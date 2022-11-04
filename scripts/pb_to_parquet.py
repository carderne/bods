from datetime import datetime
from pathlib import Path

import geopandas as gpd  # type: ignore[import]
import pandas as pd  # type: ignore[import]
import typer
from google.transit import gtfs_realtime_pb2  # type: ignore[import]


def pb_to_parquet(
    path: Path,
    day: str,
    out_dir: Path = typer.Option(Path("parquet")),
) -> None:
    print(f"Loading pb2 files from '{path}' for day '{day}'")
    trips = []
    for f in sorted(path.glob(f"{day}T*.pb2")):
        msg = gtfs_realtime_pb2.FeedMessage()
        msg.ParseFromString(f.read_bytes())
        for t in msg.entity:
            trips.append(t)

    print("Convert to df")
    df = pd.DataFrame(
        {
            "id": t.id,
            "trip_id": t.vehicle.trip.trip_id,
            "start_time": t.vehicle.trip.start_time,
            "start_date": t.vehicle.trip.start_date,
            "schedule_relationship": t.vehicle.trip.schedule_relationship,
            "route_id": t.vehicle.trip.route_id,
            "latitude": t.vehicle.position.latitude,
            "longitude": t.vehicle.position.longitude,
            "bearing": t.vehicle.position.bearing,
            "current_stop_sequence": t.vehicle.current_stop_sequence,
            "current_status": t.vehicle.current_status,
            "timestamp": datetime.utcfromtimestamp(t.vehicle.timestamp),
            "vehicle": t.vehicle.vehicle.id,
        }
        for t in trips
    ).drop_duplicates()
    df.timestamp = df.timestamp.dt.tz_localize("UTC")
    df = (
        df.assign(geometry=gpd.points_from_xy(x=df.longitude, y=df.latitude))
        .drop(["longitude", "latitude"], axis=1)
        .pipe(gpd.GeoDataFrame, crs=4326)
    )

    out_path = out_dir / f"{day}.parquet"
    print(f"Save to '{out_path}'")
    df.to_parquet(out_path, index=False)


if __name__ == "__main__":
    typer.run(pb_to_parquet)
