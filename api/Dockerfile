# syntax=docker/dockerfile:1

FROM python:3.11-slim-buster

WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

ENV PORT 8080
EXPOSE $PORT

ENTRYPOINT uvicorn app.main:app --host=0.0.0.0 --port=$PORT
