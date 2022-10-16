# bods-bus-data
Playing around with British bus timetable and location data

## Getting started
Copy `.env.example` to `.env` and insert your [API key from here](https://data.bus-data.dft.gov.uk/account/settings/).

```bash
pip install -r requirements.txt
```

## Notebooks
- [api.ipynb](notebooks/api.ipynb): calling the REST API for schedule and location data
- [schedule.ipynb](notebooks/schedule.ipynb): using `gtfs-kit` with a downloaded GTFS archive
- [location.ipynb](notebooks/location.ipynb): using `python-bods-client` to get real-time GTFS data
- [parse_pb2.ipynb](notebooks/parse_pb2.ipynb): load archived `.pb2` files (see below)
- [compare_to_schedule.ipynb](notebooks/compare_to_schedule.ipynb): compare actual to schedule
- [boarding_time.ipynb](notebooks/boarding_time.ipynb): analyse delays at boarding

## Location archive
I haven't yet found an historical archive of GTFS real-time location data.
So I'm getting to set a cron-job downloading the GTFS protobuf data every ten seconds and leave it running for a few weeks (for just a few lines).
If the experiment works well hopefully I can expand it!

The (very basic) script is at [scripts/locs.sh](scripts/locs.sh).
Call it as follows (replacing the number with the `routeId`s of interest):
```bash
API_KEY="your-key" ./scripts/locs.sh 3815,4824 /path/to/output/dir/
```

Or get it to run every ten seconds in cron with something monstrous like this:
```crontab
API_KEY="your-key"
BODS_SCRIPT="/path/tp/bods-bus-data/scripts/locs.sh"
ROUTES="3815,4824,14187,50065"
BODS_DATA="/path/to/bods-bus-data/data"
* * * * * ( sleep  0; API_KEY=$API_KEY $BODS_SCRIPT $ROUTES $BODS_DATA)
* * * * * ( sleep 10; API_KEY=$API_KEY $BODS_SCRIPT $ROUTES $BODS_DATA)
* * * * * ( sleep 20; API_KEY=$API_KEY $BODS_SCRIPT $ROUTES $BODS_DATA)
* * * * * ( sleep 30; API_KEY=$API_KEY $BODS_SCRIPT $ROUTES $BODS_DATA)
* * * * * ( sleep 40; API_KEY=$API_KEY $BODS_SCRIPT $ROUTES $BODS_DATA)
* * * * * ( sleep 50; API_KEY=$API_KEY $BODS_SCRIPT $ROUTES $BODS_DATA)
```

## Useful links (also in the notebooks)
- [Inspiration from Tom Forth](https://www.tomforth.co.uk/toomanybuses/)
- [python-bods-client](https://github.com/ciaranmccormick/python-bods-client)
- [gtfs-kit](https://gitlab.com/mrcagney/gtfs_kit)
- [GTFS data download](https://data.bus-data.dft.gov.uk/timetable/download/)
- [GTFS Reference](https://developers.google.com/transit/gtfs/reference)
- [GTFS Real-Time Reference](https://developers.google.com/transit/gtfs-realtime/reference)
