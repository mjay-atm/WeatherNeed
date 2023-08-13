import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.main import generate_response, generate_city_report, generate_taiwan_report, generate_lifetopic_report

app = FastAPI()

origins = [
    "http://localhost:5000",
    "https://weather-need.n0b.me"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/ask")
async def ask(question: str):
    ans = generate_response(question, [])
    return {
        "data" : ans
    }