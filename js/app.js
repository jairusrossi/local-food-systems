(function () {

    d3.queue().defer(d3.json, "data/snap.json")
        .defer(d3.json, "https://jairusrossi.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM local_food_counties WHERE state='21'")
        .defer(d3.json, 'data/infrastructure.json')
        .defer(d3.json, 'data/dtc.geojson')
        .await(makeMap)


    function makeMap(error, snapData, counties, infrastructureData, dtcData) {


        var map = L.map('map', {
            zoomSnap: .1,
            center: [
                37.4, -83.4
            ],
            zoom: 8,
            minZoom: 8,
            maxZoom: 11,
            maxBounds: L.latLngBounds([
                41, -85.75
            ], [35.5, -81])
        });

        var tiles = L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
            attribution: 'Imagery from <a href="http://giscience.uni-hd.de/" > GIScience Research Group@ University of Heidelberg < /a> &mdash; Map data &copy; <a href="http:/ / www.openstreetmap.org / copyright ">OpenStreetMap</a>',

        });

        tiles.addTo(map);

        var options = {
            pointToLayer: function (feature, ll) { //change options to get points
                return L.circleMarker(ll, {
                    opacity: 1,
                    weight: 2,
                    fillOpacity: .3

                });
            }
        };

        var commonStyles = {
            weight: 1,
            stroke: 1,
            fillOpacity: .8,
            radius: 4
        }

        var layerInfo = {
            igaLayer: {
                source: '2',
                color: '#ff8000'
            },
            indepLayer: {
                source: '3',
                color: '#993333'
            },
            chainLayer: {
                source: '1',
                color: '#ffff00'
            },
            superLayer: {
                source: '4',
                color: '#ff0000'
            },
            farmLayer: {
                source: '5',
                color: '#006600'
            },
            vaLayer: {
                source: '6',
                color: '#ff8080'
            },
            miscLayer: {
                source: '7',
                color: '#cccc00'
            },
            marketLayer: {
                source: '8',
                color: '#00cc66'
            },
            distLayer: {
                source: '9',
                color: '#000099'
            },
            greenLayer: {
                source: '10',
                color: '#D3D3D3'
            },
            auctionLayer: {
                source: '11',
                color: '#FAA23F'
            },
            processLayer: {
                source: '12',
                color: '#ff0000'
            },
            techLayer: {
                source: '13',
                color: '#FAA23F'
            },
            banksLayer: {
                source: '14',
                color: '#ff0000'
            }

        };

        var dataLayer = L.geoJson(counties, {
            style: function (feature) {
                return {
                    color: '#dddddd',
                    weight: 2,
                    fillOpacity: .7,
                    fillColor: '#1f78b4',
                };

            }
        }).addTo(map);

        var geoJsonLayers = {};

        var snapLayer = L.layerGroup().addTo(map); // add empty layergroup to map

        for (var layer in layerInfo) { //takes each layer on its own and cycles through the code

            geoJsonLayers[layer] = L.geoJson(snapData, {

                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, commonStyles);
                },
                filter: function (feature) {

                    // create shortuts to numbers
                    var featureNum = feature.properties.source,
                        layerNum = +layerInfo[layer].source; // convert to number

                    // if this feature is equal to layer source num
                    if (featureNum === layerNum) {
                        return feature; // return the feature
                    }
                },
                style: function (feature) { //and symbolized according to source where 'layer' in layerInfo is still passed as the argument
                    return {
                        color: layerInfo[layer].color,
                        fillColor: layerInfo[layer].color,
                        //  radius: getRadius(feature.properties.fuel_source[layerInfo[layer].source]) //radius is defined by power generation capacity contained in the 'source' property
                    }
                }
            }).addTo(snapLayer);
        }

        var infrastructureLayer = L.layerGroup(); // add empty layergroup to map

        for (var layer in layerInfo) { //takes each layer on its own and cycles through the code

            geoJsonLayers[layer] = L.geoJson(infrastructureData, {

                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, commonStyles);
                },
                filter: function (feature) {

                    // create shortuts to numbers
                    var featureNum = feature.properties.source,
                        layerNum = +layerInfo[layer].source; // convert to number

                    // if this feature is equal to layer source num
                    if (featureNum === layerNum) {
                        return feature; // return the feature
                    }
                },
                style: function (feature) { //and symbolized according to source where 'layer' in layerInfo is still passed as the argument
                    return {
                        color: layerInfo[layer].color,
                        fillColor: layerInfo[layer].color,
                        //  radius: getRadius(feature.properties.fuel_source[layerInfo[layer].source]) //radius is defined by power generation capacity contained in the 'source' property
                    }
                }
            }).addTo(infrastructureLayer);
        }

        var dtcLayer = L.layerGroup(); // add empty layergroup to map

        for (var layer in layerInfo) { //takes each layer on its own and cycles through the code

            geoJsonLayers[layer] = L.geoJson(dtcData, {

                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, commonStyles);
                },
                filter: function (feature) {

                    // create shortuts to numbers
                    var featureNum = feature.properties.source,
                        layerNum = +layerInfo[layer].source; // convert to number

                    // if this feature is equal to layer source num
                    if (featureNum === layerNum) {
                        return feature; // return the feature
                    }
                },
                style: function (feature) { //and symbolized according to source where 'layer' in layerInfo is still passed as the argument
                    return {
                        color: layerInfo[layer].color,
                        fillColor: layerInfo[layer].color,
                        //  radius: getRadius(feature.properties.fuel_source[layerInfo[layer].source]) //radius is defined by power generation capacity contained in the 'source' property
                    }
                }
            }).addTo(dtcLayer);
        }


        snapLabels = {

            "<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
            "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
            "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
            "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer

        }
        dtcLabels = {
            "<b style='color:#3FFA5B'>Farm</b>": geoJsonLayers.farmLayer,
            "<b style='color:#D3D3D3'>Value-Added</b>": geoJsonLayers.vaLayer,
            "<b style='color:#FAA23F'>Apiary, Orchard, Vineyard</b>": geoJsonLayers.miscLayer,
            "<b style='color:#ff0000'>Market</b>": geoJsonLayers.marketLayer,

        }

        infraLabels = {
            "<b style='color:#3FFA5B'>Distribution</b>": geoJsonLayers.distLayer,
            "<b style='color:#D3D3D3'>Greenhouse</b>": geoJsonLayers.greenLayer,
            "<b style='color:#FAA23F'>Auction, Stockyard</b>": geoJsonLayers.auctionLayer,
            "<b style='color:#ff0000'>Processing</b>": geoJsonLayers.processLayer,
            "<b style='color:#FAA23F'>Technical Assistance</b>": geoJsonLayers.techLayer
                /*"<b style='color:#ff0000'>Food Banks</b>": geoJsonLayers.banksLayer */
        }


        /*"<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
        "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
        "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
        "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer
            "<b style='color:#3FFA5B'>Farm</b>": geoJsonLayers.farmLayer,
            "<b style='color:#D3D3D3'>Value-Added</b>": geoJsonLayers.vaLayer,
            "<b style='color:#FAA23F'>Apiary, Orchard, Vineyard</b>": geoJsonLayers.miscLayer,
            "<b style='color:#ff0000'>Market</b>": geoJsonLayers.marketLayer,
            "<b style='color:#3FFA5B'>Distribution</b>": geoJsonLayers.distLayer,
            "<b style='color:#D3D3D3'>Greenhouse</b>": geoJsonLayers.greenLayer,
            "<b style='color:#FAA23F'>Auction, Stockyard</b>": geoJsonLayers.auctionLayer,
            "<b style='color:#ff0000'>Processing</b>": geoJsonLayers.processLayer,
            "<b style='color:#FAA23F'>Technical Assistance</b>": geoJsonLayers.techLayer,
            "<b style='color:#ff0000'>Food Banks</b>": geoJsonLayers.banksLayer*/



        var snapLayerControl = L.control.layers(null, snapLabels, { //adds a control toggle option in top right of the map
            collapsed: false
        }).addTo(map);

        var infraLayerControl = L.control.layers(null, infraLabels, { //adds a control toggle option in top right of the map
            collapsed: false
        }).addTo(map);

        var dtcLayerControl = L.control.layers(null, dtcLabels, { //adds a control toggle option in top right of the map
            collapsed: false
        }).addTo(map);


        /*  var infrastructureLayer = L.geoJson(infrastructureData, options);



  var dtcLayer = L.geoJson(dtcData, options);*/


        updateMap(dataLayer);


        addUI(map, snapLayer, infrastructureLayer, dtcLayer);

    }

    // end makeMap

    function addUI(map, snapLayer, infrastructureLayer, dtcLayer, snapLabels, infraLabels, dtcLabels) {




        $('select[name]').change(function () {
            var asset = $(this).val();
            console.log(asset) // is either snap or infrastructure


            var tempLayer = L.layerGroup(); // won't add this to map

            // if snap
            if (asset === "snap") {
                // remove the infrastructureLayer and add to tempLayer
                tempLayer.addLayer(infrastructureLayer);
                tempLayer.addLayer(dtcLayer)
                map.removeLayer(infrastructureLayer);
                map.removeLayer(dtcLayer);
                // add the snapLayer and remove from tempLayer
                map.addLayer(snapLayer);
                tempLayer.removeLayer(snapLayer);
                /*map.removeControl();*/
                L.control.layers(null, snapLabels, { //adds a control toggle option in top right of the map
                    collapsed: false
                }).addTo(map);

            } else if (asset === "infrastructure") {
                // to the same thing for tempLayer
                tempLayer.addLayer(snapLayer);
                tempLayer.addLayer(dtcLayer)
                map.removeLayer(snapLayer);
                map.removeLayer(dtcLayer);
                map.addLayer(infrastructureLayer);
                tempLayer.removeLayer(infrastructureLayer);
                /* map.removeControl(snapLabels);*/
                L.control.layers(null, infraLabels, { //adds a control toggle option in top right of the map
                    collapsed: false
                }).addTo(map);
            } else if (asset === "dtc") {
                tempLayer.addLayer(snapLayer);
                tempLayer.addLayer(infrastructureLayer);
                map.removeLayer(snapLayer);
                map.removeLayer(infrastructureLayer);
                map.addLayer(dtcLayer);
                L.control.layers(null, infraLabels, { //adds a control toggle option in top right of the map
                    collapsed: false
                }).addTo(map);
            }
        });
    }




    /* function updatePoints(asset) {

            var layerInfo = {
               /*igaLayer: {
                   source: '2',
                   color: '#3FFA5B'
               },
               indepLayer: {
                   source: '3',
                   color: '#D3D3D3'
               },
               chainLayer: {
                   source: '1',
                   color: '#FAA23F'
               },
               superLayer: {
                   source: '4',
                   color: '#ff0000'
               },

               farmLayer: {
                   source: '5',
                   color: '#3FFA5B'
               },
               vaLayer: {
                   source: '6',
                   color: '#D3D3D3'
               },
               miscLayer: {
                   source: '7',
                   color: '#FAA23F'
               },
               marketLayer: {
                   source: '8',
                   color: '#ff0000'
               },
               distLayer: {
                   source: '9',
                   color: '#3FFA5B'
               },
               greenLayer: {
                   source: '10',
                   color: '#D3D3D3'
               },
               auctionLayer: {
                   source: '11',
                   color: '#FAA23F'
               },
               processLayer: {
                   source: '12',
                   color: '#ff0000'
               },
               techLayer: {
                   source: '13',
                   color: '#FAA23F'
               },
               /* banksLayer: {
                    source: '14',
                    color: '#ff0000'
               /*}*/

    //need to write layer definitions for all the other asset classes - and then recode the GEOJSONs to have different numbers.
    /* };

        var geoJsonLayers = {};

        for (var layer in layerInfo) { //takes each layer on its own and cycles through the code

            geoJsonLayers[layer] = L.geoJson(asset, {

                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, commonStyles);
                },
                filter: function (feature) {

                    // create shortuts to numbers
                    var featureNum = feature.properties.source,
                        layerNum = +layerInfo[layer].source; // convert to number

                    // if this feature is equal to layer source num
                    if (featureNum === layerNum) {
                        return feature; // return the feature
                    }
                },
                style: function (feature) { //and symbolized according to source where 'layer' in layerInfo is still passed as the argument
                    return {
                        color: layerInfo[layer].color,
                        fillColor: layerInfo[layer].color,
                        //  radius: getRadius(feature.properties.fuel_source[layerInfo[layer].source]) //radius is defined by power generation capacity contained in the 'source' property
                    }
                }
            }).addTo(map);

        }


        var snapLabels = {

            "<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
            "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
            "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
            "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer,
            "<b style='color:#3FFA5B'>Farm</b>": geoJsonLayers.farmLayer
        }
        var dtcLabels = {
            "<b style='color:#D3D3D3'>Value-Added</b>": geoJsonLayers.vaLayer,
            "<b style='color:#FAA23F'>Apiary, Orchard, Vineyard</b>": geoJsonLayers.miscLayer,
            "<b style='color:#ff0000'>Market</b>": geoJsonLayers.marketLayer,
            "<b style='color:#3FFA5B'>Distribution</b>": geoJsonLayers.distLayer
        }

        var infraLabels = {

            "<b style='color:#D3D3D3'>Greenhouse</b>": geoJsonLayers.greenLayer,
            "<b style='color:#FAA23F'>Auction, Stockyard</b>": geoJsonLayers.auctionLayer,
            "<b style='color:#ff0000'>Processing</b>": geoJsonLayers.processLayer,
            "<b style='color:#FAA23F'>Technical Assistance</b>": geoJsonLayers.techLayer
                /*"<b style='color:#ff0000'>Food Banks</b>": geoJsonLayers.banksLayer
        }



        if (asset === 'snap') {
            L.control.layers(null, snapLabels, { //adds a control toggle option in top right of the map
                collapsed: false
            }).addTo(map);
        } else if (asset === 'dtc') {
            L.control.layers(null, dtcLabels, { //adds a control toggle option in top right of the map
                collapsed: false
            }).addTo(map);
        } else if (asset === 'infrastructure') {
            L.control.layers(null, infraLabels, { //adds a control toggle option in top right of the map
                collapsed: false
            }).addTo(map);


        }
    } //*/


    function updateMap(dataLayer) {
        var breaks = getClassBreaks(dataLayer);

        dataLayer.eachLayer(function (layer) {

            var props = layer.feature.properties;

            layer.setStyle({
                fillColor: getColor(props['sales_07'], breaks)
            });
            //            updateLegend(breaks);
        });
    }

    function getClassBreaks(dataLayer) {

        // create empty Array for storing values
        var values = [];

        // loop through all the counties
        dataLayer.eachLayer(function (layer) {
            var value = layer.feature.properties['sales_07'];
            values.push(value); // push the normalized value for each layer into the Array
        });

        // determine similar clusters
        var clusters = ss.ckmeans(values, 5);

        // create an array of the lowest value within each cluster
        var breaks = clusters.map(function (cluster) {
            return [cluster[0], cluster.pop()];
        });

        //return array of arrays, e.g., [[0.24,0.25], [0.26, 0.37], etc]
        return breaks;
    }

    function getColor(d, breaks) {
        // function accepts a single normalized data attribute value
        // and uses a series of conditional statements to determine which
        // which color value to return to return to the function caller

        if (d <= breaks[0][1]) {
            return '#f1eef6';
        } else if (d <= breaks[1][1]) {
            return '#bdc9e1';
        } else if (d <= breaks[2][1]) {
            return '#74a9cf';
        } else if (d <= breaks[3][1]) {
            return '#2b8cbe'
        } else if (d <= breaks[4][1]) {
            return '#045a8d'
        }
    }


})();