from typing import Union
from fastapi import FastAPI, Body, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from random import randrange
from uuid import uuid4
import sqlalchemy
from sqlalchemy import text
import psycopg2
from app.services import engine, create_db_and_tables, add_poi, raw_location_data, geojson_location_data, import_locations
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
    return geojson_location_data()

@app.get("/locations")
async def read_locations_raw():
    '''Returns the locations found in the database as JSON.'''
    return raw_location_data()

@app.post("/locations")
async def create_location(location: dict = Body(...)):
    '''Creates a new location in the database.'''
    return add_poi(location)

@app.post("/import")
async def import_CSV(file: UploadFile = File(...)):
    '''
    Imports locations from a CSV file.
    The CSV file should have the following columns: name, category, latitude, longitude.
    '''
    contents = await file.read()
    file_path = os.path.join(STATIC_DIR, 'imported_' + str(uuid4()) + '.csv')
    with open(file_path, 'wb') as f:
        f.write(contents)
    return import_locations(file_path)