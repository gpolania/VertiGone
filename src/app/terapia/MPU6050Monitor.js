// MPU6050Monitor.jsx
"use client";

import React, { useEffect, useState } from "react";

const MPU6050Monitor = ({ currentPaso }) => {
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [baseURL] = useState(
    process.env.NEXT_PUBLIC_MPU6050_URL || "http://localhost:8000"
  );
  // Estado de conexión  
  const [isConnected, setIsConnected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Leer datos del sensor
  const leerDatos = async () => {
    if (!isFetching) return;
    try {
      const res = await fetch(`${baseURL}/data`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setRoll(json.roll);
      setPitch(json.pitch);
      setYaw(json.yaw);
      setIsConnected(true);
    } catch (e) {
      console.error("Error fetch /data:", e);
      setIsConnected(false);
      setIsFetching(false);
    }
  };

  const resetear = async () => {
    try {
      await fetch(`${baseURL}/reset`, { method: "POST" });
    } catch (e) {
      console.error("Error POST /reset:", e);
    }
  };

  // Resetear cero si el paso lo indica
  useEffect(() => {
    if (isFetching && currentPaso?.resetZero) resetear();
  }, [currentPaso, isFetching]);

  // Ciclo de lectura
  useEffect(() => {
    let id;
    if (isFetching) {
      leerDatos();
      id = setInterval(leerDatos, 100);
    } else {
      clearInterval(id);
      setIsConnected(false);
    }
    return () => clearInterval(id);
  }, [isFetching]);

  const toggleConnection = () => setIsFetching(prev => !prev);

  // Ángulos a mostrar
  const angles = currentPaso?.visibleAngles ?? ["roll", "pitch", "yaw"];
  const target = currentPaso?.anguloObjetivo;

  // Cálculo de progreso con rango prudente
  let progress = null;
  const tolerance = currentPaso?.toleranceDegrees ?? 5; // tolerancia en grados
  let inRange = false;

  if (target != null && angles.length === 1) {
    const axis = angles[0];
    const raw = axis === 'roll' ? roll : axis === 'pitch' ? pitch : yaw;
    const value = Math.round(Math.abs(raw));
    const pct = Math.min(100, Math.round((value / target) * 100));
    progress = { value, pct };
    inRange = (value >= (target - tolerance)) && (value <= (target + tolerance));
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header bg-info text-white">
        <i className="bi bi-wifi me-2"></i>
        Monitor MPU6050 — Paso {currentPaso?.numero}
      </div>
      <div className="card-body">
        <div className="mb-3 d-flex align-items-center">
          <button className={`btn ${isFetching ? 'btn-danger' : 'btn-success'} me-3`} onClick={toggleConnection}>
            {isFetching ? <><span className="spinner-border spinner-border-sm me-2"></span>Desconectar</> : 'Conectar'}
          </button>
          <button className="btn btn-warning" onClick={resetear} disabled={!isConnected}>
            <i className="bi bi-arrow-clockwise me-2"></i>Resetear Cero
          </button>
        </div>

        {isConnected ? (
          <>
            <div className="row">
              {angles.includes('roll') && (
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-header bg-primary text-white"><i className="bi bi-arrow-left-right me-2"></i>Roll</div>
                    <div className="card-body"><h2>{Math.round(Math.abs(roll))}°</h2></div>
                  </div>
                </div>
              )}
              {angles.includes('pitch') && (
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-header bg-success text-white"><i className="bi bi-arrow-up-down me-2"></i>Pitch</div>
                    <div className="card-body"><h2>{Math.round(Math.abs(pitch))}°</h2></div>
                  </div>
                </div>
              )}
              {angles.includes('yaw') && (
                <div className="col-md-4">
                  <div className="card mb-3">
                    <div className="card-header bg-warning text-dark"><i className="bi bi-compass me-2"></i>Yaw</div>
                    <div className="card-body"><h2>{Math.round(Math.abs(yaw))}°</h2></div>
                  </div>
                </div>
              )}
            </div>

            {progress && (
              <div className="mt-3">
                <label>Progreso hacia {target}°:</label>
                <div className="progress">
                  <div
                    className={`progress-bar ${inRange ? 'bg-success' : 'bg-info'}`}
                    role="progressbar"
                    style={{ width: `${progress.pct}%` }}
                    aria-valuenow={progress.value}
                    aria-valuemin={0}
                    aria-valuemax={target}
                  >{progress.value}°</div>
                </div>
                {inRange ? <small className="text-success">En rango óptimo (±{tolerance}°)</small> : null}
              </div>
            )}
          </>
        ) : (
          <p className="text-muted">Presiona "Conectar" para iniciar lectura.</p>
        )}
      </div>
    </div>
  );
};

export default MPU6050Monitor;