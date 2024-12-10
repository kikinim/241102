from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import xlwings as xw
import pandas as pd
import numpy as np
import json 
import traceback
import matplotlib.pyplot as plt 

app = FastAPI()

# CORS 설정 (React와 FastAPI가 다른 포트에서 실행되므로 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용 (개발용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class CalculationRequest(BaseModel):
    a: float  # Target pressure
    b: float  # Target flowrate
    pump: str  # Pump model
    conductance: List[dict]  # Conductance 리스트 (JSON 형태)



@app.post("/calculate")
def calculate(data: CalculationRequest):
    # 요청 데이터 확인
    print("Received Data:")
    print("Conductance JSON:", data.conductance)

    # 계산 로직 추가
    result = {
        "status": "success",
        "conductance_processed": data.conductance,  # conductance 그대로 반환
    }
    return result
