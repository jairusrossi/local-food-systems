(function () {

        /* L.mapbox.accessToken = 'pk.eyJ1IjoiamFyb3NpdHkiLCJhIjoiY2 oyamU1dTBtMDA1NjJ3cG03bHpydGk1ZiJ9.g4yDq4bRek4y16XvMMRE7w '; */

        var map = L.map('map', {
            zoomSnap: .1,
            center: [37.4, -83.4],
            zoom: 9,
            minZoom: 8,
            maxZoom: 11,
            maxBounds: L.latLngBounds([41, -85.75], [35.5, -81])
        });

        var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',

        });

        var options = {
            pointToLayer: function (feature, ll) { //change options to get points
                return L.circleMarker(ll, {
                    opacity: 1,
                    weight: 2,
                    fillOpacity: .3,
                });
            }
        };

        var commonStyles = {
            weight: 1,
            stroke: 1,
            fillOpacity: .5
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


        var geoJsonLayers = {};

        for (var layer in layerInfo) { //takes each layer on its own and cycles through the code

            geoJsonLayers[layer] = L.geoJson(stores, {

                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, commonStyles);
                },
                filter: function (feature) {

                    // create shortuts to numbers
                    var featureNum = feature.properties.source,
                        layerNum = +layerInfo[layer].source; // convert to number

                    // if this feature is equal to layer source num
                    if(featureNum === layerNum){
                        return feature;  // return the feature
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
            "<b style='color:#D3D3D3'>Chain Grocer</b>": geoJsonLayers.chainLayer,
            "<b style='color:#D3D3D3'>Superstore</b>": geoJsonLayers.superLayer,

        }

        L.control.layers(null, sourcesLabels, { //adds a control toggle option in top right of the map
            collapsed: false
        }).addTo(map);

    }




)();
