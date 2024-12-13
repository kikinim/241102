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
} from "chart.js";

import "./App.css";



ChartJS.register(
  CategoryScale,
  LinearScale,
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
        label: "Simulation Data", // 데이터 세트의 라벨
        data: result.map((point) => point.y), // result의 y 값을 data로 사용
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: isZoomed ? 2 : 0.5, // 줌 상태에 따라 선 굵기 변경
        pointRadius: isZoomed ? 3 : 0.5, // 줌 상태에 따라 점 크기 변경
      },
    ],
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
  const handleMouseUp = () => {
    if (box && box.x1 !== null && box.x2 !== null) {
      const startX = Math.min(box.x1, box.x2);
      const endX = Math.max(box.x1, box.x2);

      // x 좌표를 기준으로 범위 계산
      const chartInstance = chartRef.current;
      const totalWidth = chartInstance.chartArea.right - chartInstance.chartArea.left;
      const minX = Math.round((startX / totalWidth) * 100);
      const maxX = Math.round((endX / totalWidth) * 100);

      setRange({ startX: minX, endX: maxX }); // 확대 범위 설정
    }
    setIsDragging(false);
    setBox(null); // 박스 초기화
  };
   // 초기화
   const handleReset = () => {
    setRange(initialState); // 범위 초기화
    setXLogScale(false); // x축 로그 스케일 초기화
    setYLogScale(false); // y축 로그 스케일 초기화
  };

  // 확대된 데이터
  const zoomedData = {
    ...data,
    labels: data.labels.slice(range.startX, range.endX + 1),
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.slice(range.startX, range.endX + 1),
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

    
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "450px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
            width: "100%",
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
            width: "100%",
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
            width: "100%",
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
            width: "100%",
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
          <Line data={zoomedData} ref={chartRef} options={{ responsive: true }} />
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
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setXLogScale((prev) => !prev)}
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
          onClick={() => setYLogScale((prev) => !prev)}
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
