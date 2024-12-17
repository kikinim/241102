import React, { useState, useRef } from "react";
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
        label: 'Extra Point',
        data: [{x:a,y:b}], // 추가할 점의 좌표
        backgroundColor: 'red', // 점의 색상
        borderColor: 'red',
        pointRadius: 6, // 점의 크기
        pointHoverRadius: 8,
        showLine: false, // 선을 그리지 않음
      },


    ],
  };
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
          text: "Presure_Torr",
        },
        
      },
      y: {
        type: yLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: "Throughput_SLM",
        },
      },
    },
    
    responsive: true,
    maintainAspectRatio: false,
  };

  
  
 
  // 확대된 데이터


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
      console.log(a) ;console.log("61줄까지는돼"); 

      
      console.log("전송 데이터:", payload); // 디버깅용 로그


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
        PCS Pumping Simulation
      </h1>

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
            width: "100%",
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
            padding: "10px",
            marginBottom: "10px",
            width: "80%",
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
            width: "80%",
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
            : "Conductance"}
        </h3>
        <ul style={{ paddingLeft: "20px", color: "#555" }}>
          {conductanceList.map((item, index) => (
            <li key={index}>{item.type} - {item.description}</li>
          ))}
        </ul>
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
          right: "10px",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          gap: "10px",
        }}
      >
         <button
          onClick={toggleXLogScale}
          style={{
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




    </div>
       
        
  


</div>


  );
}

export default App;
