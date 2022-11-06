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

const addToMap = (r) => {
  const fc = emptyFc();
  fc.features = r
    .map((f) => [
      {
        type: "Feature",
        properties: {
          bearing: f.bearing,
          route_id: f.route_id,
          which: 2,
        },
        geometry: {
          type: "Point",
          coordinates: [f.lon, f.lat],
        },
      },
      {
        type: "Feature",
        properties: {
          which: 1,
        },
        geometry: {
          type: "Point",
          coordinates: [
            f.lon - 0.00005 * Math.sin(deg2rad(f.bearing)),
            f.lat - 0.00005 * Math.cos(deg2rad(f.bearing)),
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          which: 0,
        },
        geometry: {
          type: "Point",
          coordinates: [
            f.lon - 0.00009 * Math.sin(deg2rad(f.bearing)),
            f.lat - 0.00009 * Math.cos(deg2rad(f.bearing)),
          ],
        },
      },
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
  map.addSource("trail", {
    type: "geojson",
    data: emptyFc(),
  });
  map.addSource("trail2", {
    type: "geojson",
    data: emptyFc(),
  });

  map.addLayer({
    id: "bus",
    type: "circle",
    source: "bus",
    paint: {
      "circle-stroke-color": "hsla(120, 76%, 40%, 1)",
      "circle-radius": ["step", ["get", "which"], 2, 1, 4, 2, 5],
      "circle-stroke-width": ["step", ["get", "which"], 1, 1, 2, 2, 3],
      "circle-opacity": 0,
      "circle-stroke-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        ["case", ["==", ["get", "which"], 2], 1, 0],
        22,
        1,
      ],
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
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 1],
    },
  });

  map.on("click", "bus", (e) => {
    console.log(e.features[0].properties.bearing);
  });

  getData();
  map.on("moveend", getData);
  get("reload").addEventListener("click", getData);
});
