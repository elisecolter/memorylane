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

var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

$.getJSON("/photos/", function(data) {
  for (var i = 0; i < data.length; i++) {
    var location = data[i];
    var latlng = L.latLng(location.lat, location.lon)
    var marker = L.marker(latlng, {
      icon: inactiveIcon,
      title: location.name,
      photos: location.photos,
      active: false,
      riseOnHover: true
    })
    markerClusters.addLayer(marker);
  }     
});

var photoLayer = L.photo.cluster({maxClusterRadius: 2});
var displayedPhoto;

/* location marker Activate */
function deactivateMarker(e) {
  e.setIcon(inactiveIcon);
  e.closePopup();
  e.active = false;
  photoLayer.clear();
 // photoLayer = L.photo.cluster();
}

function activateMarker(e) {
  e.setIcon(activeIcon);
  e.active = true;
  var photos = e.options.photos;
  photoLayer.clearLayers();
  photoLayer.clear();

  // Draw linesfor 
  var latlngs = [];
  for (var i = 0; i < photos.length; i++) {
    latlngs.push([[photos[i].lat, photos[i].lng], [e._latlng.lat, e._latlng.lng]]);
  }
  var polyline = L.polyline(latlngs, {color: 'grey', dashArray: 5}).addTo(photoLayer);
  photoLayer.add(photos).addTo(map);

  // On clicking a photo, scoot to the right
  bounds = map.getBounds();
  x = e._latlng.lat;
  y = e._latlng.lng;
  left_y = bounds._southWest.lng;
  center_y= y - ((y - left_y)/2);
  center = L.latLng(x, center_y);

  photoLayer.on('click', function (a) {
    map.flyTo(center, 19, {duration:0.5});
    var modal = $('#photoModal'), modalImg = $('#photoModal .photo-modal-image');
    modalImg.attr('src', a.layer.photo.url);
    displayedPhoto = a.layer.photo;
    $("#photoModal").modal("show");
  });
}

/* Temporary - center is Blair Arch */
var center_lat = 40.347532;
var center_lng = -74.660949;
function getAngle(x2, y2, x1, y1) {
  var angleDeg = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return angleDeg
}

/* Get next photo by angle */
function getNextPhotoLeft() {
  var angle = getAngle(center_lat, center_lng, displayedPhoto.lat, displayedPhoto.lng);
  var left_photo = displayedPhoto;
  var smallest_dist = 360;

  var photos = photoLayer._photos;
  photos.eachLayer(function (layer) {
    if (layer.photo.url != displayedPhoto.url) {
      var next_angle = getAngle(center_lat, center_lng, layer.photo.lat, layer.photo.lng);

      // if they have the same sign
      var dist = angle - next_angle;
      // if (dist < 0) {dist = -dist;}

      // if (angle < 0 && next_angle > 0) {dist = -angle + next_angle;}
      // if (angle > 0 && next_angle < 0) {dist = -next_angle + angle;}

      var isRight = false;
      if (angle < 0 && next_angle < 0 && next_angle > angle) {isRight = true;}
      if (angle > 0 && next_angle > 0 && next_angle > angle) {isRight = true;}
      if (angle > -50 && angle < 0 && next_angle > 0) {isRight = true;}


      if (dist < smallest_dist && !isRight) {
        smallest_dist = dist;
        left_photo = layer.photo;
      }
    }
  });

  return left_photo
}

$("#photoLeft").on('click', function (a) {
  photo = getNextPhotoLeft();
  var modal = $('#photoModal'), modalImg = $('#photoModal .photo-modal-image');
  modalImg.attr('src', photo.url);
  displayedPhoto = photo;
  $("#photoModal").modal("show");
});

$("#photoRight").on('click', function (a) {
  console.log("right");
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
  markerClusters.eachLayer(function (layer){
    deactivateMarker(layer);
  });
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

map.on(zoomO)

//add zoom control with your options
L.control.zoom({
     position:'topright'
}).addTo(map);


// // Leaflet patch to make layer control scrollable on touch browsers
// var container = $(".leaflet-control-layers")[0];
// if (!L.Browser.touch) {
//   L.DomEvent
//   .disableClickPropagation(container)
//   .disableScrollPropagation(container);
// } else {
//   L.DomEvent.disableClickPropagation(container);
// }