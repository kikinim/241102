import React, { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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

const ZoomableChart = () => {
  const initialState = { startX: 0, endX: 1000 }; // 초기 확대 범위
  const [range, setRange] = useState(initialState); // 확대 범위 상태
  const [isDragging, setIsDragging] = useState(false);
  const [box, setBox] = useState(null); // 드래그 박스
  const [xLogScale, setXLogScale] = useState(false); // x축 로그 스케일 상태
  const [yLogScale, setYLogScale] = useState(false); // y축 로그 스케일 상태
  const chartRef = useRef(null);

  // 전체 데이터 (1000 포인트)
  const data = {
    labels: Array.from({ length: 1000 }, (_, i) => (i + 1) / 10), // 0.1, 0.2, ..., 100.0
    datasets: [
      {
        label: "y = x",
        data: Array.from({ length: 1000 }, (_, i) => (i + 1) / 10), // y = x
        borderColor: "rgba(0, 0, 128, 1)", // 네이비색
        backgroundColor: "rgba(0, 0, 128, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  // 드래그 시작
  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect();
    setIsDragging(true);
    setBox({
      x1: e.clientX - rect.left,
      y1: e.clientY - rect.top,
      x2: e.clientX - rect.left,
      y2: e.clientY - rect.top,
    });
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
      const chartInstance = chartRef.current;
      const { left, right } = chartInstance.chartArea;

      // 드래그한 X 범위를 차트 데이터 범위로 변환
      const totalWidth = right - left;
      let startX = Math.max(
        0,
        Math.min(999, Math.round(((Math.min(box.x1, box.x2) - left) / totalWidth) * 1000))
      );
      let endX = Math.max(
        0,
        Math.min(999, Math.round(((Math.max(box.x1, box.x2) - left) / totalWidth) * 1000))
      );

      // 최소 확대 범위를 강제 (최소 10개의 데이터 포인트)
      if (endX - startX < 10) {
        const midpoint = (startX + endX) / 2;
        startX = Math.max(0, Math.round(midpoint - 5));
        endX = Math.min(999, Math.round(midpoint + 5));
      }

      setRange({ startX, endX }); // 확대 범위 설정
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

  // 차트 옵션 (로그 스케일 반영)
  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: xLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: xLogScale ? "Logarithmic Scale (X)" : "Linear Scale (X)",
        },
      },
      y: {
        type: yLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: yLogScale ? "Logarithmic Scale (Y)" : "Linear Scale (Y)",
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", width: "600px", margin: "0 auto" }}>
      {/* 차트 */}
      <div
        style={{ position: "relative", width: "600px", height: "400px", borderRadius: "15px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Line data={zoomedData} ref={chartRef} options={chartOptions} />
        {isDragging && box && (
          <div
            style={{
              position: "absolute",
              top: Math.min(box.y1, box.y2),
              left: Math.min(box.x1, box.x2),
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
};

export default ZoomableChart;
