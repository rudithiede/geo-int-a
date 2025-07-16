from sqlmodel import SQLModel, create_engine
import app.models

DATABASE_URL = 'postgresql://gidb_user:password@database/geo_int_db'

engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)