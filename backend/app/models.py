from sqlmodel import Field, SQLModel, Column, Index
from datetime import datetime
from typing import Optional, Any
from geoalchemy2 import Geometry

class POI(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    category: Optional[str] = None
    geom: Optional[Any] = Field(sa_column=Column(Geometry('GEOMETRY', srid=4326)))

    class Config:
        orm_mode = True

__table_args__ = (
    Index("idx_poi_geom_gist", POI.__table__.c.geom, postgresql_using='gist'),
)