var getInfo = function(destination) {
  var instance = L.control();

  instance.destination = destination;

  instance.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  instance.update = function(props) {
    if (props === undefined) {
      this._div.innerHTML = '<h4>Hover over a country</h4>';
    } else if (props.name === instance.destination) {
      this._div.innerHTML = '<h4>Destination</h4>';
    } else {
      this._div.innerHTML = '<h4>Travellers count</h4>' +
        '<b>' + props.name + '</b><br />' + props.routes.length + ' people';
    }
  };

  instance.updateDestination = function(destination) {
    instance.destination = destination;
    instance.update();
  }

  return instance;
}
