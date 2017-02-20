var GRAPHITE = '#464547';
var DARK_BLUE = '#1A9CB0';
var PLUM = '#8E244D';
var MEDIUM_GRAY = '#666666';
var WHITE = '#FFFFFF';
var SHARP_BLUE = '#39C2D7';

var getChosenCountryStyle = function() {
  return {
    weight: 2,
    opacity: 1,
    color: GRAPHITE,
    fillOpacity: 0.8,
    fillColor: DARK_BLUE
  }
}

var getOrdinaryCountryStyle = function(value, opacity) {
  return {
    weight: 2,
    opacity: 1,
    color: WHITE,
    dashArray: '3',
    fillOpacity: value > 0 ? opacity : 0.8,
    fillColor: value > 0 ? PLUM : MEDIUM_GRAY
  }
}

var getHighlightedCountryStyle = function() {
  return {
    weight: 2,
    color: GRAPHITE,
    dashArray: '',
    fillOpacity: 0.7,
    fillColor: SHARP_BLUE
  }
}
