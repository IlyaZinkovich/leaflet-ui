var geojson;

function createGeoJson(countriesRoutes, maxRoutesCount, chosenCountry, info) {
  var geojson = L.geoJson(countriesRoutes, {
    style: style,
    onEachFeature: onEachFeature
  });

  function style(feature) {
    var value = feature.properties.routes.length;
    var opacity = (value / maxRoutesCount) * 0.8;
    return feature.properties.name === chosenCountry ?
      getChosenCountryStyle() : getOrdinaryCountryStyle(value, opacity);
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(getHighlightedCountryStyle());
    info.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    chosenCountry = e.target.feature.properties.name;
    info.updateDestination(chosenCountry);
    getData(chosenCountry);
  }

  return geojson;
}
