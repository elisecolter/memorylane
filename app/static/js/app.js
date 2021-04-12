var map, featureList, boroughSearch = [], theaterSearch = [], museumSearch = [];

$(document).on('change','.up', function() {
        var names = [];
        var length = $(this).get(0).files.length;
        if (length > 1){
          $("#collection_name").removeAttr("hidden");
          $("#collection_info").removeAttr("hidden");
        }
        else {
          $("#collection_name").attr("hidden", true);
          $("#collection_info").attr("hidden", true);
        }
          for (var i = 0; i < $(this).get(0).files.length; ++i) {
              names.push($(this).get(0).files[i].name);
          }
          // $("input[name=file]").val(names);
        if(length>2){
          var fileName = names.join(', ');
          $(this).closest('.form-group').find('.form-control').attr("value",length+" files selected");
        }
        else{
          $(this).closest('.form-group').find('.form-control').attr("value",names);
        }
     });

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

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

var detected_landmark = $("#landmark_name").data().val;
var searched_landmark = $('#landmark').data().val
if (detected_landmark != "") {
  var landmark_lat = $("#landmark_lat").data().val;
  var landmark_lon = $("#landmark_lon").data().val;
  var confidence = $("#confidence").data().val;
  $("#foundLandmarkModal").modal("show");
  $('#foundLandmarkTitle').append('Landmark Identified')
  $('#foundLandmarkModalBody').append('<p> Landmark: ' + detected_landmark + ' </p>');
  $('#foundLandmarkModalBody').append('<p> Latitude: ' + landmark_lat + ' </p>');
  $('#foundLandmarkModalBody').append('<p> Longitude: ' + landmark_lon + ' </p>');
  $('#foundLandmarkModalBody').append('<p> Confidence: ' + confidence + ' </p>');
  $(".navbar-collapse.in").collapse("hide");
}
else if (searched_landmark != "") {
  $('#foundLandmarkTitle').append('No Landmarks Detected')
  $("#foundLandmarkModal").modal("show");
  $('#foundLandmarkModalBody').append('Google Cloud Vision did not identify any landmarks with significant confidence.');
  $(".navbar-collapse.in").collapse("hide");
} 

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#upload-btn").click(function() {
  $("#uploadModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#landmark-btn").click(function() {
  $("#landmarkModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(boroughs.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar").hide();

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
// var cartoLight = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//   maxZoom: 19,
//   attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
// });
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

// /* Icons */
// var inactiveIcon = L.icon({
//         iconUrl: "/static/assets/marker-icon-grey.png",
//         iconSize: [16, 25],
//         iconAnchor: [8, 25],
//         popupAnchor: [40, 25]
// });

// var activeIcon = L.icon({
//         iconUrl: "/static/assets/marker-icon-red.png",
//         iconSize: [16, 25],
//         iconAnchor: [8, 25],
//         popupAnchor: [40, 25]
// });

/* Icons */
var inactiveIcon = L.icon({
        iconUrl: "/static/assets/simple_pin.svg",
        iconSize: [30, 49],
        iconAnchor: [15, 40],
        popupAnchor: [0, -5]
});

var activeIcon = L.icon({
        iconUrl: "/static/assets/simple_pin_red.svg",
        iconSize: [30, 49],
        iconAnchor: [15, 40],
        popupAnchor: [0, -5]
});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

/* Location and photo markers */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Functions to sort photos */
/* Angle between the center and a photo. Puts them on a circle from 0-360.
   Clockwise (left) is decreasing angle.
   Counterclockwise (right) is increasing angle */
function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180/pi);
}

Math.getDistance = function( x1, y1, x2, y2 ) { 
  var xs = x2 - x1,
  ys = y2 - y1;   
  xs *= xs;
  ys *= ys;
  return Math.sqrt( xs + ys );
};

function getAngle(center_lon, center_lat, lon, lat) {
  var pi = Math.PI;
  var radius = Math.getDistance(center_lon, center_lat, lon, lat);
  var angleDeg = (radians_to_degrees(Math.atan2(center_lat - lat, center_lon - lon )) + 360.0) % 360.0;
  return angleDeg;
}

function sortByAngle(photos) {
  photos.sort((a, b) => (a.angle < b.angle) ? 1 : -1);
}

