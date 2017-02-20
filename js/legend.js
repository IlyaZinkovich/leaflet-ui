var legend = L.control({
  position: 'bottomright'
});

function calculateLegendGrades(maxRoutesCount) {
  var grades = [];
  for (var i = 0; i < 8; i++) {
    grades.push(parseInt((maxRoutesCount / 8) * i, 10));
  }
  return grades;
}

function calculateLegendLabels(grades, maxRoutesCount) {
  var labels = [];
  for (var i = 0; i < grades.length; i++) {
    var from = grades[i];
    var to = grades[i + 1];
    labels.push(
      '<i style="background:' + '#8E244D;' + 'opacity:' + (from / maxRoutesCount) * 0.8 + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }
  return labels;
}

function createLegend(maxRoutesCount) {
  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = calculateLegendGrades(maxRoutesCount);
    var labels = calculateLegendLabels(grades, maxRoutesCount);
    div.innerHTML = labels.join('<br>');
    return div;
  };
  return legend;
}
