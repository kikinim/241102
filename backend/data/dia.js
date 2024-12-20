import React, { useMemo, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale ,
  registerables,
} from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
import "./App.css";
ChartJS.register(...registerables, zoomPlugin);


ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);




function App() {
  const [a, setA] = useState(""); // Target pressure
  const [b, setB] = useState(""); // Target flowrate
  const [d, setD] = useState(""); // Pump model
  const [result, setResult] = useState([{x: 0.1, y:10},{x:0.2, y:20}]); // 결과 데이터
  const [type, setType] = useState(""); // 종류
  const [length, setLength] = useState(""); // 길이
  const [diameter, setDiameter] = useState(""); // 직경
  const [conductanceList, setConductanceList] = useState([]); // Conductance 리스트
  const [xLogScale, setXLogScale] = useState(false); // x축 로그 스케일 상태
  const [yLogScale, setYLogScale] = useState(false); // y축 로그 스케일 상태
  const chartRef = useRef(null);
  
  const [V, setV] = useState(100); // 부피 V 초기값


  const point = { x: a, y: b }; // 기준점
  const marginPercent = 0.2; // 마진 비율 (20%)

  const marginX = point.x * marginPercent; // x축 마진
  const marginY = point.y * marginPercent; // y축 마진
  console.log(marginX,marginY)
  
// 추천 Conductance 추가 핸들러
const handleAddRecommendedConductance = (recommendations) => {
  // 기존 리스트에 추천 Conductance 항목 추가
  setConductanceList([...conductanceList, ...recommendations]);
};
// Conductance 초기화 핸들러
const handleResetConductance = () => {
  setConductanceList([]); // conductanceList를 빈 배열로 설정
};

 
  
  // 전체 데이터
  const data = {
    labels: result.map((point) => point.x ), // result의 x 값을 labels로 사용
    datasets: [
      {
        label: "Throughtput (Slm)", // 데이터 세트의 라벨
        data: result.map((point) => point.y), // result의 y 값을 data로 사용
        borderColor: "rgba(9, 11, 254, 10)", // 연한 회색
        backgroundColor: "rgba(9, 11, 254, 10)",
        borderWidth: 2, // 줌 상태에 따라 선 굵기 변경
        pointRadius: 1, // 줌 상태에 따라 점 크기 변경
        pointBackgroundColor: "rgba(9, 11, 254, 10)", // 점 채우기 색상
        pointBorderColor: "rgba(9, 11, 254, 10)", // 점 테두리 색상
        pointHoverRadius: 6, // 마우스 올릴 때 점 크기


      },
      

      
  

      {
        label: 'Target',
        data: [{x:a,y:b}], // 추가할 점의 좌표
        backgroundColor: 'red', // 점의 색상
        borderColor: 'red',
        pointRadius: 3, // 점의 크기
        pointHoverRadius: 8,
        showLine: false, // 선을 그리지 않음
      },


    ],
  };





const targetY = b;
const targetX = a; 
  
const findXForY = (data, targetY) => {
  const xLabels = data.labels; // x축 값
  const yData = data.datasets[0].data; // y축 값

  for (let i = 0; i < yData.length - 1; i++) {
    const y1 = yData[i]; // y축 값
    const y2 = yData[i + 1]; // 다음 y축 값
    const x1 = xLabels[i]; // x축 값
    const x2 = xLabels[i + 1]; // 다음 x축 값

    // targetY가 y1과 y2 사이에 있는지 확인
    if ((y1 <= targetY && targetY <= y2 && y1 != 0 && y2 != 0) || (y2 <= targetY && targetY <= y1 && y1 != 0 && y2 != 0)) {
      // 선형 보간법 공식 적용
      const x = x1 + ((targetY - y1) * (x2 - x1)) / (y2 - y1);
      
      console.log("x1,x2,y1,y2,targety,x",x1,x2,y2,y1,x,targetY);
      
      
      return x; // 근사 x값 반환


    }
  }

  return null; // targetY가 범위 내에 없으면 null 반환




};

const findYForX = (data, targetX) => {
  const xLabels = data.labels; // x축 값
  const yData = data.datasets[0].data; // y축 값

  for (let i = 0; i < xLabels.length - 1; i++) {
    const x1 = xLabels[i];
    const x2 = xLabels[i + 1];
    const y1 = yData[i];
    const y2 = yData[i + 1];

    // targetX가 x1과 x2 사이에 있는지 확인
    if ((x1 <= targetX && targetX <= x2) || (x2 <= targetX && targetX <= x1)) {
      // 선형 보간법 공식 적용
      const y = y1 + ((targetX - x1) * (y2 - y1)) / (x2 - x1);
      return y; // 근사 y값 반환
    }
  }

  return null; // targetX가 범위 내에 없으면 null 반환
};


let cumulativeSum = 0;

const qwerData = useMemo(() => {
  let cumulativeSum = 0;

  return result.map((point, index, arr) => {
    let e = null;
  // e 계산 (마지막 요소 제외)
  if (index < arr.length - 1) {
    const nextX = arr[index + 1].x;

    // 로그 값이 유효한 경우에만 계산
    if (point.y>0 && point.x > 0 && nextX > 0 && point.x / nextX > 0) {
      e = V / (point.y / 60 * 760 /point.x) * Math.log(point.x / nextX);

    } else {
      e = 0; // 로그 값이 유효하지 않으면 e를 0으로 처리
    }
  }

  // 누적합 r 계산
  cumulativeSum += e;

  return {
    q: point.x,       // x 값
    w: point.y,       // y 값
    e: e,             // 계산된 e 값
    r: cumulativeSum, // 누적합 r 값
  };
});  }, [V, result]); // V 값 변경 시 재계

console.log(qwerData);


  const qweChartData = {

    
  
    labels: qwerData.map((item) => item.r), // r를 x축 값으로 사용
    datasets: [
      {
        label: "Tact time graph", // 새로운 데이터셋
        data: qwerData.map((item) => ({
          x: item.r,
          y: item.q,
        })),
        borderColor: "rgba(9, 11, 254, 10)", // 연한 회색
        backgroundColor: "rgba(9, 11, 254, 10)",
        borderWidth: 2, // 줌 상태에 따라 선 굵기 변경
        pointRadius: 1, // 줌 상태에 따라 점 크기 변경
        pointBackgroundColor: "rgba(9, 11, 254, 10)", // 점 채우기 색상
        pointBorderColor: "rgba(9, 11, 254, 10)", // 점 테두리 색상
        pointHoverRadius: 6, // 마우스 올릴 때 점 크

      },
    ],
  };






  
  // 예제 데이터
   
  const resultX = findXForY(data, targetY);
  console.log("targety" , targetY,resultX)
  console.log(`y=${targetY}에 해당하는 x 값은 ${resultX}입니다.`);
  const roundedx = Math.round(resultX * 100) / 100; // 둘째 자리 반올림
  const ansxx= (targetX-roundedx)/(roundedx)*100; 
  const ansx= Math.round(ansxx * 100) / 100;
  console.log("pressure margin 확인 :  ", ansx,targetX,roundedx )


  const resultY = findYForX(data, targetX);
  console.log(`x=${targetX}에 해당하는 y 값은 ${resultY}입니다.`);
  const roundedy = Math.round(resultY * 100) / 100; // 둘째 자리 반올림
  const ansyy= (roundedy-targetY)/(roundedy)*100;
  const ansy= Math.round(ansyy * 100) / 100;




  const options = {
       plugins: {


      zoom: {
        pan: {
          enabled: true, // 드래그로 이동
          mode: 'x', // x축으로만 이동
        },
        zoom: {
          wheel: {
            enabled: true, // 마우스 휠 줌 활성화
          },
          pinch: {
            enabled: true, // 터치 핀치 줌 활성화
          },
          mode: 'x', // x축 줌만 활성화
        },
       
      },

      



    },


    scales: {
      x: {
        type: xLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: "Presure (Torr)",
        },
        
      },
      y: {
        type: yLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: "Throughput (SLM)",
        },
      },
    },
    
    responsive: true,
    maintainAspectRatio: false,
  };

  
  const optionsSecondChart = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Time (Second)", // 두 번째 그래프의 x축 레이블
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Pressure (Torr)", // 두 번째 그래프의 y축 레이블
        },
      },
    },
  };

  
 
  //const margin = {(a-conditionx)/100}    



  // Conductance 추가 핸들러
  const handleAddConductance = () => {
    if (!type || !length || !diameter) {
      alert("종류, 길이, 직경을 모두 입력하세요.");
      return;
    }



    const newConductance = {
      type,
      description: `L=${length}cm, D=${diameter}cm`,
    };

    setConductanceList([...conductanceList, newConductance]);
    setType(""); // 입력 필드 초기화
    setLength("");
    setDiameter("");
  };

  const payload = {
    a: parseFloat(a), // 숫자
    b: parseFloat(b), // 숫자
    pump: d,
    conductance: conductanceList,          // 문자열
      };

  // 줌 리셋 기능
 


  // 데이터 전송 핸들러
  const handleCalculate = async () => {
    try {
      const response = await fetch("http://12.54.70.125:8000/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          a: parseFloat(a),
          b: parseFloat(b),
          pump: d,
          conductance: conductanceList,
        }),
      });
      

      // log 확인 
   

      



      if (response.ok) {
        const result = await response.json();
        console.log("받은 데이터:", result); // 응답 로그 확인
        setResult(result); // 결과 저장
        // test
        console.log("Received Result:",result)
        console.log(Array.isArray(result)); // true라면 배열
        console.log("데이터 길이:", result.length); // 데이터 길이 확인
        console.log("type",type.result)
        


       




      } else {
        console.error("서버 오류:", response.statusText);
      }
    } catch (error) {
      console.error("네트워크 오류:", error);
    }
  };

      // 버튼 클릭 핸들러
