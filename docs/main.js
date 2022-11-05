/* global mapboxgl */

let backend = true;

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/carderne/cl9ycldb8004z14lnoqlcb2u3',
  center: [-1.2, 51.75],
  zoom: 10,
  minZoom: 8,
  maxZoom: 16,
  maxBounds: [-9, 48, 3, 61],
  projection: "globe",
});
map.addControl(new mapboxgl.NavigationControl());

const emptyFc = () => ({
  "type": "FeatureCollection",
  "features": [],
});

const addToMap = (r) => {
  const fc = emptyFc();
  fc.features = r.map((f) => ({
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": [
        f.lon,
        f.lat,
      ],
    },
  }));
  map.getSource("rt").setData(fc);
};

const getData = () => {
  const bounds = map.getBounds();
  const bbox = `${bounds._sw.lng},${bounds._sw.lat},${bounds._ne.lng},${bounds._ne.lat}`;
  if (!backend) return;
  fetch(`http://pc.local:5123/api/locations/${bbox}`)
    .then((r) => r.json())
    .then((r) => addToMap(r))
    .catch((e) => {
      backend = false;
    });
};

map.on("load", () => {
  map.addSource("rt", {
    type: "geojson",
    data: emptyFc(),
  });

  map.addLayer({
    id: "rt",
    type: "circle",
    source: "rt",
    layout: {},
    paint: {
      "circle-radius": 3,
    },
  });

  getData();
  map.on("moveend", getData);
  document.getElementById("reload").addEventListener("click", getData);
});