function sortByDate(photos) {
  photos.sort((a, b) => (a.taken > b.taken) ? 1 : -1);
}

$.getJSON("/photos/", function(data) {
  for (var i = 0; i < data.length; i++) {
    console.log(i)
    var location = data[i];
    var latlng = L.latLng(location.lat, location.lon);
    var photos = location.photos;

    // Initially sorted by angle
    var photosSorted = []
    for (var j = 0; j < photos.length; j++) {
      var photo = photos[j];
      var lat = photo.lat;
      var lon = photo.lng;
      var url = photo.url;
      var title = photo.title;
      var taken = photo.taken;
      var azimuth = bearing(lat, lon, location.lat, location.lon);
      var angle = getAngle(location.lon, location.lat, lon, lat);

      var photo = {lat: lat, lon: lon, url: url, angle: angle, bearing:azimuth, thumbnail:url, taken:taken, title:title}
      photosSorted.push(photo);
    }
    sortByAngle(photosSorted);

    // Create a layer of the photos attached to that marker
    var markerPhotos = L.photo.cluster({maxClusterRadius: 2}).add(photosSorted);
    var markerLines = new L.MarkerClusterGroup();

    // Include lines
    var latlngs = [];
    for (var j = 0; j < photos.length; j++) {
      latlngs.push([[photos[j].lat, photos[j].lng], [location.lat, location.lon]]);
    }
    var polyline = L.polyline(latlngs, {color: 'grey', dashArray: 5}).addTo(markerLines);

    var marker = L.marker(latlng, {
      active: false,
      icon: inactiveIcon,
      title: location.name,
      photos: photosSorted,
      markerPhotos: markerPhotos,
      markerLines: markerLines,
      riseOnHover: true
    })
    markerClusters.addLayer(marker);
  } 
  console.log("done");   
});

var photoLayer = L.photo.cluster({maxClusterRadius: 2});
var activeMarker;

/* Deactivate and activate location & photo markers */
function deactivateMarker(e) {
  var photoLayer = e.options.markerPhotos;
  var lineLayer = e.options.markerLines;
  e.options.active = false;

  e.setIcon(inactiveIcon);
  e.closePopup();
  
  map.removeLayer(photoLayer);
  map.removeLayer(lineLayer);
}

function formatPhotoTitle(title, taken) {
  if (taken == null) {
    taken = "Unknown Date"
  }
  if (title == "" || title == null) {
    return taken;
  }
  else return (title + ", " + taken)
}

function activateMarker(e) {
  e.options.active = true;
  e.setIcon(activeIcon);
  activeMarker = e;
  var photoLayer = e.options.markerPhotos.addTo(map);
  var lineLayer = e.options.markerLines.addTo(map);

  // On clicking a photo, scoot to the right to give room to modal
  // Recenter marker at 75% of the way to the right
  bounds = map.getBounds();
  x = e._latlng.lat;
  y = e._latlng.lng;
  left_y = bounds._southWest.lng;
  center_y= y - ((y - left_y)/2);
  center = L.latLng(x, center_y);

  // On clicking a photo, pop up the photo modal
  photoLayer.on('click', function (a) {
    map.flyTo(center, 19, {duration:0.5});
    var modal = $('#photoModal'), modalImg = $('#photoModal .photo-modal-image');
    modalImg.attr('src', a.layer.photo.url);

    var title = a.layer.photo.title;
    var taken = a.layer.photo.taken;
    var formatTitle = formatPhotoTitle(title, taken);

    $('#photoTitle').empty();
    $('<p>' + formatTitle +'</p>').appendTo('#photoTitle');
    displayedPhoto = a.layer.photo;
    $("#photoModal").modal("show");
  });
}

/* Open google streetview */
$("#streetview").on('click', function (a) {
  bearing = displayedPhoto.bearing;
  coords = displayedPhoto.lat + ',' + displayedPhoto.lon;
  url_begin = 'https:maps.google.com/maps?q=&layer=c&cbll='
  url_mid = '&cbp=0,'
  url_end = ',0,0,0'
  streetview_url = url_begin + coords + url_mid + bearing + url_end;

  console.log(streetview_url);
  window.open(streetview_url, "_blank");
});

