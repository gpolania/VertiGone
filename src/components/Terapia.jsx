// /components/Terapia.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../app/firebase/config";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import CircularTimer from "../app/terapia/CircularTimer";
import MPU6050Monitor from "../app/terapia/MPU6050Monitor";

config.autoAddCss = false;


export default function Terapia() {
    const searchParams = useSearchParams();
    const pacienteId = searchParams.get("pacienteId");
    const router = useRouter();
  
    const [pacienteNombre, setPacienteNombre] = useState("");
    const [terapias, setTerapias] = useState([]);
    const [terapiaSeleccionadaId, setTerapiaSeleccionadaId] = useState("");
    const [pasos, setPasos] = useState([]);
    const [pasoActualIndice, setPasoActualIndice] = useState(0);
    const [anguloRegistrado, setAnguloRegistrado] = useState("");
    const [registrosSesion, setRegistrosSesion] = useState([]);
    const [finalizarVisible, setFinalizarVisible] = useState(false);
    const [tiempoGlobal, setTiempoGlobal] = useState(0);
    const [historialModal, setHistorialModal] = useState(false);
    const [historialData, setHistorialData] = useState([]);
    const [historialLoading, setHistorialLoading] = useState(false);
    const [historialError, setHistorialError] = useState(null);
  
    // Carga el nombre del paciente
    useEffect(() => {
      if (!pacienteId) return;
      (async () => {
        const pacienteRef = doc(db, "pacientes", pacienteId);
        const snap = await getDoc(pacienteRef);
        if (snap.exists()) setPacienteNombre(snap.data().nombre);
      })();
    }, [pacienteId]);
  
    // Carga la lista de terapias disponibles
    useEffect(() => {
      (async () => {
        const snap = await getDocs(collection(db, "terapias"));
        setTerapias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      })();
    }, []);
  
    // Carga los pasos de la terapia seleccionada
    useEffect(() => {
      if (!terapiaSeleccionadaId) return;
      (async () => {
        const terapiaRef = doc(db, "terapias", terapiaSeleccionadaId);
        const snap = await getDoc(terapiaRef);
        if (snap.exists()) {
          setPasos(snap.data().pasos || []);
          setPasoActualIndice(0);
          setRegistrosSesion([]);
          setFinalizarVisible(false);
        }
      })();
    }, [terapiaSeleccionadaId]);
  
    const currentPaso = pasos[pasoActualIndice] || {};
  
    // Maneja registro de ángulo y avance de paso
    const registrarAngulo = () => {
      const registro = {
        paso: pasoActualIndice + 1,
        anguloAlcanzado:
          currentPaso.anguloObjetivo == null ? null : parseFloat(anguloRegistrado),
        tiempo: tiempoGlobal,
        instruccion: currentPaso.instruccion,
        timestamp: Timestamp.now(),
      };
      setRegistrosSesion(prev => [
        ...prev.filter(r => r.paso !== registro.paso),
        registro,
      ]);
      setAnguloRegistrado("");
      setTiempoGlobal(0);
      if (pasoActualIndice < pasos.length - 1) {
        setPasoActualIndice(i => i + 1);
      } else {
        setFinalizarVisible(true);
      }
    };
  
    // Guarda la sesión completa en Firestore
    const finalizarTerapia = async () => {
      if (!pacienteId || registrosSesion.length !== pasos.length) return;
      try {
        await addDoc(collection(db, "sesionesTerapia"), {
          pacienteId,
          terapiaId: terapiaSeleccionadaId,
          fechaInicio: Timestamp.now(),
          registros: registrosSesion,
          fechaFin: Timestamp.now(),
        });
        router.push("/dashboard");
      } catch (e) {
        console.error("Error guardando sesión:", e);
      }
    };
  
    // Carga historial de sesiones para el modal
    const cargarHistorial = async () => {
      setHistorialLoading(true);
      try {
        const q = query(
          collection(db, "sesionesTerapia"),
          where("pacienteId", "==", pacienteId)
        );
        const snap = await getDocs(q);
        setHistorialData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setHistorialError("No se pudo cargar el historial.");
      } finally {
        setHistorialLoading(false);
      }
    };
  
    return (
      <>
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top"
        style={{ backgroundColor: "#2271B2" }}>
            
          <div className="container-fluid">
            <Link href="/dashboard" className="navbar-brand">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Pacientes
            </Link>
            <button
              onClick={() => { setHistorialModal(true); cargarHistorial(); }}
              className="btn btn-light ms-auto"
            >
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              Historial
            </button>
          </div>
        </nav>
  
        <div className="container py-4" style={{ marginTop: 80 }}>
          <h1>Terapia para: {pacienteNombre}</h1>
  
          {!terapiaSeleccionadaId ? (
            <select
              className="form-select my-3"
              onChange={e => setTerapiaSeleccionadaId(e.target.value)}
            >
              <option value="">-- Seleccionar Terapia --</option>
              {terapias.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          ) : (
            <>
              <MPU6050Monitor currentPaso={currentPaso} />
  
              <div className="card my-4">
                <div className="card-body">
                  <h5>Paso {pasoActualIndice + 1} de {pasos.length}</h5>
                  <p>{currentPaso.instruccion}</p>
  
                  {currentPaso.anguloObjetivo != null && (
                    <input
                      type="number"
                      className="form-control w-25"
                      placeholder="Ángulo"
                      value={anguloRegistrado}
                      onChange={e => setAnguloRegistrado(e.target.value)}
                    />
                  )}
  
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-secondary"
                      disabled={pasoActualIndice === 0}
                      onClick={() => setPasoActualIndice(i => i - 1)}
                    >Anterior</button>
                    <button
                      className="btn btn-primary"
                      onClick={registrarAngulo}
                    >Siguiente</button>
                  </div>
                </div>
              </div>
  
              {finalizarVisible && (
                <button
                  className="btn btn-success"
                  onClick={finalizarTerapia}
                >Guardar Sesión</button>
              )}
            </>
          )}
        </div>
  
        <CircularTimer onTimeUpdate={setTiempoGlobal} />
  
        {/* Modal Historial */}
        {historialModal && (
          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Historial de Sesiones</h5>
                  <button className="btn-close" onClick={()=>setHistorialModal(false)}></button>
                </div>
                <div className="modal-body">
                  {historialLoading && <p>Cargando...</p>}
                  {historialError && <p className="text-danger">{historialError}</p>}
                  {!historialLoading && !historialError && historialData.length === 0 && <p>No hay registros.</p>}
                  {!historialLoading && historialData.length > 0 && (
                    <ul className="list-group">
                      {historialData.map(s => (
                        <li key={s.id} className="list-group-item">
                          Sesión {new Date(s.fechaInicio.toDate()).toLocaleString()} - Registros: {s.registros.length}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={()=>setHistorialModal(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }