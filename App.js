import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import "./App.css";


function App() {
  const [a, setA] = useState(""); // Target pressure
  const [b, setB] = useState(""); // Target flowrate
  const [d, setD] = useState(""); // Pump model
  const [result, setResult] = useState([]); // 결과 데이터
  const [type, setType] = useState(""); // 종류
  const [length, setLength] = useState(""); // 길이
  const [diameter, setDiameter] = useState(""); // 직경
  const [conductanceList, setConductanceList] = useState([]); // Conductance 리스트

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
        console.log("Received Result:")
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


        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={result}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              label={{ value: "Pressure (torr)", position: "insideBottom" }}
            />
            <YAxis
              label={{
                value: "Throughput (slm)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="y" stroke="#82ca9d" />
            <ReferenceDot
              x={Number(a)}
              y={Number(b)}
              r={8}
              fill="#3232FF"
              label={{ value: `(${a}, ${b})`, position: "top" }}
            />
          </LineChart>
        </ResponsiveContainer>
  

</div>


  );
}

export default App;
