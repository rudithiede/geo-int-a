from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from random import randrange
from uuid import uuid4

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_random_number():
    return (randrange(1, 1000)/1000) * 2 - 1

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/locations/")
def read_locations():
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
    return locations

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}