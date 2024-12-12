from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import xlwings as xw
import pandas as pd
import numpy as np
import json 
import traceback
import matplotlib.pyplot as plt 
from sympy import symbols, Eq, solve



# FastAPI 인스턴스 생성
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용 (개발용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델 정의



class ConductanceItem(BaseModel):  # ConductanceList 대신 이 이름을 사용
    type: str  # Conductance 종류 (예: Circular Type)
    description: str  # Conductance 설명 (예: L=30cm, D=5cm)


class CalculationRequest(BaseModel):
    a: float
    b: float
    pump: str
    conductance: List[ConductanceItem]  # Conductance 리스트



# 엔드포인트
@app.post("/calculate")
async def calculate(data: CalculationRequest):
    try:
        print("WWWWWWWWWWWWW")

        print("Received Target Pressure (a):", data.a)
        print("Received Target Flowrate (b):", data.b)
        print("Received Pump Model:", data.pump)
        print("Received Conductance List:", data.conductance)
        
        
        wb = xw.Book("backend/data/pumpdb.xlsx")
        #sheet = wb.sheets['표준배관_직관_설비배관X Conductance']

        pump=data.pump
        sheet1 = wb.sheets['pumpdb']
        data2 = sheet1.range('A1').expand('table').value
        df1 = pd.DataFrame(data2[1:], columns=data2[0])
        df1 = df1.set_index(df1.columns[0]).fillna(0)   
        pump_index = np.round(df1.index.to_numpy(), 2)  
        pump_values = df1[pump].to_numpy(dtype=np.float64)

        print(df1)
        print(pump_index)
        print(pump_values)
        #print(pump_values)



        conductance_list = [{"type": item.type, "description": item.description} for item in data.conductance]
        
        print(conductance_list)
        print(type(conductance_list))
        print(type(conductance_list[0]))
        print(conductance_list[0])

        converted_data = [
    [int(item['description'].split('L=')[1].split('cm')[0]),  # L 값 추출
     int(item['description'].split('D=')[1].split('cm')[0])]  # D 값 추출
    for item in conductance_list
]
        print(converted_data)

        Length = converted_data[0]
        Diameter = converted_data[1]

# [[L,D],[L,D]]
        pipe_conductance = [((3.14*(i[1]**4))/(128*3.17*10**-6*i[0]))  for i in converted_data]      
        print(pipe_conductance) 

        x=symbols('x')
        
        equation = Eq(1/x, sum([1/i  for i in pipe_conductance]))
        solution = solve(equation,x)
        total_conductance = solution
        print("total_conductance" , solution)

        total_conductance_list = pump_index *  total_conductance

        print("total_conductance_list = " , total_conductance_list)

        #그럼 이제 pressure index있고 pumping speed 있고 total conductance 있음



        delivered_speed = (pump_values*total_conductance)/(pump_values+total_conductance)
        delivered_throughput =  delivered_speed * pump_index / 760
        print("delivered throughput = " , delivered_throughput)

        return {
        "status": "success",
        "received_data": data.dict()
                            }
        
    except Exception as e:
        traceback.print_exc()  # 예외 정보 출력
        raise HTTPException(status_code=500, detail=f"오류 발생: {str(e)}")


   
    
