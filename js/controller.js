var map = L.map('map').setView([37.8, -96], 3);

var chosenCountry = 'France';

var info = getInfo(chosenCountry);
map.addControl(info);

map.addLayer(getCountriesLayer());

getData(chosenCountry);

function getData(chosenCountry) {
  var maxRoutesCount = 0;
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8882/routes?country=' + chosenCountry,
    dataType: "json",
    xhrFields: {
      withCredentials: false
    },
    success: function(results) {
      var routes = {};
      results.forEach(function(result) {
        var fromCountry = result.from.country;
        if (fromCountry === chosenCountry) return;

        if (routes[fromCountry] === undefined) {
          routes[fromCountry] = [];
        }
        routes[fromCountry].push(result);
      })
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
      geojson = createGeoJson(countriesRoutes, maxRoutesCount, chosenCountry, info);
      map.addLayer(geojson);

      if (legend !== undefined) map.removeLayer(legend);
      legend = createLegend(maxRoutesCount);
      map.addControl(legend);
    }
  });
}


function getCountriesLayer() {
  var countriesLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaWx5YXppbmtvdmljaCIsImEiOiJjaXkwbDVyd3kwMDRyMnpuODkzbnBqdzNrIn0.BDlBOMJc3mcQeQR0XTB9rg', {
    maxZoom: 18,
    attribution: '',
    id: 'mapbox.light'
  });
  return countriesLayer;
}
