import React, { useState,useRef, useEffect  } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,ReferenceDot } from 'recharts';
import * as d3 from 'd3';
import './App.css';

function App() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [d, setD] = useState('');
  const [result, setResult] = useState([]); // 초기값을 빈 배열로 설정

  const svgRef = useRef();
  const [transform, setTransform] = useState(d3.zoomIdentity);


  const xRange = [0.1,5];
  const yRange = [1,30];

 // D3 zoom 기능 설정
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([1, 5])  // 확대/축소 가능 범위 설정
      .on('zoom', (event) => setTransform(event.transform));
    
    svg.call(zoom);

    console.log("SVG selected:", svgRef.current); // SVG 요소 확인
    console.log("Zoom applied:", zoom);

  }, []);



  const handleCalculate = async () => {
    try {
      const response = await fetch('http://12.54.70.125:8000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: parseFloat(a),
          b: parseFloat(b),
          c: parseFloat(c),
          d

          
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API 응답:', data); // 응답 확인
        setResult(data); // 결과를 상태에 저장

        
  console.log(data) //data type 확인
  // 데이터의 각 요소에서 Pressure 값의 타입 확인하기
  
         // 데이터의 각 요소에서 Pressure 값의 타입 확인하기
      } else {
        console.error('서버 오류:', response.statusText);
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
    }
  };


  return (
    <div className = "App" >
      <h1 style={{ textAlign: 'left', color: '#6482FF' }}>  PCS Pumping Simulation 1.0.0 - alpha </h1>

      <input
        type="number"
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="target pressure (torr)"
      />
      <input
        type="number"
        value={b}
        onChange={(e) => setB(e.target.value)}
        placeholder="target flow (slm)"
      />
      <select value={c} onChange={(e) => setC(e.target.value)}>
      <option value="">Conductance를 선택하세요</option>
      <option value="1600\">1600</option>
      <option value="3000\">3000</option>
      <option value="5000\">5000</option>
      <option value="10000\">10000</option>
      <option value="30000\">30000</option>
      <option value="50000\">50000</option>
      <option value="80000\">80000</option>
      <option value="100000\">100000</option>
      <option value="120000\">120000</option>
      </select>





      <select value={d} onChange={(e) => setD(e.target.value)}>
      <option value="">pump model 을 선택하세요</option>
      <option value="ESA100WN_H2">ESA100WN_H2</option>
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
{/*<option value="SDH3000N (W/HEATER)">SDH3000N (w/ Heater)</option>
<option value="SDH3000N (W/OHEATER)">SDH3000N (w/o Heater)</option>
<option value="SDH6000N (W/HEATER)">SDH6000N (w/ Heater)</option>
<option value="SDH6000N (W/OHEATER)">SDH6000N (w/o Heater)</option>
<option value="SDH6000-MT (W/HEATER)">SDH6000-MT (w/ Heater)</option>
<option value="SDH6000-MT (W/OHEATER)">SDH6000-MT (w/o Heater)</option>*/}

</select>
      <button onClick={handleCalculate}>계산</button>




      {result && !Array.isArray(result) && (
        <h2>결과: {JSON.stringify(result)}</h2>
      )}

<div className="tablestyle">




<h1>Conductance 표준 정의</h1>
<table>
<tbody>
<tr>
  <th>Pumping Speed [L/min]</th>
  <td>1,600</td>
  <td>3,000</td>
  <td>5,000</td>
  <td>10,000</td>
  <td>20,000</td>
  <td>30,000</td>
  <td>50,000</td>
  <td>80,000</td>
  <td>100,000</td>
  <td>120,000</td>
</tr>
</tbody>
<tbody>
<tr>

  <th>Pump inlet [mm]</th>
  <td>50</td>
  <td>50</td>
  <td>50</td>
  <td>80</td>
  <td>100</td>
  <td>160</td>
  <td>160</td>
  <td>160</td>
  <td>200</td>
  <td>250</td>
</tr>
</tbody>
<tbody>
<tr>
  <th>표준배관 직경 [mm]</th>
  <td>50</td>
  <td>50</td>
  <td>50</td>
  <td>80</td>
  <td>100</td>
  <td>150</td>
  <td>150</td>
  <td>150</td>
  <td>200</td>
  <td>250</td>
</tr>
</tbody>
<tbody>
<tr>
  <th>표준배관 길이 [mm]</th>
  <td>2,000</td>
  <td>2,000</td>
  <td>15,000</td>
  <td>15,000</td>
  <td>15,000</td>
  <td>15,000</td>
  <td>15,000</td>
  <td>15,000</td>
  <td>15,000</td>
  <td>15,000</td>
</tr>
</tbody>
<tbody>
<tr>
  <th>표준배관 꺾임 [deg]</th>
  <td>360</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
  <td>90</td>
</tr>
</tbody>

</table>

</div>


{}






{/* 그래프 그리기 */}
{Array.isArray(result) && result.length > 0 && (
         <div >
          <h1 style={{ textAlign: 'left', color: '#6482FF', fontSize: '15px'  }} >Target Pressure : {a}  Target Flowrate : {b} </h1>

         

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={result}>
              <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Pressure"  
                
                ticks={[0.1, 1, 2, 3, 4, 5]}
                padding={{ left: 0, right: 0 }}  // 패딩 제거
                scale="log" 
                label={{ value: "Pressure(torr)", position: "insideBottom", offset: -5 }} />
              <YAxis     domain={yRange}  
              allowDataOverflow={true}
                scale="linear"
                ticks={[1, 10, 20, 50]}  // 표시할 Y축 틱 설정
                padding={{ top: 0, bottom: 0 }}  // 패딩 제거
              label={{ value: "throughput(slm)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              
              <Line type="monotone" dataKey="delivered throughput" stroke="#82ca9d" name="Delivered Throughput" />
              {/*<Line type="monotone" dataKey="delivered speed" stroke="#82ca9d" name="delivered speed" />*/}
              <ReferenceDot 
  x={Number(a)} 
  y={Number(b)} 
  r={8} 
  fill="#3232FF" // 부드러운 파스텔톤 색상
  stroke="#333333" // 세련된 짙은 회색
  strokeWidth={1.5} // 두께 약간 줄임
  label={{ 
    value: `(${a}, ${b})`, 
    position: 'top',
    fontSize: 12, // 작은 글씨로 세련되게
    fill: "#333333", // 텍스트 색상도 회색
    fontWeight: "bold", // 가독성 높임
    fontFamily: "Arial, sans-serif", // 깔끔한 폰트 사용
  }} 
/>

            </LineChart>
          </ResponsiveContainer>

         
          



        </div>
        
     

      )}



<div> 


{/* 그래프 그리기 */}
{Array.isArray(result) && result.length > 0 && (
         <div >
          <h1 style={{ textAlign: 'left', color: '#6482FF', fontSize: '15px'  }} >Target Pressure : {a}  Target Flowrate : {b} </h1>

         

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={result}>
              <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Pressure"  
                
                
                padding={{ left: 0, right: 0 }}  // 패딩 제거
                scale="log" 
                label={{ value: "Pressure(torr)", position: "insideBottom", offset: -5 }} />
              <YAxis     domain={yRange}  
             
                scale="linear"
                ticks={[1, 10, 20, 50]}  // 표시할 Y축 틱 설정
                padding={{ top: 0, bottom: 0 }}  // 패딩 제거
              label={{ value: "throughput(slm)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              
              <Line type="monotone" dataKey="delivered throughput" stroke="#82ca9d" name="Delivered Throughput" />
              {/*<Line type="monotone" dataKey="delivered speed" stroke="#82ca9d" name="delivered speed" />*/}
              <ReferenceDot 
  x={Number(a)} 
  y={Number(b)} 
  r={8} 
  fill="#3232FF" // 부드러운 파스텔톤 색상
  stroke="#333333" // 세련된 짙은 회색
  strokeWidth={1.5} // 두께 약간 줄임
  label={{ 
    value: `(${a}, ${b})`, 
    position: 'top',
    fontSize: 12, // 작은 글씨로 세련되게
    fill: "#333333", // 텍스트 색상도 회색
    fontWeight: "bold", // 가독성 높임
    fontFamily: "Arial, sans-serif", // 깔끔한 폰트 사용
  }} 
/>

            </LineChart>
          </ResponsiveContainer>

         
          



        </div>
        
     

      )}



</div>



      
      {/*
      {/* result가 배열일 때만 테이블 렌더링 *
      {Array.isArray(result) && result.length > 0 && (
        <div>
          <h1>Pumping Throughput</h1>
          <table border="1">
            <thead>
              <tr>
                <th>Pressure (Index)</th>
                <th>Delivered speed </th>
                <th>Delivered Throughput</th>
             
              </tr>
            </thead>
            <tbody>
              {result.map((row, index) => (
                <tr key={index}>
                 
                 

                  <td>{row["Pressure"]}</td>
                  <td>{row["delivered speed"]}</td>
                  <td>{row["delivered throughput"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      }*/}




    </div>
  );
}

export default App;
