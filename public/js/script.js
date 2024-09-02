

const socket = io();
let currentPostion ;
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      currentPostion = { latitude, longitude };
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2500,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const markers = {};

socket.on("recive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 15);
  if (markers[id]) {
    markers[id].setLatLong([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});



map.on("click", function (e) {
    new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    socket.emit("second-marker", { "data": { "latitude": e.latlng.lat, "longitude": e.latlng.lng }, currentPostion })
 
})



// socket.on("Route",(data)=>{
//   console.log(data.id && data.distance)
//   if(data.id && data.distance){
//     console.log('inside route');
//     L.Routing.control({
//       waypoints:   [
//       L.latLng(data.currentPostion),
//       L.latLng(data.markedPosition)
//       ]
//     }).addTo(map);
//   }

// })

socket.on("Route", (data) => {
  console.log("Route data received:", data);

  const { currentPostion, markedPosition } = data;

  if (currentPostion && markedPosition) {
    const start = L.latLng(currentPostion.latitude, currentPostion.longitude);
    const end = L.latLng(markedPosition.latitude, markedPosition.longitude);

    L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: true
    }).addTo(map);
  } else {
    console.error("Invalid route data:", data);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
    console.log("Disconnected from server");
  }
});
