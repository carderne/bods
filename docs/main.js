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
  maxZoom: 22,
  maxBounds: [-9, 45, 9, 65],
  projection: "globe",
  hash: "loc",
});
map.addControl(new mapboxgl.NavigationControl());

const deg2rad = (deg) => deg * (Math.PI / 180);

const emptyFc = () => ({ type: "FeatureCollection", features: [] });

const makePoint = (f, which, offset) => ({
  type: "Feature",
  properties: {
    bearing: f.bearing,
    route_id: f.route_id,
    which,
  },
  geometry: {
    type: "Point",
    coordinates: [
      f.lon - offset * Math.sin(deg2rad(f.bearing)),
      f.lat - offset * Math.cos(deg2rad(f.bearing)),
    ],
  },
});

const addToMap = (r) => {
  const fc = emptyFc();
  fc.features = r
    .map((f) => [
      makePoint(f, 4, 0),
      makePoint(f, 3, 0.00006),
      makePoint(f, 2, 0.00014),
      makePoint(f, 1, 0.00024),
      makePoint(f, 0, 0.00062),
    ])
    .flat();
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

map.on("load", () => {
  map.addSource("bus", {
    type: "geojson",
    data: emptyFc(),
  });

  // prettier-ignore
  const radius = [
    "step", ["get", "which"],
       2,
    1, 2.5,
    2, 3,
    3, 4,
    4, 6
  ];
  // prettier-ignore
  const width = [
    "step", ["get", "which"],
       1,
    1, 1.5,
    2, 2,
    3, 2.5,
    4, 4,
  ];
  // prettier-ignore
  const opacity = [
    "interpolate", ["linear"], ["zoom"],
    8, ["case", ["==", ["get", "which"], 4], 1, 0],
    13, ["case", ["==", ["get", "which"], 4], 1, ["==", ["get", "which"], 0], 1, 0],
    15, 1,
    17, ["case", ["==", ["get", "which"], 0], 0, 1],
  ];
  // prettier-ignore
  const textOpacity = [
    "interpolate", ["linear"], ["zoom"],
    13, 0,
    14, ["case", ["==", ["get", "which"], 4], 1, 0],
  ];

  map.addLayer({
    id: "bus",
    type: "circle",
    source: "bus",
    paint: {
      "circle-stroke-color": "hsla(120, 76%, 40%, 1)",
      "circle-radius": radius,
      "circle-stroke-width": width,
      "circle-opacity": 0,
      "circle-stroke-opacity": opacity,
    },
  });

  map.addLayer({
    id: "bus-text",
    type: "symbol",
    source: "bus",
    layout: {
      "text-field": ["to-string", ["get", "route_id"]],
      "text-size": ["interpolate", ["linear"], ["zoom"], 13, 10, 14, 12],
      "text-offset": [0.7, -0.7],
    },
    paint: {
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
      "text-halo-blur": 1,
      "text-opacity": textOpacity,
    },
  });

  getData();
  map.on("moveend", getData);
  get("reload").addEventListener("click", getData);
});
