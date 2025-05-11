"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../firebase/config";
import { collection, doc, getDocs, getDoc, addDoc, Timestamp, query, where } from "firebase/firestore";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import CircularTimer from './CircularTimer'; // Importa el componente
import MPU6050Monitor from './MPU6050Monitor'; // Importa el nuevo componente

// Evitar el prefijo de Font Awesome
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
  const [terapiaNombreSeleccionada, setTerapiaNombreSeleccionada] = useState("");
  const [finalizarTerapiaVisible, setFinalizarTerapiaVisible] = useState(false);
  const [tiempoGlobalUsado, setTiempoGlobalUsado] = useState(0);
  const [mostrarHistorialModal, setMostrarHistorialModal] = useState(false);
  const [historialPaciente, setHistorialPaciente] = useState([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [historialError, setHistorialError] = useState(null);

  useEffect(() => {
    const cargarPacienteNombre = async () => {
      if (pacienteId) {
        const pacienteDoc = await doc(db, "pacientes", pacienteId);
        const pacienteSnapshot = await getDoc(pacienteDoc);
        if (pacienteSnapshot.exists()) {
          setPacienteNombre(pacienteSnapshot.data().nombre || "Nombre no encontrado");
        }
      }
    };
    cargarPacienteNombre();
  }, [pacienteId]);

  // Cargar terapias
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "terapias"));
      setTerapias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // Cargar pasos de la terapia seleccionada
  useEffect(() => {
    if (!terapiaSeleccionadaId) return;
    (async () => {
      const ref = doc(db, "terapias", terapiaSeleccionadaId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPasos(snap.data().pasos || []);
        setPasoActualIndice(0);
        setRegistrosSesion([]);
        setFinalizarVisible(false);
      }
    })();
  }, [terapiaSeleccionadaId]);

  const currentPaso = pasos[pasoActualIndice] || {};

  // Registro de ángulo manual
  const registrarAngulo = () => {
    const nuevo = { ...currentPaso, // incluye numero, resetZero, visibleAngles
      anguloAlcanzado: currentPaso.anguloObjetivo == null ? null : parseFloat(anguloRegistrado),
      tiempo: tiempoGlobal,
      paso: pasoActualIndice + 1,
      timestamp: Timestamp.now()
    };
    setRegistrosSesion(prev => [...prev.filter(r => r.paso !== nuevo.paso), nuevo]);
    setAnguloRegistrado("");
    setTiempoGlobal(0);
    if (pasoActualIndice < pasos.length - 1) setPasoActualIndice(i => i + 1);
    else setFinalizarVisible(true);
  };

 

 // Guardar sesión
 const finalizarTerapia = async () => {
  if (!pacienteId || registrosSesion.length !== pasos.length) return;
  await addDoc(collection(db, "sesionesTerapia"), {
    pacienteId,
    terapiaId: terapiaSeleccionadaId,
    fechaInicio: Timestamp.now(),
    registros: registrosSesion,
    fechaFin: Timestamp.now()
  });
  router.push("/dashboard");
};


  const handleTiempoGlobalActualizado = (timeInSeconds) => {
    setTiempoGlobalUsado(timeInSeconds);
  };

  const handleSeleccionarTerapia = (event) => {
    setTerapiaSeleccionadaId(event.target.value);
  };

  const handleCambiarTerapia = () => {
    setTerapiaSeleccionadaId("");
    setPasos([]);
    setPasoActualIndice(0);
    setAnguloRegistrado("");
    setRegistrosSesion([]);
    setTerapiaNombreSeleccionada("");
    setFinalizarTerapiaVisible(false);
    setTiempoGlobalUsado(0);
  };

  const handleRegistrarAngulo = (event) => {
    setAnguloRegistrado(event.target.value);
  };

  const handleSiguientePaso = () => {
    const pasoActual = pasos[pasoActualIndice];
    const anguloParaRegistrar = pasoActual?.anguloObjetivo === null ? null : parseInt(anguloRegistrado);

    const nuevoRegistro = {
      pasoIndice: pasoActualIndice,
      anguloAlcanzado: anguloParaRegistrar,
      tiempoManualGlobal: tiempoGlobalUsado > 0 ? tiempoGlobalUsado : null,
      timestamp: Timestamp.now(),
    };

    const registroExistenteIndice = registrosSesion.findIndex(
      (registro) => registro.pasoIndice === pasoActualIndice
    );

    if (registroExistenteIndice !== -1) {
      const nuevosRegistros = [...registrosSesion];
      nuevosRegistros[registroExistenteIndice] = nuevoRegistro;
      setRegistrosSesion(nuevosRegistros);
    } else {
      setRegistrosSesion([...registrosSesion, nuevoRegistro]);
    }

    setAnguloRegistrado("");
    setTiempoGlobalUsado(0);

    if (pasoActualIndice < pasos.length - 1) {
      setPasoActualIndice(pasoActualIndice + 1);
    } else {
      setFinalizarTerapiaVisible(true);
    }
  };

  const handleAnteriorPaso = () => {
    if (pasoActualIndice > 0) {
      setPasoActualIndice(pasoActualIndice - 1);
      setFinalizarTerapiaVisible(false);
    }
  };

  const handleFinalizarTerapia = async () => {
    if (pacienteId && terapiaSeleccionadaId && registrosSesion.length === pasos.length) {
      try {
        await addDoc(collection(db, "sesionesTerapia"), {
          pacienteId: pacienteId,
          terapiaId: terapiaSeleccionadaId,
          fechaInicio: Timestamp.now(),
          registros: registrosSesion,
          fechaFin: Timestamp.now(),
        });
        alert("Sesión de terapia guardada exitosamente.");
        router.push(`/dashboard`); // Redirigir al dashboard o a una página de historial
      } catch (error) {
        console.error("Error al guardar la sesión de terapia:", error);
        alert("Error al guardar la sesión.");
      }
    } else {
      alert("Asegúrate de haber completado todos los pasos.");
    }
  };

  const cargarHistorialPaciente = async () => {
    setHistorialCargando(true);
    setHistorialError(null);
    setMostrarHistorialModal(true);

    if (pacienteId) {
      try {
        const sesionesQuery = query(
          collection(db, "sesionesTerapia"),
          where("pacienteId", "==", pacienteId)
        );
        const sesionesSnapshot = await getDocs(sesionesQuery);
        const sesionesData = sesionesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHistorialPaciente(sesionesData);
      } catch (e) {
        console.error("Error al cargar el historial:", e);
        setHistorialError("Error al cargar el historial.");
      } finally {
        setHistorialCargando(false);
      }
    }
  };

  const cerrarHistorialModal = () => {
    setMostrarHistorialModal(false);
    setHistorialPaciente([]);
    setHistorialError(null);
  };

  return (
    <>
      <header>
        <nav
          style={{ backgroundColor: "#2271B2" }}
          className="navbar navbar-expand-lg navbar-dark fixed-top shadow"
        >
          <div className="container-fluid">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse justify-content-between"
              id="navbarNav"
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link href="/dashboard" className="nav-link d-flex align-items-center fw-semibold text-white">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Pacientes
                  </Link>
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <button onClick={cargarHistorialPaciente} className="nav-link d-flex align-items-center fw-semibold text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faHistory} className="me-2" />
                    Historial
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Integración del MPU6050Monitor */}
      <div className="mt-4">
              <MPU6050Monitor />
            </div>

      <div className="container py-5" style={{ marginTop: '80px' }}>
    
    

        <h1>Iniciar Terapia para: {pacienteNombre}</h1>

        {!terapiaSeleccionadaId ? (
          <div className="mb-3">
            <label htmlFor="terapiaSeleccionada" className="form-label">Seleccionar Terapia:</label>
            <select
              className="form-select"
              id="terapiaSeleccionada"
              onChange={handleSeleccionarTerapia}
              value={terapiaSeleccionadaId}
            >
              <option value="">-- Seleccionar --</option>
              {terapias.map((terapia) => (
                <option key={terapia.id} value={terapia.id}>
                  {terapia.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Terapia: {terapiaNombreSeleccionada}</h2>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleCambiarTerapia}>
                Cambiar Terapia
              </button>
            </div>

            {pasos.length > 0 && (
              <div className="mb-4">
                <div className="card shadow">
                  <div className="card-body">
                    <h5 className="card-title">Paso {pasoActualIndice + 1} de {pasos.length}</h5>
                    <p className="card-text"><strong>Instrucción:</strong> {pasos[pasoActualIndice]?.instruccion}</p>
                    {pasos[pasoActualIndice]?.anguloObjetivo !== null && (
                      <div className="mt-3">
                        <label htmlFor="anguloRegistrado" className="form-label">Ángulo Registrado:</label>
                        <input
                          type="number"
                          className="form-control"
                          id="anguloRegistrado"
                          value={anguloRegistrado}
                          onChange={handleRegistrarAngulo}
                          style={{ maxWidth: '150px', margin: '0 auto' }}
                        />
                      </div>
                    )}
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-secondary"
                        onClick={handleAnteriorPaso}
                        disabled={pasoActualIndice === 0}
                      >
                        Anterior
                      </button>
                      <button className="btn btn-primary" onClick={handleSiguientePaso}>
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) 
}

            

            {registrosSesion.length > 0 && (
              <div className="mt-4">
                <h3>Registros de la Sesión Actual:</h3>
                <ul className="list-group">
                  {registrosSesion.map((registro, index) => (
                    <li key={index} className="list-group-item">
                      Paso {registro.pasoIndice + 1}: Ángulo registrado - {registro.anguloAlcanzado === null ? 'Completado' : `${registro.anguloAlcanzado} grados`} {registro.tiempoManualGlobal > 0 && `(Tiempo usado: ${registro.tiempoManualGlobal} segundos)`} ({registro.timestamp?.toDate().toLocaleTimeString()})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {finalizarTerapiaVisible && (
              <button className="btn btn-success mt-3" onClick={handleFinalizarTerapia}>
                Guardar Sesión de Terapia
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Historial */}
      <div className={`modal fade ${mostrarHistorialModal ? 'show' : ''}`} style={{ display: mostrarHistorialModal ? 'block' : 'none' }} tabIndex="-1" aria-labelledby="historialModalLabel" aria-hidden={!mostrarHistorialModal}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="historialModalLabel">Historial de Terapia para: {pacienteNombre}</h5>
              <button type="button" className="btn-close" onClick={cerrarHistorialModal} aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {historialCargando && <p>Cargando historial...</p>}
              {historialError && <p className="text-danger">{historialError}</p>}
              {!historialCargando && !historialError && historialPaciente.length === 0 && (
                <p>No hay sesiones de terapia registradas para este paciente.</p>
              )}
              {!historialCargando && !historialError && historialPaciente.length > 0 && (
                <ul className="list-group">
                  {historialPaciente.map((sesion) => (
                    <li key={sesion.id} className="list-group-item mb-3 shadow-sm rounded">
                      <h6 className="mb-1">Sesión del {sesion.fechaInicio?.toDate().toLocaleDateString()}</h6>
                      <p className="mb-0 text-muted">
                        Iniciada a las {sesion.fechaInicio?.toDate().toLocaleTimeString()} - Finalizada a las {sesion.fechaFin?.toDate().toLocaleTimeString()}
                      </p>
                      {sesion.registros && sesion.registros.length > 0 && (
                        <div className="mt-2">
                          <h6 className="mb-1">Registros:</h6>
                          <ul className="list-unstyled">
                            {sesion.registros.map((registro, index) => (
                              <li key={index}>
                                Paso {registro.pasoIndice + 1}:
                                {registro.anguloAlcanzado !== null && ` Ángulo registrado - ${registro.anguloAlcanzado} grados`}
                                {registro.tiempoEspera > 0 && ` (Esperó ${registro.tiempoCompletado} segundos)`}
                                {registro.tiempoEsperaManual > 0 && ` (Tiempo manual: ${registro.tiempoEsperaManual} segundos)`}
                                {registro.tiempoManualGlobal > 0 && ` (Tiempo global: ${registro.tiempoManualGlobal} segundos)`}
                              </li>
                            ))}</ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarHistorialModal}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
    
          {/* Renderiza el CircularTimer fuera del flujo normal del documento */}
          <div className="floating-timer">
            <CircularTimer onTimeUpdate={handleTiempoGlobalActualizado} />
          </div>
    
          <style jsx>{`
            .floating-timer {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 1000; /* Asegura que esté por encima de otros elementos */
            }
            .sensor-container {
              margin-top: 20px;
            }
          `}</style>
        </>
      );
    }

    