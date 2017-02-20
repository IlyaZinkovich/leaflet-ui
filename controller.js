var map = L.map('map').setView([37.8, -96], 3);

addCountryNames(map);

function addCountryNames(map) {
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaWx5YXppbmtvdmljaCIsImEiOiJjaXkwbDVyd3kwMDRyMnpuODkzbnBqdzNrIn0.BDlBOMJc3mcQeQR0XTB9rg', {
    maxZoom: 18,
    attribution: '',
    id: 'mapbox.light'
  }).addTo(map);
}

var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function(props) {
  if (props === undefined) {
    this._div.innerHTML = '<h4>Hover over a country</h4>';
  } else if (props.name === chosenCountry) {
    this._div.innerHTML = '<h4>Destination</h4>';
  } else {
    this._div.innerHTML = '<h4>Travellers count</h4>' +
      '<b>' + props.name + '</b><br />' + props.routes.length + ' people';
  }
};

info.addTo(map);

var chosenCountry = 'France';

function style(feature) {
  var value = feature.properties.routes.length;
  var opacity = (value / maxRoutesCount) * 0.8;

  if (feature.properties.name === chosenCountry) {
    return {
      weight: 2,
      opacity: 1,
      color: '#464547',
      fillOpacity: 0.8,
      fillColor: '#1A9CB0'
    }
  }

  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: value > 0 ? opacity : 0.8,
    fillColor: value > 0 ? '#8E244D' : '#707070'
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: '#464547',
    dashArray: '',
    fillOpacity: 0.7,
    fillColor: '#39C2D7'
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
  chosenCountry = e.target.feature.properties.name;
  getData(chosenCountry);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

getData(chosenCountry);

var legend = L.control({
  position: 'bottomright'
});
var routes = {};
var maxRoutesCount = 0;

function getData(chosenCountry) {
  routes = {};
  maxRoutesCount = 0;
  if (legend !== undefined) map.removeLayer(legend);
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8882/routes?country=' + chosenCountry,
    dataType: "json",
    xhrFields: {
      withCredentials: false
    },
    success: function(results) {
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
      geojson = L.geoJson(countriesRoutes, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(map);

      legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
          labels = [],
          from, to;
        var grades = [];
        for (var i = 0; i < 8; i++) {
          grades.push(parseInt((maxRoutesCount / 8) * i, 10));
        }

        for (var i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];

          labels.push(
            '<i style="background:' + '#8E244D;' + 'opacity:' + (from / maxRoutesCount) * 0.8 + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
      };

      legend.addTo(map);
    }
  });
}
