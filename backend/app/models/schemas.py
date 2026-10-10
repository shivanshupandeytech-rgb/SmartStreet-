from pydantic import BaseModel


class WhatIf(BaseModel):
    age_years: float = 3
    previous_failures: int = 0
    voltage: float = 230
    operating_hours: float = 10
    temperature: float = 30
    rainfall: float = 0
    maintenance_count: int = 2
    days_since_maintenance: int = 90
