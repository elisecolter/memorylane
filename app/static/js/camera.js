/* Geographic calculations helper functions */
// Converts from degrees to radians.
function toRadians(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

function bearing(startLat, startLng, destLat, destLng){
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  y = Math.sin(destLng - startLng) * Math.cos(destLat);
  x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}

function pointFromAngle(latitude, longitude, bearing) {
    distance = 0.05;
    // distance in KM, bearing in degrees
    var R = 6378.1,                         // Radius of the Earth
        brng = toRadians(bearing)       // Convert bearing to radian
        lat = toRadians(latitude),       // Current coords to radians
        lon = toRadians(longitude);

    // Do the math magic
    lat = Math.asin(Math.sin(lat) * Math.cos(distance / R) + Math.cos(lat) * Math.sin(distance / R) * Math.cos(brng));
    lon += Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat), Math.cos(distance/R)-Math.sin(lat)*Math.sin(lat));

    latd = toDegrees(lat);
    lond = toDegrees(lon);

    return L.latLng(latd, lond);
}

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

/* Location and photo markers */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Icons */
var pinIcon = L.icon({
        iconUrl: "/static/assets/simple_pin.svg",
        iconSize: [30, 49],
        iconAnchor: [15, 40],
        popupAnchor: [45, 20]
});

var activeIcon = L.icon({
        iconUrl: "/static/assets/simple_pin_red.svg",
        iconSize: [30, 49],
        iconAnchor: [15, 40],
        popupAnchor: [45, 20]
});

/* Add locations */
$.getJSON("/locations/", function(data) {
  for (var i = 0; i < data.length; i++) {
    var location = data[i];
    var latlng = L.latLng(location.lat, location.lon);
    var name = location.name;
    var id = location.id;

    var marker = L.marker(latlng, {
      active: false,
      icon: pinIcon,
      id: id,
      title: location.name,
      riseOnHover: true
    })
    markerClusters.addLayer(marker);
  }  
});


map = L.map("map", {
zoom: 18,
center: [lat.val, lon.val],
layers: [cartoLight, highlight, markerClusters],
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

// var cameraPoint = [6.83442, 52.43369]
// var targetPoint = [6.83342, 52.43469]
console.log(lon);
console.log(lat);

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
      
          var text = L.DomUtil.create('div');
          text.id = "info-box";
          text.innerHTML = '<p class="instructions-title">Add Landmark</p>\
          <div class="crosshair-instructions">Drag the target over the landmark the photo was taken of, or click a pin to add the photo to an existing landmark. \
          Add the name of a new landmark (optional).</div>\
          <img src="' + url + '" class="tagging-photo-image">'
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
  div.innerHTML = '<input type="text" placeholder="Landmark Name" maxlength="40" id="loc_new_input"><br><br>\
                   <button type="submit" form="addTarget" class="btn submit-button btn-lg btn-default justify-center">Add Landmark</button>'
  return div;
}

submit.addTo(map);

/* Add add button */
var add = L.control({
  position:'bottomright'
});

add.onAdd = function(map) {
  var div = L.DomUtil.create('div');
  div.id = 'submit';
  if (targetName == "") {
    targetName = "Location";
  }
  div.innerHTML = '<button type="submit" form="addTarget" class="btn btn-default justify-center">Add to ' + targetName + '</button>'
  return div;
}

var geotagPhotoCamera = L.geotagPhoto.camera(points, {
  cameraIcon: L.icon({
    iconUrl: '/static/assets/camera.svg',
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  }),
  targetIcon: L.icon({
    iconUrl: '/static/assets/marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }),
  angleIcon: L.icon({
    iconUrl: '/static/assets/marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }),
  controlCameraImg: '/static/assets/camera-icon.svg',
  controlCrosshairImg: '/static/assets/crosshair-icon.svg',
  minAngle: 10,
  angleMarker: false
}).addTo(map)

var angle = $("#angle").data().val;
if (angle != -1) {
  target = pointFromAngle(lat.val, lon.val, angle);
  geotagPhotoCamera.setTargetLatLng(target);
}

var outputElement = document.getElementById('output')

var slider = document.getElementById('slider')
var angleText = document.getElementById('angle')

/* Location marker clusters highlight on mouseover */
markerClusters.on('mouseover', function (a) {
  console.log("mouseover on marker");
  var e = a.layer;
  e.setIcon(activeIcon);
});

markerClusters.on('mouseout', function(a) {
  var e = a.layer;
  if (!e.options.active) {
    e.setIcon(pinIcon);
  }
});


/* If you click a marker, set the geotag target there */
markerClusters.on('click', function (a) {
  var e = a.layer;
  geotagPhotoCamera.setTargetLatLng(e._latlng);
  targetName = e.options.title;
  e.setIcon(activeIcon)
  e.options.active = true;

  /* Change submit button to say "Add to location ______" */ 
  submit.remove();
  add.addTo(map);
  targetLocation = true;
  $("#loc_id").val(e.options.id);
});

$("#addTarget").submit( function (){
  var point = geotagPhotoCamera.getTargetPoint()
  console.log(point)
  console.log(point.coordinates[1]);
  var loc_new_input = $('#loc_new_input').val();
  $("#loc_new").val(loc_new_input);
  $("#lat2").val(point.coordinates[1]);
  $("#lon2").val(point.coordinates[0]);
});

geotagPhotoCamera.on('change', function (event) {
    console.log("changed from location");
    $("#loc_id").val("");
    targetLocation = false;
    targetName = "";
    add.remove();
    submit.addTo(map);

    markerClusters.eachLayer(function (layer){
      layer.options.active = false;
      layer.setIcon(pinIcon);
    });

  var point = geotagPhotoCamera.getTargetPoint()
  console.log(point)
  console.log(point.coordinates[1]);
  var loc_new_input = $('#loc_new_input').val();
  $("#loc_new").val(loc_new_input);
  $("#lat2").val(point.coordinates[1]);
  $("#lon2").val(point.coordinates[0]);
});

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

