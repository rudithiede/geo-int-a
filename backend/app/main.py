from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from random import randrange
from uuid import uuid4
import sqlalchemy
from sqlalchemy import text
import psycopg2
from app.services import engine, create_db_and_tables
from sqlmodel import Session
from geoalchemy2.elements import WKTElement
from shapely import wkt

app = FastAPI()

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
    create_db_and_tables()

def generate_random_number():
    return (randrange(1, 1000)/1000) * 2 - 1

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/locations/geojson")
async def read_locations():
    '''Returns the locations found in the database.'''
    with Session(engine) as session:
        results = session.exec(text("SELECT id, name, ST_AsText(geom) FROM test_points")).all()
        locations = {
            "features": []
        }
        for result in results:
            id = result[0]
            name = result[1]
            geom = wkt.loads(result[2])
            locations["features"].append(
                {
                    "id": id,
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [geom.x, geom.y]
                    },
                    "properties": {
                        "name": name
                    }
                }
            )
        return locations


    '''
    locations = {
        "features": []
    }
    for i in range(3):
        base_coords = {"lat": -33.9249+generate_random_number(), "lon": 18.4241+generate_random_number()}
        pointID = uuid4()
        locations["features"].append(
            {
                "id": str(pointID),
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [base_coords["lon"], base_coords["lat"]]
                }
            }
        )
    return locations'''

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}