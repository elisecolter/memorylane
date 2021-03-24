var map, featureList, boroughSearch = [], theaterSearch = [], museumSearch = [];

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

/* Icons */
var inactiveIcon = L.icon({
        iconUrl: "/static/assets/marker-icon-grey.png",
        iconSize: [16, 25],
        iconAnchor: [8, 25],
        popupAnchor: [40, 25]
});

var activeIcon = L.icon({
        iconUrl: "/static/assets/marker-icon-red.png",
        iconSize: [16, 25],
        iconAnchor: [8, 25],
        popupAnchor: [40, 25]
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
      var angle = getAngle(location.lon, location.lat, lon, lat);

      var photo = {lat: lat, lon: lon, url: url, angle: angle}
      photosSorted.push(photo);
    }
    sortByAngle(photosSorted);

    // Create a layer of the photos attached to that marker
    var markerPhotos = L.photo.cluster({maxClusterRadius: 2}).add(photos);
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
      photos: location.photos,
      photosSorted: photosSorted,
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
    displayedPhoto = a.layer.photo;
    $("#photoModal").modal("show");
  });
}

/* Get next photo by angle */
function getNextPhotoLeft() {
  var photoLayer = activeMarker.options.markerPhotos;
  photoLayer.eachLayer(function (layer) {
    var lat = layer.photo.lat;
    var lon = layer.photo.lng;

  });
  return left_photo
}

$("#photoLeft").on('click', function (a) {
  photos = activeMarker.options.photosSorted;

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
  $("#photoModal").modal("show");
});

$("#photoRight").on('click', function (a) {
  photos = activeMarker.options.photosSorted;

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
      if (map.getZoom() == 19 && !(e.active)) {
          activateMarker(e);
      }
    });
  });
  map.flyTo(e._latlng, 19, {duration:0.5});
  e.openPopup();
});

map = L.map("map", {
  zoom: 10,
  center: [40.35, -74.66],
  layers: [cartoLight, highlight, markerClusters, photoLayer],
  zoomControl: false,
  attributionControl: false
});

//add zoom control with your options
L.control.zoom({
     position:'topright'
}).addTo(map);

$("#uploadPhoto").submit(function (){ 
  latlng = map.getBounds().getCenter();
  $("#lat").val(latlng.lat);
  $("#lon").val(latlng.lng);
})

// // Leaflet patch to make layer control scrollable on touch browsers
// var container = $(".leaflet-control-layers")[0];
// if (!L.Browser.touch) {
//   L.DomEvent
//   .disableClickPropagation(container)
//   .disableScrollPropagation(container);
// } else {
//   L.DomEvent.disableClickPropagation(container);
// }