from fastapi import FastAPI,HTTPException,Request
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
from fastapi.responses import JSONResponse

import sqlite3
from datetime import datetime

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

# 데이터베이스 파일 경로
DB_PATH = "clicks.db"      

# 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # 클릭 데이터를 저장할 테이블 생성
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 자동 증가 ID
            timestamp TEXT NOT NULL,               -- 클릭 시간
            client_ip TEXT NOT NULL                -- 클릭한 클라이언트 IP
        )
    ''')
    conn.commit()
    conn.close()


# 클릭 정보 저장
def save_click(client_ip):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    current_time = datetime.now().isoformat()  # 현재 시간 저장 (ISO 형식)
    cursor.execute(
        'INSERT INTO clicks (timestamp, client_ip) VALUES (?, ?)',
        (current_time, client_ip)
    )
    conn.commit()
    conn.close()



# 클릭 횟수 가져오기
def get_click_count():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM clicks')  # 클릭 횟수 계산
    count = cursor.fetchone()[0]
    conn.close()
    return count

# 클릭 기록 가져오기
def get_click_times():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, timestamp, client_ip FROM clicks ORDER BY id DESC')  # 최신순 정렬
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "timestamp": row[1], "client_ip": row[2]} for row in rows]

# SQLite 초기화
init_db()


# 엔드포인트
@app.post("/calculate")
async def calculate(data: CalculationRequest,request: Request):

    
    # 클릭 정보 저장
    client_ip = request.client.host

    # 클릭 정보 저장
    save_click(client_ip)

    # 클릭 횟수와 기록 반환
    click_count = get_click_count()
    times = get_click_times()

    
    try:
   
        print("Received Target Pressure (a):", data.a)
        print("Received Target Flowrate (b):", data.b)
        print("Received Pump Model:", data.pump)
        print("Received Conductance List:", data.conductance)
        
       

         # 클릭 횟수 반환
        click_count = get_click_count()
        times = get_click_times()

        
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
        print("pump_index", pump_index)
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

        
        result = [{"x": float(x), "y": float(y)} for x, y in zip(pump_index, delivered_throughput)]

        print("응답 데이터 : " , result)

        print("@@@@@@@@@@@@@@@@@@",click_count,times,client_ip)




        return JSONResponse(content=result)



    except Exception as e:
        traceback.print_exc()  # 예외 정보 출력
        raise HTTPException(status_code=500, detail=f"오류 발생: {str(e)}")


   
