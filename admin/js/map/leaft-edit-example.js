const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems, // อ้างถึงชั้นที่ต้องการให้แก้ไข/ลบ
            edit: true,
            remove: true
        },
        draw: {
            marker: true,
            polygon: true,
            polyline: true,
            rectangle: true,
            circle: false,  // ปิดได้ถ้าไม่ต้องการ
            circlemarker: false
        }
    });
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        onWorkDone("created", layer);
    });

    // 5) ฟัง Event: แก้ไขเสร็จ
    map.on(L.Draw.Event.EDITED, function (e) {
        // e.layers เป็น LayerGroup ของชิ้นที่ถูกแก้
        onWorkDone("edited", e.layers);
    });

    // 6) ฟัง Event: ลบเสร็จ
    map.on(L.Draw.Event.DELETED, function (e) {
        onWorkDone("deleted", e.layers);
    });

    // 7) (ทางเลือก) ฟังตอน “ออกจากโหมดแก้ไข”
    map.on('draw:editstop', function () {
        console.log('Edit mode stopped');
        // บันทึกสถานะทั้งหมดก็ได้
        saveAllGeoJSON();
    });
    function onWorkDone(action, target) {
        console.log('[DRAW]', action, target);

        // เก็บทั้งหมดเป็น FeatureCollection
        saveAllGeoJSON();

        // ถ้าต้องตรวจเฉพาะชิ้นที่เพิ่งทำเสร็จ:
        // const gj = target.toGeoJSON ? target.toGeoJSON() : target.toGeoJSON({multi:true});
        // console.log('just-updated-geojson', gj);

        // TODO: เรียก API ของคุณเพื่อเซฟลง backend ก็ได้
        // fetch('/api/save', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(gj)})
    }

    function saveAllGeoJSON() {
        const fc = drawnItems.toGeoJSON(); // เป็น FeatureCollection
        console.log('all-geojson', fc);
        // ตัวอย่างส่งกลับ backend
        // fetch('/api/saveAll', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(fc) });
    }

    // --- (ทางเลือก) เปิด/ปิดโหมดแก้ไขด้วยปุ่มของคุณเอง ---
    // เปิดโหมดแก้ไขทุกชิ้น
    function enableEditAll() {
        drawnItems.eachLayer(l => {
        if (l.editing && l.editing.enable) l.editing.enable();
        });
    }
    // ปิดโหมดแก้ไขทุกชิ้น
    function disableEditAll() {
        drawnItems.eachLayer(l => {
        if (l.editing && l.editing.disable) l.editing.disable();
        });
        saveAllGeoJSON(); // เซฟเมื่อออกจากโหมดแก้ไข
    }
    // ตัวอย่าง: เพิ่มชิ้นเริ่มต้นแล้วเปิดแก้ไขทันที
    // const initMarker = L.marker([13.75, 100.5]).addTo(drawnItems);
    // enableEditAll();