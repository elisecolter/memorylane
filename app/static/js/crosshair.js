var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 15,
    }), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var lat = $('#lat').data();
var lon = $('#lon').data();


/* Create Map */
map = L.map("map", {
zoom: 15,
center: [lat.val, lon.val],
layers: [cartoLight, highlight],
zoomControl: false,
attributionControl: false,
scrollWheelZoom: 'center', // zoom to center regardless where mouse is
doubleClickZoom: 'center',
touchZoom:       'center'
});

//add zoom control with your options
L.control.zoom({
  position:'topright'
}).addTo(map);

L.Control.textbox = L.Control.extend({
  onAdd: function(map) {

  var url = $("#url").data().val;
  var text = L.DomUtil.create('div');
  text.id = "info-box";
  text.innerHTML = '<img src="' + url + '" class="photo-modal-image shadow-lg">'
  return text;
  },
  onRemove: function(map) {
            // Nothing to do here
  }
});

L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
L.control.textbox({ position: 'topleft' }).addTo(map);

/* Add submit button */
var submit = L.control({
  position:'bottomright'
});

submit.onAdd = function(map) {
  var div = L.DomUtil.create('div');
  div.id = 'submit';
  div.innerHTML = '<button type="submit" form="addLocation" class="btn btn-default justify-center">Submit</button>'
  return div;
}

submit.addTo(map);

var geotagPhotoCrosshair = L.geotagPhoto.crosshair({crosshairHTML: '<img src="/static/assets/crosshair.svg" width="100px" />'}).addTo(map)

$("#addLocation").submit( function (){
  var point = geotagPhotoCrosshair.getCrosshairPoint()
  $("#lat2").val(point.coordinates[1]);
  $("#lon2").val(point.coordinates[0]);
});

/* Search box */
var geocoder = L.Control.geocoder({
  defaultMarkGeocode: false
})
.on('markgeocode', function(e) {
  var bbox = e.geocode.bbox;
  var poly = L.polygon([
    bbox.getSouthEast(),
    bbox.getNorthEast(),
    bbox.getNorthWest(),
    bbox.getSouthWest()
  ]);
  map.fitBounds(poly.getBounds());
})
.addTo(map);