import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.main import generate_response, generate_response_bycity, generate_city_report, generate_taiwan_report, generate_lifetopic_report

app = FastAPI()

origins = [
    "http://localhost:5500",
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

@app.get("/ask/")
async def ask(question: str):
    ans = generate_response(question, [])
    return {
        "data" : ans
    }

@app.get("/ask/{city}")
async def ask_city(city: str, question: str):
    ans = generate_response_bycity(question, city, [])
    return {
        "data" : ans
    }

@app.get("/city-report")
async def cityReport(city: str):
    ans = generate_city_report(city, [])
    return {
        "data": ans
    }