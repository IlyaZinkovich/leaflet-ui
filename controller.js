var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
$(".slider")
  .slider({
    range: true,
    min: 0,
    max: months.length - 1,
    value: new Date().getMonth()
  })
  .slider("pips", {
    rest: "label",
    labels: months
  })
  .on("slidechange", function(e, ui) {
    console.log(months[ui.values[0]] + "-" + months[ui.values[1]]);
  });

var map = L.map('map').setView([37.8, -96], 4);

addCountryNames(map);

function addCountryNames(map) {
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: '',
    id: 'mapbox.light'
  }).addTo(map);
}

var markers = [];

function addMarker(location, map) {
  var marker = L.marker(location);
  markers.push(marker);
  marker.addTo(map);
}

var arcs = [];

function addArc(from, to, weight, map) {
  var arc = L.Polyline.Arc(from, to, {
    color: '#8E244D',
    weight: weight
  });
  arcs.push(arc);
  map.addLayer(arc);
}

function removeArcs(arcs, map) {
  arcs.forEach(function(arc) {
    map.removeLayer(arc);
  })
  arcs = [];
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
      color: 'white',
      dashArray: '3',
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
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
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
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

getData();

var routes = {};
var maxRoutesCount = 0;

function getData() {
  var city = 'Paris';
  var country = 'France';
  var startDate = '2016-01-01';
  var endDate = '2016-01-31';
  $.ajax({
    type: 'GET',
    url: 'http://localhost:8881/routes?city=' + city + '&country=' + country +
      '&startDate=' + startDate + '&endDate=' + endDate,
    dataType: "json",
    xhrFields: {
      withCredentials: false
    },
    success: function(results) {
      results.forEach(function(result) {
        var fromCountry = result.fromPlace.country;
        if (fromCountry === country) return;

        if (routes[fromCountry] === undefined) {
          routes[fromCountry] = [];
        }
        routes[fromCountry].push(result);
      })
      countriesData.features.forEach(function(countryData) {
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
      for (var countryName in routes) {
        routes[countryName].forEach(function(route) {
          var from = [route.fromPlace.latitude, route.fromPlace.longitude];
          var to = [route.toPlace.latitude, route.toPlace.longitude];
          if (from[0] == null || from[1] == null || to[0] == null || to[1] == null)
            return;
          addMarker(from, map);
        });
        // addArc(from, to, (routes[countryName].length / maxRoutesCount) * 3, map);
      }
      countriesData.features.forEach(function(countryData) {
        console.log(countryData.properties.name + ' - ' + countryData.properties.routes.length);
      });
      console.log(maxRoutesCount);
      geojson = L.geoJson(countriesData, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(map);


      var legend = L.control({
        position: 'bottomright'
      });

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