$("#photoLeft").on('click', function (a) {
  photos = activeMarker.options.photos;

  if (displayedPhoto.url == photos[0].url) {
    displayedPhoto = photos[photos.length - 1];
  }
  else {
    for (var i = photos.length - 1; i > 0; i--) {
      if (displayedPhoto.url == photos[i].url) {
        displayedPhoto = photos[i-1];
        break;
      }
    }
  }
  var modal = $('#photoModal'), modalImg = $('#photoModal .photo-modal-image');
  modalImg.attr('src', displayedPhoto.url);

  var title = displayedPhoto.title;
  var taken = displayedPhoto.taken;
  var formatTitle = formatPhotoTitle(title, taken);

  $('#photoTitle').empty();
  $('<p>' + formatTitle +'</p>').appendTo('#photoTitle');
  $("#photoModal").modal("show");
});

$("#photoRight").on('click', function (a) {
  photos = activeMarker.options.photos;

  if (displayedPhoto.url == photos[photos.length - 1].url) {
    displayedPhoto = photos[0];
  }
  else {
    for (var i = 0; i < photos.length - 1; i++) {
      if (displayedPhoto.url == photos[i].url) {
        displayedPhoto = photos[i+1];
        break;
      }
    }
  }
  var title = displayedPhoto.title;
  var taken = displayedPhoto.taken;
  var formatTitle = formatPhotoTitle(title, taken);

  $('#photoTitle').empty();
  $('<p>' + formatTitle +'</p>').appendTo('#photoTitle');
  var modal = $('#photoModal'), modalImg = $('#photoModal .photo-modal-image');
  modalImg.attr('src', displayedPhoto.url);
  $("#photoModal").modal("show");
});
// photoLayer.on('click', function (a) {
//   var e = a.layer;
//   var photoOptions = {
//     'className': 'photoPopup',
//   }
//   popupContent = document.createElement("img");
//   popupContent.onload = function () {
//     e.openPopup();
//   };
//   popupContent.src = e.photo.url;
//   e.bindPopup(popupContent, {
//     maxWidth: 100,
//     maxHeight:100
//   });
// });

/* Location marker clusters*/
markerClusters.on('click', function (a) {
  var e = a.layer;
  var markerTitle = L.popup({
      closeOnClick: false,
      closeButton: false,
      autoClose: false
    }).setContent(e.options.title);
  var markerOptions = {
    'className': 'markerTitle',
  }
  var activate = !e.options.active && (map.getZoom() == 19);
  markerClusters.eachLayer(function (layer){
    deactivateMarker(layer);
  });
  if (activate) {
    activateMarker(e);
  }
  e.unbindPopup().bindPopup(markerTitle, markerOptions).on("popupopen", (a) => {
    var popUp = a.target.getPopup()
      popUp.getElement().addEventListener("click", l => {
      if (e.options.active) {
        deactivateMarker(e);
        return;
      }
      if (map.getZoom() == 19 && !(e.options.active)) {
        activateMarker(e);
      }
    });
  });
  if (map.getZoom() != 19) {
    map.flyTo(e._latlng, 19, {duration:0.5});
  }
  e.openPopup();
});

map = L.map("map", {
  zoom: 10,
  center: [40.35, -74.66],
  layers: [cartoLight, highlight, markerClusters, photoLayer],
  zoomControl: false,
  attributionControl: false,
  scrollWheelZoom: true
});

//add zoom control with your options
L.control.zoom({
     position:'topright'
}).addTo(map);


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

$("#uploadPhoto").submit(function (){ 
  latlng = map.getBounds().getCenter();
  $("#lat").val(latlng.lat);
  $("#lon").val(latlng.lng);
});

$('#angleButton').click(function() {
  sortByAngle(activeMarker.options.photos);
  $('#angleButton').addClass("active");
  $('#timeButton').removeClass("active");
  console.log("clicky");
});

$('#timeButton').click(function() {
  sortByDate(activeMarker.options.photos);
  console.log("clicky");
  $('#timeButton').addClass("active");
  $('#angleButton').removeClass("active");
});


// // Leaflet patch to make layer control scrollable on touch browsers
// var container = $(".leaflet-control-layers")[0];
// if (!L.Browser.touch) {
//   L.DomEvent
//   .disableClickPropagation(container)
//   .disableScrollPropagation(container);
// } else {
//   L.DomEvent.disableClickPropagation(container);
// }