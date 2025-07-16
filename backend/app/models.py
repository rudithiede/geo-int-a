from sqlmodel import Field, SQLModel, Column
from datetime import datetime
from typing import Optional, Any
from geoalchemy2 import Geometry

class TestPoints(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    geom: Optional[Any] = Field(sa_column=Column(Geometry('GEOMETRY')))

    class Config:
        orm_mode = True