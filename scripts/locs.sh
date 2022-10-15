#!/bin/bash

URL='https://data.bus-data.dft.gov.uk/api/v1/gtfsrtdatafeed/'

curl "${URL}?api_key=${API_KEY}&routeId=$1" \
    --output "${2}/$(date -uIs).pb2" \
    --silent
