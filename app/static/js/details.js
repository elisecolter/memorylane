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

map = L.map("map", {
zoom: 18,
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


var cameraPoint = [lon.val, lat.val]
var targetPoint = [lon.val - 0.001, lat.val + 0.001]

var points = {
  type: 'Feature',
  properties: {
    angle: 20
  },
  geometry: {
    type: 'GeometryCollection',
    geometries: [
      {
        type: 'Point',
        coordinates: cameraPoint
      },
      {
        type: 'Point',
        coordinates: targetPoint
      }
    ]
  }
}

var targetLocation = false;
var targetName = "";


L.Control.textbox = L.Control.extend({
          onAdd: function(map) {
          var url = $("#url").data().val;

          var date = $('#date_input').data().val;
      
          var text = L.DomUtil.create('div', 'details');
          text.id = "info-box";
          text.innerHTML = '<p class="instructions-title">Add Details</p>\
          <div class="crosshair-instructions">Add a title for the photo and confirm or estimate when it was taken.\
          <br><br>\
          <input type="text" placeholder="Title" maxlength="50" style="width:80%;" name="title_val" id="title_val"><br><br>\
          <input type="date" name="date_val" id="date_val" value="' + date + '" min="1800-01-01" max="2021-07-01">\
          <button type="submit" form="addDetails" class="btn submit-button btn-default">Submit</button>\
          </div>\
          <img src="' + url + '" class="tagging-photo-image">'
          return text;
          },

          onRemove: function(map) {
            // Nothing to do here
          }
      });
L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
L.control.textbox({ position: 'topleft' }).addTo(map);


$("#addDetails").submit( function (){
  var date_val = $('#date_val').val();
  var title_val = $('#title_val').val();
  $("#date").val(date_val);
  $("#title").val(title_val);
});