const toggleXLogScale = () => setXLogScale((prev) => !prev);
const toggleYLogScale = () => setYLogScale((prev) => !prev);

const resetZoom = () => {
  if (chartRef.current) {
    chartRef.current.resetZoom();
  }
};


  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "950px",
        margin: "0 auto",
        padding: "100px",
        backgroundColor: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        //overflow: "hidden", // 음영 바깥으로 삐져나오는 그래프 방지
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#333",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Mg Pumping Simulation 
      </h1>
      <h3
        style={{
          textAlign: "Right",
          color: "#333",
          fontSize: "15px",
          fontWeight: "bold",
        }}
      >
        제작 :고명국님
         </h3>
      <h3
        style={{
          textAlign: "Right",
          marginRight : "1px",
          color: "#333",
          fontSize: "10px",
          
        }}
      >
        Contributor 조재영님
      </h3>


      {/* Conductance 입력 */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#666", marginBottom: "10px" }}>Conductance 입력</h3>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "30%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">종류 선택</option>
          <option value="Circular Type">Circular Type</option>
        </select>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="길이 (cm)"
          style={{
            display :  "block",
            padding: "10px",
            marginBottom: "10px",
            width: "50%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="number"
          value={diameter}
          onChange={(e) => setDiameter(e.target.value)}
          placeholder="직경 (cm)"
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "50%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleAddConductance}
          style={{
            padding: "10px",
            backgroundColor: "#6482FF",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            border: "none",
          }}
        >
          Conductance 추가
        </button>
      </div>


      {/* 추천 */}
      <div
  style={{
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <h3 style={{ color: "#666", marginBottom: "10px" }}>추천 Conductance 입력</h3>
  <button
    onClick={() =>
      handleAddRecommendedConductance([
        { type: "Recommended", description: "L=100cm, D=10cm" },
        { type: "Recommended", description: "L=1000cm, D=20cm" },
      ])
    }
    style={{
      padding: "10px",
      backgroundColor: "#4CAF50",
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "5px",
      cursor: "pointer",
      width: "80%",
      border: "none",
    }}
  >
    추천 Conductance / (설비배관 : L=100cm, D=10cm) + (배기 배관 : L=1000cm, D=20cm) / 추가
  </button>
</div>
      

      {/* Conductance 리스트 */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            marginBottom: "10px",
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {conductanceList.length > 0
            ? `${conductanceList.length} Conductance series`
            : "입력한 Conductance"}
        </h3>
        <ul style={{ paddingLeft: "20px", color: "#555" }}>
          {conductanceList.map((item, index) => (
            <li key={index}>{item.type} - {item.description}</li>
          ))}
        </ul>
      </div>

      {/*초기화버튼추가*/}
<div
  style={{
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <h3 style={{ color: "#666", marginBottom: "10px" }}>Conductance 초기화</h3>
  <button
    onClick={handleResetConductance}
    style={{
      padding: "10px",
      backgroundColor: "#FF6F61",
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "5px",
      cursor: "pointer",
      width: "18%",
      border: "none",
    }}
  >
    Conductance 초기화
  </button>
</div>


      {/* Pump 모델 */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#666", marginBottom: "10px" }}>Pump 모델 선택</h3>
        <select
          value={d}
          onChange={(e) => setD(e.target.value)}
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Pump model 선택</option>
          <option value="ESA100WN_H2">ESA100WN_H2</option>
          <option value="ESA100WN_N2">ESA100WN_N2</option>
          <option value="ESA200W">ESA200W</option>
          <option value="ESA500W">ESA500W</option>
          <option value="IXH3050H">IXH3050H</option>
          <option value="ESA100WN_N2">ESA100WN_N2</option>
<option value="ESA200W">ESA200W</option>
<option value="ESA500W">ESA500W</option>
<option value="ESR1283XT-LT">ESR1283XT-LT</option>
<option value="PEB200k_Pre">PEB200k_Pre</option>
<option value="ESR201W-LT">ESR201W-LT</option>
<option value="ESR500W-LT">ESR500W-LT</option>
<option value="EST300WN">EST300WN</option>
<option value="EST301WN-BME-HN">EST301WN-BME-HN</option>
<option value="EST500WN">EST500WN</option>
<option value="EST500WN_BM_HN">EST500WN_BM_HN</option>
<option value="EST500WN-BBME-HN">EST500WN-BBME-HN</option>
<option value="EST500WN-XHN">EST500WN-XHN</option>
<option value="EST801WN-XHN">EST801WN-XHN</option>
<option value="EST1201WN-XHN">EST1201WN-XHN</option>
<option value="EST1204WN-X2HN">EST1204WN-X2HN</option>
<option value="EST1684TN-X2HN">EST1684TN-X2HN</option>
<option value="EV_S200N">EV_S200N</option>
<option value="EV-M202N">EV-M202N</option>
<option value="EV-M225NS-BME-HN">EV-M225NS-BME-HN</option>
<option value="EV-M302N">EV-M302N</option>
<option value="EV-M352NS-BE">EV-M352NS-BE</option>
<option value="EV-M502N">EV-M502N</option>
<option value="EV_M502N_H2">EV_M502N_H2</option>
<option value="EV_M502N_N2">EV_M502N_N2</option>
<option value="EV_M502NS-BE-HN">EV_M502NS-BE-HN</option>
<option value="EV_M505SF-BME-HN-4200RPM">EV_M505SF-BME-HN-4200RPM</option>
<option value="EV_M505SF-BME-HN-7000RPM">EV_M505SF-BME-HN-7000RPM</option>
<option value="EV_M505SF-B3MME-HN">EV_M505SF-B3MME-HN</option>
<option value="EV-M805SF-B3MME-HN">EV-M805SF-B3MME-HN</option>
<option value="EV-M1205SF-B3MME-HN">EV-M1205SF-B3MME-HN</option>
<option value="EST1684TN-X2HN">EST1684TN-X2HN</option>
<option value="EV-M1685TSF-B6MME-HN">EV-M1685TSF-B6MME-HN</option>
<option value="EV-S100P">EV-S100P</option>
<option value="EV-S20">EV-S20</option>
<option value="EPX500">EPX500</option>
<option value="IGX100L">IGX100L</option>
<option value="IGX600L">IGX600L</option>
<option value="IH1000">IH1000</option>
<option value="IH1800_H2">iH1800_H2</option>
<option value="IH1800_N2">iH1800_N2</option>
<option value="iH600">iH600</option>
<option value="IXH1220H_H2">iXH1220H_H2</option>
<option value="IXH1220H_N2">iXH1220H_N2</option>
<option value="IXH1220HT">IXH1220HT</option>
<option value="IXH1220HTX">iXH1220HTX</option>
<option value="IXH1220HTXS">iXH1220HTXS</option>
<option value="iXH1220HTXS XD+">iXH1220HTXS XD+</option>
<option value="IXH1820">IXH1820</option>
<option value="IXH1820H">iXH1820H</option>
<option value="IXH1820HTX">iXH1820HTX</option>
<option value="IXH3030T">IXH3030T</option>
<option value="IXH3045H">IXH3045H</option>
<option value="IXH3050H">IXH3050H</option>
<option value="IXH3050HTX_H2">iXH3050HTX_H2</option><option value="IXH3050HTX_N2">iXH3050HTX_N2</option>
<option value="IXH3050HTXS">IXH3050HTXS</option>
<option value="IXH4550HT">IXH4550HT</option>
<option value="IXH4550">iXH4550</option>
<option value="IXH4550">IXH4550</option>
<option value="IXH6050H">IXH6050H</option>
<option value="IXH6050HT">IXH6050HT</option>
<option value="IXH6050HT_N2">IXH6050HT_N2</option>
<option value="iXH6050HTX_H2">iXH6050HTX_H2</option>
<option value="IXH6050HTXS">IXH6050HTXS</option>
<option value="IXH610">IXH610</option>
<option value="IXL120">IXL120</option>
<option value="iXL200">iXL200</option>
<option value="IXL600">IXL600</option>
<option value="IXL1000N">IXL1000N</option>
<option value="IXL250Q">IXL250Q</option>
<option value="IXL500Q">IXL500Q</option>
<option value="IXM1200">IXM1200</option>
<option value="IXM1200_H2">iXM1200_H2</option>
<option value="IM1200_N2">iXM1200_N2</option>
<option value="IXM1800XD+">IXM1800XD+</option>
<option value="IXM3000">IXM3000</option>
<option value="MU100X">MU100X</option>
<option value="MU180X">MU180X</option>
<option value="MU300X">MU300X</option>
<option value="MU600X">MU600X</option>
<option value="MU600X">MU600X</option>
<option value="SDE1203">SDE1203</option>
<option value="SDE1203TX">SDE1203TX</option>
<option value="SDX1200">SDX1200</option>
<option value="SDT1800">SDT1800</option>
<option value="SDH3000">SDH3000</option>
        </select>


      </div>

      {/* Target Pressure and Flowrate */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#666", marginBottom: "10px" }}>공정조건 입력</h3>
        <input
          type="number"
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="target pressure (torr)"
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "80%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="number"
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="target flow (slm)"
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "80%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleCalculate}
          style={{
            padding: "10px",
            backgroundColor: "#FF6F61",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            border: "none",
          }}
        >
          계산
        </button>
        </div>
    

    
        <div style={{ position: 'relative', height: '500px', width: '100%' }}>



      <h3>Pump Throughtput 그래프</h3>

      <Line ref={chartRef} data={data} options={options} />
      
      {/* 버튼 */}
      <div
        style={{
          
          position: "absolute",
          bottom: "10px",
          right: "-84px",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          gap: "10px",
        }}
      >
         <button
          onClick={toggleXLogScale}
          style={{
            left: "100px", // 왼쪽에서 100px 떨어진 위치
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "#333",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        >
          {xLogScale ? "X: Linear" : "X: Log"}
        </button>
        <button
          onClick={toggleYLogScale}
          style={{
            rigt: "100px", // 왼쪽에서 100px 떨어진 위치
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "#333",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        >
          {yLogScale ? "Y: Linear" : "Y: Log"}
        </button>
        <button onClick={resetZoom} 
        style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "#333",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}>
        
        
        
        줌 리셋
      </button>
       
      </div>
          
      
      <button
          
          style={{
            marginRight: "30px", 
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "rgba(0, 0, 0, 1)",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        >
          Pressure margin : {ansx} %
        </button>

        <button
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "rgba(0, 0, 0, 1)",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        >
          Throughput margin : {ansy} %
        </button>
        

{/*합불판정*/}
       <button
          style={{
            margin: "30px",
            marginRight: "30px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "rgba(0, 0, 255, 1)",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        >
         {ansx > 30 ? "Pressure margin 합격" : "Pressure margin 불합격"}    
        </button>
      

{/*합불판정*/}
       <button
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#f5f5f7",
            color: "rgba(0, 0, 255, 1)",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        >
            {ansy > 30 ? "Throughput margin 합격" : "Throughput margin 불합격"}
        </button>
     



    </div>
       

    


       
          {/* 두 번째 차트 */}



          
          
  <div style={{ position: "relative", height: "400px", width: "100%", marginTop: "200px" }}>
    <h3>Tact Time 그래프</h3>


    <label
      htmlFor="volume-input"
      style={{
        display: "block",
        marginBottom: "5px",
        fontSize: "14px",
        color: "#555",
      }}
    >
      Enter the volume (V) in liters:
    </label>


{/* volume 넣기 */}

    <input
  type="number"
  placeholder="Volume (L)"
  style={{
    width: "10%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "16px",
    color: "#333",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }}


  
  onFocus={(e) =>
    (e.target.style.borderColor = "#007aff") &&
    (e.target.style.boxShadow = "0 0 5px rgba(0, 122, 255, 0.5)")
  }
  onBlur={(e) =>
    (e.target.style.borderColor = "#ddd") &&
    (e.target.style.boxShadow = "inset 0 1px 3px rgba(0, 0, 0, 0.1)")
  }

  value={V}
  onChange={(e) => setV(Number(e.target.value))}
  placeholder="Enter Volume"


/>


    <Line data={qweChartData} options={optionsSecondChart} />
  </div>
  import React, { useMemo, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale ,
  registerables,
} from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
import "./App.css";
ChartJS.register(...registerables, zoomPlugin);


ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);




function App() {
  const [a, setA] = useState(""); // Target pressure
  const [b, setB] = useState(""); // Target flowrate
  const [d, setD] = useState(""); // Pump model
  const [result, setResult] = useState([{x: 0.1, y:10},{x:0.2, y:20}]); // 결과 데이터
  const [type, setType] = useState(""); // 종류
  const [length, setLength] = useState(""); // 길이
  const [diameter, setDiameter] = useState(""); // 직경
  const [conductanceList, setConductanceList] = useState([]); // Conductance 리스트
  const [xLogScale, setXLogScale] = useState(false); // x축 로그 스케일 상태
  const [yLogScale, setYLogScale] = useState(false); // y축 로그 스케일 상태
  const chartRef = useRef(null);
  
  const [V, setV] = useState(100); // 부피 V 초기값


  const point = { x: a, y: b }; // 기준점
  const marginPercent = 0.2; // 마진 비율 (20%)

  const marginX = point.x * marginPercent; // x축 마진
  const marginY = point.y * marginPercent; // y축 마진
  console.log(marginX,marginY)
  
// 추천 Conductance 추가 핸들러
const handleAddRecommendedConductance = (recommendations) => {
  // 기존 리스트에 추천 Conductance 항목 추가
  setConductanceList([...conductanceList, ...recommendations]);
};
// Conductance 초기화 핸들러
const handleResetConductance = () => {
  setConductanceList([]); // conductanceList를 빈 배열로 설정
};

 
  
  // 전체 데이터
  const data = {
    labels: result.map((point) => point.x ), // result의 x 값을 labels로 사용
    datasets: [
      {
        label: "Throughtput (Slm)", // 데이터 세트의 라벨
        data: result.map((point) => point.y), // result의 y 값을 data로 사용
        borderColor: "rgba(9, 11, 254, 10)", // 연한 회색
        backgroundColor: "rgba(9, 11, 254, 10)",
        borderWidth: 2, // 줌 상태에 따라 선 굵기 변경
        pointRadius: 1, // 줌 상태에 따라 점 크기 변경
        pointBackgroundColor: "rgba(9, 11, 254, 10)", // 점 채우기 색상
        pointBorderColor: "rgba(9, 11, 254, 10)", // 점 테두리 색상
        pointHoverRadius: 6, // 마우스 올릴 때 점 크기


      },
      

      
  

      {
        label: 'Target',
        data: [{x:a,y:b}], // 추가할 점의 좌표
        backgroundColor: 'red', // 점의 색상
        borderColor: 'red',
        pointRadius: 3, // 점의 크기
        pointHoverRadius: 8,
        showLine: false, // 선을 그리지 않음
      },


    ],
  };





const targetY = b;
const targetX = a; 
  
const findXForY = (data, targetY) => {
  const xLabels = data.labels; // x축 값
  const yData = data.datasets[0].data; // y축 값

  for (let i = 0; i < yData.length - 1; i++) {
    const y1 = yData[i]; // y축 값
    const y2 = yData[i + 1]; // 다음 y축 값
    const x1 = xLabels[i]; // x축 값
    const x2 = xLabels[i + 1]; // 다음 x축 값

    // targetY가 y1과 y2 사이에 있는지 확인
    if ((y1 <= targetY && targetY <= y2 && y1 != 0 && y2 != 0) || (y2 <= targetY && targetY <= y1 && y1 != 0 && y2 != 0)) {
      // 선형 보간법 공식 적용
      const x = x1 + ((targetY - y1) * (x2 - x1)) / (y2 - y1);
      
      console.log("x1,x2,y1,y2,targety,x",x1,x2,y2,y1,x,targetY);
      
      
      return x; // 근사 x값 반환


    }
  }

  return null; // targetY가 범위 내에 없으면 null 반환




};

const findYForX = (data, targetX) => {
  const xLabels = data.labels; // x축 값
  const yData = data.datasets[0].data; // y축 값

  for (let i = 0; i < xLabels.length - 1; i++) {
    const x1 = xLabels[i];
    const x2 = xLabels[i + 1];
    const y1 = yData[i];
    const y2 = yData[i + 1];

    // targetX가 x1과 x2 사이에 있는지 확인
    if ((x1 <= targetX && targetX <= x2) || (x2 <= targetX && targetX <= x1)) {
      // 선형 보간법 공식 적용
      const y = y1 + ((targetX - x1) * (y2 - y1)) / (x2 - x1);
      return y; // 근사 y값 반환
    }
  }

  return null; // targetX가 범위 내에 없으면 null 반환
};


let cumulativeSum = 0;

const qwerData = useMemo(() => {
  let cumulativeSum = 0;

  return result.map((point, index, arr) => {
    let e = null;
  // e 계산 (마지막 요소 제외)
  if (index < arr.length - 1) {
    const nextX = arr[index + 1].x;

    // 로그 값이 유효한 경우에만 계산
    if (point.y>0 && point.x > 0 && nextX > 0 && point.x / nextX > 0) {
      e = V / (point.y / 60 * 760 /point.x) * Math.log(point.x / nextX);

    } else {
      e = 0; // 로그 값이 유효하지 않으면 e를 0으로 처리
    }
  }

  // 누적합 r 계산
  cumulativeSum += e;

  return {
    q: point.x,       // x 값
    w: point.y,       // y 값
    e: e,             // 계산된 e 값
    r: cumulativeSum, // 누적합 r 값
  };
});  }, [V, result]); // V 값 변경 시 재계

console.log(qwerData);


  const qweChartData = {

    
  
    labels: qwerData.map((item) => item.r), // r를 x축 값으로 사용
    datasets: [
      {
        label: "Tact time graph", // 새로운 데이터셋
        data: qwerData.map((item) => ({
          x: item.r,
          y: item.q,
        })),
        borderColor: "rgba(9, 11, 254, 10)", // 연한 회색
        backgroundColor: "rgba(9, 11, 254, 10)",
        borderWidth: 2, // 줌 상태에 따라 선 굵기 변경
        pointRadius: 1, // 줌 상태에 따라 점 크기 변경
        pointBackgroundColor: "rgba(9, 11, 254, 10)", // 점 채우기 색상
        pointBorderColor: "rgba(9, 11, 254, 10)", // 점 테두리 색상
        pointHoverRadius: 6, // 마우스 올릴 때 점 크

      },
    ],
  };






  
  // 예제 데이터
   
  const resultX = findXForY(data, targetY);
  console.log("targety" , targetY,resultX)
  console.log(`y=${targetY}에 해당하는 x 값은 ${resultX}입니다.`);
  const roundedx = Math.round(resultX * 100) / 100; // 둘째 자리 반올림
  const ansxx= (targetX-roundedx)/(roundedx)*100; 
  const ansx= Math.round(ansxx * 100) / 100;
  console.log("pressure margin 확인 :  ", ansx,targetX,roundedx )


  const resultY = findYForX(data, targetX);
  console.log(`x=${targetX}에 해당하는 y 값은 ${resultY}입니다.`);
  const roundedy = Math.round(resultY * 100) / 100; // 둘째 자리 반올림
  const ansyy= (roundedy-targetY)/(roundedy)*100;
  const ansy= Math.round(ansyy * 100) / 100;




  const options = {
       plugins: {


      zoom: {
        pan: {
          enabled: true, // 드래그로 이동
          mode: 'x', // x축으로만 이동
        },
        zoom: {
          wheel: {
            enabled: true, // 마우스 휠 줌 활성화
          },
          pinch: {
            enabled: true, // 터치 핀치 줌 활성화
          },
          mode: 'x', // x축 줌만 활성화
        },
       
      },

      



    },


    scales: {
      x: {
        type: xLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: "Presure (Torr)",
        },
        
      },
      y: {
        type: yLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: "Throughput (SLM)",
        },
      },
    },
    
    responsive: true,
    maintainAspectRatio: false,
  };

  
  const optionsSecondChart = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Time (Second)", // 두 번째 그래프의 x축 레이블
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Pressure (Torr)", // 두 번째 그래프의 y축 레이블
        },
      },
    },
  };

  
 
  //const margin = {(a-conditionx)/100}    



  // Conductance 추가 핸들러
  const handleAddConductance = () => {
    if (!type || !length || !diameter) {
      alert("종류, 길이, 직경을 모두 입력하세요.");
      return;
    }



    const newConductance = {
      type,
      description: `L=${length}cm, D=${diameter}cm`,
    };

    setConductanceList([...conductanceList, newConductance]);
    setType(""); // 입력 필드 초기화
    setLength("");
    setDiameter("");
  };

  const payload = {
    a: parseFloat(a), // 숫자
    b: parseFloat(b), // 숫자
    pump: d,
    conductance: conductanceList,          // 문자열
      };

  // 줌 리셋 기능
 


  // 데이터 전송 핸들러
  const handleCalculate = async () => {
    try {
      const response = await fetch("http://12.54.70.125:8000/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          a: parseFloat(a),
          b: parseFloat(b),
          pump: d,
          conductance: conductanceList,
        }),
      });
      

      // log 확인 
   

      



      if (response.ok) {
        const result = await response.json();
        console.log("받은 데이터:", result); // 응답 로그 확인
        setResult(result); // 결과 저장
        // test
        console.log("Received Result:",result)
        console.log(Array.isArray(result)); // true라면 배열
        console.log("데이터 길이:", result.length); // 데이터 길이 확인
        console.log("type",type.result)
        


       




      } else {
        console.error("서버 오류:", response.statusText);
      }
    } catch (error) {
      console.error("네트워크 오류:", error);
    }
  };

      // 버튼 클릭 핸들러
const toggleXLogScale = () => setXLogScale((prev) => !prev);
const toggleYLogScale = () => setYLogScale((prev) => !prev);

const resetZoom = () => {
  if (chartRef.current) {
    chartRef.current.resetZoom();
  }
};


  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "950px",
        margin: "0 auto",
        padding: "100px",
        backgroundColor: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        //overflow: "hidden", // 음영 바깥으로 삐져나오는 그래프 방지
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#333",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Mg Pumping Simulation 
      </h1>
      <h3
        style={{
          textAlign: "Right",
          color: "#333",
          fontSize: "15px",
          fontWeight: "bold",
        }}
      >
        제작 :고명국님
         </h3>
      <h3
        style={{
          textAlign: "Right",
          marginRight : "1px",
          color: "#333",
          fontSize: "10px",
          
        }}
      >
        Contributor 조재영님
      </h3>


      {/* Conductance 입력 */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#666", marginBottom: "10px" }}>Conductance 입력</h3>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "10px",
            marginBottom: "10px",
            width: "30%",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">종류 선택</option>
          <option value="Circular Type">Circular Type</option>
        </select>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="길이 (cm)"
          style={{
            display :  "block",
            padding: "10px",
            marginBottom: "10px",
            width: "50%",
           
