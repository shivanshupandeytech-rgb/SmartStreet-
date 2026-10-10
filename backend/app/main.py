import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router

app = FastAPI(title="SmartStreet API", version="1.0")
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)


@app.get("/")
def root():
    return {"name": "SmartStreet API", "docs": "/docs"}
