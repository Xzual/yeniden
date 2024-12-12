const map = L.map('map').setView([38.4276, 27.2044], 12);

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 20,
});

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Uydu Görüntüsü": satelliteLayer,
};

L.control.layers(baseLayers).addTo(map);

L.control.zoom({
  position: 'topright',
  zoomInText: '+',
  zoomOutText: '-'
}).addTo(map);

const searchInput = document.getElementById('searchInput');
const suggestionList = document.getElementById('suggestionList');

searchInput.addEventListener('input', () => {
  const query = searchInput.value;
  if (query.length > 2) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}+school`)
      .then(response => response.json())
      .then(data => {
        suggestionList.innerHTML = '';
        data.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.display_name.split(',')[0];
          li.addEventListener('click', () => {
            map.flyTo([item.lat, item.lon], 15);
            addMarker(item.lat, item.lon, item.display_name.split(',')[0]);
            suggestionList.innerHTML = '';
          });
          suggestionList.appendChild(li);
        });
      });
  }
});

const markers = [];

function addMarker(lat, lng, name) {
  const messageBox = document.createElement('div');
  messageBox.className = 'message-box';
  messageBox.textContent = name;
  document.body.appendChild(messageBox);

  const marker = L.marker([lat, lng]).addTo(map);
  const updateMessageBoxPosition = () => {
    const point = map.latLngToContainerPoint([lat, lng]);
    messageBox.style.left = `${point.x}px`;
    messageBox.style.top = `${point.y}px`;
  };

  updateMessageBoxPosition();
  map.on('move', updateMessageBoxPosition);
  map.on('zoom', updateMessageBoxPosition);

  marker.on('click', () => {
    const newText = prompt("Konumu aratın:", messageBox.textContent);
    if (newText) {
      messageBox.textContent = newText;
    }
  });

  marker.on('contextmenu', () => {
    map.removeLayer(marker);
    document.body.removeChild(messageBox);

    const index = markers.findIndex(item => item.marker === marker);
    if (index !== -1) {
      markers.splice(index, 1);
    }
  });

  markers.push({ marker, messageBox });
}

map.on('click', function (e) {
  const { lat, lng } = e.latlng;
  addMarker(lat, lng, "Yeni Okul");
});

function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const latlng = [position.coords.latitude, position.coords.longitude];
      map.setView(latlng, 15);
      L.marker(latlng).addTo(map)
        .bindPopup('Buradasınız!')
        .openPopup();
    });
  } else {
    alert("Tarayıcınız konum servislerini desteklemiyor.");
  }
}
