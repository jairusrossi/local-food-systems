(function () {

        L.mapbox.accessToken = 'pk.eyJ1IjoiamFyb3NpdHkiLCJhIjoiY2oyamU1dTBtMDA1NjJ3cG03bHpydGk1ZiJ9.g4yDq4bRek4y16XvMMRE7w';
        var map = L.mapbox.map('map', 'mapbox.light', {
            zoomSnap: .1,
            center: [37.4, -83.4],
            zoom: 9,
            minZoom: 8,
            maxZoom: 11,
            maxBounds: L.latLngBounds([41, -85.75], [35.5, -81]) //
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
                type: "IGA",
                color: '#3FFA5B'
            },
            indepLayer: {
                type: "Independent",
                color: '#D3D3D3'
            },
            chainLayer: {
                type: "Chain",
                color: '#FAA23F'
            },
            superLayer: {
                type: "Superstore",
                color: '#ff0000'
            }
        };


        omnivore.csv('data/snap_retailers.csv')
            .on('ready', function (e) {
                drawMap(e.target.toGeoJSON());
            })
            .on('error', function (e) {
                console.log(e.error[0].message);
            });

        function drawMap(data) {
            var geoJsonLayers = {};

            for (var layer in layerInfo) { //takes each layer on its own and cycles through the code
                geoJsonLayers[layer] = L.geoJson(data, { //geoJsonlayer is defiend through a fucntion where plants are passed as an arguement
                    pointToLayer: function (feature, latlng) { // then turned into a point
                        return L.circleMarker(latlng, commonStyles); //returned as a marker with styles specified above
                    },
                   /* filter: function (feature) { //then filtered by source
     if (feature.properties.Type[layerInfo[layer].Type]) {
         return feature;
     }
 },*/
                    style: function (feature) { //and symbolized according to source where 'layer' in layerInfo is still passed as the argument
                        return {
                            color: layerInfo[layer].color,
                            fillColor: layerInfo[layer].color,
                            //  radius: getRadius(feature.properties.fuel_source[layerInfo[layer].source]) //radius is defined by power generation capacity contained in the 'source' property
                        }
                    }
                }).addTo(map);
            }
        }


    }

)();