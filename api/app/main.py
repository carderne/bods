import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.transit import gtfs_realtime_pb2  # type: ignore[import]

from app.routes import routes

load_dotenv()

api_key = os.environ["API_KEY"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
)

base_url = "https://data.bus-data.dft.gov.uk/api/v1/"


@app.get("/api/locations/{bbox}")
def api(bbox: str) -> list[dict[str, float]]:
    client = httpx.Client(
        base_url=base_url,
        params={"api_key": api_key},
        timeout=30,
    )

    r = client.get(
        "gtfsrtdatafeed/",
        params={
            "boundingBox": bbox,
        },
    )
    assert r.status_code == 200

    msg = gtfs_realtime_pb2.FeedMessage()
    msg.ParseFromString(r.content)

    buses = [
        {
            "lat": round(t.vehicle.position.latitude, 6),
            "lon": round(t.vehicle.position.longitude, 6),
            "bearing": t.vehicle.position.bearing,
            "route_id": routes.get(t.vehicle.trip.route_id, ""),
        }
        for t in msg.entity
    ]

    return buses
