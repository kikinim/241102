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
    allow_origins=["*"],  # 모든 도메인 허용
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalculationRequest(BaseModel):
    a: float
    b: float
    c: float
    d: str

@app.post("/calculate")
async def calculate(data: CalculationRequest):
        
    try:
    
        wb = xw.Book("backend/data/pumpdb.xlsx")
        sheet = wb.sheets['표준배관_직관_설비배관X Conductance']
        sheet1 = wb.sheets['pumpdb']

        # 2. 데이터를 xlwings로 읽어온 후 DataFrame으로 변환
        data1 = sheet.range('A1').expand('table').value
        df = pd.DataFrame(data1[1:], columns=data1[0])  # 첫 번째 행을 컬럼명으로 사용

        data2 = sheet1.range('A1').expand('table').value
        df1 = pd.DataFrame(data2[1:], columns=data2[0])

        print("whatwhat")   

            # 첫 번째 열을 인덱스로 설정하고 값만 numpy 배열로 변환
        df = df.set_index(df.columns[0]).fillna(0)
        df1 = df1.set_index(df1.columns[0]).fillna(0)

            # 인덱스와 값 추출 (numpy 배열로 변환)
        pipe_index = np.round(df.index.to_numpy(), 2)
        pump_index = np.round(df1.index.to_numpy(), 2)

        
        target_pressure=data.a
        target_flowrate=data.b
        print("whatwhat")

        conductance = int(data.c)
        print('conductance 를 입력하세요')
        pump = data.d.upper() 
        print('pump를 입력하세요')
        
        
        
        pipe_values = df[conductance].to_numpy(dtype=np.float64)
        pump_values = df1[pump].to_numpy(dtype=np.float64)

            # 공통 인덱스 추출 (정렬된 상태 유지)
        common_index, pipe_idx, pump_idx = np.intersect1d(pipe_index, pump_index, return_indices=True)

            # 공통 인덱스에 해당하는 값 필터링
        pipe_filtered = pipe_values[pipe_idx]
        pump_filtered = pump_values[pump_idx]

        print(pump_filtered)
        print(pipe_filtered)
            # 곱셈 수행
        result = pipe_filtered * pump_filtered


            # delivered speed 구하기
    
        delivered_speed = (pump_filtered*pipe_filtered)/(pump_filtered+pipe_filtered)
        
        # test@@@@@@@@@@@@@@@@@@@@
        print("pressure 크기",len(common_index))
        print("delivered speed  크기",len(delivered_speed))


        result_delivered_speed = pd.DataFrame({
                'Pressure': common_index,
                'delivered speed': delivered_speed
            })

        
        
        
        result_delivered_speed = result_delivered_speed.set_index('Pressure')
        
            # 계산 수행: (delivered throughput * Pressure / 760)
        result_delivered_speed['delivered throughput'] = (
                result_delivered_speed['delivered speed'] * result_delivered_speed.index / 760
            )
        
        
        # DataFrame으로 변환: 첫 열은 인덱스, 두 번째 열은 결과값
        result_df = pd.DataFrame({
                'Pressure': common_index,
                '!!!EXAMPLEM ultiplication Result !!!!!!!!!': result
            })

            # 인덱스 설정
        result_df = result_df.set_index('Pressure')

            # 결과 출력
        print(result_df,"결과출력")
        
        
        
        '''
            # 그래프 생성
        fig, ax = plt.subplots(figsize=(10, 6))
        
            # 기본 그래프
        ax.plot(result_delivered_speed.index, result_delivered_speed['adjusted throughput'],
                marker='o', linestyle='-', color='b', label='Adjusted Throughput')
        ax.plot(result_delivered_speed.index, result_delivered_speed['delivered throughput'],
                    marker='x', linestyle='--', color='g', label='Delivered Throughput')

            # (target_pressure, target_flowrate) 점 추가
        ax.plot(target_pressure, target_flowrate, 'ro', label=f'New Point ({target_pressure}, {target_flowrate})')

            # 그래프 제목과 축 레이블 설정
        ax.set_title('Throughput vs Pressure')
        ax.set_xlabel('Pressure (Torr)')
        ax.set_ylabel('Throughput')

            # 범례와 그리드 추가
        ax.legend()
        ax.grid(True)

            # 확대/축소 기능 활성화
        plt.get_current_fig_manager().toolbar.zoom()

            # 그래프 표시
        plt.show()

        """

        '''

        print(result_delivered_speed)

        print( type(result_delivered_speed))

    

        

        
        result_json = result_delivered_speed.reset_index().to_dict(orient='records')
        
        print("전송할 JSON:", result_json)  # 터미널에 출력

        print("입력한값!!!!!!!",target_pressure,target_flowrate,conductance,pump,type(target_pressure),type(target_flowrate),type(conductance),type(pump))
        return result_json  #json 응답 반환
    
        
    except Exception as e:
        traceback.print_exc()  # 예외 정보 출력
        raise HTTPException(status_code=500, detail=f"오류 발생: {str(e)}")

  
    
    #"result2" :2222
    

    
    return {"result": 565555, "json_data" :result_json_data }
    
