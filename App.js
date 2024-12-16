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
} from "chart.js";

import "./App.css";



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

  const initialState = { startX: 0, endX: 1000 }; // 초기 확대 범위
  const [range, setRange] = useState(initialState); // 확대 범위 상태
  const [isDragging, setIsDragging] = useState(false);
  const [box, setBox] = useState(null); // 드래그 박스
  const [xLogScale, setXLogScale] = useState(false); // x축 로그 스케일 상태
  const [yLogScale, setYLogScale] = useState(false); // y축 로그 스케일 상태
  const chartRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false); // 줌 상태 추적


  const handleZoom = () => {
    setIsZoomed(true); // 줌 상태로 설정
  };

  const handleResetZoom = () => {
    setIsZoomed(false); // 줌 상태 해제
  };
  
  // 전체 데이터
  const data = {
    labels: result.map((point) => point.x), // result의 x 값을 labels로 사용
    datasets: [
      {
        label: "Throughtput", // 데이터 세트의 라벨
        data: result.map((point) => point.y), // result의 y 값을 data로 사용
        borderColor: "rgba(211, 211, 211, 10)", // 연한 회색
        backgroundColor: "rgba(253, 245, 230, 10)",
        borderWidth: isZoomed ? 5 : 4, // 줌 상태에 따라 선 굵기 변경
        pointRadius: isZoomed ? 3 : 0.5, // 줌 상태에 따라 점 크기 변경
        pointBackgroundColor: "rgba(255, 99, 132, 1)", // 점 채우기 색상
        pointBorderColor: "rgba(255, 159, 64, 1)", // 점 테두리 색상
        pointHoverRadius: 6, // 마우스 올릴 때 점 크기

      },
    ],
  };
  const options = {
    responsive: true,
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
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

   // 드래그 시작
  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect();
    setIsDragging(true);
    setBox({ x1: e.clientX - rect.left, y1: e.clientY - rect.top, x2: null, y2: null });
  };
   // 드래그 중
   const handleMouseMove = (e) => {
    if (!isDragging || !box) return;
    const rect = e.target.getBoundingClientRect();
    setBox((prev) => ({
      ...prev,
      x2: e.clientX - rect.left,
      y2: e.clientY - rect.top,
    }));
  };

  // 드래그 끝
  const handleMouseUp = (e) => {
    if (!isDragging || !box) return; // 드래그가 활성화되지 않았으면 종료
  
    const chartInstance = chartRef.current?.chartInstance || chartRef.current;
    const chartArea = chartInstance.chartArea;
  
    // 차트 영역 확인
    const { left, right } = chartArea;
  
    // 드래그 박스의 시작/끝 X 좌표 계산
    const startX = Math.min(box.x1, box.x2);
    const endX = Math.max(box.x1, box.x2);
  
    // 드래그 범위가 차트 영역 내에 있는지 확인
    if (startX < left || endX > right) {
      setIsDragging(false);
      setBox(null);
      return; // 드래그 범위가 차트 영역 밖이라면 종료
    }
  
    // 차트의 데이터 범위 계산 (data.labels는 x축 값 배열)
    const dataStart = data.labels[0];
    const dataEnd = data.labels[data.labels.length - 1];
  
    // 드래그 박스의 화면 좌표를 데이터 좌표로 변환
    const newStartX =
      ((startX - left) / (right - left)) * (dataEnd - dataStart) + dataStart;
    const newEndX =
      ((endX - left) / (right - left)) * (dataEnd - dataStart) + dataStart;
  
    // 업데이트된 확대 범위 설정
    setRange({
      startX: newStartX,
      endX: newEndX,
    });
  
    console.log("Calculated range:", { newStartX, newEndX }); // 확인용 로그
    console.log("Box coordinates:", box);
  console.log("Chart area:", chartArea);
  console.log("Data labels:", data.labels);
    console.log("Calculated range:", { newStartX, newEndX });
  
    setIsDragging(false);
    setBox(null); // 드래그 박스 초기화
  };
  
  
  const handleReset = () => {
    setRange(initialState); // 확대 범위를 초기값으로 리셋
  };
  

  // 확대된 데이터
  const zoomedData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      data: range.startX === initialState.startX && range.endX === initialState.endX
        ? dataset.data // 초기 상태: 전체 데이터를 표시
        : dataset.data.filter((point) => point.x >= range.startX && point.x <= range.endX), // 확대 범위 필터링
    })),
  };
  

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
        

        console.log("Dragging box coordinates:", box);
        console.log("Zoomed Data:", zoomedData);
        console.log(chartRef.current)
        console.log("Zoomed range:", range);
        console.log("Zoomed Data (after update):", zoomedData);




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
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "950px",
        margin: "0 auto",
        padding: "100px",
        backgroundColor: "#f5f5f5",
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
        <h3 style={{ color: "#666", marginBottom: "10px" }}>Target 입력</h3>
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
    
          <div
          style={{ position: "relative", width: "600px", height: "400px", margin: "0 auto" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div style={{ position: "relative", width: "600px", height: "400px", margin: "0 auto" }}>

          <Line
  data={{
    labels: zoomedData.labels, // 기존 라벨 유지
    datasets: [
      {
        label: "Line Data", // 선 데이터
        data: zoomedData.datasets[0].data, // 기존 zoomedData에서 데이터 유지
        borderColor: "rgba(0, 122, 255, 1)", // 선 색상
        backgroundColor: "rgba(0, 122, 255, 0.3)", // 배경 색상
        borderWidth: 1,
        pointRadius: 1, // 점 크기
        pointBackgroundColor: "rgba(0, 122, 255, 1)", // 점 색상
      },
      {
        label: "Highlighted Point", // 특정 점
        data: [{ x: a, y: b }], // 특정 점 좌표
        pointBackgroundColor: "rgba(255, 99, 71, 1)", // 점 내부 색상
        pointBorderColor: "rgba(255, 99, 71, 1)", // 점 외부 테두리 색상
        pointRadius: 4, // 점 크기
        showLine: false, // 선 없음
      },
    ],
  }}
  options={options} // 기존 옵션 유지
  ref={chartRef}
/>





  
</div>

          
          
          
          
          {isDragging && box && (
            <div
              style={{
                position: "absolute",
                top: box.y1,
                left: box.x1,
                width: Math.abs(box.x2 - box.x1),
                height: Math.abs(box.y2 - box.y1),
                border: "1px dashed rgba(0, 0, 0, 0.5)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
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
        <button
          onClick={handleReset}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#007aff",
            color: "white",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

  


</div>


  );
}

export default App;
