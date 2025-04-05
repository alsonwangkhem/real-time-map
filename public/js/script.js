const socket = io();

const username = prompt("Enter your name: ");
socket.emit("user-joined", username);

function showToast(msg) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = msg;
  document.getElementById("toast-container").appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Alson Wangkhem",
}).addTo(map);

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude }); // Send once immediately
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const markers = {};

let mapCentered = false;

socket.on("receive-location", function (data) {
  const { id, latitude, longitude, username } = data;
  if (socket.id === id && !mapCentered) {
    map.setView([latitude, longitude], 16);
    mapCentered = true;
  }

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(username)
      .openPopup();
  }
});

socket.on("user-joined", function (data) {
  const { username } = data;
  showToast(`${username} joined`);
});

socket.on("user-disconnected", (data) => {
  const { id, username } = data;
  showToast(`${username} left!`);

  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
