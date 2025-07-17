from sqlmodel import SQLModel, create_engine
import app.models
import csv
from geoalchemy2.elements import WKTElement
from sqlmodel import Session

DATABASE_URL = 'postgresql://gidb_user:password@database/geo_int_db'

engine = create_engine(DATABASE_URL)

def is_poi_table_empty():
    '''
    Checks if the POI table is empty.
    Returns True if empty, False otherwise.
    '''
    with Session(engine) as session:
        return session.query(app.models.POI).first() is None

def load_POI_from_csv(file_path: str):
    '''
    Loads Points of Interest (POI) from a CSV file into the database.
    The CSV file should have columns: Name, Category, Longitude, Latitude.
    '''
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        if set(reader.fieldnames) != {'Name', 'Category', 'Longitude', 'Latitude'}:
            return "CSV file must contain headers: Name, Category, Longitude, Latitude"

        points = []
        for row in reader:
            try:
                lon = float(row['Longitude'])
                lat = float(row['Latitude'])
            except:
                continue

            point = app.models.POI(
                name=str(row['Name']),
                category=str(row['Category']),
                geom=WKTElement(f'POINT({lon} {lat})', srid=4326)
            )
            points.append(point)

    with Session(engine) as session:
        session.add_all(points)
        session.commit()
    
    return ""

def create_db_and_tables(file_path: str):
    '''
    Create the database and tables if they do not exist.
    Populate tables if necessary.
    '''
    SQLModel.metadata.create_all(engine)
    if is_poi_table_empty():
        print("POI table is empty, loading data from CSV...")
        load_POI_from_csv(file_path)