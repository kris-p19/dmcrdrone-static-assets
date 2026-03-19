const sldTemplate = {
   beachVolumn:  `<?xml version="1.0" encoding="UTF-8"?>
                    <StyledLayerDescriptor 
                        xmlns="http://www.opengis.net/sld"
                        xmlns:ogc="http://www.opengis.net/ogc"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xsi:schemaLocation="http://www.opengis.net/sld
                        http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
                        version="1.0.0">
                    <NamedLayer>
                        <Name>__LAYER_NAME__</Name>
                        <UserStyle>
                        <Title>DTM Dynamic Two Color</Title>
                        <FeatureTypeStyle>
                            <Rule>
                            <RasterSymbolizer>
                                <Opacity>1.0</Opacity>
                                <ColorMap>
                                    <ColorMapEntry color="__LOW_COLOR__"  quantity="-10000" label="Below 0"/>
                                    <ColorMapEntry color="__LOW_COLOR__"  quantity="0"       label="0"/>
                                    <ColorMapEntry color="__HIGH_COLOR__" quantity="0.0001"  label="Above 0"/>
                                    <ColorMapEntry color="__HIGH_COLOR__" quantity="10000"   label="High"/>
                                </ColorMap>
                            </RasterSymbolizer>
                            </Rule>
                        </FeatureTypeStyle>
                        </UserStyle>
                    </NamedLayer>
                    </StyledLayerDescriptor>`
};