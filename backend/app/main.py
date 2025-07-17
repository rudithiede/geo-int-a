from typing import Union
from fastapi import FastAPI, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from random import randrange
from uuid import uuid4
import sqlalchemy
from sqlalchemy import text
import psycopg2
from app.services import engine, create_db_and_tables, add_poi
from sqlmodel import Session
from geoalchemy2.elements import WKTElement
from shapely import wkt
import os

# Set up dirs
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create table if necessary
@app.on_event("startup")
def on_startup():
    csv_path = os.path.join(STATIC_DIR, "POI.csv")
    create_db_and_tables(csv_path)

def generate_random_number():
    return (randrange(1, 1000)/1000) * 2 - 1

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/locations/geojson")
async def read_locations():
    '''Returns the locations found in the database as GeoJSON.'''
    with Session(engine) as session:
        results = session.exec(text("SELECT id, name, category, ST_AsText(geom) FROM poi")).all()
        locations = {
            "features": []
        }
        for result in results:
            id = result[0]
            name = result[1]
            category = result[2]
            geom = wkt.loads(result[3])
            locations["features"].append(
                {
                    "id": id,
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [geom.x, geom.y]
                    },
                    "properties": {
                        "name": name,
                        "category": category
                    }
                }
            )
        return locations

@app.get("/locations")
async def read_locations_raw():
    '''Returns the locations found in the database as JSON.'''
    with Session(engine) as session:
        results = session.exec(text("SELECT id, name, category, ST_AsText(geom) FROM poi")).all()
        locations = []
        for result in results:
            id = result[0]
            name = result[1]
            category = result[2]
            geom = wkt.loads(result[3])
            locations.append({
                "id": id,
                "name": name,
                "category": category,
                "longitude": geom.x,
                "latitude": geom.y
            })
        return locations

@app.post("/locations")
async def create_location(location: dict = Body(...)):
    '''Creates a new location in the database.'''
    return add_poi(location)