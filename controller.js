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
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
  }).addTo(map);
}

var from = [43.11667, 131.90000];
var to = [55.7522200, 37.6155600];

var arcs = []

function addArc(from, to, map) {
  var arc = L.Polyline.Arc(from, to);
  arcs.push(arc);
  arc.addTo(map);
}

addArc(from, to, map);

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
  this._div.innerHTML = '<h4>US Population Density</h4>' + (props ?
    '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>' :
    'Hover over a state');
};

info.addTo(map);


// get color depending on population density value
function getColor(d) {
  return d > 1000 ? '#800026' :
    d > 500 ? '#BD0026' :
    d > 200 ? '#E31A1C' :
    d > 100 ? '#FC4E2A' :
    d > 50 ? '#FD8D3C' :
    d > 20 ? '#FEB24C' :
    d > 10 ? '#FED976' :
    '#FFEDA0';
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.density)
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

geojson = L.geoJson(countriesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function(map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);


function getData() {
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
        var fromPlaceLocation = {
          lat: result.fromPlace.latitude,
          lng: result.fromPlace.longitude
        };

        var toPlaceLocation = {
          lat: result.toPlace.latitude,
          lng: result.toPlace.longitude
        };

        var marker = new google.maps.Marker({
          position: fromPlaceLocation,
          map: map
        });

        var route = [fromPlaceLocation, toPlaceLocation];

        map.setCenter(toPlaceLocation);

        var path = new google.maps.Polyline({
          path: route,
          strokeColor: "972BC1",
          strokeOpacity: 0.75,
          strokeWeight: 2,
          geodesic: true
        });

        path.setMap(map);
      })
    }
  });
}
