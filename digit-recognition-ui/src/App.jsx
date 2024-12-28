import React, { useState, useRef, useEffect } from 'react';

const PredictionLog = ({ data }) => (
  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs font-mono h-72 overflow-auto shadow-sm scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {data.map((log, i) => (
      <div key={i} className="flex items-start gap-2 mb-1">
        <span className="text-gray-400">{log.time}</span>
        <span className={`text-${log.type === 'error' ? 'red' : 'emerald'}-600`}>
          {log.message}
        </span>
      </div>
    ))}
  </div>
);

// Update MetricsPanel component with black/white theme
const MetricsPanel = ({ prediction }) => {
  const maxConfidence = prediction ? Math.max(...prediction) * 100 : 0;
  const predictedDigit = prediction ? prediction.indexOf(Math.max(...prediction)) : null;
  const entropy = prediction ? prediction.reduce((acc, p) => {
    if (p === 0) return acc;
    return acc - (p * Math.log2(p));
  }, 0) : 0;

  return (
    <div className="grid grid-cols-3 gap-3 text-xs">
      <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
        <div className="text-gray-500 mb-1">Confidence</div>
        <div className="text-xl font-bold text-gray-600">
          {maxConfidence.toFixed(1)}%
        </div>
      </div>
      <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
        <div className="text-gray-500 mb-1">Prediction</div>
        <div className="text-xl font-bold text-gray-600">
          {predictedDigit ?? '-'}
        </div>
      </div>
      <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
        <div className="text-gray-500 mb-1">Entropy</div>
        <div className="text-xl font-bold text-gray-600">
          {entropy.toFixed(3)}
        </div>
      </div>
    </div>
  );
};

const ConfidenceChart = ({ prediction }) => {
  if (!prediction) return null;
  
  const maxValue = Math.max(...prediction);
  
  return (
    <div className="flex items-end h-24 gap-1">
      {prediction.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-emerald-500 rounded-t"
            style={{ 
              height: `${(value / maxValue) * 100}%`,
              opacity: value * 0.8 + 0.2
            }}
          />
          <div className="text-xs mt-1 text-gray-600">{i}</div>
        </div>
      ))}
    </div>
  );
};


const DigitRecognition = () => {
  const [activations, setActivations] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [logs, setLogs] = useState([]);
  const canvasRef = useRef(null);
  const predictTimeoutRef = useRef(null);
  const lastPredictTimeRef = useRef(0);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
    setLogs(prev => [...prev.slice(-50), { time, message, type }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    addLog('System initialized');

    return () => {
      if (predictTimeoutRef.current) {
        cancelAnimationFrame(predictTimeoutRef.current);
      }
    };
  }, []);

  const predictDrawing = async () => {
    const now = Date.now();
    if (now - lastPredictTimeRef.current < 33) {
      predictTimeoutRef.current = requestAnimationFrame(predictDrawing);
      return;
    }

    try {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/png');
      
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      
      if (!response.ok) {
        throw new Error('Prediction failed');
      }
      
      const data = await response.json();
      if (data.prediction && data.activations) {
        setActivations(data.activations);
        setPrediction(data.prediction[0]);
        addLog(`Predicted: ${data.prediction[0].indexOf(Math.max(...data.prediction[0]))}`);
      }
      
      lastPredictTimeRef.current = now;
      
      if (isDrawing) {
        predictTimeoutRef.current = requestAnimationFrame(predictDrawing);
      }
    } catch (error) {
      console.error('Error:', error);
      addLog(error.message, 'error');
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    addLog('Started drawing');
    predictDrawing();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (predictTimeoutRef.current) {
      cancelAnimationFrame(predictTimeoutRef.current);
    }
    addLog('Finished drawing');
    predictDrawing();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setActivations(null);
    setPrediction(null);
    addLog('Canvas cleared');
  };

  // Update NetworkGraph component with black/white/green theme
const NetworkGraph = React.memo(({ activations, prediction }) => {
  const getColor = (value = 0) => {
    const intensity = Math.min(Math.max(value * 255, 0), 255);
    return `rgb(71, 85, 105, ${intensity / 255})`; // slate-600
  };


  const getOpacity = (value = 0) => {
    return Math.min(Math.max(Math.abs(value), 0.1), 1);
  };

  const layers = [
    { name: 'Input', values: activations?.[0]?.[0]?.slice(0, 10) || new Array(10).fill(0) },
    { name: 'Hidden 1', values: activations?.[1]?.[0]?.slice(0, 10) || new Array(10).fill(0) },
    { name: 'Hidden 2', values: activations?.[2]?.[0]?.slice(0, 10) || new Array(10).fill(0) },
    { name: 'Output', values: prediction || new Array(10).fill(0) }
  ];

  return (
    <svg viewBox="50 0 1180 600" className="w-full h-full">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Connections */}
      {layers.slice(0, -1).map((layer, layerIndex) => (
        <g key={`connections-${layerIndex}`}>
          {layer.values?.map((_, i) => (
            layers[layerIndex + 1].values?.map((nextValue, j) => (
              <line
                key={`connection-${layerIndex}-${i}-${j}`}
                x1={250 + layerIndex * 250}
                y1={100 + i * 45}
                x2={250 + (layerIndex + 1) * 250}
                y2={100 + j * 45}
                stroke="rgb(75, 85, 99)" // gray-600
                strokeOpacity={getOpacity(nextValue) * 0.3}
                strokeWidth={1}
                style={{
                  transition: 'stroke-opacity 0.05s ease-out'
                }}
              />
            ))
          ))}
        </g>
      ))}


        {/* Nodes */}
        {layers.map((layer, layerIndex) => (
          <g key={`layer-${layerIndex}`}>
            <text
              x={250 + layerIndex * 250}
              y={50}
              textAnchor="middle"
              className="fill-gray-600 text-xs font-medium"
            >
              {layer.name}
            </text>
            {layer.values?.map((value, i) => (
              <g key={`node-${layerIndex}-${i}`}>
                <circle
                  cx={250 + layerIndex * 250}
                  cy={100 + i * 45}
                  r={16}
                  fill={getColor(value)}
                  filter="url(#glow)"
                  style={{
                    transition: 'fill 0.05s ease-out'
                  }}
                />
                {layerIndex === 3 && (
                  <text
                    x={290 + layerIndex * 250}
                    y={105 + i * 45}
                    className="fill-gray-600 text-xs"
                  >
                    {i}: {(value * 100).toFixed(1)}%
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
      </svg>
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-3">
      <div className="flex gap-3">
        <div className="w-1/4 flex flex-col gap-3">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">Input Canvas</h2>
            <div className="flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="border border-gray-200 rounded-lg mb-3 bg-black"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
              />
              <button
                onClick={clearCanvas}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm rounded transition-colors border border-gray-300"
              >
                Clear Canvas
              </button>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">Metrics</h2>
            <MetricsPanel prediction={prediction} />
          </div>

          {/* System Logs */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex-1">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">System Logs</h2>
            <PredictionLog data={logs} />
          </div>
        </div>

        {/* Right Panel (75%) */}
        <div className="w-3/4 flex flex-col gap-3">
          {/* Network Visualization */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex-1">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">Neural Network Architecture</h2>
            <div className="h-[calc(100%-2rem)]">
              <NetworkGraph
                activations={activations}
                prediction={prediction}
              />
            </div>
          </div>

          {/* Confidence Distribution */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">Confidence Distribution</h2>
            <ConfidenceChart prediction={prediction} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitRecognition;