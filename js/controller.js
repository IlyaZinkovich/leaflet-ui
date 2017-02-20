var map = L.map('map').setView([37.8, -96], 3);

var destination = 'France';

var info = getInfo(destination);
map.addControl(info);

map.addLayer(getCountriesLayer());

getData(destination);

function getData(destination) {
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8882/routes?country=' + destination,
    dataType: "json",
    xhrFields: {
      withCredentials: false
    },
    success: function(results) {
      var maxRoutesCount = 0;
      var routes = groupRoutesByCountry(results, destination);
      var countriesRoutes = JSON.parse(JSON.stringify(countriesData));
      countriesRoutes.features.forEach(function(countryData) {
        var name = countryData.properties.name;
        if (routes[name] === undefined) {
          countryData.properties.routes = [];
        } else {
          countryData.properties.routes = routes[name];
          if (routes[name].length > maxRoutesCount) {
            maxRoutesCount = routes[name].length;
          }
        }
      });

      if (geojson !== undefined) map.removeLayer(geojson);
      geojson = createGeoJson(countriesRoutes, maxRoutesCount, destination, info);
      map.addLayer(geojson);

      if (legend !== undefined) map.removeLayer(legend);
      legend = createLegend(maxRoutesCount);
      map.addControl(legend);
    }
  });
}

function groupRoutesByCountry(results, destination) {
  var routes = {};
  results.forEach(function(result) {
    var fromCountry = result.from.country;
    if (fromCountry === destination) return;
    if (routes[fromCountry] === undefined) {
      routes[fromCountry] = [];
    }
    routes[fromCountry].push(result);
  })
  return routes;
}

function getCountriesLayer() {
  var countriesLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaWx5YXppbmtvdmljaCIsImEiOiJjaXkwbDVyd3kwMDRyMnpuODkzbnBqdzNrIn0.BDlBOMJc3mcQeQR0XTB9rg', {
    maxZoom: 18,
    attribution: '',
    id: 'mapbox.light'
  });
  return countriesLayer;
}
