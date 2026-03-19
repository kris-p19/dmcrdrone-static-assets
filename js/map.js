$(function () {
    // Config ENV
    window.CESIUM_BASE_URL = "/app/template/assets/cesium/";
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNzdmMDIwOS0zZTViLTRhMTItOWYyOS01OWYyMmM4MTBjNTgiLCJpZCI6MzExMzA0LCJpYXQiOjE3NDk2NDY1MzB9.OkebqwZnlttjqT-wNs_8OrVK2KEZ1GLmHLGml-JQpZY';
    let cesiumInit;
    let currentBaseMapLayer;
    const d2r = Cesium.Math.toRadians;
    let scaleContainer;
    let scaleLabel;
    let scaleBar;
    let userEntity;
    let watchId = null;
    window.proj4 = proj4;
    window.handler_view_beach_volumn = null;
    window.handler_view_beach_volumn_first_click = 0;
    window.lastMarkerEntity = null;
    window.beachVolumeStore = {
        rows: [],          // {lon, lat, GI, h, volPx, pxSizeM, pxAreaM2}
        totalVolume: 0,    // m^3 (ผลรวม)
        countValid: 0,     // จำนวนจุดที่ valid
        reset() {
            this.rows = [];
            this.totalVolume = 0;
            this.countValid = 0;
        }
    };
    let openlayer = null;

    const AppMap = {
        activeMarker: null,
        activeLayers: {},
        lastClickedLayerName: null,          // 👈 เลเยอร์สุดท้ายที่ถูกคลิก
        featureInfoHandler: null,            // 👈 handler ของ feature info click
        geoserverWfsUrl: $('meta[name="mapapi2"]').attr('content').replace('/wms', '/ows'),
        geoserverWmsUrl: $('meta[name="mapapi2"]').attr('content'),
        legendUrl: $('meta[name="mapapi2"]').attr('content') +'?request=GetLegendGraphic&version=1.1.1&format=image/png',
        projection: {
            utmProj: '+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs',
            wgs84Proj: 'EPSG:4326'
        },
        basemap: {
            googlesatellite: new Cesium.UrlTemplateImageryProvider({
                url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                credit: '© Google Satellite'
            }),
            googlehybrid: new Cesium.UrlTemplateImageryProvider({
                url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                credit: '© Google Hybrid'
            }),
            openstreetmap: new Cesium.UrlTemplateImageryProvider({
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                subdomains: ['a', 'b', 'c'],
                credit: '© OpenStreetMap contributors'
            }),
            esriworldimagery: new Cesium.UrlTemplateImageryProvider({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                credit: '© Esri'
            }),
            cartoposition: new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                subdomains: ['a', 'b', 'c', 'd'],
                credit: '© CartoDB'
            }),
            esristreet: new Cesium.UrlTemplateImageryProvider({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
                credit: '© Esri'
            }),
            cartodark: new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: ['a', 'b', 'c', 'd'],
                credit: '© CartoDB'
            })
        },
        createOpenlayer: (targetID, Layers) => {
            // 2. ตรวจสอบว่าถ้าเคยมีแผนที่อยู่แล้ว ให้ทำการลบออกก่อน
            if (openlayer !== null) {
                openlayer.setTarget(null); // ยกเลิกการเชื่อมต่อกับ HTML Element
                openlayer = null;          // ล้างค่าตัวแปร
                
                // ล้างเนื้อหาใน div เพื่อความมั่นใจ (optional)
                const mapContainer = document.getElementById(targetID);
                if (mapContainer) mapContainer.innerHTML = '';
            }

            const scaleLineControl = new ol.control.ScaleLine({
                units: 'metric', // กำหนดหน่วยเป็น เมตร/กิโลเมตร
                bar: false,      // ถ้าปรับเป็น true จะแสดงผลเป็นแถบ (Scale Bar)
                steps: 4,        // จำนวนช่องแบ่ง (กรณีใช้ Scale Bar)
                text: true,      // แสดงตัวเลขกำกับ
                minWidth: 100    // ความกว้างขั้นต่ำของแถบสเกล
            });

            // 3. สร้างแผนที่ใหม่
            openlayer = new ol.Map({
                target: targetID,
                controls: ol.control.defaults.defaults().extend([
                    scaleLineControl
                ]),
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url:'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            attributions: 'OpenStreetMap © Google'
                        })
                    }),
                    Layers
                ],
                view: new ol.View({
                    center: ol.proj.fromLonLat([100.5018, 13.7563]),
                    zoom: 6
                })
            });
        },
        formatCQL: (inputString) => {
            if (!inputString) return "";

            let cql = inputString;

            // -------------------------------------------------------------
            // CASE 1: การเปรียบเทียบแบบ "เท่ากับ" หรือ "ไม่เท่ากับ" (=, <>)
            // ไม่ว่าค่าจะเป็นตัวเลขหรือข้อความ ให้มองเป็น Text ทั้งหมด
            // แก้ปัญหา: text = integer operator does not exist
            // -------------------------------------------------------------
            // จับ pattern: props:key = value (ทั้งตัวเลขและข้อความ)
            cql = cql.replace(/props:([\w_]+)\s*(=|<>|LIKE|ILIKE)\s*['"]?([^'"\s]+)['"]?/gi, (match, key, operator, value) => {
                // บังคับใส่ Single Quote ครอบ value เสมอ
                return `jsonPointer(props, '/${key}') ${operator} '${value}'`;
            });

            // -------------------------------------------------------------
            // CASE 2: การเปรียบเทียบแบบ "ตัวเลข" (>, <, >=, <=)
            // ต้องแปลงค่าจาก JSON ให้เป็นตัวเลขด้วย parseDouble
            // -------------------------------------------------------------
            cql = cql.replace(/props:([\w_]+)\s*(>|<|>=|<=)\s*([0-9\.]+)/gi, (match, key, operator, value) => {
                // ใช้ parseDouble แปลงฝั่งซ้ายให้เป็นตัวเลข
                return `parseDouble(jsonPointer(props, '/${key}')) ${operator} ${value}`;
            });

            // ลบช่องว่างส่วนเกิน
            cql = cql.replace(/\s+/g, ' ').trim();

            return cql;
        },
        normalizeQuery: (q) => {
            return q.trim().replace(/\s+/g, ' ').toLowerCase();
        },
        switchBasemap: (type) => {
            if (currentBaseMapLayer) {
                cesiumInit.imageryLayers.remove(currentBaseMapLayer, true);
            }
            switch (type) {
                case 'googlesatellite': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.googlesatellite, 0); break;
                case 'googlehybrid': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.googlehybrid, 0); break;
                case 'openstreetmap': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.openstreetmap, 0); break;
                case 'esriworldimagery': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.esriworldimagery, 0); break;
                case 'cartoposition': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.cartoposition, 0); break;
                case 'esristreet': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.esristreet, 0); break;
                case 'cartodark': currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.cartodark, 0); break;
                default: currentBaseMapLayer = cesiumInit.imageryLayers.addImageryProvider(AppMap.basemap.googlesatellite, 0); break;
            }
        },
        initMapSetHome: () => {
            cesiumInit.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(101.208530, 12.662185, 15000000),
                orientation: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(-90.0),
                    roll: 0.0
                }
            });
        },
        initCurrentPosition: () => {
            const utmCoordinates = proj4(AppMap.projection.wgs84Proj, AppMap.projection.utmProj, [12.662185, 101.208530]);
            const utmEasting = utmCoordinates[0].toFixed(0);
            const utmNorthing = utmCoordinates[1].toFixed(0);
            $('#currentposition').html(`Lat: 101.208530 Lon: 12.662185 X: ${utmEasting} Y: ${utmNorthing}`);
            cesiumInit.screenSpaceEventHandler.setInputAction(async (movement) => {
                const cartesian = cesiumInit.scene.pickPosition(movement.endPosition);
                if (cartesian) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                    const utmCoordinates = proj4(AppMap.projection.wgs84Proj, AppMap.projection.utmProj, [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]);
                    const utmEasting = utmCoordinates[0].toFixed(0);
                    const utmNorthing = utmCoordinates[1].toFixed(0);
                    $('#currentposition').html(`Lat: ${lat} Lon: ${lon} X: ${utmEasting} Y: ${utmNorthing}`);
                    $('#currentposition').toggleClass('bg-gray-500', $.inArray($('#basemap').val(), ['openstreetmap', 'cartoposition', 'esristreet']) !== -1);
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },
        toggleViewMode: () => {
            cesiumInit.scene.mode = ((cesiumInit.scene.mode === Cesium.SceneMode.SCENE3D) ? Cesium.SceneMode.SCENE2D : Cesium.SceneMode.SCENE3D);
        },
        geocoderSearch: async (text) => {
            // console.log(text);

            $('#map-ui-loading-page').removeClass('hidden');
            const url = 'https://search.longdo.com/mapsearch/json/search?' +
                new URLSearchParams({
                    keyword: text,
                    limit: '1',
                    locale: 'th',
                    key: '592a36a1908c4318a921581123606947',
                });
            const res = await fetch(url);
            if (!res.ok) { $('#map-ui-loading-page').addClass('hidden'); return null; };
            const data = await res.json();
            if (data?.data?.length) {
                $('#map-ui-loading-page').addClass('hidden');
                return data.data[0];
            }
            $('#map-ui-loading-page').addClass('hidden');
            return null;
        },
        updateToolUse: () => {
            const demlayer = $(document).find('.layer-item:checked');
            const demlayernames = demlayer.map(function () {
                return $(this).data('name');
            }).get();
            if ($.inArray('DEM', demlayernames) !== -1) {
                $('#tool-use-dash').removeClass('hidden');
            } else {
                $('#tool-use-dash').addClass('hidden');
                disableDsasDraw();
            }
        },
        getWmsLayerRectangle: async (wmsUrl, layerName) => {
            const url = (wmsUrl.includes('?') ? wmsUrl : wmsUrl + '?') + 'service=WMS&request=GetCapabilities';
            const res = await fetch(url);
            const text = await res.text();
            const xml = new DOMParser().parseFromString(text, 'text/xml');
            const layerNameOnly = layerName.includes(':') ? layerName.split(':')[1] : layerName;

            const layers = Array.from(xml.getElementsByTagName('Layer'));
            const node = layers.find(l => {
                const n = l.getElementsByTagName('Name')[0];
                return n && n.textContent === layerNameOnly;
            });
            if (!node) return null;

            // EX_GeographicBoundingBox (WMS 1.3.0)
            const ex = node.getElementsByTagName('EX_GeographicBoundingBox')[0];
            if (ex) {
                const west = parseFloat(ex.getElementsByTagName('westBoundLongitude')[0].textContent);
                const east = parseFloat(ex.getElementsByTagName('eastBoundLongitude')[0].textContent);
                const south = parseFloat(ex.getElementsByTagName('southBoundLatitude')[0].textContent);
                const north = parseFloat(ex.getElementsByTagName('northBoundLatitude')[0].textContent);
                // console.log(['EX_GeographicBoundingBox', west, south, east, north]);
                return Cesium.Rectangle.fromDegrees(west, south, east, north);
            }

            // LatLonBoundingBox (WMS 1.1.1)
            const latlon = node.getElementsByTagName('LatLonBoundingBox')[0];
            if (latlon) {
                const west = parseFloat(latlon.getAttribute('minx'));
                const south = parseFloat(latlon.getAttribute('miny'));
                const east = parseFloat(latlon.getAttribute('maxx'));
                const north = parseFloat(latlon.getAttribute('maxy'));
                // console.log(['LatLonBoundingBox', west, south, east, north]);
                return Cesium.Rectangle.fromDegrees(west, south, east, north);
            }

            // BoundingBox (ตรวจ CRS/SRS)
            const bbox = node.getElementsByTagName('BoundingBox')[0];
            if (bbox) {
                const crs = (bbox.getAttribute('CRS') || bbox.getAttribute('SRS') || '').toUpperCase();
                const minx = parseFloat(bbox.getAttribute('minx'));
                const miny = parseFloat(bbox.getAttribute('miny'));
                const maxx = parseFloat(bbox.getAttribute('maxx'));
                const maxy = parseFloat(bbox.getAttribute('maxy'));

                // ⚠️ EPSG:4326 ใน WMS 1.3.0 = lat,lon (ต้องสลับ)
                if (crs === 'EPSG:4326') {
                    // console.log(['BoundingBox_EPSG:4326', miny, minx, maxy, maxx]);
                    return Cesium.Rectangle.fromDegrees(miny, minx, maxy, maxx);
                }
                // CRS:84 = lon,lat ปกติ
                // console.log(['BoundingBox', miny, minx, maxy, maxx]);
                return Cesium.Rectangle.fromDegrees(minx, miny, maxx, maxy);
            }

            return null;
        },
        addLayer: async (layer) => {
            await $('#map-ui-loading-page').removeClass('hidden');
            var cesiumImageLayer = null;
            switch (layer.type) {
                case 'wms':
                    cesiumImageLayer = cesiumInit.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                        url: layer.url,
                        layers: `${layer.name}`,
                        parameters: {
                            service: 'WMS',
                            transparent: true,
                            styles: layer.sld ? layer.sld : '',
                            format: 'image/png8',
                            srs: 'EPSG:4326',
                            tiled: true
                        },
                        tileWidth: 512,
                        tileHeight: 512,
                        enablePickFeatures: true,
                        rectangle: Cesium.Rectangle.fromDegrees(97.0, 5.0, 106.0, 21.0)
                    }));

                    cesiumImageLayer.layerId = layer.id;
                    cesiumImageLayer.layerName = layer.name;
                    cesiumImageLayer.layerTitle = layer.title;

                    AppMap.activeLayers[layer.name] = cesiumImageLayer;
                    

                    const rect = await AppMap.getWmsLayerRectangle(layer.url, layer.name);
                    if (rect) {
                        cesiumInit.camera.flyTo({
                            destination: rect,
                            duration: 1.2
                        });
                    }

                    break;
                case 'geojson':
                    let rawGeoJSON = layer.url;
                    const response = await fetch(rawGeoJSON);
                    rawGeoJSON = await response.json();
                    cesiumImageLayer = await Cesium.GeoJsonDataSource.load(rawGeoJSON, {
                        clampToGround: true,
                        stroke: Cesium.Color.fromCssColorString(layer.stroke),
                        fill: Cesium.Color.YELLOW.withAlpha(0.3),
                        strokeWidth: 2
                    });
                    const entities = cesiumImageLayer.entities.values;
                    for (let i = 0; i < entities.length; i++) {
                        const entity = entities[i];
                        if (Cesium.defined(entity.billboard)) {
                            entity.billboard.image = '/circle-pink.png';
                            entity.billboard.width = 8;
                            entity.billboard.height = 8;
                        }
                        entity.layerName = layer.id;
                    }
                    cesiumImageLayer.entities.layername = layer.id;
                    cesiumImageLayer.layerId = layer.id;
                    cesiumImageLayer.layerTitle = layer.title;                    

                    cesiumInit.dataSources.add(cesiumImageLayer);
                    AppMap.activeLayers[layer.name] = cesiumImageLayer;
                    await cesiumInit.zoomTo(cesiumImageLayer, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90), 0));
                    break;
            }
            AppMap.updateToolUse();
            await $('#map-ui-loading-page').addClass('hidden');
        },
        removeLayer: async (layer) => {
            if (AppMap.activeLayers[layer.name]) {
                cesiumInit.imageryLayers.remove(AppMap.activeLayers[layer.name], true);
                cesiumInit.dataSources.remove(AppMap.activeLayers[layer.name], true);
                delete AppMap.activeLayers[layer.name];
                AppMap.updateToolUse();
                cesiumInit.scene.requestRender?.();
            }
        },
        // 3. Filter Layer (New Feature)
        filterLayer: async (layer, filterCondition) => {
            const currentLayer = AppMap.activeLayers[layer.name];
            if (!currentLayer) return; // ถ้า Layer ไม่ได้เปิดอยู่ ให้จบฟังก์ชัน

            await $('#map-ui-loading-page').removeClass('hidden');

            try {
                switch (layer.type) {
                    case 'wms':
                        // --- WMS Logic: เปลี่ยน Provider ใหม่ ---
                        
                        // 1. หาตำแหน่ง index เดิม เพื่อไม่ให้ Layer กระโดดไปบังอันอื่น
                        const layerIndex = cesiumInit.imageryLayers.indexOf(currentLayer);

                        // 2. ลบ Layer เดิมออก
                        cesiumInit.imageryLayers.remove(currentLayer, false); // false = อย่าเพิ่ง destroy จนกว่าจะสร้างอันใหม่เสร็จ (safe side)

                        // 3. เตรียม Parameter ใหม่
                        let newParams = {
                            service: 'WMS',
                            transparent: true,
                            styles: layer.sld ? layer.sld : '',
                            format: 'image/png',
                            srs: 'EPSG:4326',
                        };

                        // ใส่ CQL_FILTER ถ้ามีค่าส่งมา
                        if (filterCondition && filterCondition.trim() !== "") {
                            newParams.CQL_FILTER = filterCondition;
                        }

                        // 4. สร้าง Provider ใหม่
                        const newProvider = new Cesium.WebMapServiceImageryProvider({
                            url: layer.url,
                            layers: `${layer.name}`,
                            parameters: newParams,
                            tileWidth: 256,
                            tileHeight: 256,
                            enablePickFeatures: true
                        });

                        // 5. เพิ่มกลับเข้าไปที่ index เดิม
                        let newCesiumLayer;
                        if (layerIndex !== -1) {
                            newCesiumLayer = cesiumInit.imageryLayers.addImageryProvider(newProvider, layerIndex);
                        } else {
                            newCesiumLayer = cesiumInit.imageryLayers.addImageryProvider(newProvider);
                        }

                        // 6. คืนค่า Property ให้ object ใหม่
                        newCesiumLayer.layerId = layer.id;
                        newCesiumLayer.layerName = layer.name;
                        newCesiumLayer.layerTitle = layer.title;
                        AppMap.activeLayers[layer.name] = newCesiumLayer;
                        break;

                    case 'geojson':
                        // --- GeoJSON Logic: ซ่อน/แสดง Entity ---
                        const dataSource = currentLayer;
                        const entities = dataSource.entities.values;

                        for (let i = 0; i < entities.length; i++) {
                            const entity = entities[i];
                            
                            // ถ้าไม่มี Filter -> แสดงทั้งหมด
                            if (!filterCondition) {
                                entity.show = true;
                            } 
                            // ถ้า Filter เป็น Function (Custom Logic)
                            else if (typeof filterCondition === 'function') {
                                // แปลง PropertyBag ของ Cesium เป็น JS Object ปกติเพื่อให้ใช้ง่าย
                                let props = {};
                                const propertyNames = entity.properties.propertyNames;
                                propertyNames.forEach(name => {
                                    props[name] = entity.properties[name].getValue();
                                });
                                entity.show = filterCondition(props);
                            }
                            // ถ้า Filter เป็น String หรือ Object (Simple Match)
                            // ตัวอย่างการรองรับ: เช็คว่ามี Property นี้และค่าตรงกันไหม
                            // *ส่วนนี้คุณสามารถปรับแก้ตามโครงสร้างข้อมูล GeoJSON ของคุณ*
                            else {
                            // Default logic: ถ้า filter ไม่ใช่ function ให้แสดงทั้งหมดไปก่อน 
                            // หรือคุณอาจจะเขียน parser สำหรับ string query ง่ายๆ ที่นี่
                            entity.show = true; 
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error("Error filtering layer:", error);
            }

            cesiumInit.scene.requestRender();
            await $('#map-ui-loading-page').addClass('hidden');
        },
        addMarker: ({ lon, lat, name }) => {
            // ลบตัวเดิมถ้ามี
            if (AppMap.activeMarker) {
                cesiumInit.entities.remove(AppMap.activeMarker);
                AppMap.activeMarker = null;
            }

            // กันกรณีพิกัดเป็น string
            const lonNum = parseFloat(lon);
            const latNum = parseFloat(lat);

            const entity = cesiumInit.entities.add({
                id: 'search-marker',
                name: name || 'Marker',
                position: Cesium.Cartesian3.fromDegrees(lonNum, latNum),
                point: {
                    pixelSize: 12,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                label: {
                    text: name || `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`,
                    font: '10px inherit',
                    fillColor: Cesium.Color.fromCssColorString('#ffffffff'),
                    showBackground: true,
                    backgroundColor: Cesium.Color.fromCssColorString('#737272ff').withAlpha(0.8),
                    backgroundPadding: new Cesium.Cartesian2(8, 4),
                    pixelOffset: new Cesium.Cartesian2(0, -18),
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                }
            });

            AppMap.activeMarker = entity;
            return entity;
        },
        removeMarker: () => {
            if (AppMap.activeMarker) {
                cesiumInit.entities.remove(AppMap.activeMarker);
                AppMap.activeMarker = null;
                cesiumInit.scene.requestRender?.();
            }
        },
        plotChart: async (chartOption) => {
            const traces = Array.isArray(chartOption.trace) ? chartOption.trace : [chartOption.trace];
            const layout = chartOption.layout;
            await Plotly.newPlot(chartOption.target, traces, layout);
        },
        plotChartH: (chartOption) => {
            const traces = Array.isArray(chartOption.trace)
                ? chartOption.trace
                : [chartOption.trace];

            // แปลง Plotly trace -> Highcharts series
            const series = traces.map(t => {
                // ถ้ามาเป็น x,y แยกแบบ Plotly
                if (Array.isArray(t.x) && Array.isArray(t.y)) {
                    const data = t.x.map((xVal, i) => [xVal, t.y[i]]);
                    return {
                        name: t.name || 'Series',
                        data: data
                    };
                }

                // ถ้ามี data อยู่แล้ว (รองรับกรณีส่งมาเป็น Highcharts อยู่แล้ว)
                if (Array.isArray(t.data)) {
                    return {
                        name: t.name || 'Series',
                        data: t.data
                    };
                }

                return t; // fallback เผื่อกรณีพิเศษ
            });

            Highcharts.chart(chartOption.target, {
                chart: {
                    type: 'line'
                },
                title: {
                    text: chartOption.layout?.title || ''
                },
                xAxis: {
                    title: {
                        text: chartOption.layout?.xaxis?.title || ''
                    }
                },
                yAxis: {
                    title: {
                        text: chartOption.layout?.yaxis?.title || ''
                    }
                },
                series: series
            });
        },
        flytoextend_initSelect2: (data) => {

            $('#dashboard-input-province').select2({
                width: '100%',
                selectionCssClass: 'block bg-white',
                dropdownCssClass: 'bg-white',
                allowClear: true
            });

            $('#dashboard-input-beach').select2({
                width: '100%',
                selectionCssClass: 'block bg-white',
                dropdownCssClass: 'bg-white',
                allowClear: true
            });

            $('.flytoextend_select').each(function () {
                const flytoextend_$select = $(this);
                // ถ้า init แล้ว → ข้าม
                if (flytoextend_$select.hasClass('select2-hidden-accessible')) {
                    return;
                }
                flytoextend_$select.select2({
                    width: 'resolve',
                    placeholder: flytoextend_$select.attr('placeholder') || 'Select...',
                    width: '100%',
                    selectionCssClass: 'w-full md:w-[150px] mb-2 md:pb-0 bg-gray-100/70',
                    allowClear: true
                });
            });

        },
        copyToClipboard: (text) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    // console.log("Copied to clipboard:", text);
                    alert("คัดลอกพิกัดแล้ว:\n" + text);
                });
            } else {
                // fallback สำหรับ browser เก่าที่ไม่รองรับ clipboard API
                const textarea = document.createElement("textarea");
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                alert("คัดลอกพิกัดแล้ว:\n" + text);
            }
        },

        // === Helper: ตรวจว่า layer นี้ active อยู่ไหม ===
        isLayerActive: (layerName) => {
            if (!layerName) return false;
            return !!AppMap.activeLayers[layerName];
        },

        // === Helper: หา layerName จาก Entity (GeoJSON, ฯลฯ) ===
        getLayerNameFromEntity: (entity) => {
            if (!entity) return null;
            if (entity.layerName) return entity.layerName;

            // เผื่ออนาคตเก็บไว้ใน properties.layerName
            const p = entity.properties?.layerName;
            if (!p) return null;
            if (typeof p.getValue === "function") {
                return p.getValue(Cesium.JulianDate.now());
            }
            return p;
        },

        // === Helper: หา layerName จากผล WMS feature (pickImageryLayerFeatures) ===
        getLayerNameFromWmsFeature: (feature) => {
            if (!feature) return null;
            const data = feature.data || {};
            // Geoserver มักส่ง LAYER/layer กลับมา
            return (
                data.LAYER ||
                data.layer ||
                feature.imageryLayer?.imageryProvider?.layers ||
                feature.layer?.imageryProvider?.layers ||
                null
            );
        },

        // === ลงทะเบียน click เพื่อทำ FeatureInfo (ทั้ง GeoJSON + WMS) ===
        initFeatureInfoClick: () => {
            // เคลียร์ handler เดิมถ้ามี
            if (AppMap.featureInfoHandler) {
                AppMap.featureInfoHandler.destroy();
                AppMap.featureInfoHandler = null;
            }

            // ใช้ handler แยกจาก viewer เพื่อไม่ไปรบกวน selectedEntity ของ Cesium
            AppMap.featureInfoHandler = new Cesium.ScreenSpaceEventHandler(cesiumInit.scene.canvas);

            AppMap.featureInfoHandler.setInputAction(function (click) {
                if (!click || !click.position) return;
                // ---------- เคลียร์ beach-volume marker/handler เดิม ----------
                if (window.lastBeachMarker) {
                    cesiumInit.entities.remove(window.lastBeachMarker);
                    window.lastBeachMarker = null;
                }
                if (window.lastMarkerEntity) {
                    cesiumInit.entities.remove(window.lastMarkerEntity);
                    window.lastMarkerEntity = null;
                }
                if (window.handler_view_beach_volumn) {
                    window.handler_view_beach_volumn.destroy();
                    window.handler_view_beach_volumn = null;
                }

                const scene = cesiumInit.scene;
                const position = click.position;

                // --------------------------
                // 1) ลอง pick entity (GeoJSON, marker ฯลฯ)
                // --------------------------
                const picked = scene.pick(position);

                if (Cesium.defined(picked) && picked.id && picked.id instanceof Cesium.Entity) {
                    const entity = picked.id;
                    const layerName = AppMap.getLayerNameFromEntity(entity);
                    if (layerName) {
                        entity.layerName = layerName;
                        AppMap.lastClickedLayerName = layerName;
                        // console.log("Picked entity layer:", layerName, entity);
                    }
                    // ปล่อยให้ Cesium จัดการ selectedEntity เอง (initInfoBox จะทำงานต่อ)
                    AppMap.showInfoBox(entity);
                }

                // --------------------------
                // 2) ลอง GetFeatureInfo จาก WMS
                // --------------------------
                const pickRay = cesiumInit.camera.getPickRay(position);
                const promise = scene.imageryLayers.pickImageryLayerFeatures(pickRay, scene);
                if (!promise) return;

                promise.then(function (results) {
                    if (!results || results.length === 0) return;

                    const feature = results[0];
                    const layerName = AppMap.getLayerNameFromWmsFeature(feature);
                    AppMap.lastClickedLayerName = layerName;
                    // console.log("Picked WMS layer:", layerName, feature);

                    // สร้าง HTML table จาก feature.data (ให้เข้ากับ htmlTableToJSON เดิม)
                    // let html = "";
                    const dataObj = feature.data || {};

                    // if (typeof dataObj === "string" && dataObj.trim().toLowerCase().includes("<table")) {
                    //     // ถ้า server ส่ง table HTML มาแล้วก็ใช้เลย
                    //     html = dataObj;
                    // } else {
                    //     html = '<table class="min-w-full table-auto text-sm"><tbody>';
                    //     Object.keys(dataObj).forEach((key) => {
                    //         const val = dataObj[key];
                    //         if (val === null || val === undefined || val === "") return;
                    //         html += `
                    //             <tr>
                    //                 <td>${key}</td>
                    //                 <td>${val}</td>
                    //             </tr>
                    //         `;
                    //     });
                    //     html += "</tbody></table>";
                    // }

                    // หาพิกัดบน ellipsoid เพื่อให้ initInfoBox ใช้งานได้ (กรณี Beach Volume)
                    const cartesian = cesiumInit.camera.pickEllipsoid(
                        position,
                        cesiumInit.scene.globe.ellipsoid
                    );

                    const entity = new Cesium.Entity({
                        name: feature?.imageryLayer?.layerTitle || feature.name || layerName || "Feature Info",
                        description: new Cesium.ConstantProperty(dataObj),
                        position: cartesian
                    });

                    const imageryLayer = feature.imageryLayer || feature.layer;
                    const layerId = imageryLayer?.layerId || layerName;
                    entity.layerName = layerId;

                    // ให้ไปเข้าทาง initInfoBox เดิม
                    // cesiumInit.selectedEntity = entity;
                    AppMap.showInfoBox(entity);
                });
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },


        htmlTableToJSON: (tableInput, options = {}) => {
            const {
                trim = true,
                cast = true,
                emptyToNull = true,
                preferInputValue = true,
                forceNoHeader = false
            } = options;

            // ✅ รองรับทั้ง element และ string HTML
            let table;
            if (typeof tableInput === "string") {
                const wrapper = document.createElement("div");
                wrapper.innerHTML = tableInput.trim();
                table = wrapper.querySelector("table");
            } else {
                table = tableInput;
            }

            if (!table) return [];

            const getCellText = (cell) => {
                if (!cell) return "";
                if (preferInputValue) {
                    const input = cell.querySelector("input, textarea, select");
                    if (input) return input.value;
                }
                return trim ? cell.textContent.trim() : cell.textContent;
            };

            const smartCast = (v) => {
                if (!cast) return v;
                if (v === "" || v == null) return emptyToNull ? null : v;

                const num = Number(v.replace?.(/,/g, "") ?? v);
                if (!Number.isNaN(num) && /^-?\d+(\.\d+)?$/.test(v.trim())) return num;

                const ddmmyyyy = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (ddmmyyyy) {
                    const [, d, m, y] = ddmmyyyy.map(Number);
                    const date = new Date(Date.UTC(y, m - 1, d));
                    if (!isNaN(date)) return date.toISOString();
                }

                const iso = new Date(v);
                if (!isNaN(iso)) return iso.toISOString();

                if (/^(true|false)$/i.test(v)) return /^true$/i.test(v);

                return v;
            };

            // ------------------------
            // หา header
            // ------------------------
            let headerCells = [];
            if (!forceNoHeader) {
                if (table.tHead && table.tHead.rows.length > 0) {
                    headerCells = Array.from(table.tHead.rows[0].cells);
                } else if (table.rows.length > 0) {
                    headerCells = Array.from(table.rows[0].cells);
                }
            }

            const headers = headerCells.map((th, i) =>
                (getCellText(th) || `col_${i + 1}`).replace(/\s+/g, "_")
            );

            // ------------------------
            // หา rows
            // ------------------------
            let dataRows = [];
            if (table.tBodies.length > 0) {
                dataRows = Array.from(table.tBodies).flatMap((tb) => Array.from(tb.rows));
            } else {
                dataRows = Array.from(table.rows);
            }

            if (!forceNoHeader && headerCells.length > 0) {
                dataRows = dataRows.slice(1); // ข้าม header row
            }

            // ------------------------
            // แปลงแถว → JSON
            // ------------------------
            const json = dataRows.map((row) => {
                const cells = Array.from(row.cells);
                const obj = {};
                cells.forEach((cell, i) => {
                    const key = headers[i] || `col_${i + 1}`;
                    obj[key] = smartCast(getCellText(cell));
                });
                return obj;
            });

            return json;
        },


        eventClickTouchCopyPosition: () => {
            const handler = new Cesium.ScreenSpaceEventHandler(cesiumInit.scene.canvas);
            handler.setInputAction(function (movement) {
                const cartesian = cesiumInit.camera.pickEllipsoid(
                    movement.position,
                    cesiumInit.scene.globe.ellipsoid
                );
                if (cartesian) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                    const utmCoordinates = proj4(AppMap.projection.wgs84Proj, AppMap.projection.utmProj, [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]);
                    const utmEasting = utmCoordinates[0].toFixed(0);
                    const utmNorthing = utmCoordinates[1].toFixed(0);
                    AppMap.copyToClipboard(`Lat: ${lat} Lon: ${lon} X: ${utmEasting} Y: ${utmNorthing}\n(Lat,Lon,X,Y): ${lat}, ${lon}, ${utmEasting}, ${utmNorthing}`);
                }
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

            // จัดการ event สำหรับ mobile (กดค้าง)
            let touchStartTime = 0;
            let isSingleTouch = false;
            let startX = 0, startY = 0;
            let isDragging = false;
            const DRAG_TOLERANCE = 10;

            cesiumInit.scene.canvas.addEventListener("touchstart", function (e) {
                if (e.touches.length === 1) {
                    isSingleTouch = true;
                    touchStartTime = Date.now();
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                } else {
                    isSingleTouch = false;
                }
            });

            cesiumInit.scene.canvas.addEventListener("touchmove", function (e) {
                if (!isSingleTouch) return;
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                if (Math.hypot(dx, dy) > DRAG_TOLERANCE) {
                    isDragging = true;
                }
            }, { passive: true });

            cesiumInit.scene.canvas.addEventListener("touchend", function (e) {
                if (!isSingleTouch || isDragging) return;
                const duration = Date.now() - touchStartTime;
                if (duration > 600) { // กดค้างเกิน 0.6 วินาที
                    const touch = e.changedTouches[0];
                    const rect = cesiumInit.scene.canvas.getBoundingClientRect();
                    const position = {
                        x: touch.clientX - rect.left,
                        y: touch.clientY - rect.top,
                    };
                    const cartesian = cesiumInit.camera.pickEllipsoid(
                        position,
                        cesiumInit.scene.globe.ellipsoid
                    );
                    if (cartesian) {
                        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                        const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                        const utmCoordinates = proj4(AppMap.projection.wgs84Proj, AppMap.projection.utmProj, [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]);
                        const utmEasting = utmCoordinates[0].toFixed(0);
                        const utmNorthing = utmCoordinates[1].toFixed(0);
                        AppMap.copyToClipboard(`Lat: ${lat} Lon: ${lon} X: ${utmEasting} Y: ${utmNorthing}\n(Lat,Lon,X,Y): ${lat}, ${lon}, ${utmEasting}, ${utmNorthing}`);
                    }
                }
                isSingleTouch = false;
                isDragging = false;
            });
        },

        // ============================
        // Dashboard Maps - ความยาวชายหาดรวมต่อจังหวัด (final)
        // ============================
        dashboardMapsVolumnFinal: (targetID, filterMapLayout = []) => {
            (async () => {
                const $wrap = $(`#${targetID}`);
                $wrap.empty();
                $wrap
                    .removeClass('hidden')
                    .addClass('flex flex-col lg:flex-row gap-4')
                    .html(`
                        <div id="${targetID}-map-openlayer" class="w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-map" class="hidden w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-bar" class="w-full lg:w-1/2 h-[600px]"></div>
                    `);
                var wfsSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return (
                            AppMap.geoserverWfsUrl +
                            '?service=WFS&' +
                            'version=1.1.0&' +
                            'request=GetFeature&' +
                            'typename=dmcrdrone_ws:shoreline_master_table_view&' + // ระบุ workspace และชื่อเลเยอร์
                            'outputFormat=application/json&' + // ขอเป็น JSON เพื่อความง่าย
                            'srsname=EPSG:3857&' +             // ระบุระบบพิกัดที่ต้องการ
                            'bbox=' + extent.join(',') + ',EPSG:3857' // ดึงเฉพาะพื้นที่ที่แสดงบนหน้าจอ
                        );
                    },
                    strategy: ol.loadingstrategy.bbox, // โหลดข้อมูลเฉพาะบริเวณที่มองเห็น (ช่วยเรื่อง Performance)
                });
                var wfsLayer = new ol.layer.Vector({
                    source: wfsSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 3
                        })
                    })
                });
                wfsSource.once('change', function() {
                    if (wfsSource.getState() === 'ready') {
                        const extent = wfsSource.getExtent(); // ดึงขอบเขตของข้อมูลทั้งหมดใน Source
                        
                        // สั่งให้ View ซูมไปที่ขอบเขตนั้น
                        openlayer.getView().fit(extent, {
                            padding: [50, 50, 50, 50], // เพิ่มพื้นที่ว่างขอบจอ (หน่วยเป็น Pixel)
                            duration: 1000,            // ความเร็วในการซูม (มิลลิวินาที)
                            maxZoom: 15                // ป้องกันการซูมใกล้เกินไปกรณีมีแค่จุดเดียว
                        });
                    }
                });
                AppMap.createOpenlayer(`${targetID}-map-openlayer`,wfsLayer);

                
                const shorelineUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:shoreline_master_table_view' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const provinceUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:province' +
                    '&propertyName=name_th,geom_simplify' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const [shorelineFC, provinceFC] = await Promise.all([
                    (await fetch(shorelineUrl)).json(),
                    (await fetch(provinceUrl)).json()
                ]);                

                // ----------------------------
                // 24 จังหวัดชายทะเล
                // ----------------------------
                const COASTAL_24 = [
                    'ตราด', 'จันทบุรี', 'ระยอง', 'ชลบุรี', 'ฉะเชิงเทรา', 'สมุทรปราการ',
                    'กรุงเทพมหานคร', 'สมุทรสาคร', 'สมุทรสงคราม', 'เพชรบุรี', 'ประจวบคีรีขันธ์',
                    'ชุมพร', 'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'สงขลา', 'ปัตตานี', 'นราธิวาส',
                    'ระนอง', 'พังงา', 'ภูเก็ต', 'กระบี่', 'ตรัง', 'สตูล'
                ];
                const COASTAL_SET = new Set(COASTAL_24);

                // ----------------------------
                // อ่าน coastal_status จาก DOM (ใช้ทำ "ความยาวหาดสูงสุด" ใน bar)
                // ----------------------------
                const CoastalStatusData = JSON.parse(
                    $('div[data-default="true"][data-name="coastal_status"]').html() || '{"data":[]}'
                );
                const statusRows = Array.isArray(CoastalStatusData?.data) ? CoastalStatusData.data : [];

                // ----------------------------
                // helper
                // ----------------------------
                const toNum = (v) => {
                    if (v === null || v === undefined) return 0;
                    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
                    const s = String(v).replace(/,/g, '').trim();
                    const n = Number(s);
                    return Number.isFinite(n) ? n : 0;
                };

                const applyFilters = (features, filters) => {
                    if (!Array.isArray(filters) || filters.length === 0) return features;
                    return features.filter(f => {
                        const p = f.properties || {};
                        return filters.every(fl => {
                            const v = p[fl.key];
                            if (!fl.values || fl.values.length === 0) return true;
                            return fl.values.includes(v);
                        });
                    });
                };

                // ----------------------------
                // 1) filter shoreline (ถ้ามี)
                // ----------------------------
                const filteredFeatures = applyFilters(shorelineFC.features || [], filterMapLayout);

                // ----------------------------
                // 2) aggregate ความยาวชายหาดรวมต่อจังหวัด (shoreline_master_table_view: province + length_km)
                // ----------------------------
                const agg = new Map();
                for (const f of filteredFeatures) {
                    const p = f.properties || {};
                    const prov = (p.province || '').trim();
                    if (!COASTAL_SET.has(prov)) continue;

                    const len = toNum(p.length_km);
                    agg.set(prov, (agg.get(prov) || 0) + len);
                }

                // ให้ครบทั้ง 24 จังหวัด (ไม่มีข้อมูล = 0)
                const agg24 = COASTAL_24.map(name => [name, agg.get(name) || 0]);

                // ----------------------------
                // 3) prepare province polygon เฉพาะ 24 จังหวัด
                // ----------------------------
                const provGeo24 = {
                    type: 'FeatureCollection',
                    features: (provinceFC.features || []).map(feat => {
                        const name_th = (feat.properties?.name_th || '').trim();
                        const geometry = feat.geometry || feat.properties?.geom_simplify || feat.geom_simplify;
                        return { type: 'Feature', properties: { name_th }, geometry };
                    }).filter(f => f.geometry && COASTAL_SET.has((f.properties?.name_th || '').trim()))
                };

                const mapPolygons = Highcharts.geojson(provGeo24);
                mapPolygons.forEach(f => {
                    f.name_th = (f.properties?.name_th || '').trim();
                    f.name = f.name_th;
                });

                // data สำหรับ map
                const mapSeriesData = agg24.map(([prov, totalKm]) => ({ name_th: prov, value: totalKm }));

                // ----------------------------
                // 4) shoreline overlay (เส้นชายหาด) — กรองเฉพาะ 24 จังหวัดเพื่อให้สะอาด
                // ----------------------------
                const shorelineFiltered = {
                    type: 'FeatureCollection',
                    features: (shorelineFC.features || []).filter(ft => {
                        const prov = (ft.properties?.province || '').trim();
                        return COASTAL_SET.has(prov);
                    })
                };
                const shoreLines = Highcharts.geojson(shorelineFiltered, 'mapline');

                const COLOR_THEME = {
                    mapGradient: [
                        [0, '#e0f2fe'], // ฟ้าอ่อน
                        [0.5, '#38bdf8'], // ฟ้ากลาง
                        [1, '#075985']  // ฟ้าเข้ม
                    ],
                    shoreline: '#38bdf8',        // เส้นชายหาด (เทาเข้ม)
                    barTotal: '#38bdf8',          // ความยาวชายหาดรวม
                    barMax: '#858585ff'             // ความยาวหาดสูงสุด
                };

                // ----------------------------
                // 5) render MAP
                // ----------------------------
                Highcharts.mapChart(`${targetID}-map`, {
                    title: { text: 'เส้นชายหาด (ความยาวรวม km)' },
                    credits: { enabled: false },
                    mapNavigation: { enabled: true },
                    colorAxis: { min: 0, stops: COLOR_THEME.mapGradient },
                    tooltip: {
                        useHTML: true,
                        formatter: function () {
                            if (this.point && typeof this.point.value === 'number') {
                                return `<b>${this.point.name}</b><br/>ความยาวรวม: <b>${Highcharts.numberFormat(this.point.value, 2)}</b> km`;
                            }
                            return `<b>เส้นชายหาด</b>`;
                        }
                    },
                    series: [
                        {
                            type: 'map',
                            name: 'จังหวัดชายทะเล',
                            mapData: mapPolygons,
                            data: mapSeriesData,
                            joinBy: ['name_th', 'name_th'],
                            keys: ['name_th', 'value'],
                            borderColor: '#000000ff',
                            nullColor: '#f2f2f2',
                            states: { hover: { brightness: 0.2 } },
                            dataLabels: { enabled: false }
                        },
                        {
                            type: 'mapline',
                            name: 'เส้นชายหาด',
                            data: shoreLines,
                            color: COLOR_THEME.shoreline,
                            lineWidth: 4,
                            enableMouseTracking: false
                        }
                    ]
                });

                // ----------------------------
                // 6) BAR: เพิ่มแท่ง "ความยาวหาดสูงสุด" จาก CoastalStatusData.data["ความยาว  (กม.)"]
                // ----------------------------
                const sumLenByProv = statusRows.reduce((acc, r) => {
                    const prov = (r['จังหวัด'] || '').trim();
                    const len = toNum(r['ความยาว (กม.)']);
                    if (!COASTAL_SET.has(prov)) return acc;
                    acc.set(prov, (acc.get(prov) || 0) + len);
                    return acc;
                }, new Map());

                // เรียง bar ตาม "ความยาวรวม (length_km)" มาก -> น้อย
                const agg24Sorted = [...agg24].sort((a, b) => b[1] - a[1]);
                const categories = agg24Sorted.map(d => d[0]);

                const seriesTotalLen = categories.map(p => (agg.get(p) || 0));
                const seriesMaxBeach = categories.map(p => (sumLenByProv.get(p) || 0));

                Highcharts.chart(`${targetID}-bar`, {
                    chart: { type: 'bar' },
                    title: { text: 'ความยาวชายหาด' },
                    credits: { enabled: false },
                    xAxis: {
                        categories,
                        title: { text: null }
                    },
                    yAxis: {
                        min: 0,
                        title: { text: 'กิโลเมตร (km)', align: 'high' }
                    },
                    tooltip: {
                        shared: true,
                        pointFormat: `<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b> km<br/>`
                    },
                    plotOptions: {
                        series: {
                            grouping: true,
                            dataLabels: { enabled: true, format: '{y:.2f}' }
                        }
                    },
                    legend: { enabled: true },
                    series: [
                        {
                            name: 'ความยาวหายหาด (สูงสุด)',
                            data: seriesMaxBeach,
                            color: COLOR_THEME.barMax
                        },
                        {
                            name: 'ความยาวชายหาด (สำรวจ)',
                            data: seriesTotalLen,
                            color: COLOR_THEME.barTotal
                        }
                    ]
                });

            })();
        },
        // ============================
        // Dashboard Maps - ความยาวชายหาดรวมต่อจังหวัด (final) with province filter
        // ============================
        dashboardMapsVolumnProvinceFinal: (targetID, filterProvince = null) => {
            (async () => {
                const $wrap = $(`#${targetID}`);
                $wrap.empty();
                $wrap
                    .removeClass('hidden')
                    .addClass('flex flex-col lg:flex-row gap-4')
                    .html(`
                        <div id="${targetID}-map-openlayer" class="w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-map" class="hidden w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-bar" class="w-full lg:w-1/2 h-[600px]"></div>
                    `);
                var wfsSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return (
                            AppMap.geoserverWfsUrl +
                            '?service=WFS&' +
                            'version=1.1.0&' +
                            'request=GetFeature&' +
                            'typename=dmcrdrone_ws:shoreline_master_table_view&' +
                            'outputFormat=application/json&' +
                            'srsname=EPSG:3857&' +
                            'cql_filter=' + encodeURIComponent("province='" + filterProvince + "'") // ใส่ ' ' คร่อมชื่อจังหวัด
                        );
                    },
                    strategy: ol.loadingstrategy.all
                });
                var wfsLayer = new ol.layer.Vector({
                    source: wfsSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 3
                        })
                    })
                });
                wfsSource.once('change', function() {
                    if (wfsSource.getState() === 'ready') {
                        const extent = wfsSource.getExtent(); // ดึงขอบเขตของข้อมูลทั้งหมดใน Source
                        
                        if (extent && !ol.extent.isEmpty(extent)) {
                            openlayer.getView().fit(extent, {
                                padding: [50, 50, 50, 50],
                                duration: 1000,
                                maxZoom: 15
                            });
                        } else {
                            console.warn("ไม่พบข้อมูลพิกัดในจังหวัดที่เลือก");
                        }
                    }
                });
                AppMap.createOpenlayer(`${targetID}-map-openlayer`,wfsLayer);

                const COLOR_THEME = {
                    mapGradient: [
                        [0, '#e0f2fe'],
                        [0.5, '#38bdf8'],
                        [1, '#075985']
                    ],
                    shoreline: '#1f2937',
                    bar: '#0284c7',
                    barMax: '#858585ff'
                };

                // helper: parse number (รองรับ "1,234.56")
                const toNum = (v) => {
                    if (v === null || v === undefined) return 0;
                    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
                    const s = String(v).replace(/,/g, '').trim();
                    const n = Number(s);
                    return Number.isFinite(n) ? n : 0;
                };

                // helper: escape single quotes for CQL strings
                const cqlEscape = (s) => String(s ?? '').replace(/'/g, "''").trim();

                // ============================
                // WFS (with optional province CQL_FILTER)
                // ============================
                const shorelineBaseUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:shoreline_master_table_view' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const provinceBaseUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:province' +
                    '&propertyName=name_th,geom_simplify' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const hasProv = !!(filterProvince && String(filterProvince).trim());

                const shorelineUrl = hasProv
                    ? `${shorelineBaseUrl}&CQL_FILTER=${encodeURIComponent(`province='${cqlEscape(filterProvince)}'`)}`
                    : shorelineBaseUrl;

                const provinceUrl = hasProv
                    ? `${provinceBaseUrl}&CQL_FILTER=${encodeURIComponent(`name_th='${cqlEscape(filterProvince)}'`)}`
                    : provinceBaseUrl;

                const [shorelineFC, provinceFC] = await Promise.all([
                    (await fetch(shorelineUrl)).json(),
                    (await fetch(provinceUrl)).json()
                ]);

                // ============================
                // Filter shoreline features (กันเหนียว)
                // ============================
                let filteredFeatures = shorelineFC.features || [];
                if (hasProv) {
                    const fp = String(filterProvince).trim();
                    filteredFeatures = filteredFeatures.filter(
                        f => String(f?.properties?.province || '').trim() === fp
                    );
                }

                // ============================
                // MAP: sum length_km by province
                // ============================
                const provName = hasProv ? String(filterProvince).trim() : '';
                let provTotalKm = 0;

                for (const f of filteredFeatures) {
                    const p = f.properties || {};
                    provTotalKm += toNum(p.length_km);
                }

                // Province polygon (เฉพาะจังหวัดเดียวถ้ามี filterProvince)
                const provGeo = {
                    type: 'FeatureCollection',
                    features: (provinceFC.features || []).map(feat => {
                        const name_th = String(feat.properties?.name_th || '').trim();
                        const geometry = feat.geometry || feat.properties?.geom_simplify || feat.geom_simplify;
                        return { type: 'Feature', properties: { name_th }, geometry };
                    }).filter(f => f.geometry && (!hasProv || String(f.properties.name_th).trim() === provName))
                };

                const mapPolygons = Highcharts.geojson(provGeo);
                mapPolygons.forEach(f => {
                    f.name_th = String(f.properties?.name_th || '').trim();
                    f.name = f.name_th;
                });

                const mapSeriesData = hasProv
                    ? [{ name_th: provName, value: provTotalKm }]
                    : mapPolygons.map(p => ({ name_th: p.name_th, value: 0 })); // fallback (ถ้าไม่กรองจังหวัด)

                // shoreline overlay (เป็นเส้น)
                const shoreLines = Highcharts.geojson(
                    { type: 'FeatureCollection', features: filteredFeatures },
                    'mapline'
                );

                // ============================
                // Render MAP
                // ============================
                Highcharts.mapChart(`${targetID}-map`, {
                    title: { text: hasProv ? `ความยาวชายหาด (สำรวจ) — ${provName}` : 'ความยาวชายหาดรวมรายจังหวัด' },
                    credits: { enabled: false },
                    mapNavigation: { enabled: true },
                    colorAxis: { min: 0, stops: COLOR_THEME.mapGradient },
                    tooltip: {
                        useHTML: true,
                        formatter() {
                            if (typeof this.point.value === 'number') {
                                return `<b>${this.point.name}</b><br/>ความยาว: <b>${Highcharts.numberFormat(this.point.value, 2)}</b> km`;
                            }
                            return `<b>เส้นชายหาด</b>`;
                        }
                    },
                    series: [
                        {
                            type: 'map',
                            name: 'จังหวัด',
                            mapData: mapPolygons,
                            data: mapSeriesData,
                            joinBy: ['name_th', 'name_th'],
                            keys: ['name_th', 'value'],
                            borderColor: '#64748b',
                            borderWidth: 0.5,
                            nullColor: '#f1f5f9',
                            states: { hover: { brightness: 0.25 } },
                            dataLabels: { enabled: false }
                        },
                        {
                            type: 'mapline',
                            name: 'เส้นชายหาด',
                            data: shoreLines,
                            color: COLOR_THEME.shoreline,
                            lineWidth: 1.2,
                            enableMouseTracking: false
                        }
                    ]
                });

                // ============================
                // BAR: beachsheet + sum length_km
                // ============================
                const beachAgg = new Map();
                for (const f of filteredFeatures) {
                    const p = f.properties || {};
                    const beach = String(p.beachsheet || '').trim();
                    if (!beach) continue;
                    beachAgg.set(beach, (beachAgg.get(beach) || 0) + toNum(p.length_km));
                }

                const TOP_N = 30;
                const beachSorted = Array.from(beachAgg.entries()).sort((a, b) => b[1] - a[1]).slice(0, TOP_N);

                const CoastalStatusData = JSON.parse(
                    $('div[data-default="true"][data-name="coastal_status"]').html() || '{"data":[]}'
                );
                const statusRows = Array.isArray(CoastalStatusData?.data) ? CoastalStatusData.data : [];
                const sumLenByProv = statusRows.reduce((acc, r) => {
                    const prov = (r['จังหวัด'] || '').trim();
                    const len = toNum(r['ความยาว (กม.)']);
                    if (hasProv && prov !== provName) return acc;
                    const beach = (r['ชื่อหาด/ระบบหาด'] || '').trim();
                    if (!beach) return acc;
                    acc.set(beach, (acc.get(beach) || 0) + len);
                    return acc;
                }, new Map());

                Highcharts.chart(`${targetID}-bar`, {
                    chart: { type: 'bar' },
                    title: { text: hasProv ? `ความยาวชายหาด (สำรวจ) — ${provName}` : `ความยาวชายหาด` },
                    credits: { enabled: false },
                    xAxis: { categories: beachSorted.map(d => d[0]), title: { text: null } },
                    yAxis: { min: 0, title: { text: 'กิโลเมตร (km)', align: 'high' } },
                    tooltip: {
                        shared: true,
                        pointFormat: `<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b> km<br/>`
                    },
                    plotOptions: { bar: { dataLabels: { enabled: true, format: '{y:.2f}' } } },
                    legend: { enabled: false },
                    series: [
                        {
                            name: 'ความยาวหายหาด (สูงสุด)',
                            data: beachSorted.map(d => sumLenByProv.get(d[0]) || 0),
                            color: COLOR_THEME.barMax
                        },
                        {
                            name: 'ความยาวชายหาด (km)',
                            data: beachSorted.map(d => d[1]),
                            color: COLOR_THEME.bar
                        }
                    ]
                });
            })();
        },
        dashboardMapsVolumnBeachFinal: (targetID, filterBeachsweet = null) => {
            (async () => {
                const $wrap = $(`#${targetID}`);
                $wrap.empty();
                $wrap
                    .removeClass('hidden')
                    .addClass('flex flex-col lg:flex-row gap-4')
                    .html(`
                        <div id="${targetID}-map-openlayer" class="w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-map" class="hidden w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-bar" class="w-full lg:w-1/2 h-[600px]"></div>
                    `);
                var wfsSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return (
                            AppMap.geoserverWfsUrl +
                            '?service=WFS&' +
                            'version=1.1.0&' +
                            'request=GetFeature&' +
                            'typename=dmcrdrone_ws:shoreline_master_table_view&' +
                            'outputFormat=application/json&' +
                            'srsname=EPSG:3857&' +
                            'cql_filter=' + encodeURIComponent("beachsheet='" + filterBeachsweet + "'") // ใส่ ' ' คร่อมชื่อจังหวัด
                        );
                    },
                    strategy: ol.loadingstrategy.all
                });
                var wfsLayer = new ol.layer.Vector({
                    source: wfsSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 3
                        })
                    })
                });
                wfsSource.once('change', function() {
                    if (wfsSource.getState() === 'ready') {
                        const extent = wfsSource.getExtent(); // ดึงขอบเขตของข้อมูลทั้งหมดใน Source
                        
                        if (extent && !ol.extent.isEmpty(extent)) {
                            openlayer.getView().fit(extent, {
                                padding: [50, 50, 50, 50],
                                duration: 1000,
                                maxZoom: 15
                            });
                        } else {
                            console.warn("ไม่พบข้อมูลพิกัดในหาดที่เลือก");
                        }
                    }
                });
                AppMap.createOpenlayer(`${targetID}-map-openlayer`,wfsLayer);

                // ============================
                // COLOR THEME
                // ============================
                const COLOR_THEME = {
                    mapGradient: [
                        [0, '#e0f2fe'],
                        [0.5, '#38bdf8'],
                        [1, '#075985']
                    ],
                    shoreline: '#1f2937',
                    barTotal: '#0284c7', // รวม (length_km จาก WFS)
                    barMax: '#858585ff'    // สูงสุด (อ้างอิงจาก coastal_status ถ้าใช้)
                };

                const toNum = (v) => {
                    if (v === null || v === undefined) return 0;
                    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
                    const s = String(v).replace(/,/g, '').trim();
                    const n = Number(s);
                    return Number.isFinite(n) ? n : 0;
                };

                const cqlEscape = (s) => String(s ?? '').replace(/'/g, "''").trim();
                const hasBeach = !!(filterBeachsweet && String(filterBeachsweet).trim());
                const beachName = hasBeach ? String(filterBeachsweet).trim() : '';

                // ============================
                // WFS (filter ด้วย beachsheet)
                // ============================
                const shorelineBaseUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:shoreline_master_table_view' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const provinceBaseUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:province' +
                    '&propertyName=name_th,geom_simplify' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const shorelineUrl = hasBeach
                    ? `${shorelineBaseUrl}&CQL_FILTER=${encodeURIComponent(`beachsheet='${cqlEscape(beachName)}'`)}`
                    : shorelineBaseUrl;

                // province ไม่ได้ filter ตรง ๆ ด้วย beachsheet ได้ (คนละ layer)
                // เอาทั้งหมดมาแล้วค่อยตัดให้เหลือเฉพาะจังหวัดที่เกี่ยวข้องจากผล shoreline
                const provinceUrl = provinceBaseUrl;

                const [shorelineFC, provinceFC] = await Promise.all([
                    (await fetch(shorelineUrl)).json(),
                    (await fetch(provinceUrl)).json()
                ]);

                // ============================
                // Filter shoreline features (กันเหนียว)
                // ============================
                let filteredFeatures = shorelineFC.features || [];
                if (hasBeach) {
                    filteredFeatures = filteredFeatures.filter(
                        f => String(f?.properties?.beachsheet || '').trim() === beachName
                    );
                }

                // ============================
                // หา "จังหวัดของหาดนี้" จากข้อมูล shoreline (ใช้ทำ polygon)
                // ============================
                const provSet = new Set(
                    filteredFeatures
                        .map(f => String(f?.properties?.province || '').trim())
                        .filter(Boolean)
                );

                // ============================
                // MAP: รวม length_km ตามจังหวัด (ภายใน beachsheet นี้)
                // ============================
                const aggProv = new Map();
                for (const f of filteredFeatures) {
                    const p = f.properties || {};
                    const prov = String(p.province || '').trim();
                    if (!prov) continue;
                    aggProv.set(prov, (aggProv.get(prov) || 0) + toNum(p.length_km));
                }

                const mapProvinceList = Array.from(provSet).sort((a, b) => a.localeCompare(b, 'th'));

                // Province polygon เฉพาะจังหวัดที่เกี่ยวข้อง
                const provGeo = {
                    type: 'FeatureCollection',
                    features: (provinceFC.features || []).map(feat => {
                        const name_th = String(feat.properties?.name_th || '').trim();
                        const geometry = feat.geometry || feat.properties?.geom_simplify || feat.geom_simplify;
                        return { type: 'Feature', properties: { name_th }, geometry };
                    }).filter(f => f.geometry && provSet.has(String(f.properties?.name_th || '').trim()))
                };

                const mapPolygons = Highcharts.geojson(provGeo);
                mapPolygons.forEach(f => {
                    f.name_th = String(f.properties?.name_th || '').trim();
                    f.name = f.name_th;
                });

                const mapSeriesData = mapProvinceList.map(prov => ({
                    name_th: prov,
                    value: aggProv.get(prov) || 0
                }));

                // shoreline overlay (เป็นเส้น)
                const shoreLines = Highcharts.geojson(
                    { type: 'FeatureCollection', features: filteredFeatures },
                    'mapline'
                );

                // ============================
                // Render MAP
                // ============================
                Highcharts.mapChart(`${targetID}-map`, {
                    title: { text: hasBeach ? `ความยาวชายหาด (สำรวจ) — หาด: ${beachName}` : 'ความยาวชายหาด' },
                    credits: { enabled: false },
                    mapNavigation: { enabled: true },
                    colorAxis: { min: 0, stops: COLOR_THEME.mapGradient },
                    tooltip: {
                        useHTML: true,
                        formatter() {
                            if (typeof this.point.value === 'number') {
                                return `<b>${this.point.name}</b><br/>ความยาว: <b>${Highcharts.numberFormat(this.point.value, 2)}</b> km`;
                            }
                            return `<b>เส้นชายหาด</b>`;
                        }
                    },
                    series: [
                        {
                            type: 'map',
                            name: 'จังหวัด',
                            mapData: mapPolygons,
                            data: mapSeriesData,
                            joinBy: ['name_th', 'name_th'],
                            keys: ['name_th', 'value'],
                            borderColor: '#64748b',
                            borderWidth: 0.5,
                            nullColor: '#f1f5f9',
                            states: { hover: { brightness: 0.25 } },
                            dataLabels: { enabled: false }
                        },
                        {
                            type: 'mapline',
                            name: 'เส้นชายหาด',
                            data: shoreLines,
                            color: COLOR_THEME.shoreline,
                            lineWidth: 1.2,
                            enableMouseTracking: false
                        }
                    ]
                });

                // ============================
                // BAR: แสดง nosheet + sum length_km (ภายใน beachsheet นี้)
                // shoreline_master_table_view: nosheet + length_km
                // ============================

                // -------------------- 1) รวมความยาวจากเส้นตาม nosheet --------------------
                const noAgg = new Map();
                for (const f of filteredFeatures) {
                    const p = f.properties || {};
                    const no = String(p.nosheet || '').trim();
                    if (!no) continue;
                    noAgg.set(no, (noAgg.get(no) || 0) + toNum(p.length_km));
                }

                const TOP_N = 30;
                const noSorted = Array.from(noAgg.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, TOP_N); // [ [no, len], ... ]

                // -------------------- 2) อ่านตาราง coastal_status --------------------
                const CoastalStatusData = JSON.parse(
                    $('div[data-default="true"][data-name="coastal_status"]').html() || '{"data":[]}'
                );
                const statusRows = Array.isArray(CoastalStatusData?.data) ? CoastalStatusData.data : [];

                // -------------------- 3) รวมความยาวจากตารางตาม "เลขระวาง" --------------------
                const sumLenByNo = statusRows.reduce((acc, r) => {
                    const beach = String(r['ชื่อหาด/ระบบหาด'] || '').trim();
                    const no = String(r['เลขระวาง'] || '').trim();
                    const len = toNum(r['ความยาว (กม.)']);

                    // ถ้ามีการเลือก beach เฉพาะ ให้กรองตามนั้น
                    if (hasBeach && beach !== beachName) return acc;

                    // ต้องมีเลขระวางจริง (ข้าม "-" หรือค่าว่าง)
                    if (!no || no === '-') return acc;

                    acc.set(no, (acc.get(no) || 0) + len);
                    return acc;
                }, new Map());

                // -------------------- 4) เตรียม categories ให้ตรงกัน --------------------
                const categories = noSorted.map(([no]) => no);

                // ซีรีส์ 1: ความยาวสำรวจจากตาราง (ตามเลขระวางเดียวกับ categories)
                const surveyedLenSeries = categories.map(no => sumLenByNo.get(no) || 0);

                // ซีรีส์ 2: ความยาวรวมจากเส้น (filteredFeatures)
                const lineLenSeries = noSorted.map(([, len]) => len);

                // -------------------- 5) วาดกราฟ --------------------
                Highcharts.chart(`${targetID}-bar`, {
                    chart: { type: 'bar' },
                    title: { text: hasBeach ? `ความยาวชายหาด (สำรวจ) — ${beachName}` : `ความยาวชายหาด (สำรวจ)` },
                    credits: { enabled: false },
                    xAxis: { categories, title: { text: null } },
                    yAxis: { min: 0, title: { text: 'กิโลเมตร (km)', align: 'high' } },
                    // tooltip: { pointFormat: `ความยาวรวม: <b>{point.y:,.2f}</b> km` },
                    tooltip: {
                        shared: true,
                        pointFormat: `<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b> km<br/>`
                    },
                    plotOptions: { bar: { dataLabels: { enabled: true, format: '{y:.2f}' } } },
                    legend: { enabled: true },
                    series: [
                        {
                            name: 'ความยาวชายหาด (สูงสุด)',
                            data: surveyedLenSeries,
                            color: COLOR_THEME.barMax
                        },
                        {
                            name: 'ความยาวชายหาด (สำรวจ)',
                            data: lineLenSeries,
                            color: COLOR_THEME.barTotal
                        }
                    ]
                });
            })();
        },


        dashboardMapsQualityFinal: (targetID, filterMapLayout = []) => {
            (async () => {
                // ============================
                // COLOR THEME (DMCR style)
                // ============================
                const COLOR_THEME = {
                    shoreline: '#1f2937',
                    pieColors: [
                        '#dc2626', // กัดเซาะรุนแรง
                        '#f97316', // กัดเซาะปานกลาง
                        '#facc15', // กัดเซาะน้อย
                        '#22c55e', // DS
                        '#fb7185', // แก้ไขแล้วยังมีการกัดเซาะ
                        '#0ea5e9', // สมดุล
                        '#a855f7', // สะสมตะกอน
                        '#14b8a6', // หัวหาด/หาดหิน
                        '#64748b', // รุกล้ำ/ถมทะเล
                        '#94a3b8'  // ปากแม่น้ำ/ปากคลอง
                    ]
                };

                // layout map + pie
                const $wrap = $(`#${targetID}`);
                $wrap.empty();
                $wrap
                    .removeClass('hidden')
                    .addClass('flex flex-col lg:flex-row gap-4')
                    .html(`
                        <div id="${targetID}-map-openlayer" class="w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-map" class="hidden w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-pie" class="w-full lg:w-1/2 h-[600px]"></div>
                    `);
                var wfsSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return (
                            AppMap.geoserverWfsUrl +
                            '?service=WFS&' +
                            'version=1.1.0&' +
                            'request=GetFeature&' +
                            'typename=dmcrdrone_ws:shoreline_master_table_view&' + // ระบุ workspace และชื่อเลเยอร์
                            'outputFormat=application/json&' + // ขอเป็น JSON เพื่อความง่าย
                            'srsname=EPSG:3857&' +             // ระบุระบบพิกัดที่ต้องการ
                            'bbox=' + extent.join(',') + ',EPSG:3857' // ดึงเฉพาะพื้นที่ที่แสดงบนหน้าจอ
                        );
                    },
                    strategy: ol.loadingstrategy.bbox, // โหลดข้อมูลเฉพาะบริเวณที่มองเห็น (ช่วยเรื่อง Performance)
                });
                var wfsLayer = new ol.layer.Vector({
                    source: wfsSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 3
                        })
                    })
                });
                wfsSource.once('change', function() {
                    if (wfsSource.getState() === 'ready') {
                        const extent = wfsSource.getExtent(); // ดึงขอบเขตของข้อมูลทั้งหมดใน Source
                        
                        // สั่งให้ View ซูมไปที่ขอบเขตนั้น
                        openlayer.getView().fit(extent, {
                            padding: [50, 50, 50, 50], // เพิ่มพื้นที่ว่างขอบจอ (หน่วยเป็น Pixel)
                            duration: 1000,            // ความเร็วในการซูม (มิลลิวินาที)
                            maxZoom: 15                // ป้องกันการซูมใกล้เกินไปกรณีมีแค่จุดเดียว
                        });
                    }
                });
                AppMap.createOpenlayer(`${targetID}-map-openlayer`,wfsLayer);

                // อ่านข้อมูลสถานะชายฝั่งจาก DOM
                const CoastalStatusData = JSON.parse(
                    $('div[data-default="true"][data-name="coastal_status"]').html() || '{"data":[]}'
                );
                const rows = Array.isArray(CoastalStatusData?.data) ? CoastalStatusData.data : [];

                // 24 จังหวัดชายทะเล
                const COASTAL_24 = [
                    'ตราด', 'จันทบุรี', 'ระยอง', 'ชลบุรี', 'ฉะเชิงเทรา', 'สมุทรปราการ',
                    'กรุงเทพมหานคร', 'สมุทรสาคร', 'สมุทรสงคราม', 'เพชรบุรี', 'ประจวบคีรีขันธ์',
                    'ชุมพร', 'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'สงขลา', 'ปัตตานี', 'นราธิวาส',
                    'ระนอง', 'พังงา', 'ภูเก็ต', 'กระบี่', 'ตรัง', 'สตูล'
                ];
                const COASTAL_SET = new Set(COASTAL_24);
                // 10 สถานะ (map + pie ต้องใช้ชุดเดียวกัน)
                const QUALITY_CATEGORIES = [
                    'กัดเซาะรุนแรง',
                    'กัดเซาะปานกลาง',
                    'กัดเซาะน้อย',
                    'พื้นที่ที่มีการดำเนินการแก้ไขแล้วไม่มีการกัดเซาะ (DS)',
                    'ดำเนินการแก้ไขแล้วยังมีการกัดเซาะ',
                    'สมดุล',
                    'สะสมตะกอน',
                    'พื้นที่หัวหาด/หาดหิน',
                    'พิ้นที่ก่อสร้างรุกล้ำแนวชายฝั่ง/พื้นที่ถมทะเล',
                    'พื้นที่ปากแม่น้ำ/ปากคลอง'
                ];
                // helper parse number (รองรับ "1,234.56")
                const toNum = (v) => {
                    if (v === null || v === undefined) return 0;
                    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
                    const s = String(v).replace(/,/g, '').trim();
                    const n = Number(s);
                    return Number.isFinite(n) ? n : 0;
                };
                // helper filter rows จาก filterMapLayout (optional)
                const applyFilters = (rowsArr, filters) => {
                    if (!filters || !filters.length) return rowsArr;
                    return rowsArr.filter(r => {
                        return filters.every(fl => {
                            if (!fl?.values?.length) return true;
                            return fl.values.includes(r?.[fl.key]);
                        });
                    });
                };
                const filteredRows = applyFilters(rows, filterMapLayout);
                // index จังหวัด -> row
                const byProv = new Map();
                filteredRows.forEach(r => {
                    const prov = (r['จังหวัด'] || '').trim();
                    if (!prov) return;
                    if (!COASTAL_SET.has(prov)) return;
                    byProv.set(prov, r);
                });
                // ----------------------------
                // PIE: รวมทุกจังหวัด × 10 สถานะ
                // ----------------------------
                const pieData = QUALITY_CATEGORIES.map((cat, idx) => {
                    const sum = filteredRows.reduce((acc, r) => acc + toNum(r?.[cat]), 0);
                    return {
                        name: cat,
                        y: sum,
                        color: COLOR_THEME.pieColors[idx]
                    };
                });

                // ----------------------------
                // MAP: แสดง "ข้อมูลเดียวกัน 10 สถานะ" = ทำเป็น 10 layers (one color each)
                // วิธีนี้ทำให้ map สื่อสารเหมือน pie: จังหวัดถูกแบ่งตามสัดส่วน 10 สถานะ
                // (tooltip แสดงทุกสถานะของจังหวัดนั้น)
                // ----------------------------

                // fetch province polygon + shoreline line
                const provinceUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:province' +
                    '&propertyName=name_th,geom_simplify' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const shorelineUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:shoreline_master_table_view' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const [provinceFC, shorelineFC] = await Promise.all([
                    (await fetch(provinceUrl)).json(),
                    (await fetch(shorelineUrl)).json()
                ]);

                // province polygon เฉพาะ 24 จังหวัด
                const provinceGeo24 = {
                    type: 'FeatureCollection',
                    features: (provinceFC.features || []).map(f => {
                        const name_th = (f.properties?.name_th || '').trim();
                        const geometry = f.geometry || f.properties?.geom_simplify || f.geom_simplify;
                        return { type: 'Feature', properties: { name_th }, geometry };
                    }).filter(f => f.geometry && COASTAL_SET.has(f.properties.name_th))
                };

                const mapPolygons = Highcharts.geojson(provinceGeo24);
                mapPolygons.forEach(f => {
                    f.name_th = f.properties.name_th;
                    f.name = f.name_th;
                });

                // shoreline overlay เป็นเส้น (กรองเฉพาะ 24 จังหวัด)
                const shorelineFiltered = {
                    type: 'FeatureCollection',
                    features: (shorelineFC.features || []).filter(ft => {
                        const prov = (ft.properties?.province || '').trim();
                        return COASTAL_SET.has(prov);
                    })
                };
                const shorelineLines = Highcharts.geojson(shorelineFiltered, 'mapline');

                // เตรียม "data ต่อจังหวัด" ที่มีทุกสถานะไว้ใน point (ใช้ tooltip)
                const provStats = new Map();
                COASTAL_24.forEach(p => {
                    const r = byProv.get(p) || {};
                    const obj = {};
                    QUALITY_CATEGORIES.forEach(cat => { obj[cat] = toNum(r[cat]); });
                    provStats.set(p, obj);
                });

                // สร้าง series 10 ชุด (แต่ละชุดคือ map ของหมวดนั้น ๆ)
                // แต่ละหมวดใช้ "ค่า" เพื่อ hover/tooltip และใช้ "สีคงที่" ของหมวดนั้น
                const statusSeries = QUALITY_CATEGORIES.map((cat, idx) => ({
                    type: 'map',
                    name: cat,
                    mapData: mapPolygons,
                    // data แค่เอาค่า cat ใส่เข้าไป พร้อมแนบทุกสถานะสำหรับ tooltip
                    data: COASTAL_24.map(p => ({
                        name_th: p,
                        value: provStats.get(p)?.[cat] || 0,
                        __all: provStats.get(p) || {}
                    })),
                    joinBy: ['name_th', 'name_th'],
                    keys: ['name_th', 'value'],
                    // ทำให้ series นี้เป็น "layer สีเดียว" (ไม่ใช้ colorAxis)
                    color: COLOR_THEME.pieColors[idx],
                    nullColor: 'rgba(0,0,0,0)',
                    borderColor: '#64748b',
                    borderWidth: 0.5,
                    // ปรับ opacity ให้เห็นหลาย layer ทับกันได้ (ถ้าไม่อยากทับกัน ให้ตั้ง 0.9 แล้วเลือกเปิดทีละ layer)
                    opacity: 0.18,
                    states: { hover: { brightness: 0.25 } },
                    tooltip: { pointFormat: '' } // ใช้ tooltip formatter รวมด้านล่าง
                }));

                Highcharts.mapChart(`${targetID}-map`, {
                    title: { text: 'จังหวัดชายทะเล + เส้นชายหาด' },
                    credits: { enabled: false },
                    mapNavigation: { enabled: true },

                    // ไม่ใช้ colorAxis เพราะแต่ละสถานะมีสีของตัวเอง
                    tooltip: {
                        useHTML: true,
                        formatter() {
                            const p = this.point || {};
                            const name = p.name || p.name_th || '';
                            const all = p.__all || provStats.get(name) || {};
                            const lines = QUALITY_CATEGORIES.map(cat =>
                                `${cat}: <b>${Highcharts.numberFormat(all[cat] || 0, 2)}</b> กม.`
                            ).join('<br/>');
                            return `<b>${name}</b><br/>${lines}`;
                        }
                    },

                    series: [
                        ...statusSeries,
                        {
                            type: 'mapline',
                            name: 'เส้นชายหาด',
                            data: shorelineLines,
                            color: COLOR_THEME.shoreline,
                            lineWidth: 1.2,
                            enableMouseTracking: false
                        }
                    ]
                });

                // ----------------------------
                // PIE (10 สถานะเดียวกับ MAP)
                // ----------------------------
                Highcharts.chart(`${targetID}-pie`, {
                    chart: { type: 'pie' },
                    title: { text: 'สัดส่วนสถานะชายฝั่ง' },
                    credits: { enabled: false },
                    tooltip: {
                        pointFormat: `<b>{point.y:,.2f}</b> กม. ({point.percentage:.1f}%)`
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false,
                                format: '{point.name}: {point.percentage:.1f}%'
                            }
                        }
                    },
                    series: [{
                        name: 'ความยาว (กม.)',
                        data: pieData
                    }]
                });

            })();
        },
        dashboardMapsQualityProvinceFinal: (targetID, filterProvince) => {
            (async () => {

                const $wrap = $(`#${targetID}`);
                $wrap.empty();
                $wrap
                    .removeClass('hidden')
                    .addClass('flex flex-col lg:flex-row gap-4')
                    .html(`
                        <div id="${targetID}-map-openlayer" class="w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-map" class="hidden w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-pie" class="w-full lg:w-1/2 h-[600px]"></div>
                    `);
                var wfsSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return (
                            AppMap.geoserverWfsUrl +
                            '?service=WFS&' +
                            'version=1.1.0&' +
                            'request=GetFeature&' +
                            'typename=dmcrdrone_ws:shoreline_master_table_view&' +
                            'outputFormat=application/json&' +
                            'srsname=EPSG:3857&' +
                            'cql_filter=' + encodeURIComponent("province='" + filterProvince + "'") // ใส่ ' ' คร่อมชื่อจังหวัด
                        );
                    },
                    strategy: ol.loadingstrategy.all
                });
                var wfsLayer = new ol.layer.Vector({
                    source: wfsSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 3
                        })
                    })
                });
                wfsSource.once('change', function() {
                    if (wfsSource.getState() === 'ready') {
                        const extent = wfsSource.getExtent(); // ดึงขอบเขตของข้อมูลทั้งหมดใน Source
                        
                        if (extent && !ol.extent.isEmpty(extent)) {
                            openlayer.getView().fit(extent, {
                                padding: [50, 50, 50, 50],
                                duration: 1000,
                                maxZoom: 15
                            });
                        } else {
                            console.warn("ไม่พบข้อมูลพิกัดในจังหวัดที่เลือก");
                        }
                    }
                });
                AppMap.createOpenlayer(`${targetID}-map-openlayer`,wfsLayer);

                // ============================
                // COLOR THEME
                // ============================
                const COLOR_THEME = {
                    shoreline: '#1f2937',
                    pieColors: [
                        '#dc2626', // กัดเซาะรุนแรง
                        '#f97316', // กัดเซาะปานกลาง
                        '#facc15', // กัดเซาะน้อย
                        '#22c55e', // DS
                        '#fb7185', // แก้ไขแล้วยังมีการกัดเซาะ
                        '#0ea5e9', // สมดุล
                        '#a855f7', // สะสมตะกอน
                        '#14b8a6', // หัวหาด/หาดหิน
                        '#64748b', // รุกล้ำ/ถมทะเล
                        '#94a3b8'  // ปากแม่น้ำ/ปากคลอง
                    ]
                };

                // ============================
                // helpers
                // ============================
                const toNum = (v) => {
                    if (v === null || v === undefined) return 0;
                    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
                    const s = String(v).replace(/,/g, '').trim();
                    if (!s || s === '-' || s === '–') return 0;
                    const n = Number(s);
                    return Number.isFinite(n) ? n : 0;
                };

                const cqlEscape = (s) => String(s ?? '').replace(/'/g, "''").trim();
                const provName = String(filterProvince).trim();

                // ============================
                // 10 สถานะชายฝั่ง
                // ============================
                const QUALITY_CATEGORIES = [
                    'กัดเซาะรุนแรง',
                    'กัดเซาะปานกลาง',
                    'กัดเซาะน้อย',
                    'พื้นที่ที่มีการดำเนินการแก้ไขแล้วไม่มีการกัดเซาะ (DS)',
                    'ดำเนินการแก้ไขแล้วยังมีการกัดเซาะ',
                    'สมดุล',
                    'สะสมตะกอน',
                    'พื้นที่หัวหาด/หาดหิน',
                    'พิ้นที่ก่อสร้างรุกล้ำแนวชายฝั่ง/พื้นที่ถมทะเล',
                    'พื้นที่ปากแม่น้ำ/ปากคลอง'
                ];

                // ============================
                // coastal_status (ตารางคุณภาพ)
                // ============================
                const CoastalStatusData = JSON.parse(
                    $('div[data-default="true"][data-name="coastal_status"]').html() || '{"data":[]}'
                );
                const statusRows = Array.isArray(CoastalStatusData?.data)
                    ? CoastalStatusData.data
                    : [];

                // ============================
                // รวมหลาย row ของจังหวัดที่เลือก -> provAgg
                // ============================
                const provAgg = QUALITY_CATEGORIES.reduce((acc, cat) => {
                    acc[cat] = 0;
                    return acc;
                }, { จังหวัด: provName });

                statusRows
                    .filter(r => String(r['จังหวัด'] || '').trim() === provName)
                    .forEach(r => {
                        QUALITY_CATEGORIES.forEach(cat => {
                            provAgg[cat] += toNum(r?.[cat]);
                        });
                    });

                // ============================
                // PIE data
                // ============================
                const pieData = QUALITY_CATEGORIES.map((cat, idx) => ({
                    name: cat,
                    y: provAgg[cat],
                    color: COLOR_THEME.pieColors[idx]
                }));

                const totalQualityLen = QUALITY_CATEGORIES.reduce(
                    (s, cat) => s + provAgg[cat], 0
                );

                // ============================
                // WFS: province polygon + shoreline
                // ============================
                const provinceUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:province' +
                    '&propertyName=name_th,geom_simplify' +
                    '&outputFormat=application/json&srsName=EPSG:4326' +
                    `&CQL_FILTER=${encodeURIComponent(`name_th='${cqlEscape(provName)}'`)}`;

                const shorelineUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:shoreline_master_table_view' +
                    '&outputFormat=application/json&srsName=EPSG:4326' +
                    `&CQL_FILTER=${encodeURIComponent(`province='${cqlEscape(provName)}'`)}`;

                const [provinceFC, shorelineFC] = await Promise.all([
                    (await fetch(provinceUrl)).json(),
                    (await fetch(shorelineUrl)).json()
                ]);

                // ============================
                // province polygon
                // ============================
                const provGeo = {
                    type: 'FeatureCollection',
                    features: (provinceFC.features || []).map(f => {
                        const name_th = String(f.properties?.name_th || '').trim();
                        const geometry = f.geometry || f.properties?.geom_simplify || f.geom_simplify;
                        return { type: 'Feature', properties: { name_th }, geometry };
                    }).filter(f => f.geometry && f.properties.name_th === provName)
                };

                const mapPolygons = Highcharts.geojson(provGeo);
                mapPolygons.forEach(f => {
                    f.name_th = f.properties.name_th;
                    f.name = f.name_th;
                });

                const shoreLines = Highcharts.geojson(
                    { type: 'FeatureCollection', features: shorelineFC.features || [] },
                    'mapline'
                );

                // ============================
                // MAP
                // ============================
                Highcharts.mapChart(`${targetID}-map`, {
                    title: { text: `สถานะชายฝั่ง — ${provName}` },
                    credits: { enabled: false },
                    mapNavigation: { enabled: true },
                    colorAxis: {
                        min: 0,
                        max: totalQualityLen || 1,
                        stops: [
                            [0, '#e5e7eb'],
                            [1, '#0284c7']
                        ]
                    },
                    tooltip: {
                        useHTML: true,
                        formatter() {
                            const lines = QUALITY_CATEGORIES.map(cat =>
                                `${cat}: <b>${Highcharts.numberFormat(provAgg[cat], 2)}</b> กม.`
                            ).join('<br/>');
                            return `<b>${provName}</b><br/>${lines}`;
                        }
                    },
                    series: [
                        {
                            type: 'map',
                            name: 'จังหวัด',
                            mapData: mapPolygons,
                            data: [{ name_th: provName, value: totalQualityLen }],
                            joinBy: ['name_th', 'name_th'],
                            keys: ['name_th', 'value'],
                            borderColor: '#64748b',
                            borderWidth: 0.6,
                            nullColor: '#f1f5f9'
                        },
                        {
                            type: 'mapline',
                            name: 'เส้นชายหาด',
                            data: shoreLines,
                            color: COLOR_THEME.shoreline,
                            lineWidth: 1.2,
                            enableMouseTracking: false
                        }
                    ]
                });

                // ============================
                // PIE
                // ============================
                Highcharts.chart(`${targetID}-pie`, {
                    chart: { type: 'pie' },
                    title: { text: `สัดส่วนสถานะชายฝั่ง (${provName})` },
                    credits: { enabled: false },
                    tooltip: {
                        pointFormat: `<b>{point.y:,.2f}</b> กม. ({point.percentage:.1f}%)`
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: { enabled: false }
                        }
                    },
                    series: [{
                        name: 'ความยาว (กม.)',
                        data: pieData
                    }]
                });

            })();
        },

        dashboardMapsQualityBeachFinal: (targetID, filterBeachsweet = null) => {
            (async () => {
                const $wrap = $(`#${targetID}`);
                $wrap.empty();
                $wrap
                    .removeClass('hidden')
                    .addClass('flex flex-col lg:flex-row gap-4')
                    .html(`
                        <div id="${targetID}-map-openlayer" class="w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-map" class="hidden w-full lg:w-1/2 h-[600px]"></div>
                        <div id="${targetID}-pie" class="w-full lg:w-1/2 h-[600px]"></div>
                    `);
                var wfsSource = new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return (
                            AppMap.geoserverWfsUrl +
                            '?service=WFS&' +
                            'version=1.1.0&' +
                            'request=GetFeature&' +
                            'typename=dmcrdrone_ws:shoreline_master_table_view&' +
                            'outputFormat=application/json&' +
                            'srsname=EPSG:3857&' +
                            'cql_filter=' + encodeURIComponent("beachsheet='" + filterBeachsweet + "'") // ใส่ ' ' คร่อมชื่อจังหวัด
                        );
                    },
                    strategy: ol.loadingstrategy.all
                });
                var wfsLayer = new ol.layer.Vector({
                    source: wfsSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 3
                        })
                    })
                });
                wfsSource.once('change', function() {
                    if (wfsSource.getState() === 'ready') {
                        const extent = wfsSource.getExtent(); // ดึงขอบเขตของข้อมูลทั้งหมดใน Source
                        
                        if (extent && !ol.extent.isEmpty(extent)) {
                            openlayer.getView().fit(extent, {
                                padding: [50, 50, 50, 50],
                                duration: 1000,
                                maxZoom: 15
                            });
                        } else {
                            console.warn("ไม่พบข้อมูลพิกัดในหาดที่เลือก");
                        }
                    }
                });
                AppMap.createOpenlayer(`${targetID}-map-openlayer`,wfsLayer);

                // ============================
                // COLOR THEME
                // ============================
                const COLOR_THEME = {
                    shoreline: '#1f2937',
                    pieColors: [
                        '#dc2626', // กัดเซาะรุนแรง
                        '#f97316', // กัดเซาะปานกลาง
                        '#facc15', // กัดเซาะน้อย
                        '#22c55e', // DS
                        '#fb7185', // แก้ไขแล้วยังมีการกัดเซาะ
                        '#0ea5e9', // สมดุล
                        '#a855f7', // สะสมตะกอน
                        '#14b8a6', // หัวหาด/หาดหิน
                        '#64748b', // รุกล้ำ/ถมทะเล
                        '#94a3b8'  // ปากแม่น้ำ/ปากคลอง
                    ]
                };

                // ============================
                // HELPERS
                // ============================
                const toNum = (v) => {
                    if (v === null || v === undefined) return 0;
                    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
                    const s = String(v).replace(/,/g, '').trim();
                    if (!s || s === '-' || s === '-   ') return 0;
                    const n = Number(s);
                    return Number.isFinite(n) ? n : 0;
                };

                const cqlEscape = (s) => String(s ?? '').replace(/'/g, "''").trim();
                const hasBeach = !!(filterBeachsweet && String(filterBeachsweet).trim());
                const beachName = hasBeach ? String(filterBeachsweet).trim() : '';

                // ============================
                // 10 สถานะ (ใช้ชุดเดียวกับ pie)
                // ============================
                const QUALITY_CATEGORIES = [
                    'กัดเซาะรุนแรง',
                    'กัดเซาะปานกลาง',
                    'กัดเซาะน้อย',
                    'พื้นที่ที่มีการดำเนินการแก้ไขแล้วไม่มีการกัดเซาะ (DS)',
                    'ดำเนินการแก้ไขแล้วยังมีการกัดเซาะ',
                    'สมดุล',
                    'สะสมตะกอน',
                    'พื้นที่หัวหาด/หาดหิน',
                    'พื้นที่ก่อสร้างรุกล้ำแนวชายฝั่ง/พื้นที่ถมทะเล',
                    'พื้นที่ปากแม่น้ำ/ปากคลอง'
                ];

                // ============================
                // coastal_status (ตารางคุณภาพ)
                // ============================
                const CoastalStatusData = JSON.parse(
                    $('div[data-default="true"][data-name="coastal_status"]').html() || '{"data":[]}'
                );
                const statusRows = Array.isArray(CoastalStatusData?.data) ? CoastalStatusData.data : [];

                /**
                 * รวม statusRows เป็น summary ต่อ "ชื่อหาด/ระบบหาด"
                 * - ถ้า "ชื่อหาด/ระบบหาด" เป็น "-" ให้ fallback เป็น "ทั้งจังหวัด: <จังหวัด>"
                 * - กันบวกซ้ำ: ถ้า key เดียวกันมีหลายเลขระวาง แต่ตัวเลข “ระดับรวม” ถูกซ้ำมาหลายแถว
                 *   ให้เปิด useDedup=true เพื่อไม่บวกซ้ำภายใน key เดียวกัน (นับแค่ 1 แถวต่อเลขระวาง)
                 */
                function aggregateByBeachSystem(rows, { useDedup = false } = {}) {
                    const map = new Map();

                    for (const r of (rows || [])) {
                        const prov = String(r['จังหวัด'] || '').trim();

                        const rawBeach = String(r['ชื่อหาด/ระบบหาด'] || '').trim();
                        const beachKey = (rawBeach && rawBeach !== '-') ? rawBeach : `ทั้งจังหวัด: ${prov}`;

                        // ถ้าคุณกลัวชื่อ beach ซ้ำข้ามจังหวัด ให้ใช้ key แบบรวมจังหวัด:
                        // const key = `${prov}__${beachKey}`;
                        const key = beachKey;

                        if (!map.has(key)) {
                            map.set(key, {
                                key,
                                'จังหวัด': prov,
                                'ชื่อหาด/ระบบหาด': beachKey,
                                sums: Object.fromEntries(QUALITY_CATEGORIES.map(c => [c, 0])),
                                totalLen: 0,
                                _seen: new Set()
                            });
                        }

                        const agg = map.get(key);

                        if (useDedup) {
                            // ใช้เลขระวางเป็นตัวกันซ้ำ (ถ้าคุณมี field อื่นที่ unique กว่า เปลี่ยนได้)
                            const segId = String(r['เลขระวาง'] || '').trim();
                            const dedupKey = segId || JSON.stringify(
                                QUALITY_CATEGORIES.map(c => String(r[c] ?? '').trim()).concat([String(r['ความยาว (กม.)'] ?? '').trim()])
                            );

                            if (agg._seen.has(dedupKey)) continue;
                            agg._seen.add(dedupKey);
                        }

                        for (const cat of QUALITY_CATEGORIES) {
                            agg.sums[cat] += toNum(r[cat]);
                        }
                        agg.totalLen += toNum(r['ความยาว (กม.)']);
                    }

                    // ลบ _seen ออกก่อน return (ไม่จำเป็นต้อง expose)
                    return Array.from(map.values()).map(({ _seen, ...rest }) => rest);
                }

                // ============================
                // WFS: shoreline (filter beachsheet) + province polygons
                // ============================
                const shorelineBaseUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:shoreline_master_table_view' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const provinceBaseUrl =
                    AppMap.geoserverWfsUrl +
                    '?service=WFS&version=2.0.0&request=GetFeature' +
                    '&typeName=dmcrdrone_ws:province' +
                    '&propertyName=name_th,geom_simplify' +
                    '&outputFormat=application/json&srsName=EPSG:4326';

                const shorelineUrl = hasBeach
                    ? `${shorelineBaseUrl}&CQL_FILTER=${encodeURIComponent(`beachsheet='${cqlEscape(beachName)}'`)}`
                    : shorelineBaseUrl;

                const [shorelineFC, provinceFC] = await Promise.all([
                    (await fetch(shorelineUrl)).json(),
                    (await fetch(provinceBaseUrl)).json()
                ]);

                // filter กันเหนียว
                let filteredFeatures = shorelineFC.features || [];
                if (hasBeach) {
                    filteredFeatures = filteredFeatures.filter(
                        f => String(f?.properties?.beachsheet || '').trim() === beachName
                    );
                }

                // จังหวัดที่เกี่ยวข้องกับ beachsheet นี้ (จาก shoreline)
                const provList = Array.from(new Set(
                    filteredFeatures.map(f => String(f?.properties?.province || '').trim()).filter(Boolean)
                ));

                // ============================
                // PIE: รวมค่าจาก statusRows แบบ "ชื่อหาด/ระบบหาด"
                // เงื่อนไข:
                // - ถ้ามี filterBeachsweet มา:
                //   (1) พยายาม match กับ "ชื่อหาด/ระบบหาด" ก่อน
                //   (2) ถ้าไม่เจอเลย -> fallback เป็นการรวมราย "จังหวัดจาก shoreline" (เหมือนโค้ดเดิม)
                // ============================
                const aggregatedBeach = aggregateByBeachSystem(statusRows, {
                    // ถ้าในตารางคุณมีปัญหาค่าซ้ำหลายแถว (เหมือนตัวอย่าง SNI01..SNI12)
                    // ให้ลอง true
                    useDedup: true
                });

                // 1) match by beach system name
                const matchedBeachRow = hasBeach
                    ? aggregatedBeach.find(x => String(x['ชื่อหาด/ระบบหาด'] || '').trim() === beachName)
                    : null;

                let pieData;

                if (matchedBeachRow) {
                    // --- pie แบบตรงกับชื่อหาด/ระบบหาด
                    pieData = QUALITY_CATEGORIES.map((cat, idx) => ({
                        name: cat,
                        y: toNum(matchedBeachRow.sums[cat]),
                        color: COLOR_THEME.pieColors[idx]
                    }));
                } else {
                    // --- fallback: pie แบบรวมรายจังหวัดที่อยู่ใน shoreline (โค้ดเดิม แต่ทำให้ปลอดภัยขึ้น)
                    //     หมายเหตุ: statusRows ของคุณมีทั้งระดับจังหวัด (-) และระดับหาด (มีชื่อ)
                    //     ถ้าจะรวมรายจังหวัดให้ “ไม่บวกซ้ำ” แนะนำเลือกเฉพาะแถวที่ชื่อหาดเป็น "-"
                    const statusProvOnly = statusRows.filter(r => String(r['ชื่อหาด/ระบบหาด'] || '').trim() === '-');

                    pieData = QUALITY_CATEGORIES.map((cat, idx) => {
                        let sum = 0;
                        for (const prov of provList) {
                            const row = statusProvOnly.find(r => String(r['จังหวัด'] || '').trim() === prov);
                            if (row) sum += toNum(row[cat]);
                        }
                        return { name: cat, y: sum, color: COLOR_THEME.pieColors[idx] };
                    });
                }

                const totalQualityLen = pieData.reduce((s, p) => s + toNum(p.y), 0);

                // ============================
                // MAP: จังหวัดที่เกี่ยวข้อง + เส้นชายหาด
                // shading ใช้ “รวม 10 สถานะของจังหวัดนั้น” (จากตารางจังหวัดเท่านั้นเพื่อกันซ้ำ)
                // tooltip แสดงรายการ 10 สถานะ (ระดับ pie ที่คำนวณไว้)
                // ============================

                // province polygons เฉพาะจังหวัดที่เกี่ยวข้อง
                const provSet = new Set(provList);

                const provGeo = {
                    type: 'FeatureCollection',
                    features: (provinceFC.features || [])
                        .map(f => {
                            const name_th = String(f.properties?.name_th || '').trim();
                            const geometry = f.geometry || f.properties?.geom_simplify || f.geom_simplify;
                            return { type: 'Feature', properties: { name_th }, geometry };
                        })
                        .filter(f => f.geometry && provSet.has(String(f.properties?.name_th || '').trim()))
                };

                const mapPolygons = Highcharts.geojson(provGeo);
                mapPolygons.forEach(f => {
                    f.name_th = f.properties.name_th;
                    f.name = f.name_th;
                });

                // ใช้เฉพาะแถวจังหวัด (ชื่อหาด "-") เพื่อ shading กันซ้ำ
                const statusProvOnly = statusRows.filter(r => String(r['ชื่อหาด/ระบบหาด'] || '').trim() === '-');

                const mapSeriesData = provList.map(prov => {
                    const row = statusProvOnly.find(r => String(r['จังหวัด'] || '').trim() === prov) || {};
                    const v = QUALITY_CATEGORIES.reduce((s, cat) => s + toNum(row[cat]), 0);
                    return { name_th: prov, value: v };
                });

                // shoreline overlay
                const shoreLines = Highcharts.geojson(
                    { type: 'FeatureCollection', features: filteredFeatures },
                    'mapline'
                );

                const tooltipLines = QUALITY_CATEGORIES.map((cat, i) => {
                    const v = pieData[i]?.y || 0;
                    return `${cat}: <b>${Highcharts.numberFormat(v, 2)}</b> กม.`;
                }).join('<br/>');

                Highcharts.mapChart(`${targetID}-map`, {
                    title: { text: hasBeach ? `สถานะชายฝั่ง — ${beachName}` : 'สถานะชายฝั่ง + เส้นชายหาด' },
                    credits: { enabled: false },
                    mapNavigation: { enabled: true },
                    colorAxis: {
                        min: 0,
                        max: totalQualityLen || 1,
                        stops: [
                            [0, '#e5e7eb'],
                            [1, '#0284c7']
                        ]
                    },
                    tooltip: {
                        useHTML: true,
                        formatter() {
                            if (this.point && typeof this.point.value === 'number') {
                                return `<b>${this.point.name}</b><br/>${tooltipLines}`;
                            }
                            return `<b>เส้นชายหาด</b>`;
                        }
                    },
                    series: [
                        {
                            type: 'map',
                            name: 'จังหวัด',
                            mapData: mapPolygons,
                            data: mapSeriesData,
                            joinBy: ['name_th', 'name_th'],
                            keys: ['name_th', 'value'],
                            borderColor: '#64748b',
                            borderWidth: 0.6,
                            nullColor: '#f1f5f9'
                        },
                        {
                            type: 'mapline',
                            name: 'เส้นชายหาด',
                            data: shoreLines,
                            color: COLOR_THEME.shoreline,
                            lineWidth: 1.2,
                            enableMouseTracking: false
                        }
                    ]
                });

                // ============================
                // PIE
                // ============================
                Highcharts.chart(`${targetID}-pie`, {
                    chart: { type: 'pie' },
                    title: { text: hasBeach ? `สัดส่วนสถานะชายฝั่ง — ${beachName}` : 'สัดส่วนสถานะชายฝั่ง' },
                    credits: { enabled: false },
                    tooltip: {
                        pointFormat: `<b>{point.y:,.2f}</b> กม. ({point.percentage:.1f}%)`
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false,
                                format: '{point.name}: {point.percentage:.1f}%'
                            }
                        }
                    },
                    series: [{
                        name: 'ความยาว (กม.)',
                        data: pieData
                    }]
                });

            })();
        },

        restartCesium: () => {
            try {
                if (AppMap.featureInfoHandler) {
                    AppMap.featureInfoHandler.destroy();
                    AppMap.featureInfoHandler = null;
                }
                if (cesiumInit) {
                    cesiumInit.destroy();
                    cesiumInit = null;
                }
                setTimeout(() => {
                    AppMap.initCesium();
                }, 1000);

            } catch (e) {
                console.error('❌ Restart failed:', e);
            }
        },

        /**
         * คำนวณปริมาตรโดยประมาณภายในรัศมีรอบจุดคลิก
         * จากค่าระดับสีเทา (gray index) ที่ได้จาก WMS/ภาพ DEM
         *
         * @param {number} radiusMeters - รัศมีของพื้นที่รอบจุดคลิก (หน่วย: เมตร)
         * @param {number} grayindex    - ค่า gray (เช่น 0–255 หรือค่าที่ map แล้ว) ที่แทนความสูง/ความลึก
         * @returns {number}            - ปริมาตรโดยประมาณ (หน่วย: ลูกบาศก์เมตร, m³)
        */
        calcVolumeAroundClickWms: (radiusMeters, grayindex) => {
            // ตัวคูณแปลงค่าจาก gray -> ความสูง (เมตร)
            // เช่น ถ้า gray = 10 และ GRAY_TO_METER = 0.1 => dz = 1 เมตร
            const GRAY_TO_METER = 0.1;

            // ระยะห่างระหว่างจุด sample ในแกน x,y (หน่วย: เมตร)
            // ยิ่ง step เล็ก => ยิ่งละเอียด แต่ใช้เวลา run นานขึ้น
            const step = 5; // m
            const areaPerSample = step * step; // m² (ประมาณ, approx.)

            // ตัวแปรเก็บผลรวมปริมาตรทั้งหมด (m³)
            let total = 0;

            // วนลูปในกรอบสี่เหลี่ยมที่ครอบวงกลมรัศมี radiusMeters
            // dx, dy แทน offset จากจุดคลิกในทิศ x,y (หน่วย: เมตร)
            for (let dx = -radiusMeters; dx <= radiusMeters; dx += step) {
                for (let dy = -radiusMeters; dy <= radiusMeters; dy += step) {

                    // เช็คว่า (dx, dy) อยู่ "ในวงกลม" จริงหรือไม่
                    // ถ้า sqrt(dx^2 + dy^2) > radius => อยู่นอกวงกลม => ข้าม
                    if (Math.sqrt(dx * dx + dy * dy) > radiusMeters) continue;

                    // ในเวอร์ชันนี้ใช้ค่า grayindex เดียวกันทุกจุด
                    // ถ้าต้องการความละเอียดจริง ๆ ควรอ่าน gray ใหม่ตามตำแหน่ง (dx, dy)
                    const gray = grayindex;

                    // ถ้า gray เป็น null, undefined หรือไม่ใช่ตัวเลขปกติ ให้ข้าม
                    if (gray == null || !Number.isFinite(gray)) continue;

                    // แปลงค่าระดับสี (gray) -> ความสูง/ความลึกแนวตั้ง (dz) หน่วย: เมตร
                    const dz = gray * GRAY_TO_METER; // m

                    // ปริมาตรย่อยที่จุดนี้ = ความสูง dz * พื้นที่ที่จุดนี้แทนตัว (areaPerSample)
                    // หน่วย: m (สูง) × m² (พื้นที่) = m³ (ปริมาตร)
                    const dV = dz * areaPerSample;   // m³

                    // สะสมปริมาตรย่อยเข้ากับผลรวม
                    total += dV;
                }
            }

            // ส่งกลับปริมาตรโดยประมาณทั้งหมด (m³)
            return total;
        },

        /**
         * ดึงค่าความสูงจาก Terrain ของ Cesium ตำแหน่งที่กำหนด (lon, lat)
         *
         * ใช้ฟังก์ชัน sampleTerrainMostDetailed เพื่อขอค่าความสูงละเอียดที่สุด
         * จาก terrainProvider ปัจจุบันของ Cesium (เช่น Cesium World Terrain หรือ DEM ที่ผู้ใช้โหลดเอง)
         *
         * @param {number} lon - ลองจิจูด (degree)
         * @param {number} lat - ละติจูด (degree)
         * @returns {Promise<number|null>} - ความสูงหน่วยเมตร (ทศนิยม 2 ตำแหน่ง) หรือ null ถ้าไม่พบค่า
         */
        getHeightAtPointFromCesium: async (lon, lat) => {

            // 1) สร้างตำแหน่ง Cartographic จากค่าพิกัดองศา
            //    - longitude (rad)
            //    - latitude  (rad)
            //    - height    (m) → เดิมยังไม่มี ก็เป็น undefined
            const carto = Cesium.Cartographic.fromDegrees(lon, lat);

            // 2) ขอค่าความสูงจาก terrainProvider
            //    sampleTerrainMostDetailed ต้องการ array ของ Cartographic
            //    ฟังก์ชันจะคืน array เดิม แต่เติมค่าความสูง (height) ลงไป
            //
            //    - ยิ่ง zoom ละเอียด (หรือ terrain รองรับ) ยิ่งแม่นยำ
            //    - ฟังก์ชันเป็น async เพราะต้องโหลดข้อมูล tile terrain
            const updated = await Cesium.sampleTerrainMostDetailed(
                cesiumInit.terrainProvider,
                [carto] // ใส่เป็น array แม้จะมีจุดเดียว
            );

            // 3) updated[0].height คือความสูงที่ terrain ระบุสำหรับจุดนั้น
            //    หน่วย: เมตร
            //    อ้างอิงระดับพื้นโลกตาม ellipsoid + ค่าความสูงของ terrain
            const h = updated[0].height;

            // 4) ถ้าได้ค่า valid → ปัดทศนิยม 2 ตำแหน่ง (string)
            //    ถ้าไม่ได้ → คืน null
            return Number.isFinite(h) ? h.toFixed(2) : null;
        },

        /**
         * คำนวณระยะทางบนพื้นผิวโลก (หน่วย: เมตร)
         * โดยใช้สูตร Haversine ซึ่งเหมาะสำหรับระยะทางระหว่างจุด 2 จุด
         * ที่ระบุตำแหน่งด้วยลองจิจูด/ละติจูดในหน่วยองศา
         *
         * @param {number} lon1 - ลองจิจูดจุดที่ 1 (degree)
         * @param {number} lat1 - ละติจูดจุดที่ 1 (degree)
         * @param {number} lon2 - ลองจิจูดจุดที่ 2 (degree)
         * @param {number} lat2 - ละติจูดจุดที่ 2 (degree)
         * @returns {number} - ระยะทางระหว่างสองจุดบนผิวโลก (หน่วย: เมตร)
         */
        distanceMeters: (lon1, lat1, lon2, lat2) => {
            // รัศมีเฉลี่ยของโลก (WGS84 ellipsoid)
            // ใช้ค่า 6378137 m ซึ่งเป็นค่า equatorial radius
            const R = 6378137; // meters

            // helper แปลง degree → radian
            const toRad = d => d * Math.PI / 180;

            // แปลง lat เป็น radian
            const φ1 = toRad(lat1);
            const φ2 = toRad(lat2);

            // ความต่างละติจูด และลองจิจูดในรูปแบบ radian
            const Δφ = toRad(lat2 - lat1);
            const Δλ = toRad(lon2 - lon1);

            // Haversine formula
            const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +       // ส่วนต่างละติจูด
                Math.cos(φ1) * Math.cos(φ2) *               // ค่าละติจูดทั้งคู่
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);        // ส่วนต่างลองจิจูด

            // ส่วนของมุมระหว่างสองจุดบนทรงกลม
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            // ระยะทางสุดท้าย = มุม * รัศมีโลก
            return R * c; // meters
        },

        generateBeachProfileFromGeom: async (geomStr, spacingMeters = 1, realdemfile = false) => {

            const geom = JSON.parse(geomStr);
            const profilePoints = [];
            if (geom.type !== "LineString" || geom.coordinates.length < 2) {
                throw new Error("geom ต้องเป็น LineString 2 จุดขึ้นไป");
            }
            const [start, end] = geom.coordinates;
            const [lon1, lat1] = start;
            const [lon2, lat2] = end;

            const lengthMeters = AppMap.distanceMeters(lon1, lat1, lon2, lat2);
            const nSamples = Math.max(2, Math.floor(lengthMeters / spacingMeters) + 1);

            if (realdemfile) {

                for (let i = 0; i < nSamples; i++) {
                    const s = i * spacingMeters;         // ระยะจากจุดเริ่ม (เมตร)
                    const t = s / lengthMeters;          // 0..1 along the line

                    const lon = lon1 + (lon2 - lon1) * t;
                    const lat = lat1 + (lat2 - lat1) * t;

                    profilePoints.push({
                        id: i,
                        distance: s,
                        lon,
                        lat
                    });
                }

                const ajaxRequest = $.ajax({
                    url: `${$('meta[name="mapapi"]').attr('content')}/map-api/get-evaluation`,
                    type: 'POST',
                    dataType: 'json',
                    timeout: (((1000 * 60) * 60) * 10), // 60 วินาที
                    beforeSend: function () {
                        $('#map-ui-loading-page').removeClass('hidden');
                    },
                    error: function (err) {
                        // alert();
                        console.error(err);
                        $('#map-ui-loading-page').addClass('hidden');
                    },
                    complete: function () {
                        $('#map-ui-loading-page').addClass('hidden');
                    },
                    data: JSON.stringify({
                        arr_point: profilePoints
                    })
                });

                return await ajaxRequest;

            } else {

                for (let i = 0; i < nSamples; i++) {
                    const s = i * spacingMeters;         // ระยะจากจุดเริ่ม (เมตร)
                    const t = s / lengthMeters;          // 0..1 along the line

                    const lon = lon1 + (lon2 - lon1) * t;
                    const lat = lat1 + (lat2 - lat1) * t;

                    const height = await AppMap.getHeightAtPointFromCesium(lon, lat); // m (อาจเป็น null ถ้า error)

                    profilePoints.push({
                        id: i,
                        distance: s,
                        lon,
                        lat,
                        height
                    });
                }
                return profilePoints;

            }
        },

        calculateBeachProfileVolume: (datachart) => {
            // width = ความยาวตามแนวชายฝั่ง (เมตร), ค่าเริ่มต้น 1 m
            const area = AppMap.calculateBeachProfileArea(datachart); // m²
            const width = Math.max(...datachart.map(p => p.distance));
            return area * width; // m³
        },

        calculateBeachProfileArea: (datachart) => {
            if (!Array.isArray(datachart) || datachart.length < 2) {
                // console.log("Input data must be an array with at least 2 points.");
                return 0;
            }

            let totalArea = 0;

            for (let i = 1; i < datachart.length; i++) {
                const prevPoint = datachart[i - 1]; // Previous point data
                const currPoint = datachart[i];     // Current point data

                // Calculate the area of each trapezoid
                // The formula is: ((y1 + y2) / 2) * (x2 - x1)
                // Note: The user's data uses 'evaloation' for elevation and 'distance' for distance
                // คำนวณพื้นที่ของสี่เหลี่ยมคางหมูแต่ละชิ้น
                const area = (
                    (parseFloat(prevPoint.height) + parseFloat(currPoint.height)) / 2
                ) * (
                        parseFloat(currPoint.distance) - parseFloat(prevPoint.distance)
                    );

                totalArea += area;
            }

            return totalArea; // หน่วย: m²  = m³/m
        },

        groupedToTraces: (grouped, msl = false) => {
            // ถ้า grouped เป็น array (ปีเดียว)
            if (Array.isArray(grouped)) {
                let items = grouped.slice().sort((a, b) => a.distance - b.distance);
                if (msl) {
                    items = items.filter((item) => item.height >= 0);
                }
                const year = items[0]?.year ?? '';

                return [{
                    name: year,
                    x: items.map(i => i.distance + ' m.'),   // x-axis
                    y: items.map(i => Number((i.height).toFixed(2))),             // y-axis
                    type: 'scatter',
                    mode: 'lines+markers'
                }];
            }

            // แบบเดิม: grouped = {year: [items]}
            return Object.entries(grouped).map(([year, items]) => {
                if (!Array.isArray(items)) return null;

                let sorted = items.slice().sort((a, b) => a.distance - b.distance);
                if (msl) {
                    sorted = sorted.filter((item) => item.height >= 0);
                }

                return {
                    name: year,
                    x: sorted.map(i => i.distance + ' m.'),
                    y: sorted.map(i => i.height),
                    type: 'scatter',
                    mode: 'lines+markers'
                };
            }).filter(Boolean);
        },

        beachprofileChart: async (datachart) => {
            const dsasbsline = datachart?.data?.baseline || [];
            const d_arr = datachart?.data?.data || [];
            if (!Array.isArray(d_arr) || !d_arr.length > 0) {

                $("#dialog")
                .html("ไม่พบข้อมูล DEM จากการสำรวจที่เผยแพร่<br>สำหรับเส้น Transect ที่คุณเลือก")
                .dialog({
                    autoOpen: true,
                    title: "แจ้งเตือน",
                    height: "auto",
                    position: {
                        my: "center top",
                        at: "center top+100",
                        of: window
                    }
                });

                return;
            }

            const grouped = Object.fromEntries(
                Object.entries(
                    d_arr.reduce((acc, item) => {
                        (acc[item.year] ||= []).push(item);
                        return acc;
                    }, {})
                ).sort((a, b) => b[0] - a[0])
            );

            let chartid = 'chart-id-of-menu-four-' + Math.random().toString(36).substr(2, 6);

            $(`.menu-item`).removeClass('!bg-[#86a0e8]').addClass('bg-[#4c619a]');
            $(`.menu-item[title="${datachart?.name}"]`).addClass('active !bg-[#86a0e8]').removeClass('bg-[#4c619a]');

            $('#menu-four-body').empty();
            $('#menu-four-title').text(`${datachart?.name}`);
            $('#menu-second').addClass('-translate-x-full opacity-0 pointer-events-none');
            $('#main-container').find('.menu-item.active').removeClass('active');
            if (window.innerWidth >= 700) {
                $('#menu-four').attr('class', layoutFour.layout1).removeClass('-translate-x-full opacity-0 pointer-events-none');
            } else {
                $('#menu-four').attr('class', layoutFour.layout2).removeClass('-translate-x-full opacity-0 pointer-events-none');
            }
            switch (datachart?.name) {
                case 'Beach Profile':
                    const lastYear = d_arr[0].year;
                    const tracesb1 = AppMap.groupedToTraces(grouped[lastYear], false);
                    
                    // สร้างเส้น baseline ถึง last shoreline                    
                    const baseline = [[], []];                    
                    for (let index = 0; index < grouped[lastYear].length; index++) {
                        baseline[0].push(grouped[lastYear][index].height + " m.");
                        if (grouped[lastYear][index].intersection === 't') {
                            baseline[1].push(grouped[lastYear][index].height);
                        } else {
                            baseline[1].push(null);
                        }
                    }
                    
                    tracesb1.push({
                        mode: "lines+markers",
                        name: "Baseline (2562)",
                        type: "scatter",
                        x: baseline[0],
                        y: baseline[1],
                    });

                    const tracesb2 = AppMap.groupedToTraces(grouped[lastYear], true);
                    const area1 = Object.entries(grouped).filter(([year]) => year == lastYear).map(([year, points]) => {
                        const area = AppMap.calculateBeachProfileArea(points);           // m²
                        const volume = AppMap.calculateBeachProfileVolume(points); // m³
                        return { year, area, volume };
                    }).sort((a, b) => b.year - a.year);
                    const area2 = Object.entries(grouped).filter(([year]) => year == lastYear).map(([year, points]) => {
                        const area = AppMap.calculateBeachProfileArea(points.filter((item) => item.height >= 0));           // m²
                        const volume = AppMap.calculateBeachProfileVolume(points.filter((item) => item.height >= 0)); // m³
                        return { year, area, volume };
                    }).sort((a, b) => b.year - a.year);

                    // const dsas_all_html = (dsasbsline?.dsas_all || []).map((d,i)=>`
                    // <p class="pl-3 mt-1">
                    //     อัตราการกัดเซาะ (DSAS) ปี ${d.year} =
                    //     ${d.dsas_m_per_year !== undefined
                    //     ? Number(d.dsas_m_per_year).toFixed(2)
                    //     : '-'}
                    //     เมตรต่อปี
                    // </p>
                    // `).join('');

                    $('#menu-four-body').append(`
                        <div id="${chartid}" class="w-full mr-3"></div>
                        <div id="${chartid}-msl" class="w-full mr-3 hidden"></div>

                        <p class="pl-3 mt-3 font-bold">อัตราการเปลี่ยนแปลงชายฝั่ง (DSAS) ปี ${dsasbsline?.dsas?.[0]?.farthest_year} = ${dsasbsline?.dsas?.[0]?.dsas_m_per_year !== undefined ? Number(dsasbsline?.dsas?.[0]?.dsas_m_per_year).toFixed(2) : '-'} เมตรต่อปี ความกว้างชายหาด ${dsasbsline?.dsas?.[0]?.farthest_distance_m !== undefined ? Number(dsasbsline?.dsas?.[0]?.farthest_distance_m).toFixed(2) : '-'} เมตร</p>
                        ${dsasbsline?.dsas_all ? (dsasbsline.dsas_all.map((d) => `
                            <p class="pl-3 mt-1">
                                อัตราการเปลี่ยนแปลงชายฝั่ง (DSAS) ปี ${d.year} =
                                ${d.dsas_m_per_year !== undefined ? Number(d.dsas_m_per_year).toFixed(2) : '-'} เมตรต่อปี ความกว้างชายหาด ${d.abs_dist_m !== undefined ? Number(d.abs_dist_m).toFixed(2) : '-'} เมตร
                            </p>
                        `).join('')) : ''}

                        <div class="flex">
                            <div class="flex-1 p-3 mt-auto">
                                <p class="mb-1">ปริมาตรชายหาด</p>
                                <p class="mb-1" id="value-area"> ${area1.map((item) => item.year + ' : ' + Math.abs((item.area).toFixed(2)) + ' ลูกบาศก์เมตร / เมตร').join('')} </p>
                            </div>

                            <div class="p-3 mt-auto justify-end">
                                <span id="beachprofile-view-msl" class="hover:bg-gray-300 cursor-pointer p-2 rounded">วิเคราะห์ CM Line ถึง 0 MSL</span>
                            </div>
                        </div>
                    `);
                    $('#beachprofile-view-msl').off('click').on('click', function () {
                        if ($(this).hasClass('active')) {
                            $(this).removeClass('active');
                            $(this).text('วิเคราะห์ CM Line ถึง 0 MSL');
                            $('#value-area').text(`${area1.map((item) => item.year + ' : ' + Math.abs((item.area).toFixed(2)) + ' ลูกบาศก์เมตร / เมตร').join('')}`);
                            $(`#${chartid}`).removeClass('hidden');
                            $(`#${chartid + '-msl'}`).addClass('hidden');
                        } else {
                            $(this).addClass('active');
                            $(this).text('วิเคราะห์ Beach Profile');
                            $('#value-area').text(`${area2.map((item) => item.year + ' : ' + Math.abs((item.area).toFixed(2)) + ' ลูกบาศก์เมตร / เมตร').join('')}`);
                            $(`#${chartid}`).addClass('hidden');
                            $(`#${chartid + '-msl'}`).removeClass('hidden');
                            setTimeout(async () => {
                                await AppMap.plotChartH({
                                    target: chartid + '-msl',
                                    trace: tracesb2,
                                    layout: {
                                        title: 'วิเคราะห์ CM Line ถึง 0 MSL',
                                        xaxis: { title: 'ระยะทาง (เมตร)' },
                                        yaxis: { title: 'ความสูงจากระดับน้ำทะเล (เมตร)' }
                                    }
                                });
                            }, 1);
                        }
                    });
                    setTimeout(async () => {
                        await AppMap.plotChartH({
                            target: chartid,
                            trace: tracesb1,
                            layout: {
                                title: 'Beach Profile',
                                xaxis: { title: 'ระยะทาง (เมตร)' },
                                yaxis: { title: 'ความสูงจากระดับน้ำทะเล (เมตร)' }
                            },
                            // baseline: []
                        });
                    }, 1);
                    break;
                case 'DSAS':
                    const traces = AppMap.groupedToTraces(grouped, false);
                    const area3 = Object.entries(grouped).map(([year, points]) => {
                        const area = AppMap.calculateBeachProfileArea(points/*.filter((item) => item.height <= 0)*/);           // m²
                        const volume = AppMap.calculateBeachProfileVolume(points/*.filter((item) => item.height <= 0)*/); // m³
                        return { year, area, volume };
                    }).sort((a, b) => b.year - a.year);

                    console.log(dsasbsline);

                    $('#menu-four-body').append(`
                        <div id="${chartid}" class="w-full mr-3"></div>
                        
                        <p class="pl-3 mt-3">อัตราการเปลี่ยนแปลงชายฝั่ง (DSAS) = ${dsasbsline?.dsas?.[0]?.dsas_m_per_year !== undefined ? Number(dsasbsline?.dsas?.[0]?.dsas_m_per_year).toFixed(2) : '-'} เมตรต่อปี</p>
                        
                        <div class="flex">
                            <div class="flex-1 p-3 mt-auto">
                                <p class="mb-1">ปริมาตรชายหาด</p>
                                ${area3.map((item) => '<p class="mb-1">' + item.year + ' : ' + Math.abs((item.area).toFixed(2)) + ' ลูกบาศก์เมตร / เมตร</p>').join('')}
                            </div>
                        </div>
                    `);
                    setTimeout(async () => {
                        await AppMap.plotChartH({
                            target: chartid,
                            trace: traces,
                            layout: {
                                xaxis: { title: 'ระยะทาง (เมตร)' },
                                yaxis: { title: 'ความสูงจากระดับน้ำทะเล (เมตร)' },
                                legend: {
                                    orientation: 'h', // แสดง legend แนวนอน
                                    x: 0.5,           // กึ่งกลางแนวนอน
                                    y: 1.15,          // อยู่เหนือกราฟ
                                    xanchor: 'center', // ยึดตำแหน่งตามจุดกึ่งกลางแกน x
                                    yanchor: 'bottom'  // ยึดจากด้านล่าง (ให้เลื่อนขึ้น)
                                }
                            }
                        });
                    }, 1);
                    break;
            }
        },

        normalizeLineLandToSea: (geomStr) => {
            console.log(geomStr);
            
            const geom = JSON.parse(geomStr);
            if (geom.type !== "LineString" || !Array.isArray(geom.coordinates)) {
                return geomStr;
            }

            const coords = geom.coordinates;
            if (coords.length < 2) return geomStr;

            const [lon1, lat1] = coords[0];
            const [lon2, lat2] = coords[coords.length - 1];

            if (lat1 < lat2) {
                coords.reverse();
            }

            console.log(geom);
            console.log(coords);
            
            return JSON.stringify(geom);
        },

        initInfoBox: () => {
            window.beachVolumeStore = window.beachVolumeStore || {
                rows: [],
                totalVolume: 0,
                countValid: 0,
                deltaVolume: 0,
                lastVolume: 0,
                reset() {
                    this.rows = [];
                    this.totalVolume = 0;
                    this.countValid = 0;
                    this.deltaVolume = 0;
                    this.lastVolume = 0;
                }
            };
            window.handler_view_beach_volumn_first_click = 0;
        },


        showInfoBox: async (entity) => {

            // console.log(entity);

            if (!entity) return;
            $('#map-ui-loading-page').removeClass('hidden');
            // ---------- layer name ----------
            // const layerName =
            //     entity.layerName ||
            //     (() => {
            //         const p = entity?._name;
            //         if (!p) return null;
            //         if (typeof p.getValue === "function") {
            //             return p.getValue(Cesium.JulianDate.now());
            //         }
            //         return p;
            //     })() ||
            //     null;
            // AppMap.lastClickedLayerName = layerName;
            const nameToCheck = entity.name || entity.layerName || "No Name";
            // ถ้ามั่นใจว่า name เป็น string ธรรมดา (มาตรฐาน Cesium)
            AppMap.lastClickedLayerName = nameToCheck;
            // หรือถ้าเผื่อว่า name เป็น Cesium Property (Dynamic)
            AppMap.lastClickedLayerName = (typeof nameToCheck.getValue === 'function')
                ? nameToCheck.getValue(Cesium.JulianDate.now())
                : nameToCheck;
            // ---------- description -> HTML -> table -> data ----------
            let html = "";
            if (entity?.description) {
                if (typeof entity?.description?.getValue === "function") {
                    html = entity?.description?.getValue(Cesium.JulianDate.now()) || "";
                } else {
                    html = String(entity?.description || "");
                }
            }

            const data = html?.properties;
            const [bftableSS, bfidSS] = html?.id?.split(".") ?? [];
            // ---------- map data -> rows HTML ----------
            let rows = [];

            if (entity?.layerName == 'beachprofile') {
                $.ajax({
                    type: "post",
                    url: $('meta[name="mapapi"]').attr('content') + '/map-api/get-beachprofile-chart',
                    dataType: "json",
                    data: {
                        id: bfidSS,
                        tb: bftableSS
                    },
                    beforeSend: function () {
                        $('#map-ui-loading-page').removeClass('hidden');
                    },
                    error: function () {
                        $('#map-ui-loading-page').addClass('hidden');
                    },
                    success: async function (resp) {
                        $('#map-ui-loading-page').removeClass('hidden');
                        const geomStr = resp?.data[0]?.geom;
                        const geomLandToSea = geomStr; //AppMap.normalizeLineLandToSea(geomStr);
                        const profile = {
                            name: 'Beach Profile',
                            data: await AppMap.generateBeachProfileFromGeom(geomLandToSea, 5, true)
                        };
                        
                        await AppMap.beachprofileChart(profile);
                        $('#map-ui-loading-page').addClass('hidden');
                    }
                });
                return;
            }

            if (!data || Object.keys(data).length === 0) {
                rows = [`
                    <tr class="bg-white">
                        <td class="p-1 text-center" colspan="2">ไม่มีข้อมูล</td>
                    </tr>
                `];
            } else {
                Object.entries(data).forEach(async ([key, value]) => {

                    // -------- allow_group --------
                    if (key.toLowerCase() === "allow_group") {
                        try {
                            const allDep = JSON.parse($('div[data-name="department"]').text().trim());
                            const valIds = JSON.parse(value || "[]");
                            const valuehtml = allDep.filter(dep => valIds.find(id => Number(id) === Number(dep.id)))
                                .map(dep => `<span class='block mb-1'>- ${dep.name}</span>`)
                                .join("");
                            rows.push(`
                                <tr class="bg-white">
                                    <td class="p-1 align-top">กลุ่มที่ได้รับอนุญาต</td>
                                    <td class="p-1 align-top">${valuehtml}</td>
                                </tr>
                            `);
                        } catch (e) { }
                    }

                    // -------- props (JSON) --------
                    else if (key.toLowerCase() === "props") {
                        try {
                            const obj = JSON.parse(value);
                            const valuehtml = Object.entries(obj).map(([k, v]) => {
                                const num = Number(v);
                                const disp = Number.isFinite(num) ? num.toFixed(3) : v;
                                return `<b class="font-bold">${k}:</b> ${disp}<br>`;
                            }).join("");
                            rows.push(`
                                <tr class="bg-white">
                                    <td class="p-1 align-top">ข้อมูลคุณสมบัติ</td>
                                    <td class="p-1 align-top">${valuehtml}</td>
                                </tr>
                            `);
                        } catch (e) { }
                    }

                    // -------- beach volume: GRAY_INDEX --------
                    else if (entity?.layerName == 'ปริมาตรชายหาด' && key.toLowerCase() === "gray_index") {
                        const isNoData = (!Number.isFinite(value)) || value === -3.4028234663852886e+38;
                        if (isNoData) {
                            if (window.lastBeachMarker) {
                                cesiumInit.entities.remove(window.lastBeachMarker);
                                window.lastBeachMarker = null;
                            }
                        } else {
                            const cartesian_first = entity.position?.getValue ? entity.position.getValue(Cesium.JulianDate.now()) : null;
                            const cartesian = new Cesium.Cartesian3(cartesian_first.x, cartesian_first.y, cartesian_first.z);
                            const radiusMeters = 50;
                            const total = AppMap.calcVolumeAroundClickWms(radiusMeters, value);
                            const areaMeters2 = Math.PI * radiusMeters * radiusMeters; // พื้นที่วงกลมที่ใช้คำนวณ
                            const pixelSize = Cesium.Math.clamp(
                                Math.sqrt(areaMeters2) * 0.1, // scale factor ปรับได้
                                8,  // min px
                                60  // max px
                            );
                            let text;
                            if (total > 0) {
                                text = `<span class="material-icons-outlined leading-none text-blue-500">trending_up</span> เพิ่มขึ้นประมาณ ${Number(total.toFixed(0)).toLocaleString("th-TH")} ลูกบาศก์เมตร`;
                            } else if (total < 0) {
                                text = `<span class="material-icons-outlined leading-none text-red-500">trending_down</span> ลดลงประมาณ ${Number(total.toFixed(0)).toLocaleString("th-TH")} ลูกบาศก์เมตร`;
                            } else {
                                text = `<span class="material-icons-outlined leading-none">trending_flat</span> ไม่เปลี่ยนแปลงอย่างมีนัยสำคัญ`;
                            }
                            if (window.lastBeachMarker) {
                                cesiumInit.entities.remove(window.lastBeachMarker);
                                window.lastBeachMarker = null;
                            }
                            window.lastBeachMarker = cesiumInit.entities.add({
                                position: cartesian,
                                point: {
                                    pixelSize: pixelSize,
                                    color: Cesium.Color.YELLOW,
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 0
                                }
                            });

                            rows.push(`
                                <tr class="bg-white">
                                    <td class="p-1 align-top">ค่า gray index</td>
                                    <td class="p-1 align-top">${value.toFixed(4)}</td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="p-1 align-top">ปริมาตรชายหาด</td>
                                    <td class="p-1 align-top">${text}</td>
                                </tr>
                            `);

                        }

                    }

                    else if (key.toLowerCase() === "id") {

                    }

                    // -------- Default --------
                    else {
                        rows.push(`
                            <tr class="bg-white">
                                <td class="p-1 align-top">${key.toLowerCase()}</td>
                                <td class="p-1 align-top">${value}</td>
                            </tr>
                        `);
                    }

                });
            }

            $("#dialog").html(`
                <div class="overflow-x-auto rounded border border-gray-200">
                    <table class="min-w-full table-auto text-sm">
                        <thead class="bg-gray-50 text-gray-700">
                            <tr>
                                <th class="p-1 text-left font-bold">Name</th>
                                <th class="p-1 text-left font-bold">Value</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${rows.join("")}
                        </tbody>
                    </table>
                </div>
            `);

            setTimeout(() => {
                $("#dialog").dialog({
                    autoOpen: true,
                    title: entity.name || entity?.layerName || "รายละเอียด",
                    height: "auto",
                    position: {
                        my: "right top",
                        at: "right-0 top-0",
                        of: window
                    }
                });
            }, 500);

            $('#map-ui-loading-page').addClass('hidden');
        },
        initDefaultData: () => {
            $(document).ready(function () {
                function fetchDataDefaultLayer() {
                    $.ajax({
                        type: "post",
                        url: $('meta[name="mapapi"]').attr('content') + "/map-api/get-default-layer",
                        dataType: "json",
                        beforeSend: function(){
                            $('#map-ui-loading-page').removeClass('hidden');
                        },
                        error: function(){
                            $('#map-ui-loading-page').addClass('hidden');
                        },
                        success: function (resp) {
                            $('#map-ui-loading-page').addClass('hidden');
                            const beach_profiles_layer = resp.beach_profiles.map(item => item.tb);
                            // const cmline_layer = resp.cmlines.map(item => item.tb);
                            const beach_volumns_layer = resp.beach_volumns.map(item => item.tb);
                            // const otho_layer = resp.otho_dems.map(item => {
                            //     const tb = item.type == 'DEM' ? 'tif' + item.tb : item.tb;
                            //     const type = item.type == 'DEM' ? 'DEM' : 'ORTHO';
                            //     if (type == 'ORTHO') {
                            //         // console.log(item);
                                    
                            //         return `
                            //         <li class="p-2 rounded hover:bg-gray-100">
                            //             <label class="flex items-center space-x-2 cursor-pointer">
                            //                 <input type="checkbox" class="layer-item peer hidden" data-name="${type}" data-title="${type}" data-type="wms" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["dmcrdrone_ws:${tb}"]' data-sld="${item.sld || ''}">
                            //                 <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                            //                     <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            //                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            //                     </svg>
                            //                 </div>
                            //                 <span>${type} ${item.year} : ${item.province} : ${item.originalname}</span>
                            //             </label>
                            //             ${type == 'DEM' ? `<span class="block ml-auto px-2 py-1"><img style="height:60px;width:100%;object-fit:scale-down;" src="${AppMap.legendUrl}&legend_options=forceLabels:on;layout:horizontal;&layer=${tb}"></span>` : ''}
                            //         </li>`;
                            //     }
                            // });

                            const cmlineUniqueYears = [...new Set(resp.cmlines.map(item => item.year))];
                            if (cmlineUniqueYears.length > 0) {
                                const cmlinecoastal_layer_html = cmlineUniqueYears.map(year => {
                                    return `
                                        <li class="panel-menu-item panel-has-submenu main-folder w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2">
                                            <a class="mb-2 ml-2 text-white">
                                                ${year}
                                                <span class="panel-menu-icon material-icons-outlined leading-none !text-base float-right text-[#0094D0]">expand_more</span>
                                            </a>
                                            <ul class="panel-sub-menu sub-folder hidden ml-[20px] mt-2 max-h-[calc(100vh-300px)] overflow-y-auto" id="cmlinecoastal_layer_${year}"></ul>
                                        </li>`;
                                }).join('');
                                $('#cmlinecoastal_layer').append(cmlinecoastal_layer_html);
                                resp.cmlines.forEach(item => {
                                    const tb = item.tb;
                                    const type = 'CM. Line';
                                    $('#cmlinecoastal_layer_' + item.year).append(`
                                        <li class="p-2 rounded hover:bg-gray-100">
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" class="layer-item peer hidden" 
                                                    data-name="${type}" 
                                                    data-title="${type}" 
                                                    data-type="wms" 
                                                    data-layergroup="wms-external" 
                                                    data-wmsuri="${AppMap.geoserverWmsUrl}" 
                                                    value='["dmcrdrone_ws:${tb}"]' 
                                                    data-sld="${item.sld || ''}">
                                                <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                    <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>${item.year} : ${item.layertitle}</span>
                                            </label>
                                            <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle} (${item.year})">table_chart</span>
                                        </li>
                                    `);
                                });
                                $('#cmlinecoastal_layer').on('click', '.main-folder', function (e) {
                                    if ($(e.target).closest('.sub-folder').length > 0) {
                                        return;
                                    }
                                    e.preventDefault();
                                    const subFolder = $(this).find('.sub-folder');
                                    const icon = $(this).find('.panel-menu-icon');
                                    if (subFolder.hasClass('hidden')) {
                                        subFolder.removeClass('hidden');
                                        icon.text('expand_less');
                                    } else {
                                        subFolder.addClass('hidden');
                                        icon.text('expand_more');
                                    }
                                });
                            }

                            // 1. กรองเอาเฉพาะข้อมูลที่ไม่ได้เป็น DEM (ก็คือ ORTHO)
                            const orthoItems = resp.otho_dems.filter(item => item.type === 'Othophoto');
                            if (orthoItems.length > 0) {
                                // 2. หา "ปี" ที่ไม่ซ้ำกัน เพื่อสร้างเป็นโฟลเดอร์หลัก
                                const uniqueYears = [...new Set(orthoItems.map(item => item.year))];

                                // 3. สร้าง HTML สำหรับโฟลเดอร์ปีของ ORTHO
                                // (ตั้งชื่อ id เป็น ortho_layer_{year} เพื่อไม่ให้ซ้ำกับ DEM)
                                const yearFoldersHTML = uniqueYears.map(year => {
                                    return `
                                        <li class="panel-menu-item panel-has-submenu main-folder w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2">
                                            <a class="mb-2 ml-2 text-white">
                                                ${year}
                                                <span class="panel-menu-icon material-icons-outlined leading-none !text-base float-right text-[#0094D0]">expand_more</span>
                                            </a>
                                            <ul class="panel-sub-menu sub-folder hidden ml-[20px] mt-2 max-h-[calc(100vh-300px)] overflow-y-auto" id="ortho_layer_${year}"></ul>
                                        </li>`;
                                }).join('');

                                // นำโฟลเดอร์ปีไปแสดงผล 
                                // **หมายเหตุ: ตรงนี้ผมสมมติเป็น #display_sheet_otho_dem คุณสามารถแก้ ID ให้ตรงกับ HTML ของคุณได้เลยครับ**
                                $('#display_sheet_otho_dem').append(yearFoldersHTML);

                                // 4. วนลูปข้อมูล ORTHO เพื่อใส่เข้าโฟลเดอร์ปีของตัวเอง
                                orthoItems.forEach(item => {
                                    const tb = item.tb; // ORTHO ไม่ต้องเติม 'tif' นำหน้า (อิงตามโค้ดเดิมของคุณ)
                                    const type = 'Othophoto';

                                    $('#ortho_layer_' + item.year).append(`
                                        <li class="p-2 rounded hover:bg-gray-100">
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" class="layer-item peer hidden" 
                                                    data-name="${type}" 
                                                    data-title="${type}" 
                                                    data-type="wms" 
                                                    data-layergroup="wms-external" 
                                                    data-wmsuri="${AppMap.geoserverWmsUrl}" 
                                                    value='["dmcrdrone_ws:${tb}"]' 
                                                    data-sld="${item.sld || ''}">
                                                <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                    <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>${type} ${item.year} : ${item.province}</span>
                                            </label>
                                        </li>
                                    `);
                                    // ${item.originalname}
                                });
                                // ดักจับการคลิกที่แท็ก <a> ที่อยู่ข้างใน .main-folder
                                $('#display_sheet_otho_dem').on('click', '.main-folder', function(e) {
                                    // 1. ตรวจสอบว่าจุดที่คลิก อยู่ข้างในเมนูย่อย (.sub-folder) หรือไม่
                                    // ถ้าใช่ ให้หยุดการทำงานทันที (ป้องกันไม่ให้คลิก Checkbox แล้วโฟลเดอร์พับปิด)
                                    if ($(e.target).closest('.sub-folder').length > 0) {
                                        return; 
                                    }

                                    e.preventDefault();

                                    // 2. หาเมนูย่อยและไอคอนที่อยู่ภายในโฟลเดอร์ที่ถูกคลิก
                                    const subFolder = $(this).find('.sub-folder');
                                    const icon = $(this).find('.panel-menu-icon');

                                    // 3. สลับคลาสเพื่อเปิด/ปิด
                                    if (subFolder.hasClass('hidden')) {
                                        subFolder.removeClass('hidden');
                                        icon.text('expand_less');
                                    } else {
                                        subFolder.addClass('hidden');
                                        icon.text('expand_more');
                                    }
                                });
                            }

                            // 2. กรองเอาเฉพาะข้อมูลที่มี type เป็น 'DEM'
                            const demItems = resp.otho_dems.filter(item => item.type === 'DEM');

                            if (demItems.length > 0) {
                                // 2. ดึงข้อมูลตัวแรกมาทำ Legend (ตามจุดประสงค์ของ demCount เดิม)
                                const firstDem = demItems[0];
                                const firstTb = 'tif' + firstDem.tb;
                                const legendDem = `
                                    <div class="block ml-auto px-2 py-1 mb-2">
                                        <img style="height:60px;width:100%;object-fit:scale-down;" 
                                            src="${AppMap.legendUrl}&legend_options=forceLabels:on;layout:horizontal;&layer=${firstTb}">
                                    </div>`;
                                
                                // ใส่ Legend ไว้ด้านบนสุดก่อน
                                $('#display_dem').append(legendDem);

                                // 3. หา "ปี" ที่ไม่ซ้ำกัน เพื่อนำมาสร้างเป็นโฟลเดอร์หลัก (ลดปัญหา ID ซ้ำกัน)
                                const uniqueYears = [...new Set(demItems.map(item => item.year))];

                                // 4. สร้าง HTML สำหรับโฟลเดอร์ปี
                                const yearFoldersHTML = uniqueYears.map(year => {
                                    return `
                                        <li class="panel-menu-item panel-has-submenu main-folder w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2">
                                            <a class="mb-2 ml-2 text-white">
                                                ${year}
                                                <span class="panel-menu-icon material-icons-outlined leading-none !text-base float-right text-[#0094D0]">expand_more</span>
                                            </a>
                                            <ul class="panel-sub-menu sub-folder hidden ml-[20px] mt-2 max-h-[calc(100vh-300px)] overflow-y-auto" id="dem_layer_${year}"></ul>
                                        </li>`;
                                }).join('');

                                // นำโฟลเดอร์ปีไปแสดงผล
                                $('#display_dem').append(yearFoldersHTML);

                                // 5. วนลูปข้อมูล DEM ทั้งหมด เพื่อนำไปใส่ในโฟลเดอร์ปีของตัวเอง (ใช้ forEach เพราะเป็นการต่อ String เข้า DOM)
                                demItems.forEach(item => {
                                    const tb = 'tif' + item.tb;
                                    const type = 'DEM'; // เรารู้ว่าเป็น DEM แน่นอนจากการ filter แล้ว

                                    $('#dem_layer_' + item.year).append(`
                                        <li class="p-2 rounded hover:bg-gray-100">
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" class="layer-item peer hidden" 
                                                    data-name="${type}" 
                                                    data-title="${type}" 
                                                    data-type="wms" 
                                                    data-layergroup="wms-external" 
                                                    data-wmsuri="${AppMap.geoserverWmsUrl}" 
                                                    value='["dmcrdrone_ws:${tb}"]' 
                                                    data-sld="${item.sld || ''}">
                                                <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                    <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>${type} ${item.year} : ${item.province} (${item.nosheet})</span>
                                            </label>
                                        </li>
                                    `);
                                    // ${item.originalname}
                                });
                                // ดักจับการคลิกที่แท็ก <a> ที่อยู่ข้างใน .main-folder
                                $('#display_dem').on('click', '.main-folder', function(e) {
                                    // 1. ตรวจสอบว่าจุดที่คลิก อยู่ข้างในเมนูย่อย (.sub-folder) หรือไม่
                                    // ถ้าใช่ ให้หยุดการทำงานทันที (ป้องกันไม่ให้คลิก Checkbox แล้วโฟลเดอร์พับปิด)
                                    if ($(e.target).closest('.sub-folder').length > 0) {
                                        return; 
                                    }

                                    e.preventDefault();

                                    // 2. หาเมนูย่อยและไอคอนที่อยู่ภายในโฟลเดอร์ที่ถูกคลิก
                                    const subFolder = $(this).find('.sub-folder');
                                    const icon = $(this).find('.panel-menu-icon');

                                    // 3. สลับคลาสเพื่อเปิด/ปิด
                                    if (subFolder.hasClass('hidden')) {
                                        subFolder.removeClass('hidden');
                                        icon.text('expand_less');
                                    } else {
                                        subFolder.addClass('hidden');
                                        icon.text('expand_more');
                                    }
                                });
                            }
                            // 3. กรองเอาเฉพาะข้อมูล CVI (ดัชนีความเปราะบางชายฝั่งทะเล)
                            const cviItems = resp.other_layers.filter(item => item.layername === 'ดัชนีความเปราะบางชายฝั่งทะเล');

                            if (cviItems.length > 0) {
                                // 2. หา "จังหวัด (province)" ที่ไม่ซ้ำกัน เพื่อสร้างเป็นโฟลเดอร์หลัก
                                // const uniqueProvinces = [...new Set(cviItems.map(item => item.province))];
                                const uniqueProvinces = [...new Set(cviItems.map(item => item.province))].sort((a, b) => a.localeCompare(b, 'th'));

                                // 3. สร้าง HTML สำหรับโฟลเดอร์จังหวัด
                                const provinceFoldersHTML = uniqueProvinces.map(province => {
                                    // สร้าง id สำหรับ sub-folder ให้ปลอดภัย โดยแทนที่เว้นวรรคด้วย underscore ป้องกันบัคจากชื่อจังหวัด
                                    const safeProvinceId = province.replace(/\s+/g, '_'); 
                                    
                                    return `
                                        <li class="panel-menu-item panel-has-submenu main-folder w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2">
                                            <a class="mb-2 ml-2 text-white">
                                                ${province}
                                                <span class="panel-menu-icon material-icons-outlined leading-none !text-base float-right text-[#0094D0]">expand_more</span>
                                            </a>
                                            <ul class="panel-sub-menu sub-folder hidden ml-[20px] mt-2 max-h-[calc(100vh-300px)] overflow-y-auto" id="cvi_layer_${safeProvinceId}"></ul>
                                        </li>`;
                                }).join('');

                                // นำโฟลเดอร์จังหวัดไปแสดงผล 
                                // **หมายเหตุ: ตรงนี้ผมสมมติเป็น #display_cvi คุณสามารถแก้ให้ตรงกับ container ของคุณได้เลยครับ**
                                $('#display_cvi').append(provinceFoldersHTML);

                                // 4. วนลูปข้อมูล CVI เพื่อใส่เข้าโฟลเดอร์จังหวัดของตัวเอง
                                cviItems.forEach(item => {
                                    const safeProvinceId = item.province.replace(/\s+/g, '_');
                                    
                                    $('#cvi_layer_' + safeProvinceId).append(`
                                        <li class="p-2 rounded hover:bg-gray-100">
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" class="layer-item peer hidden" 
                                                    data-type="wms" 
                                                    data-title="${item.layertitle}" 
                                                    data-layergroup="wms-external" 
                                                    data-wmsuri="${AppMap.geoserverWmsUrl}" 
                                                    value='["${item.tb}"]' 
                                                    data-sld="${item.sld || ''}" 
                                                    data-other="yes">
                                                <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                    <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span>CVI ${item.year} : ${item.province} : ${item.layertitle}</span>
                                            </label>
                                            ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                            <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                        </li>
                                    `);
                                });
                                // ดักจับการคลิกที่แท็ก <a> ที่อยู่ข้างใน .main-folder
                                $('#display_cvi').on('click', '.main-folder', function(e) {
                                    // 1. ตรวจสอบว่าจุดที่คลิก อยู่ข้างในเมนูย่อย (.sub-folder) หรือไม่
                                    // ถ้าใช่ ให้หยุดการทำงานทันที (ป้องกันไม่ให้คลิก Checkbox แล้วโฟลเดอร์พับปิด)
                                    if ($(e.target).closest('.sub-folder').length > 0) {
                                        return; 
                                    }

                                    e.preventDefault();

                                    // 2. หาเมนูย่อยและไอคอนที่อยู่ภายในโฟลเดอร์ที่ถูกคลิก
                                    const subFolder = $(this).find('.sub-folder');
                                    const icon = $(this).find('.panel-menu-icon');

                                    // 3. สลับคลาสเพื่อเปิด/ปิด
                                    if (subFolder.hasClass('hidden')) {
                                        subFolder.removeClass('hidden');
                                        icon.text('expand_less');
                                    } else {
                                        subFolder.addClass('hidden');
                                        icon.text('expand_more');
                                    }
                                });
                            }

                            const other_layers = resp.other_layers
                            .filter(item => item.layername === 'ชั้นข้อมูลอื่น ๆ')
                            .map(item => {
                                    return `
                                    <li class="w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2 hover:bg-gray-100">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}" data-other="yes">
                                            <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>${item.layertitle}</span>
                                        </label>
                                        ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                        <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                    </li>`;
                            });

                            const beachsys_layers = resp.other_layers
                            .filter(item => item.layername === 'ระบบหาด')
                            .map(item => {
                                    return `
                                    <li class="w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2 hover:bg-gray-100">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}">
                                            <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>${item.layertitle}</span>
                                        </label>
                                        ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                        <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                    </li>`;
                            }).join('');
                            $('#beachsys_layer').append(beachsys_layers);

                            const changecoastal_layer = resp.other_layers
                            .filter(item => item.layername === 'การเปลี่ยนแปลงพื้นที่ชายฝั่ง')
                            .map(item => {
                                    return `
                                    <li class="w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2 hover:bg-gray-100">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}">
                                            <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>${item.layertitle}</span>
                                        </label>
                                        ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                        <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                    </li>`;
                            }).join('');
                            $('#changecoastal_layer').append(changecoastal_layer);

                            // const cvi_layers = resp.other_layers
                            // .filter(item => item.layername === 'ดัชนีความเปราะบางชายฝั่งทะเล')
                            // .map(item => {
                            //         console.log(item);
                            //         return `
                            //         <li class="p-2 rounded hover:bg-gray-100">
                            //             <label class="flex items-center space-x-2 cursor-pointer">
                            //                 <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}" data-other="yes">
                            //                 <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                            //                     <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            //                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            //                     </svg>
                            //                 </div>
                            //                 <span>CVI ${item.year} : ${item.province} : ${item.layertitle}</span>
                            //             </label>
                            //             ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                            //         </li>`;
                            // });
                            const scopegov_layer = resp.other_layers
                            .filter(item => item.layername === 'ขอบเขตการปกครอง')
                            .map(item => {
                                    return `
                                    <li class="w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2 hover:bg-gray-100">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}" data-other="yes">
                                            <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>${item.layertitle}</span>
                                        </label>
                                        ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                        <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                    </li>`;
                            });
                            const coastal_status_layer = resp.other_layers
                            .filter(item => item.layername === 'สถานภาพชายฝั่งทะเล')
                            .map(item => {
                                    return `
                                    <li class="w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2 hover:bg-gray-100">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}" data-other="yes">
                                            <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>${item.layertitle}</span>
                                        </label>
                                        ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                        <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                    </li>`;
                            });
                            let coastal_structure_layer = resp.other_layers
                            .filter(item => item.layername === 'โครงสร้างชายฝั่งทะเล')
                            .map(item => {
                                    return `
                                    <li class="w-full p-2 pt-3 pb-3 bg-white cursor-pointer rounded text-black mb-2 hover:bg-gray-100">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" class="layer-item peer hidden" data-type="wms" data-title="${item.layertitle}" data-layergroup="wms-external" data-wmsuri="${AppMap.geoserverWmsUrl}" value='["${item.tb}"]' data-sld="${item.sld || ''}" data-other="yes">
                                            <div class="h-5 w-5 border-2 border-gray-400 rounded-full shadow-sm peer-checked:bg-[#0094D0] peer-checked:border-[#0094D0] flex items-center justify-center">
                                                <svg class="h-4 w-4 text-white invisible peer-checked:visible" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>${item.layertitle}</span>
                                        </label>
                                        ${item.sld != null ? `<span class="block ml-auto px-2 py-1"><img style="width:150px;" src="${AppMap.legendUrl}&layer=${item.tb}&legend_options=dpi:180;fontAntiAliasing:true;labelMargin:8&style=${item.sld}"></span>` : ''}
                                        <span class="block ml-auto px-2 py-1 material-icons-outlined leading-none view-datatable-of-wms" title="View Table" data-layer="${item.tb}" data-title="${item.layertitle}">table_chart</span>
                                    </li>`;
                            });
                            
                            $(document).find('.layer-item[data-filter="Beach Profile"]').val(JSON.stringify(beach_profiles_layer));
                            // $(document).find('.layer-item[data-filter="เส้นเฝ้าระวัง"]').val(JSON.stringify(cmline_layer));
                            $(document).find('.layer-item[data-filter="ปริมาตรชายหาด"]').val(JSON.stringify(beach_volumns_layer));
                            $(document).find('.layer-item[data-filter="โครงสร้างชายฝั่งทะเล"]').val(JSON.stringify(coastal_structure_layer));
                            // beach_volumns_layer.length > 0 ? $(document).find('.layer-item[data-filter="ปริมาตรชายหาด"]').parent().parent().append(`<span class="block ml-auto px-2 py-1"><img src="${AppMap.legendUrl}&legend_options=forceLabels:on;fontName:Kanit;fontAntiAliasing:true;fontColor:2E2D2D;fontSize:15;&layer=${beach_volumns_layer[0]}"></span>`) : '';
                            // $('#display_sheet_otho_dem').append(otho_layer.join(''));
                            
                            $('#other_layer').append(other_layers.join(''));
                            // $('#cvi_layer').append(cvi_layers.join(''));
                            $('#scopegov_layer').append(scopegov_layer.join(''));
                            $('#coastal_status_layer').append(coastal_status_layer.join(''));

                            $('.view-datatable-of-wms').on('click', function() {
                                AppMap.dsLoadWFSData(this);
                            });
                        },
                        error: function () {
                            setTimeout(fetchDataDefaultLayer, 2000);
                        }
                    });
                } fetchDataDefaultLayer();

                $(document).find('div[data-default="true"]').each(async function () {
                    const data_element = $(this);
                    const path = $('meta[name="mapapi"]').attr('content') + $(this).data('path');
                    function fetchData() {
                        $.ajax({
                            type: "POST",
                            url: path,
                            dataType: "json",
                            beforeSend: function(){
                                $('#map-ui-loading-page').removeClass('hidden');
                            },
                            success: function (data) {
                                $('#map-ui-loading-page').addClass('hidden');
                                data_element.html(JSON.stringify(data));
                                // console.log(`✅ Loaded: ${path}`);
                            },
                            error: function () {
                                $('#map-ui-loading-page').addClass('hidden');
                                console.warn(`⚠️ Error loading ${path}, retrying...`);
                                setTimeout(fetchData, 2000);
                            }
                        });
                    } fetchData();
                });

                const appendChildProvinceInput = setInterval(() => {
                    const textAppendChildProvinceInput = $('body').find('[data-name="department"]').text().trim();
                    let jsonAppendChildProvinceInput = [];
                    try {
                        jsonAppendChildProvinceInput = JSON.parse(textAppendChildProvinceInput);
                    } catch (e) {
                        jsonAppendChildProvinceInput = [];
                    }
                    if (Array.isArray(jsonAppendChildProvinceInput) && jsonAppendChildProvinceInput.length > 0) {
                        clearInterval(appendChildProvinceInput);

                        const allProvinces = jsonAppendChildProvinceInput.flatMap(item => JSON.parse(item.provincelist));
                        const provinceOptions = [...new Set(allProvinces)] // ใช้ Set เพื่อตัดจังหวัดที่ซ้ำกันออก (ถ้ามี)
                        .filter(province => province !== 'ทุกจังหวัด')
                        .sort((a, b) => a.localeCompare(b, 'th')) // เรียง ก-ฮ ทั้งหมดทีเดียว
                        .map(province => `<option>${province}</option>`)
                        .join('');

                        // jsonAppendChildProvinceInput = jsonAppendChildProvinceInput.map(item => {
                        //     const p_group = JSON.parse(item.provincelist);
                        //     return p_group
                        //     .filter(item => item != 'ทุกจังหวัด')
                        //     .sort((a, b) => a.localeCompare(b, 'th'))
                        //     .map(item => `<option>${item}</option>`).join('');
                        // }).join('');

                        $('#input-filter-province-list').html(`<option>จังหวัด</option>` + provinceOptions);
                        $('#dashboard-input-province').html(`<option>จังหวัด</option>` + provinceOptions);
                        setTimeout(() => {
                            AppMap.flytoextend_initSelect2();
                            $('#input-filter-province-list').on('select2:select', async function (e) {
                                const data = e.params.data;
                                // console.log('text:', data.text);
                                // console.log('id:', data.id);
                                // console.log('data-value:', data.element.dataset.point);
                                if (data?.text) {
                                    const ppoint = await AppMap.geocoderSearch(data?.text);
                                    if (ppoint) {
                                        if (ppoint.lon && ppoint.lat) {
                                            cesiumInit.camera.flyTo({
                                                destination: Cesium.Cartesian3.fromDegrees(ppoint.lon, ppoint.lat, 100000)
                                            });
                                        }
                                    }
                                }
                            });
                            $('#dashboard-input-province').on('select2:select', async function (e) {
                                const data = e.params.data;
                                if (data?.text) {
                                    // console.log(data);

                                    // const ppoint = await AppMap.geocoderSearch(data?.text);
                                    // if (ppoint) {
                                    //     if (ppoint.lon && ppoint.lat) {
                                    //         // cesiumInit.camera.flyTo({
                                    //         //     destination: Cesium.Cartesian3.fromDegrees(ppoint.lon, ppoint.lat, 100000)
                                    //         // });
                                    //     }
                                    // }
                                }
                            });
                        }, 3);
                    }
                }, 1000);
                const appendChildMapsheetInput = setInterval(() => {
                    const textAppendChildMapsheetInput = $('body').find('[data-name="mapsheet"]').text().trim();
                    let jsonAppendChildMapsheetInput = [];
                    try {
                        jsonAppendChildMapsheetInput = JSON.parse(textAppendChildMapsheetInput).d1;
                    } catch (e) {
                        jsonAppendChildMapsheetInput = [];
                    }

                    if (Array.isArray(jsonAppendChildMapsheetInput) && jsonAppendChildMapsheetInput.length > 0) {
                        clearInterval(appendChildMapsheetInput);

                        const tma1 = jsonAppendChildMapsheetInput.map(item => {
                            return `<option data-point="${item.center_inside}">${item.blockindex}</option>`;
                        }).join('');
                        $('#input-filter-sheet-list').html(`<option>เลขระวาง</option>` + tma1);
                        setTimeout(() => {
                            AppMap.flytoextend_initSelect2();
                            $('#input-filter-sheet-list').on('select2:select', function (e) {
                                const data = e.params.data;
                                if (data?.element?.dataset?.point) {
                                    const ppoint = (data.element.dataset.point).split(',');
                                    cesiumInit.camera.flyTo({
                                        destination: Cesium.Cartesian3.fromDegrees(ppoint[1], ppoint[0], 5000),
                                        duration: 2
                                    });
                                }
                            });
                        }, 3);

                        const unique_beach = [
                            ...new Map(jsonAppendChildMapsheetInput.map(item => [item.beach, item])).values()
                        ];
                        const tma2 = unique_beach
                        .filter(item => item.beach != null) // 1. กรองค่าว่างทิ้งก่อน
                        .sort((a, b) => a.beach.localeCompare(b.beach, 'th')) // 2. เรียงลำดับ ก-ฮ (รองรับสระ/วรรณยุกต์ไทย)
                        .map(item => {
                            return `<option data-point="${item.center_inside}">${item.beach}</option>`;
                        }).join('');
                        const unique_beach_d2 = [
                            ...new Map((JSON.parse(textAppendChildMapsheetInput).d2).map(item => [item.beach, item])).values()
                        ];
                        const tma2_d2 = unique_beach_d2.filter(item => item.beach != null).map(item => {
                            return `<option data-point="${item.center_inside}">${item.beach}</option>`;
                        }).join('');
                        $('#input-filter-beach-list').html(`<option>ระบบหาด</option>` + tma2);
                        $('#dashboard-input-beach').html(`<option>ระบบหาด</option>` + tma2 + tma2_d2);
                        setTimeout(() => {
                            AppMap.flytoextend_initSelect2();
                            $('#input-filter-beach-list').on('select2:select', function (e) {
                                const data = e.params.data;
                                if (data?.element?.dataset?.point) {
                                    const ppoint = (data.element.dataset.point).split(',');
                                    cesiumInit.camera.flyTo({
                                        destination: Cesium.Cartesian3.fromDegrees(ppoint[1], ppoint[0], 5000),
                                        duration: 2
                                    });
                                }
                            });
                            $('#dashboard-input-beach').on('select2:select', function (e) {
                                const data = e.params.data;
                                if (data?.element?.dataset?.point) {
                                    const ppoint = (data.element.dataset.point).split(',');
                                }
                            });
                        }, 3);

                    }
                }, 1000);

            });
        },
        updateScaleBar: () => {
            if (!cesiumInit || !scaleBar) return;

            const scene = cesiumInit.scene;
            const ellipsoid = scene.globe.ellipsoid;
            const canvas = scene.canvas;

            const y = canvas.clientHeight - 20;
            const left = scene.camera.pickEllipsoid(
                new Cesium.Cartesian2(10, y),
                ellipsoid
            );
            const right = scene.camera.pickEllipsoid(
                new Cesium.Cartesian2(110, y),
                ellipsoid
            );
            
            if (!left || !right) {
                scaleLabel.innerText = 'มากกว่า 2000 km';
                return;
            };

            const leftCarto = Cesium.Cartographic.fromCartesian(left);
            const rightCarto = Cesium.Cartographic.fromCartesian(right);

            const geodesic = new Cesium.EllipsoidGeodesic(leftCarto, rightCarto);
            const distance = geodesic.surfaceDistance; // meters

            let display;
            if (distance > 1000) {
                display = (distance / 1000).toFixed(1) + ' km';
            } else {
                display = Math.round(distance) + ' m';
            }

            scaleBar.style.width = '100px';
            scaleLabel.innerText = display;
        },
        updateHeightMode: () => {
            if (cesiumInit.scene.mode === Cesium.SceneMode.SCENE2D) {
                // ถ้าเป็น 2D: บังคับให้แนบพื้น (20 เมตรจะถูกเพิกเฉย)
                userEntity.point.heightReference = Cesium.HeightReference.NONE;
                userEntity.label.heightReference = Cesium.HeightReference.NONE;
                // console.log("Switched to 2D: Clamped to Ground");
            } else {
                // ถ้าเป็น 3D หรือ Columbus View: ให้ลอยจากพื้นตามค่า Z ที่ส่งมา
                userEntity.point.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                userEntity.label.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                // console.log("Switched to 3D: Floating " + FLOAT_HEIGHT + "m above ground");
            }
            // AppMap.toggleTracking();
        },
        // 3. ฟังก์ชันสำหรับปุ่ม On/Off
        toggleTracking: () => {
            AppMap.updateHeightMode();
            const btn = document.getElementById('toggleBtn');
            if (!watchId) {
                console.log('woriking');
                
                // --- กรณี: เริ่มทำงาน (Start) ---
                if ("geolocation" in navigator) {
                    const options = {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    };

                    // เริ่มรับค่า GPS ต่อเนื่อง
                    watchId = navigator.geolocation.watchPosition(AppMap.updatePosition, AppMap.handleError, options);
                    cesiumInit.scene.requestRender?.();
                    
                    // ปรับหน้าตาปุ่ม
                    // btn.innerText = "Stop Tracking";
                    btn.classList.add("active"); // เปลี่ยนเป็นสีแดง
                } else {
                    alert("Browser ไม่รองรับ Geolocation");
                }
            } else {
                console.log('Stop');
                
                // --- กรณี: หยุดทำงาน (Stop) ---
                navigator.geolocation.clearWatch(watchId); // หยุดการดึงข้อมูล GPS
                watchId = null;

                // ปลดล็อคกล้อง ให้ผู้ใช้เลื่อนแมพเองได้
                cesiumInit.trackedEntity = undefined;

                userEntity.show = false;
                cesiumInit.scene.requestRender?.();

                // ปรับหน้าตาปุ่มคืน
                // btn.innerText = "Start Tracking";
                btn.classList.remove("active"); // กลับเป็นสีเขียว
            }
        },
        // 4. ฟังก์ชันอัปเดตตำแหน่งเมื่อได้ค่า GPS มา
        updatePosition: (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            // แปลงพิกัดและย้ายจุด
            const newPosition = Cesium.Cartesian3.fromDegrees(lon, lat);
            userEntity.position = newPosition;
            userEntity.show = true;

            // บังคับกล้องให้ตามติดตัวเรา (เฉพาะตอนเปิด Tracking อยู่)
            if (watchId && cesiumInit.trackedEntity !== userEntity) {
                cesiumInit.trackedEntity = userEntity;
            }
        },
        // 5. กรณี Error
        handleError: (error) => {
            console.warn('ERROR(' + error.code + '): ' + error.message);
            // document.getElementById('status').innerText = "GPS Error: " + error.message;
        },

        dsLoadWFSData: function (e) {
            const layerName = $(e).data('layer');
            const wfsUrl = this.geoserverWfsUrl;

            $('#map-ui-loading-page').removeClass('hidden');

            // ดึงแค่ 1 แถว (maxFeatures=1) เพื่อดูว่าใน props มี Key อะไรบ้าง
            const schemaUrl = `${wfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typeName=${layerName}&maxFeatures=1&outputFormat=application/json`;

            fetch(schemaUrl)
                .then(res => res.json())
                .then(geojson => {
                    if (geojson.features.length === 0) {
                        alert("ไม่พบข้อมูลใน Layer นี้");
                        $('#map-ui-loading-page').addClass('hidden');
                        return;
                    }

                    const p = geojson.features[0].properties;
                    // แตก props เพื่อหาชื่อคอลัมน์
                    const unpacked = typeof p.props === 'string' ? JSON.parse(p.props) : (p.props || p);

                    // สร้างรายการคอลัมน์ส่งให้ DataTable
                    const dsColumns = Object.keys(unpacked).map(key => ({
                        data: key,
                        title: key.replace(/_/g, ' ').toUpperCase(),
                        defaultContent: "-"
                    }));

                    // ใส่ ID คอลัมน์ไว้หน้าสุด
                    dsColumns.unshift({ data: "id", title: "ID" });

                    $('#map-ui-loading-page').addClass('hidden');

                    // ส่งไป Render ต่อพร้อมรายชื่อคอลัมน์ที่ถูกต้อง
                    this.dsRenderTable(e, dsColumns);
                })
                .catch(err => {
                    console.error("Schema Load Error:", err);
                    $('#map-ui-loading-page').addClass('hidden');
                });
        },
        dsRenderTable: function (e, dsColumns) {
            const layerName = $(e).data('layer');
            const tableTitle = $(e).data('title') || 'Data Table';
            const wfsUrl = this.geoserverWfsUrl;

            // ล้างตารางเก่าสร้างตารางใหม่เพื่อป้องกัน Error aDataSort
            $('#dialog').empty().html('<table id="ds-data-table" class="display nowrap w-full text-slate-200"></table>');

            // เปิด Dialog ก่อนเพื่อให้ DataTable คำนวณความกว้างได้ถูก
            $('#dialog').dialog({
                autoOpen: true,
                title: tableTitle,
                width: '50%',
                height: 'auto',
                position: { my: "center top", at: "center top+20", of: window },
                close: function () {
                    if ($.fn.DataTable.isDataTable('#ds-data-table')) {
                        $('#ds-data-table').DataTable().destroy();
                    }
                }
            });

            // สั่งให้ DataTable ทำงานหลัง Dialog เปิดเล็กน้อย
            setTimeout(() => {
                $('#ds-data-table').DataTable({
                    serverSide: true, // สำคัญ: เปิดโหมด Server
                    processing: true,
                    destroy: true,
                    // scrollX: true,
                    pageLength: 10,
                    dom: '<"flex justify-end mb-2"f>rtip',
                    ajax: (data, callback, settings) => {
                        const params = {
                            service: 'WFS',
                            version: '1.1.0',
                            request: 'GetFeature',
                            typeName: layerName,
                            outputFormat: 'application/json',
                            startIndex: data.start,    // หน้าปัจจุบันเริ่มที่แถวไหน
                            maxFeatures: data.length   // ดึงกี่แถว
                        };

                        // รองรับการค้นหา (CQL_FILTER)
                        if (data.search.value) {                            
                            // ค้นหาแบบรวมใน props (ต้องมั่นใจว่า GeoServer รองรับ LIKE บน props)
                            params.CQL_FILTER = `${dsColumns.map(col => `strToLowerCase(jsonPointer(props, '/${col.data}')) ILIKE '%${data.search.value}%'`).join(' OR ')}`;
                        }

                        $.ajax({
                            url: wfsUrl,
                            data: params,
                            dataType: 'json',
                            success: (geojson) => {
                                const dsRows = geojson.features.map((f, index) => {
                                    const p = f.properties;
                                    const unpacked = typeof p.props === 'string' ? JSON.parse(p.props) : (p.props || p);
                                    // คืนค่า Row โดยใส่ ID ลำดับที่ถูกต้อง
                                    return { id: (data.start + index + 1), ...unpacked };
                                });

                                callback({
                                    draw: data.draw,
                                    recordsTotal: geojson.totalFeatures || 0,
                                    recordsFiltered: geojson.totalFeatures || 0,
                                    data: dsRows
                                });
                            },
                            error: (err) => {
                                console.error("Data Load Error:", err);
                                callback({
                                    draw: data.draw,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            }
                        });
                    },
                    columns: dsColumns, // ใช้คอลัมน์ที่เตรียมไว้จาก dsLoadWFSData
                    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/th.json' },
                    drawCallback: function () {
                        // แต่งปุ่ม Pagination ด้วย Tailwind
                        $('.dataTables_paginate .paginate_button').addClass('px-3 py-1 bg-slate-800 text-white rounded mx-1 border-none hover:bg-sky-600 cursor-pointer text-xs');
                    }
                });
            }, 300);
        },
        // dsRenderTable: (e, dataArray) => {
        //     if (dataArray.length === 0) return;
        //     const dsColumns = Object.keys(dataArray[0]).map(key => ({
        //         data: key,
        //         title: key.replace(/_/g, ' ').toUpperCase()
        //     }));
            
        //     $('#dialog')
        //         .html(`<table id="ds-data-table" class="w-full"></table>`)
        //         .dialog({
        //             autoOpen: true,
        //             title: $(e).data('title') || 'Data Table',
        //             width: '50%',
        //             height: 'auto',
        //             position: {
        //                 my: "center top",
        //                 at: "center top+20",
        //                 of: window
        //             }
        //         });
        //     setTimeout(() => {
        //        $('#ds-data-table').DataTable({
        //             serverSide: true, // เปิดโหมด Server-side
        //             processing: true, // โชว์ตัวโหลดขณะรอข้อมูล
        //             language: {
        //                 url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/th.json'
        //             },
        //             stripeClasses: [],
        //             drawCallback: function() {
        //                 $('.dataTables_paginate .paginate_button').addClass('px-3 py-1 bg-slate-800 text-white rounded-md mx-1 hover:bg-sky-600 border-none');
        //             },
        //             data: dataArray,
        //             columns: dsColumns,
        //             destroy: true,
        //             // scrollX: true,
        //             pageLength: 5,
        //             dom: 'rtp' // เน้นเรียบง่าย
        //         }); 
        //     }, 500);
        // },
        // dsLoadWFSData: (e) => {
        //     $('#map-ui-loading-page').removeClass('hidden');
        //     const wfsUrl = AppMap.geoserverWfsUrl; // เปลี่ยนเป็น URL ของคุณ
        //     const params = new URLSearchParams({
        //         service: 'WFS', version: '1.0.0', request: 'GetFeature',
        //         typeName: `${$(e).data('layer')}`, // เปลี่ยนเป็น Layer ของคุณ
        //         outputFormat: 'application/json'
        //     });
        //     fetch(`${wfsUrl}?${params.toString()}`)
        //         .then(res => res.json())
        //         .then(geojson => {
        //             // Unpack ข้อมูลจากคอลัมน์ props (JSON)
        //             const dsMapped = geojson.features.map((f, key) => {
        //                 const p = f.properties;
        //                 const unpacked = typeof p.props === 'string' ? JSON.parse(p.props) : p.props;
        //                 return { id: (key+1), ...unpacked };
        //             });
        //             $('#map-ui-loading-page').addClass('hidden');
        //             AppMap.dsRenderTable(e, dsMapped);
        //         })
        //         .catch(err => console.error("WFS Error:", err),$('#map-ui-loading-page').removeClass('hidden'));
        // },

        initCesium: () => {
            if (cesiumInit && !cesiumInit.isDestroyed()) return;
            try {
                cesiumInit = new Cesium.Viewer("map", {
                    terrain: Cesium.Terrain.fromWorldTerrain(),
                    imageryProvider: AppMap.basemap.esriworldimagery,
                    baseLayerPicker: false,
                    timeline: false,
                    fullscreenButton: false,
                    geocoder: false,
                    homeButton: false,
                    navigationHelpButton: false,
                    infoBox: false,
                    selectionIndicator: true,
                    sceneModePicker: false,
                    animation: false,
                });
                const scene = cesiumInit.scene;
                // ปรับภาพให้เร็วขึ้น (ลดความละเอียดลงเล็กน้อย)
                cesiumInit.resolutionScale = $(document).find('data-mode').text() === 'dev' ? 0.8 : window.devicePixelRatio; // ตั้งค่าความละเอียด
                cesiumInit.scene.fxaa = false;                              // เทคนิคลดรอยหยักของภาพ — ปิดเพื่อให้ประสิทธิภาพดีขึ้น
                cesiumInit.scene.postProcessStages.fxaa.enabled = false;    // เพื่อให้แน่ใจว่า FXAA ถูกปิดทั้งหมด
                cesiumInit.scene.highDynamicRange = false;                  // ปิด HDR (High Dynamic Range) เพื่อไม่ใช้การเรนเดอร์แบบแสงสมจริง — ลดภาระ GPU
                cesiumInit.scene.requestRenderMode = true;                  // กำหนดค่าความละเอียดของการเรนเดอร์พื้นโลก (ค่าต่ำ = รายละเอียดสูงขึ้น) ค่านี้คือ 1 หมายถึงค่อนข้างละเอียด
                cesiumInit.scene.maximumRenderTimeChange = Infinity;        // กำหนดเวลาสูงสุดที่อนุญาตให้ Cesium หยุดเรนเดอร์ระหว่างเฟรม (Infinity = ไม่มีการจำกัดเวลาเลย)
                cesiumInit.scene.debugShowFramesPerSecond = false;          // ปิดการแสดง FPS (Frames Per Second) ที่มุมหน้าจอ (ใช้เพื่อ debug เฉพาะตอนทดสอบเท่านั้น)
                cesiumInit.scene.fog.enabled = false;                       // ปิดเอฟเฟกต์หมอก (fog) เพื่อให้ภาพดูคมชัดขึ้นและลดภาระการประมวลผล
                cesiumInit.shadows = false;                                 // ปิดการแสดงเงา (shadows) เพื่อเพิ่มประสิทธิภาพการเรนเดอร์
                // ประสิทธิภาพทั่วไป
                cesiumInit.scene.globe.maximumScreenSpaceError = 1;         // กำหนดค่าความละเอียดของการเรนเดอร์พื้นโลก (ค่าต่ำ = รายละเอียดสูงขึ้น) ค่านี้คือ 1 หมายถึงค่อนข้างละเอียด
                cesiumInit.scene.globe.showGroundAtmosphere = false;        // ปิดเอฟเฟกต์ชั้นบรรยากาศรอบโลก (สีน้ำเงินรอบขอบโลก) ลดภาระ GPU
                cesiumInit.scene.globe.depthTestAgainstTerrain = true;      // ให้วัตถุถูกซ่อนได้เมื่ออยู่หลังภูเขาหรือพื้นดิน (สมจริงขึ้น และช่วยลดการเรนเดอร์ที่ไม่จำเป็น)
                cesiumInit.scene.globe.showWaterEffect = true;              // แสดงผิวน้ำจริง
                cesiumInit.scene.globe.enableLighting = true;               // ให้แสงแดดสะท้อนผิวน้ำ
                cesiumInit.scene.globe.baseColor = Cesium.Color.BLACK;      // ตั้งสีพื้นหลังของโลกให้ดำ (ถ้าไม่มีภาพพื้นผิวโหลด)
                cesiumInit.scene.skyBox.show = false;                       // ปิดท้องฟ้า (skybox) เพื่อลดการวาดฉากเพิ่มเติม
                cesiumInit.scene.skyAtmosphere.show = false;                // ปิดบรรยากาศ (หมอกฟ้า) รอบโลก
                cesiumInit.scene.globe.preloadSiblings = false;             // ไม่ต้อง preload tile ที่อยู่รอบ ๆ (โหลดเฉพาะที่มองเห็นจริง)
                cesiumInit.scene.globe.preloadAncestors = true;            // ไม่ preload tile ที่อยู่ระดับบน (ลดการโหลดข้อมูลซ้ำ)
                cesiumInit.scene.globe.tileLoadingPriority = 1;             // กำหนดลำดับความสำคัญของการโหลด tile (ค่าต่ำ = เร็วกว่า)
                cesiumInit.scene.globe.tileCacheSize = 100;                 // จำกัดจำนวน tile ที่เก็บไว้ใน cache เพื่อลดการใช้หน่วยความจำ (ค่าต่ำ = ใช้หน่วยความจำน้อยลง) 
                Cesium.RequestScheduler.maximumRequestsPerServer = 18;      // จำนวนคำขอสูงสุดต่อเซิร์ฟเวอร์ (ค่าต่ำ = ลดภาระเซิร์ฟเวอร์และป้องกันการถูกบล็อก)

                // console.log("WebGL supported?", Cesium.FeatureDetection.supportsWebGL());

                scaleContainer = document.getElementById('map-scale');
                scaleBar = document.getElementById('map-scale-bar');
                scaleLabel = document.getElementById('map-scale-label');

                // จับ error ในการ render ของ Cesium
                scene.renderError.addEventListener((scene, error) => {
                    AppMap.restartCesium(); // เริ่มทำงานใหม่อัตโนมัติ
                });

                // จับกรณี context GPU หาย (WebGL Lost)
                scene.canvas.addEventListener('webglcontextlost', (event) => {
                    event.preventDefault(); // ป้องกันการ reload เอง
                    AppMap.restartCesium();
                });

                currentBaseMapLayer = cesiumInit.imageryLayers.get(0);
                // const handler = new Cesium.ScreenSpaceEventHandler(cesiumInit.scene.canvas);

                userEntity = cesiumInit.entities.add({
                    id: 'userLocation',
                    show: false,
                    point: {
                        pixelSize: 13,
                        color: Cesium.Color.DODGERBLUE,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                    },
                    label: {
                        text: 'Me',
                        font: '12pt monospace',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -9),
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                    }
                });

                cesiumInit.scene.morphComplete.addEventListener(AppMap.updateHeightMode);

                AppMap.switchBasemap(`googlesatellite`);
                AppMap.initCurrentPosition();
                AppMap.initInfoBox();
                AppMap.initFeatureInfoClick();
                AppMap.eventClickTouchCopyPosition();
                AppMap.initMapSetHome();
            } catch (error) {
                AppMap.restartCesium();
            }
        }
    };

    // Cesium Map Init
    AppMap.initCesium();
    AppMap.initDefaultData();
    AppMap.updateScaleBar();

    let layoutMap = {
        layout1: 'absolute w-full h-full pl-[59px]',
        layout2: 'absolute w-full h-full pl-[59px] pl-[calc(100vw-30%)]'
    };
    let layoutThird = {
        layout1: 'absolute left-[59px] top-0 w-[clamp(200px,100vw-59px,100vw-59px)] h-screen overflow-y-auto bg-[#eef3ff] transition-all duration-500 -translate-x-full opacity-0 pointer-events-none z-2',
        layout2: 'absolute left-[calc(59px+350px)] top-0 w-[clamp(200px,100vw-calc(59px+350px),100vw-calc(59px+350px))] h-screen overflow-y-auto bg-[#eef3ff] transition-all duration-500 -translate-x-full opacity-0 pointer-events-none z-2'
    };
    let layoutFour = {
        layout1: 'absolute left-[59px] top-0 w-[clamp(200px,100vw-59px,100vw-59px-30%)] h-screen overflow-y-auto bg-[#eef3ff] transition-all duration-500 -translate-x-full opacity-0 pointer-events-none z-2',
        layout2: 'absolute left-[calc(59px)] top-0 w-[clamp(200px,100vw-59px,100vw-59px)] h-screen overflow-y-auto bg-[#eef3ff] transition-all duration-500 -translate-x-full opacity-0 pointer-events-none z-2'
    };

    $('#toggleBtn').on('click',function(){
        AppMap.toggleTracking();
    });

    $("#dialog").dialog({
        autoOpen: false,
        width: 350,
        height: 350,
        open: function () {
            $(document).find('.ui-dialog').addClass('!font-[inherit]');
            $(document).find('.ui-dialog-titlebar').addClass('!bg-[#0094D0]').addClass('!text-white');
            $(document).find('.ui-dialog-titlebar-close').addClass('!border-none').addClass('!focus:ring-0').addClass('!focus:outline-none');
            $(document).find('.ui-dialog-titlebar-close .ui-icon-closethick').addClass('!border-none').addClass('!focus:ring-0').addClass('!focus:outline-none');
        }
    });
    // Script Controll
    $('body').on('change', '#basemap', function () {
        AppMap.switchBasemap(`${$(this).val()}`);
    });
    $('#main-container').on('click', '.menu-item', function (e) {
        const $item = $(this);
        const $content = $($(this).data('target'));

        $('#menu-second-title').text($item.attr('title'));
        $('.menu-item').removeClass('!bg-[#86a0e8]').addClass('bg-[#4c619a]');
        $('.menu-second-content').addClass('hidden');
        $content.removeClass('hidden');

        if ($item.hasClass('active')) {
            $item.removeClass('active !bg-[#86a0e8]').addClass('bg-[#4c619a]');
            $('#menu-second').addClass('-translate-x-full opacity-0 pointer-events-none');
            if (!$('#menu-third').hasClass('-translate-x-full') && !$('#menu-third').hasClass('opacity-0') && !$('#menu-third').hasClass('pointer-events-none')) {
                $('#menu-third').attr('class', layoutThird.layout1).removeClass('-translate-x-full opacity-0 pointer-events-none');
            }
        } else {
            $('.menu-item').removeClass('active');
            $item.addClass('active !bg-[#86a0e8]');
            $('#menu-second').removeClass('-translate-x-full opacity-0 pointer-events-none');
            if ($item.attr('title') == 'Dashboard สรุปภาพรวมการสำรวจชายฝั่ง' && !$('#menu-third').hasClass('-translate-x-full') && !$('#menu-third').hasClass('opacity-0') && !$('#menu-third').hasClass('pointer-events-none')) {
                if (window.innerWidth >= 700) {
                    $('#menu-third').attr('class', layoutThird.layout2).removeClass('-translate-x-full opacity-0 pointer-events-none');
                } else {
                    $('#menu-third').attr('class', layoutThird.layout2).addClass('-translate-x-full opacity-0 pointer-events-none');
                }
            } else if ($.inArray($item.attr('title'), ['Beach Profile', 'DSAS']) >= 0 && !$('#menu-four').hasClass('-translate-x-full') && !$('#menu-four').hasClass('opacity-0') && !$('#menu-four').hasClass('pointer-events-none')) {
                $('#menu-four').attr('class', layoutFour.layout1).addClass('-translate-x-full opacity-0 pointer-events-none');
            } else {
                $('#menu-third').attr('class', layoutThird.layout1).addClass('-translate-x-full opacity-0 pointer-events-none');
                $('#menu-four').attr('class', layoutFour.layout1).addClass('-translate-x-full opacity-0 pointer-events-none');
            }
        }
    });
    $('.panel-sub-menu').on('click', 'li', function (e) {
        e.stopPropagation();
    });
    $('.panel-main-menu').on('click', '.panel-has-submenu', function (e) {
        e.stopPropagation();
        const $submenu = $(this).children('.panel-sub-menu');
        const $icon = $(this).find('.panel-menu-icon');
        const isCurrentlyVisible = $submenu.is(':visible');
        $(this).siblings('.panel-has-submenu').each(function () {
            $(this).find('.panel-menu-icon')
                .text('expand_more')
                .removeClass('open');
        });
        $submenu.slideToggle(300);
        if (isCurrentlyVisible) {
            $icon.text('expand_more').removeClass('open');
        } else {
            $icon.text('expand_less').addClass('open');
        }
    });
    $('.panel-sub-menu').hide();
    $('.main-folder').on('click',function(){
        $(this).find('ul.sub-folder').attr('style','');
        if ($(this).find('ul.sub-folder').hasClass('hidden')) {
            $(this).find('ul.sub-folder').removeClass('hidden');
        } else {
            $(this).find('ul.sub-folder').addClass('hidden');
        }
    });
    $('.panel-6-radio-input').on('click', function (e) {
        $('#menu-third-title').text(`สรุปภาพรวมการสำรวจชายฝั่ง` + $(this).val());
        if ($('#menu-secord').hasClass('-translate-x-full') && $('#menu-secord').hasClass('opacity-0') && $('#menu-secord').hasClass('pointer-events-none')) {
            $('#menu-third').attr('class', layoutThird.layout1);
        } else {
            if (window.innerWidth >= 700) {
                $('#menu-second').removeClass('-translate-x-full opacity-0 pointer-events-none');
                $('#menu-third').attr('class', layoutThird.layout2);
            } else {
                $('#menu-second').addClass('-translate-x-full opacity-0 pointer-events-none');
                $('#main-container').find('.menu-item.active').removeClass('active');
                $('#menu-third').attr('class', layoutThird.layout1);
            }
        }
        $('#menu-third').removeClass('-translate-x-full opacity-0 pointer-events-none');

        $('#menu-third-chart1').empty();
        $('#menu-third-chart2').empty();
        $('#menu-third-view-chart-g1-1').addClass('hidden');
        $('#menu-third-view-chart-g1-2').addClass('hidden');
        $('#menu-third-view-chart-g2-1').addClass('hidden');
        $('#menu-third-view-chart-g2-2').addClass('hidden');
        $('#div-input-province').addClass('hidden');
        $('#div-input-beach').addClass('hidden');
        switch ($(this).val()) {
            case 'รายประเทศ':
                $('#dashboard-filter').removeClass('hidden');
                break;
            case 'รายจังหวัด':
                $('#dashboard-filter').removeClass('hidden');
                $('#div-input-province').removeClass('hidden');
                break;
            case 'รายระบบกลุ่มหาด':
                $('#dashboard-filter').removeClass('hidden');
                $('#div-input-beach').removeClass('hidden');
                break;
            case 'ตามช่วงเวลา':
                $('#dashboard-filter').removeClass('hidden');
                break;
        }

        $('#dashboard-query-button').off('click').on('click', function (ee) {
            ee.preventDefault();
            $('#map-ui-loading-page').removeClass('hidden');
            const filterType = $('.panel-6-radio-input:checked').val();
            let filterProvince = $('#dashboard-input-province').val() || '';
            let filterBeach = $('#dashboard-input-beach').val() || '';
            let filterDateBegin = $('#dashboard-input-date-begin').val() || '';
            let filterDateEnd = $('#dashboard-input-date-end').val() || '';

            if (!filterDateBegin || !filterDateEnd) {
                alert("กรุณากรอกวันที่ให้ครบทั้งสองช่อง");
                $('#map-ui-loading-page').addClass('hidden');
                return;
            }
            if (new Date(filterDateBegin) > new Date(filterDateEnd)) {
                alert("วันที่เริ่มต้น ต้องน้อยกว่าวันที่สิ้นสุด");
                $('#map-ui-loading-page').addClass('hidden');
                return;
            }

            $('#menu-third-view-chart-g1-1').addClass('hidden');
            $('#menu-third-view-chart-g1-2').addClass('hidden');
            $('#menu-third-view-chart-g2-1').addClass('hidden');
            $('#menu-third-view-chart-g2-2').addClass('hidden');

            switch (filterType) {
                case 'รายประเทศ':
                    AppMap.dashboardMapsVolumnFinal('menu-third-chart1');
                    $('#menu-third-view-chart-g1-2').removeClass('hidden');
                    $('#menu-third-view-chart-g1-2').off('click').on('click', function () {
                        AppMap.dashboardMapsQualityFinal('menu-third-chart2');
                        $('#menu-third-chart1').addClass('hidden');
                        $('#menu-third-view-chart-g1-1').removeClass('hidden');
                        $('#menu-third-view-chart-g1-2').addClass('hidden');
                    });
                    $('#menu-third-view-chart-g1-1').off('click').on('click', function () {
                        AppMap.dashboardMapsVolumnFinal('menu-third-chart1');
                        $('#menu-third-chart2').addClass('hidden');
                        $('#menu-third-view-chart-g1-1').addClass('hidden');
                        $('#menu-third-view-chart-g1-2').removeClass('hidden');
                    });
                    $('#map-ui-loading-page').addClass('hidden');
                    break;
                case 'รายจังหวัด':
                    if (!filterProvince) {
                        alert("กรุณาเลือกจังหวัด");
                        $('#map-ui-loading-page').addClass('hidden');
                        return;
                    }
                    AppMap.dashboardMapsVolumnProvinceFinal('menu-third-chart1', filterProvince);
                    $('#menu-third-view-chart-g2-2').removeClass('hidden');
                    $('#menu-third-view-chart-g2-2').off('click').on('click', function () {
                        AppMap.dashboardMapsQualityProvinceFinal('menu-third-chart2', filterProvince);
                        $('#menu-third-chart1').addClass('hidden');
                        $('#menu-third-view-chart-g2-1').removeClass('hidden');
                        $('#menu-third-view-chart-g2-2').addClass('hidden');
                    });
                    $('#menu-third-view-chart-g2-1').off('click').on('click', function () {
                        AppMap.dashboardMapsVolumnProvinceFinal('menu-third-chart1', filterProvince);
                        $('#menu-third-chart2').addClass('hidden');
                        $('#menu-third-view-chart-g2-1').addClass('hidden');
                        $('#menu-third-view-chart-g2-2').removeClass('hidden');
                    });
                    $('#map-ui-loading-page').addClass('hidden');
                    break;
                case 'รายระบบกลุ่มหาด':
                    if (!filterBeach) {
                        alert("กรุณาเลือกระบบกลุ่มหาด");
                        $('#map-ui-loading-page').addClass('hidden');
                        return;
                    }
                    AppMap.dashboardMapsVolumnBeachFinal('menu-third-chart1', filterBeach);
                    $('#menu-third-view-chart-g2-2').removeClass('hidden');
                    $('#menu-third-view-chart-g2-2').off('click').on('click', function () {
                        AppMap.dashboardMapsQualityBeachFinal('menu-third-chart2', filterBeach);
                        $('#menu-third-chart1').addClass('hidden');
                        $('#menu-third-view-chart-g2-1').removeClass('hidden');
                        $('#menu-third-view-chart-g2-2').addClass('hidden');
                    });
                    $('#menu-third-view-chart-g2-1').off('click').on('click', function () {
                        AppMap.dashboardMapsVolumnBeachFinal('menu-third-chart1', filterBeach);
                        $('#menu-third-chart2').addClass('hidden');
                        $('#menu-third-view-chart-g2-1').addClass('hidden');
                        $('#menu-third-view-chart-g2-2').removeClass('hidden');
                    });
                    $('#map-ui-loading-page').addClass('hidden');
                    break;
                default:
                    alert('Invalid filter type');
                    $('#map-ui-loading-page').addClass('hidden');
                    break;
            }
        });
    });

    $('#switch-mode').on('click', function () {
        AppMap.toggleViewMode();
        $(this).text(($(this).text() == 'map' ? '3d_rotation' : 'map'));
    });
    $('#setting-view-home').on('click', function () {
        AppMap.initMapSetHome();
    });
    $(document).on('click', '.close-menu', function (e) {
        $(this).parent().addClass('-translate-x-full opacity-0 pointer-events-none');
    });
    $(document).on('keyup', '.input-filter[title="สถานที่"]', async function (e) {
        if (new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']).has(e.key)) return;
        const query = AppMap.normalizeQuery($(this).val().trim());
        if (!query) { AppMap.removeMarker(); return; };
        if (query.length < 3) { return; };
        if (e.key === 'enter' || e.code === 'enter' || e.which === 13) {
            try {
                const result = await AppMap.geocoderSearch(query);
                if (result) {
                    if (result.lon && result.lat) {
                        cesiumInit.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(result.lon, result.lat, 5000)
                        });
                        AppMap.addMarker({
                            lon: result.lon,
                            lat: result.lat,
                            name: result.name
                        });
                    }
                    let keys = ["name", "address", "tag", "lat", "lon"];
                    let resultHTML = keys
                        .filter(k => result[k] !== undefined)
                        .map(k => {
                            let value = Array.isArray(result[k]) ? result[k][0] : result[k];
                            if (!value) { return; }
                            switch (k) {
                                case "name":
                                    return `<span class="mb-1">ชื่อสถานที่: ${value}</span>`;
                                    break;
                                case "address":
                                    return `<span class="mb-1">ที่อยู่: ${value}</span>`;
                                    break;
                                case "tag":
                                    return `<span class="mb-1">Tag: ${value}</span>`;
                                    break;
                                case "lat":
                                    if (result["lon"] !== undefined) {
                                        let lon = Array.isArray(result["lon"]) ? result["lon"][0] : result["lon"];
                                        return `<span class="mb-1">พิกัด: ${value.toFixed(6)}, ${lon.toFixed(6)}</span>`;
                                    }
                                    return `<span class="mb-1">พิกัด: ${value.toFixed(6)}</span>`;
                                    break;
                                case "lon": return; break;
                                default: return; break;
                            }
                        })
                        .filter(Boolean)
                        .join("");
                    $('#dialog').html(`${resultHTML}`)
                        .dialog({
                            autoOpen: true,
                            title: result.name || "No title",
                            height: 'auto',
                            position: {
                                my: "right bottom",
                                at: "right-20 bottom-20",
                                of: window
                            }
                        });
                } else {
                    return false;
                }
            } catch (err) {
                console.error('Geocode error:', err);
            }
        }
    });
    $(document).on('change', '.layer-item', function () {
        let thisEL = $(this);
        let isChecked = $(this).prop('checked');
        let layerType = $(this).data('type') || '';
        let layerGroup = $(this).data('layergroup') || '';
        let layerstroke = $(this).data('stroke') || '';
        let layerValue = $(this).val() || '';
        let layerId = $(this).data('name') || 'otherlayer';
        let layerFilter = $(this).data('filter') || '';
        let layerSLD = $(this).data('sld') || '';
        let layerOther = $(this).data('other') || 'no';
        let layerTitle = $(this).data('title') || 'Empty Name';
        let wmsUri;
        switch (layerType) {
            case 'wms': wmsUri = $(this).data('wmsuri'); break;
            case 'geojson': wmsUri = $(this).data('wmsuri'); break;
            default: wmsUri = null; break;
        }

        try {
            if (typeof layerValue === 'string' && layerValue.startsWith('[')) {
                layerValue = JSON.parse(layerValue);
            }
        } catch (e) {
            console.warn('parse ไม่ได้:', e);
        }

        if (Array.isArray(layerValue)) {
            if (isChecked) {
                $.each(layerValue, function (k, v) {
                    let llggoo09s = { id: layerId, title: layerTitle, type: layerType, group: layerGroup, stroke: layerstroke, url: wmsUri, name: v, sld: layerSLD };
                    AppMap.addLayer(llggoo09s);
                    if (layerOther == 'yes') {
                        let idIntsh = 'inputfilter-' + crypto.randomUUID();
                        thisEL.parent().parent().append(`
                            <div class="pt-1 pl-7 filter-of-this-layer">
                                <div class="w-full max-w-sm min-w-[200px] mb-2">
                                    <label class="block mb-2 text-sm text-slate-500">ตัวกรอง <a class="btnOpenFilterGuide cursor-pointer text-blue-500 hover:bg-white rounded pl-2 pr-2">วิธีใช้งานตัวกรอง</a></label>
                                    <input id="${idIntsh}-json" type="text" placeholder="พิมพ์เงื่อนไข แล้วกด Enter เพื่อค้นหา" class="inputfilter-json w-full bg-transparent placeholder:text-slate-400 text-slate-300 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"/>
                                </div>
                            </div>`);

                        $('#' + idIntsh + '-json').on('keyup',function(e){
                            if (e.key === 'Enter' || e.keyCode === 13) {
                                let iinnppss = AppMap.formatCQL($(this).val());
                                if (iinnppss != '') {
                                    AppMap.filterLayer(llggoo09s, iinnppss);
                                } else {
                                    AppMap.filterLayer(llggoo09s, "");
                                }
                            }
                        });
                        // ฟังก์ชันเปิด Modal
                        $('.btnOpenFilterGuide').off().on('click', function() {
                            $('#filterGuideModal').removeClass('hidden');
                        });
                    }
                });
            } else {
                $.each(layerValue, function (k, v) {
                    AppMap.removeLayer({ id: layerId, type: layerType, stroke: layerstroke, group: layerGroup, url: wmsUri, name: v, sld: layerSLD });
                    try {
                        thisEL.parent().parent().find('.filter-of-this-layer').remove();
                    } catch (error) { }
                });
            }
        }
    });

    let dsasDrawingHandler = null;
    let dsasStartPoint = null;
    let dsasEndPoint = null;
    let dsasLineEntity = null;
    let dsasStartEntity = null;
    let dsasEndEntity = null;

    function enableDsasDraw() {
        // กันซ้ำ ถ้ามี handler เดิมอยู่แล้วให้เคลียร์ก่อน
        disableDsasDraw();

        dsasDrawingHandler = new Cesium.ScreenSpaceEventHandler(cesiumInit.scene.canvas);
        dsasStartPoint = null;
        dsasEndPoint = null;

        // คลิกซ้าย = เลือกจุด
        dsasDrawingHandler.setInputAction(async function (click) {
            const cartesian = cesiumInit.scene.pickPosition(click.position) || cesiumInit.camera.pickEllipsoid(click.position, cesiumInit.scene.globe.ellipsoid);
            if (!cartesian) return;

            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);

            cartographic.height = (cartographic.height || 0) + 0.0; // ลอย 0 เมตร
            const elevatedCartesian = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                cartographic.height
            );

            if (!dsasStartPoint) {
                // ครั้งแรก = จุดเริ่มต้น
                dsasStartPoint = { lon, lat, cartesian: elevatedCartesian };

                // marker จุดเริ่ม
                dsasStartEntity = cesiumInit.entities.add({
                    position: cartesian,
                    point: {
                        pixelSize: 8,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE
                    },
                    label: {
                        text: 'Start',
                        font: '14px sans-serif',
                        fillColor: Cesium.Color.CYAN,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -10)
                    }
                });
                cesiumInit.scene.requestRender?.();
            } else if (!dsasEndPoint) {
                // ครั้งที่สอง = จุดสิ้นสุด
                dsasEndPoint = { lon, lat, cartesian };

                // marker จุดสิ้นสุด
                dsasEndEntity = cesiumInit.entities.add({
                    position: cartesian,
                    point: {
                        pixelSize: 8,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        // outlineWidth: 2
                    },
                    label: {
                        text: 'End',
                        font: '14px sans-serif',
                        fillColor: Cesium.Color.CYAN,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -10)
                    }
                });

                // วาดเส้นระหว่าง start–end
                if (dsasLineEntity) {
                    cesiumInit.entities.remove(dsasLineEntity);
                }

                dsasLineEntity = cesiumInit.entities.add({
                    polyline: {
                        positions: [dsasStartPoint.cartesian, dsasEndPoint.cartesian],
                        width: 3,
                        material: Cesium.Color.YELLOW
                    }
                });

                const demoLP = {
                    "type": "LineString", "coordinates": [
                        [dsasStartPoint.lon, dsasStartPoint.lat],
                        [dsasEndPoint.lon, dsasEndPoint.lat]
                    ]
                };

                setTimeout(async () => {
                    $('#map-ui-loading-page').removeClass('hidden');
                    const profile = {
                        name: 'DSAS',
                        data: await AppMap.generateBeachProfileFromGeom(JSON.stringify(demoLP), 5, true)
                    };
                    await AppMap.beachprofileChart(profile);
                    cesiumInit.scene.requestRender?.();
                    $('#map-ui-loading-page').addClass('hidden');
                }, 200);

            } else {
                dsasDrawingHandler.destroy();
                dsasDrawingHandler = null;
                dsasStartPoint = null;
                dsasEndPoint = null;
                cesiumInit.scene.requestRender?.();
                enableDsasDraw();
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    function disableDsasDraw() {
        if (dsasDrawingHandler) {
            dsasDrawingHandler.destroy();
            dsasDrawingHandler = null;
        }

        if (dsasLineEntity) {
            cesiumInit.entities.remove(dsasLineEntity);
            dsasLineEntity = null;
        }
        if (dsasStartEntity) {
            cesiumInit.entities.remove(dsasStartEntity);
            dsasStartEntity = null;
        }
        if (dsasEndEntity) {
            cesiumInit.entities.remove(dsasEndEntity);
            dsasEndEntity = null;
        }

        dsasStartPoint = null;
        cesiumInit.scene.requestRender?.();
    }


    $('#feature-dsas').on('change', function () {
        const isChecked = $(this).prop('checked');
        if (isChecked) {
            enableDsasDraw();
        } else {
            disableDsasDraw();
        }
    });


    (function () {
        const $wrap = $('#filtersWrap');
        // helper: เช็ค desktop
        const isDesktop = () => window.innerWidth >= 1160;

        // คลิกปุ่มเพื่อสลับ
        $(document).on('click', '.button-filter', function () {
            if ($wrap.hasClass('!hidden')) {
                $wrap.removeClass('!hidden');
            } else {
                $wrap.addClass('!hidden');
            };
        });

        let rAF;
        const runOnResizeOrDevtools = () => {
            cancelAnimationFrame(rAF);
            rAF = requestAnimationFrame(() => {
                if (isDesktop() && $wrap.hasClass('!hidden')) {
                    $wrap.removeClass('!hidden');
                } else if (!isDesktop() && $wrap.hasClass('!hidden')) {
                    $wrap.removeClass('!hidden');
                }
            });
        };
        $(window).on('resize', runOnResizeOrDevtools);
        $(document).on('keydown', function (e) {
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
                runOnResizeOrDevtools();
                return;
            }
            if (e.key === 'F12') {
                runOnResizeOrDevtools();
                return;
            }
        });
    })();

    $(document).ready(function () {
        $('#map-ui-loading-page').addClass('hidden');
    });

    const observer = new MutationObserver(() => {
        if ($('#menu-four').attr('class') == 'absolute left-[59px] top-0 w-[clamp(200px,100vw-59px,100vw-59px-30%)] h-screen overflow-y-auto bg-[#eef3ff] transition-all duration-500 z-2') {
            $('#map').attr('class', layoutMap.layout2);
        } else {
            $('#map').attr('class', layoutMap.layout1);
        }
    });
    observer.observe(document.getElementById('menu-four'), { attributes: true, attributeFilter: ['class'] });

    // ใช้ Prefix "NavUI" สำหรับตัวควบคุมทั้งหมด
    var NavUI = {
        // 1. Properties (Prefix: el สำหรับ DOM, val สำหรับค่าตัวเลข)
        elRing: document.getElementById('compass-ring'),
        elPitch: document.getElementById('pitch-indicator'),
        valLastX: 0,
        valLastY: 0,
        isDragging: false,

        // 2. Methods (Prefix: handle สำหรับ Event)
        init: function(Cviewer) {
            var self = this;
            
            // อัปเดต UI เมื่อกล้องเปลี่ยน
            Cviewer.camera.changed.addEventListener(function() {
                var h = Cesium.Math.toDegrees(Cviewer.camera.heading);
                var p = Cesium.Math.toDegrees(Cviewer.camera.pitch);
                
                // หมุน Ring และเปลี่ยนเลข Pitch
                self.elRing.style.transform = 'rotate(' + (-h) + 'deg)';
                self.elPitch.innerText = Math.round(p) + '°';

                AppMap.updateScaleBar();
            });
            Cviewer.camera.moveEnd.addEventListener(function() {
                var h = Cesium.Math.toDegrees(Cviewer.camera.heading);
                var p = Cesium.Math.toDegrees(Cviewer.camera.pitch);
                
                // หมุน Ring และเปลี่ยนเลข Pitch
                self.elRing.style.transform = 'rotate(' + (-h) + 'deg)';
                self.elPitch.innerText = Math.round(p) + '°';

                AppMap.updateScaleBar();
            });

            this.bindEvents(Cviewer);

            document.getElementById('navigation-widget').onclick = function () {
                cesiumInit.camera.flyTo({
                    destination: cesiumInit.camera.position,
                    orientation: {
                        heading: Cesium.Math.toRadians(0), // กลับไปทิศเหนือ
                        pitch: Cesium.Math.toRadians(-90), // มองตรงลงพื้น
                        // pitch: cesiumInit.camera.pitch,
                        roll: cesiumInit.camera.roll
                    }
                });
            };
        },

        handleDragStart: function(e) {
            this.isDragging = true;
            this.valLastX = e.clientX || e.touches[0].clientX;
            this.valLastY = e.clientY || e.touches[0].clientY;
        },

        bindEvents: function(Cviewer) {
            // ผูก Event เข้ากับ Handler
            this.elRing.addEventListener('mousedown', this.handleDragStart.bind(this));
            // ... (ใส่ Event อื่นๆ ตามที่เขียนไว้ก่อนหน้า)
        }
    };

    // เรียกใช้งานง่ายๆ แค่บรรทัดเดียว
    NavUI.init(cesiumInit);

});

$(document).ready(function() {
    // ฟังก์ชันปิด Modal (กดปุ่ม "เข้าใจแล้ว" หรือ ปุ่มกากบาท)
    $('#btnCloseFilterGuide, #btnCloseIcon').on('click', function() {
        $('#filterGuideModal').addClass('hidden');
    });

    // ฟังก์ชันปิดเมื่อคลิกที่พื้นหลัง (Backdrop)
    $('#filterGuideBackdrop').on('click', function() {
        $('#filterGuideModal').addClass('hidden');
    });
});

// ทำงานเมื่อมีการเริ่ม AJAX (Pending)
$(document).ajaxStart(function() {
    $("#map-ui-loading-page").removeClass('hidden'); 
    console.log("มี AJAX กำลังทำงาน...");
});

// ทำงานเมื่อ AJAX ทุกตัวทำงานเสร็จสิ้น (No Pending)
$(document).ajaxStop(function() {
    $("#map-ui-loading-page").addClass('hidden');
    console.log("ไม่มี AJAX ค้างแล้ว");
});