// pages/historial/[pacienteId].js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';

// Evitar el prefijo de Font Awesome
config.autoAddCss = false;

export default function HistorialPaciente() {
  const { pacienteId } = useParams();
  const router = useRouter();
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      setCargando(true);
      setError(null);

      if (pacienteId) {
        try {
          // Cargar el nombre del paciente
          const pacienteDocRef = doc(db, "pacientes", pacienteId);
          const pacienteSnapshot = await getDoc(pacienteDocRef);
          if (pacienteSnapshot.exists()) {
            setPacienteNombre(pacienteSnapshot.data().nombre || "Nombre no encontrado");
          } else {
            setError("Paciente no encontrado.");
            setCargando(false);
            return;
          }

          // Consultar las sesiones de terapia para este paciente
          const sesionesQuery = query(
            collection(db, "sesionesTerapia"),
            where("pacienteId", "==", pacienteId)
          );
          const sesionesSnapshot = await getDocs(sesionesQuery);
          const sesionesData = sesionesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setSesiones(sesionesData);
        } catch (e) {
          console.error("Error al cargar el historial:", e);
          setError("Error al cargar el historial.");
        } finally {
          setCargando(false);
        }
      }
    };

    cargarHistorial();
  }, [pacienteId]);

  if (cargando) {
    return <p className="text-center mt-5">Cargando historial...</p>;
  }

  if (error) {
    return <p className="text-center mt-5 text-danger">{error}</p>;
  }

  return (
    <>
      <header>
        <nav
          style={{ backgroundColor: "#2271B2" }}
          className="navbar navbar-expand-lg navbar-dark fixed-top shadow"
        >
          <div className="container-fluid">
            <Link href="/dashboard" className="navbar-brand d-flex align-items-center fw-semibold text-white">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Volver
            </Link>
          </div>
        </nav>
      </header>

      <div className="container py-5" style={{ marginTop: '80px' }}>
        <h1>Historial de Terapia para: {pacienteNombre}</h1>

        {sesiones.length === 0 ? (
          <p>No hay sesiones de terapia registradas para este paciente.</p>
        ) : (
          <ul className="list-group">
            {sesiones.map((sesion) => (
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
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}