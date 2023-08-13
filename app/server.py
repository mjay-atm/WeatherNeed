import json

from fastapi import FastAPI

from app.main import generate_response, generate_city_report, generate_taiwan_report, generate_lifetopic_report

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/ask")
async def ask(question: str):
    ans = generate_response(question, [])
    return {
        "data" : ans
    }