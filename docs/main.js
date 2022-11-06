/* global mapboxgl */

const get = document.getElementById.bind(document);

const busMinZoom = 9;

const url =
  window.location.protocol === "http:"
    ? new URL("http://localhost:5123/api/locations/")
    : new URL("https://bods-production.up.railway.app/api/locations/");

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/carderne/cla5557a3001n14l7hfc6m3qm?fresh=true",
  center: [-1.2, 51.75],
  zoom: 10,
  minZoom: 4,
  maxZoom: 16,
  maxBounds: [-9, 45, 9, 65],
  projection: "globe",
  hash: "loc",
});
map.addControl(new mapboxgl.NavigationControl());

const emptyFc = () => ({ type: "FeatureCollection", features: [] });

const addToMap = (r) => {
  const fc = emptyFc();
  fc.features = r.map((f) => ({
    type: "Feature",
    properties: {
      bearing: f.bearing,
      route_id: f.route_id,
    },
    geometry: {
      type: "Point",
      coordinates: [f.lon, f.lat],
    },
  }));
  map.getSource("bus").setData(fc);
  get("loading").style.display = "none";
};

const getData = () => {
  if (map.getZoom() < busMinZoom) {
    get("zoom").style.display = "block";
    return;
  }
  get("loading").style.display = "block";
  get("zoom").style.display = "none";
  const bounds = map.getBounds();
  const bbox = `${bounds._sw.lng},${bounds._sw.lat},${bounds._ne.lng},${bounds._ne.lat}`;
  fetch(`${url}${bbox}`)
    .then((r) => r.json())
    .then((r) => addToMap(r))
    .catch((e) => {
      get("loading").style.display = "none";
    });
};

const layout = {
  "text-field": ["to-string", ["get", "route_id"]],
  "text-size": 10,
  "text-offset": [0.7, -0.7],
  "icon-image": "arrow",
  "icon-size": ["interpolate", ["linear"], ["zoom"], 8, 0.2, 16, 1.1],
  "icon-rotate": [
    "interpolate",
    ["linear"],
    ["get", "bearing"],
    0,
    0,
    359,
    359,
  ],
};

const opacity = [
  "interpolate",
  ["linear"],
  ["zoom"],
  busMinZoom - 1,
  0,
  busMinZoom,
  1,
];

const paint = {
  "text-halo-color": "#ffffff",
  "text-halo-width": 2,
  "text-halo-blur": 1,
  "icon-opacity": opacity,
  "text-opacity": opacity,
  "icon-color": "hsla(120, 76%, 40%, 1)",
};

map.on("load", () => {
  map.addSource("bus", {
    type: "geojson",
    data: emptyFc(),
  });

  const img = new Image(24, 24);
  img.src = "./arrow.svg";
  img.onload = () => map.addImage("arrow", img, { sdf: true });

  map.addLayer({
    id: "bus",
    type: "symbol",
    source: "bus",
    layout,
    paint,
  });

  getData();
  map.on("moveend", getData);
  get("reload").addEventListener("click", getData);
});
