(function () {

    d3.queue().defer(d3.json, "data/snap.json")
        .defer(d3.json, "https://jairusrossi.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM local_food_counties WHERE state='21'")
        .defer(d3.json, 'data/infrastructure.json')
        .await(makeMap)



    function makeMap(error, asset, counties) {


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
            radius: 8
        }

        var layerInfo = {
            igaLayer: {
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

        var sourcesLabels = {
            "<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
            "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
            "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
            "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer
        }

        L.control.layers(null, sourcesLabels, { //adds a control toggle option in top right of the map
            collapsed: false
        }).addTo(map);

        updateMap(dataLayer);
        addUI(geoJsonLayers);
        //        drawLegend(dataLayer);


    }
    // end makeMap

    function addUI(asset) {
        $('select[name="asset"]').change(function () {
            asset = $(this).val();
            updatePoints(asset); //c
        });
    }

    function updatePoints(asset) {

        var layerInfo = {
            igaLayer: {
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
            }

            //need to write layer definitions for all the other asset classes - and then recode the GEOJSONs to have different numbers.  
        };

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

        var sourcesLabels = {
            "<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
            "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
            "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
            "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer
        }

        L.control.layers(null, sourcesLabels, { //adds a control toggle option in top right of the map
            collapsed: false
        }).addTo(map);
    }


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