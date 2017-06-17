(function () {

    // create Leaflet map and request tiles first (so page load shows something if data takes a while)
    var map = L.map('map', {
        zoomSnap: .1,
        center: [
            37.4, -83.4
        ],
        zoom: 8,
        minZoom: 8,
        maxZoom: 11,
        maxBounds: L.latLngBounds([
            42, -88
        ], [33, -81])
    });

    var tiles = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    }).addTo(map);



    var commonStyles = {
        weight: 1,
        stroke: 1,
        fillOpacity: .8,
        radius: 6
    }

    d3.queue().defer(d3.json, "data/snap.json")
        // .defer(d3.json, "data/local_counites.json") // local copy in case CARTO's server is quirky
        .defer(d3.json, "https://jairusrossi.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM local_food_counties WHERE state='21'")
        .defer(d3.json, 'data/infrastructure.json')
        .defer(d3.json, 'data/dtc.geojson')
        .defer(d3.json, 'data/layer_info.json')
        .await(makeMap)

    function makeMap(error, snapData, counties, infrastructureData, dtcData, layerInfo) {

        // create the choropleth and assign to reference
        var choroLayer = makeChoropleth(counties);

        // add it to the map
        choroLayer.addTo(map);

        // update the map with first attribute
        updateChoropleth(choroLayer, 'sales_07');

        // create empty layer group for holding the three dot layergroups
        var dotLayers = L.layerGroup().addTo(map);

        // create snapLayer and assign to reference
        var snapLayer = makeDotMap(snapData, layerInfo);

        // // add snapLayer to dotLayers
        snapLayer.addTo(dotLayers);

        // create your other two layers
        var infrastructureLayer = makeDotMap(infrastructureData, layerInfo);
        var dtcLayer = makeDotMap(dtcData, layerInfo);

        // send these layers into the UI for switching on and off
        createDotLayerUI(dotLayers, snapLayer, infrastructureLayer, dtcLayer);
        retrieveInfo(snapLayer, infrastructureLayer, dtcLayer);
        //        drawLegend();
    }

    function makeChoropleth(counties) {

        var dataLayer = L.geoJson(counties, {
            style: function (feature) {

                return {
                    color: '#dddddd',
                    weight: 2,
                    fillOpacity: .7,
                    fillColor: '#1f78b4'
                };

            }
        });

        return dataLayer;
    }

    function updateChoropleth(dataLayer, attr) {

        var breaks = getClassBreaks(dataLayer);

        dataLayer.eachLayer(function (layer) {

            var props = layer.feature.properties;

            layer.setStyle({
                fillColor: getColor(props[attr], breaks)
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

    function makeDotMap(data, layerInfo) {

        var layerGroup = L.layerGroup(); // add empty layergroup to map

        for (var layer in layerInfo) { //takes each layer on its own and cycles through the code

            L.geoJson(data, {

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

                    }
                }
            }).addTo(layerGroup);
        }

        return layerGroup;

    }

    function createDotLayerUI(dotLayers, snapLayer, infrastructureLayer, dtcLayer) {

        // first get the UI elements and add it to the map
        var dotLayerDropdown = L.control({
            position: 'topright'
        });

        dotLayerDropdown.onAdd = function (map) {

            var element = L.DomUtil.get("ui-controls");

            L.DomEvent.disableScrollPropagation(element);

            L.DomEvent.disableClickPropagation(element);

            return element;
        }

        dotLayerDropdown.addTo(map);

        // map values from UI elements to Leaflet layerGroups
        var layerKey = {
            "snap": snapLayer,
            "infrastructure": infrastructureLayer,
            "dtc": dtcLayer
        }

        $('select[name]').change(function () {

            // the value from the selected UI option
            var targetLayer = $(this).val();

            // loop through layers and remove all (i.e., the current one)
            dotLayers.eachLayer(function (layer) {
                dotLayers.removeLayer(layer);
            })

            // add the selected layergroup to dotLayers
            dotLayers.addLayer(layerKey[targetLayer]);

        });
    }

    function retrieveInfo(snapLayer, infrastructureLayer, dtcLayer) {
        var info = $('#info');


        snapLayer.eachLayer(function (layer) {

            layer.on('mouseover', function (e) {
                var props = e.layer.feature.properties;
                info.removeClass('none').show();
                $(".Name span").html('(Store Name ' + props["Store_Name"] + ')');
                $(".Business span").html('(Store Type ' + props["category"] + ')');

            });
            layer.on('mouseout', function(){
                info.hide();
            });

        });

        infrastructureLayer.eachLayer(function (layer) {
            layer.on('mouseover', function (e) {
                var props = e.layer.feature.properties;
                info.removeClass('none').show();
                $(".Name span").html('(Name ' + props["Name"] + ')');
                $(".Business span").html('(Resource Type ' + props["Resource"] + ')');
            });

            layer.on('mouseout', function(){
                info.hide();
            });

        });

        dtcLayer.eachLayer(function (layer) {
            layer.on('mouseover', function (e) {
                var props = e.layer.feature.properties;
                info.removeClass('none').show();
                $(".Name span").html('(Name ' + props["Name"] + ')');
                $(".Business span").html('(Resource Type ' + props["Resource"] + ')');

            });

            layer.on('mouseout', function(){
                info.hide();
            });

        });


        $(document).mousemove(function (e) {

            // first offset from the mouse position of the info window
            info.css({
                "left": e.pageX + 6,
                "top": e.pageY - 25
            });


        });

    }


    /*function drawLegend() {

        // create a new Leaflet control object, and position it top left
        var legendControl = L.control({
            position: 'topleft'
        });

        // when the legend is added to the map
        legendControl.onAdd = function (map) {

            // create a div element with an class attribute of legend
            var div = L.DomUtil.create('div', 'legend');

            // return the div to the method
            return div;

        };
        
        var legend = $('.legend').html("<h3>" + labels[attributeValue] + "</h3>")

        // add the empty legend div to the map
        legendControl.addTo(map);

    }*/

    /*

        // snapLabels = {

        /*    "<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
            "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
            "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
            "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer

        }*/
    //       dtcLabels = {
    //           "<b style='color:#3FFA5B'>Farm</b>": geoJsonLayers.farmLayer,
    //           "<b style='color:#D3D3D3'>Value-Added</b>": geoJsonLayers.vaLayer,
    //           "<b style='color:#FAA23F'>Apiary, Orchard, Vineyard</b>": geoJsonLayers.miscLayer,
    //           "<b style='color:#ff0000'>Market</b>": geoJsonLayers.marketLayer,
    //
    //       }
    //
    //       infraLabels = {
    //           "<b style='color:#3FFA5B'>Distribution</b>": geoJsonLayers.distLayer,
    //           "<b style='color:#D3D3D3'>Greenhouse</b>": geoJsonLayers.greenLayer,
    //           "<b style='color:#FAA23F'>Auction, Stockyard</b>": geoJsonLayers.auctionLayer,
    //           "<b style='color:#ff0000'>Processing</b>": geoJsonLayers.processLayer,
    //           "<b style='color:#FAA23F'>Technical Assistance</b>": geoJsonLayers.techLayer
    //               /*"<b style='color:#ff0000'>Food Banks</b>": geoJsonLayers.banksLayer */
    //       }
    //
    //
    //       /*"<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
    //       "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
    //       "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
    //       "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer
    //           "<b style='color:#3FFA5B'>Farm</b>": geoJsonLayers.farmLayer,
    //           "<b style='color:#D3D3D3'>Value-Added</b>": geoJsonLayers.vaLayer,
    //           "<b style='color:#FAA23F'>Apiary, Orchard, Vineyard</b>": geoJsonLayers.miscLayer,
    //           "<b style='color:#ff0000'>Market</b>": geoJsonLayers.marketLayer,
    //           "<b style='color:#3FFA5B'>Distribution</b>": geoJsonLayers.distLayer,
    //           "<b style='color:#D3D3D3'>Greenhouse</b>": geoJsonLayers.greenLayer,
    //           "<b style='color:#FAA23F'>Auction, Stockyard</b>": geoJsonLayers.auctionLayer,
    //           "<b style='color:#ff0000'>Processing</b>": geoJsonLayers.processLayer,
    //           "<b style='color:#FAA23F'>Technical Assistance</b>": geoJsonLayers.techLayer,
    //           "<b style='color:#ff0000'>Food Banks</b>": geoJsonLayers.banksLayer*/
    //
    //
    //
    //       var snapLayerControl = L.control.layers(null, snapLabels, { //adds a control toggle option in top right of the map
    //           collapsed: false
    //       }).addTo(map);
    //
    //       var infraLayerControl = L.control.layers(null, infraLabels, { //adds a control toggle option in top right of the map
    //           collapsed: false
    //       }).addTo(map);
    //
    //       var dtcLayerControl = L.control.layers(null, dtcLabels, { //adds a control toggle option in top right of the map
    //           collapsed: false
    //       }).addTo(map);
    //
    //
    //       /*  var infrastructureLayer = L.geoJson(infrastructureData, options);
    //
    //
    //
    // var dtcLayer = L.geoJson(dtcData, options);*/
    //
    //
    //
    //
    //       addUI(map, snapLayer, infrastructureLayer, dtcLayer);

    // }

    // end makeMap

    // function updatePoints(asset) {
    //
    //
    //
    //     var snapLabels = {
    //
    //         "<b style='color:#3FFA5B'>IGA</b>": geoJsonLayers.igaLayer,
    //         "<b style='color:#D3D3D3'>Independent Grocer</b>": geoJsonLayers.indepLayer,
    //         "<b style='color:#FAA23F'>Chain Grocer</b>": geoJsonLayers.chainLayer,
    //         "<b style='color:#ff0000'>Superstore</b>": geoJsonLayers.superLayer,
    //         "<b style='color:#3FFA5B'>Farm</b>": geoJsonLayers.farmLayer
    //     }
    //     var dtcLabels = {
    //         "<b style='color:#D3D3D3'>Value-Added</b>": geoJsonLayers.vaLayer,
    //         "<b style='color:#FAA23F'>Apiary, Orchard, Vineyard</b>": geoJsonLayers.miscLayer,
    //         "<b style='color:#ff0000'>Market</b>": geoJsonLayers.marketLayer,
    //         "<b style='color:#3FFA5B'>Distribution</b>": geoJsonLayers.distLayer
    //     }
    //
    //     var infraLabels = {
    //
    //         "<b style='color:#D3D3D3'>Greenhouse</b>": geoJsonLayers.greenLayer,
    //         "<b style='color:#FAA23F'>Auction, Stockyard</b>": geoJsonLayers.auctionLayer,
    //         "<b style='color:#ff0000'>Processing</b>": geoJsonLayers.processLayer,
    //         "<b style='color:#FAA23F'>Technical Assistance</b>": geoJsonLayers.techLayer
    //             /*"<b style='color:#ff0000'>Food Banks</b>": geoJsonLayers.banksLayer
    //     }
    //
    //
    // }


})();