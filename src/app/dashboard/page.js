"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

export default function Dashboard() {
  // Estados iniciales
  const [user, setUser] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    fechaNacimiento: "",
    dni: "",
    genero: "",
    direccion: "",
    telefono: "",
    email: "",
    contactoEmergencia: "",
    diagnostico: "",
    antecedentes: "",
    motivoConsulta: "",
    observaciones: "",
  });
  const [editandoPacienteId, setEditandoPacienteId] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);

  const router = useRouter();
  const unsubscribePacientesRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

        if (unsubscribePacientesRef.current) {
          unsubscribePacientesRef.current();
        }

        unsubscribePacientesRef.current = escucharPacientes(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePacientesRef.current) {
        unsubscribePacientesRef.current();
      }
    };
  }, [router]);

  const escucharPacientes = (uid) => {
    const q = query(collection(db, "pacientes"), where("createdBy", "==", uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPacientes(data);
    });
    return unsubscribe;
  };

  const handleAgregarPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.dni) {
      alert("Nombre y DNI son campos obligatorios");
      return;
    }

    try {
      await addDoc(collection(db, "pacientes"), {
        ...nuevoPaciente,
        fechaNacimiento: Timestamp.fromDate(new Date(nuevoPaciente.fechaNacimiento)),
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });

      setNuevoPaciente(initialNuevoPacienteState);
      setShowForm(false);
      setEditandoPacienteId(null);
    } catch (error) {
      console.error("Error al agregar paciente:", error);
      alert("Error: Ver consola para detalles");
    }
  };

  const handleEditarPaciente = (paciente) => {
    setNuevoPaciente({
      nombre: paciente.nombre,
      fechaNacimiento: paciente.fechaNacimiento?.toDate().toISOString().split('T')[0] || "",
      dni: paciente.dni || "",
      genero: paciente.genero || "",
      direccion: paciente.direccion || "",
      telefono: paciente.telefono || "",
      email: paciente.email || "",
      contactoEmergencia: paciente.contactoEmergencia || "",
      diagnostico: paciente.diagnostico || "",
      antecedentes: paciente.antecedentes || "",
      motivoConsulta: paciente.motivoConsulta || "",
      observaciones: paciente.observaciones || "",
    });
    setEditandoPacienteId(paciente.id);
    setShowForm(true);
  };

  const handleGuardarEdicionPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.dni) {
      alert("Nombre y DNI son campos obligatorios");
      return;
    }

    try {
      const pacienteRef = doc(db, "pacientes", editandoPacienteId);
      await updateDoc(pacienteRef, {
        ...nuevoPaciente,
        fechaNacimiento: Timestamp.fromDate(new Date(nuevoPaciente.fechaNacimiento)),
      });

      setNuevoPaciente(initialNuevoPacienteState);
      setShowForm(false);
      setEditandoPacienteId(null);
    } catch (error) {
      console.error("Error al editar paciente:", error);
      alert("Error al guardar los cambios");
    }
  };

  const handleEliminarPaciente = async (id) => {
    if (confirm("¿Estás seguro de eliminar este paciente?")) {
      try {
        await deleteDoc(doc(db, "pacientes", id));
      } catch (error) {
        console.error("Error eliminando paciente:", error);
      }
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "N/A";
    const hoy = new Date();
    const nacimiento = fechaNacimiento.toDate();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleVerPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setMostrarModalVer(true);
  };

  const cerrarModalVer = () => {
    setMostrarModalVer(false);
    setPacienteSeleccionado(null);
  };

  const initialNuevoPacienteState = {
    nombre: "",
    fechaNacimiento: "",
    dni: "",
    genero: "",
    direccion: "",
    telefono: "",
    email: "",
    contactoEmergencia: "",
    diagnostico: "",
    antecedentes: "",
    motivoConsulta: "",
    observaciones: "",
  };

  if (!user) return <p className="text-center mt-5">Cargando usuario...</p>;

  return (
    <>
      {/* NAVBAR */}
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
              className="collapse navbar-collapse justify-content-end"
              id="navbarNav"
            >
              <div className="d-flex gap-2">
                <button
                  className={`btn ${showForm ? "btn-outline-light" : "btn-light"} fw-semibold`}
                  onClick={() => {
                    setShowForm(!showForm);
                    if (showForm) {
                      setNuevoPaciente(initialNuevoPacienteState);
                      setEditandoPacienteId(null);
                    }
                  }}
                >
                  {showForm ? " Ocultar Formulario" : "➕ Nuevo Paciente"}
                </button>
                <button onClick={() => signOut(auth)} className="btn btn-danger fw-semibold">
                  🔒 Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <div className="container py-5" style={{ maxWidth: "1200px", marginTop: "80px" }}>
        <div>
          <h1>Gestión de Pacientes</h1>
          <p className="text-muted">Bienvenido, {user.email}</p>
        </div>
        {/* FORMULARIO */}
        {showForm && (
          <div className="card shadow mb-4 animate__animated animate__fadeIn">
            <div className="card-body">
              <h2 className="h4 mb-4 fw-bold" style={{ color: "#2271B2" }}>
                {editandoPacienteId ? "Editar Paciente" : "Nuevo Paciente"}
              </h2>

              <div className="row g-3">
                {/* Campos individuales */}
                {[
                  { type: "text", col: 6, placeholder: "Nombre completo *", value: nuevoPaciente.nombre, name: "nombre" },
                  { type: "date", col: 3, placeholder: "Fecha de nacimiento *", value: nuevoPaciente.fechaNacimiento, name: "fechaNacimiento" },
                  { type: "number", col: 3, placeholder: "DNI *", value: nuevoPaciente.dni, name: "dni" },
                  { type: "text", col: 9, placeholder: "Dirección", value: nuevoPaciente.direccion, name: "direccion" },
                  { type: "tel", col: 4, placeholder: "Teléfono", value: nuevoPaciente.telefono, name: "telefono" },
                  { type: "email", col: 4, placeholder: "Email", value: nuevoPaciente.email, name: "email" },
                  { type: "text", col: 4, placeholder: "Contacto de emergencia", value: nuevoPaciente.contactoEmergencia, name: "contactoEmergencia" },
                  { type: "text", col: 6, placeholder: "Diagnóstico principal", value: nuevoPaciente.diagnostico, name: "diagnostico" },
                ].map((field, i) => (
                  <div className={`col-md-${field.col}`} key={i}>
                    <input
                      className="form-control"
                      type={field.type}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={(e) =>
                        setNuevoPaciente({ ...nuevoPaciente, [field.name]: e.target.value })
                      }
                    />
                  </div>
                ))}

                {/* Select género */}
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={nuevoPaciente.genero}
                    onChange={(e) =>
                      setNuevoPaciente({ ...nuevoPaciente, genero: e.target.value })
                    }
                  >
                    <option value="">Género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Textareas */}
                {[
                  { placeholder: "Antecedentes médicos", value: nuevoPaciente.antecedentes, name: "antecedentes" },
                  { placeholder: "Motivo de consulta", value: nuevoPaciente.motivoConsulta, name: "motivoConsulta" },
                  { placeholder: "Observaciones", value: nuevoPaciente.observaciones, name: "observaciones" },
                ].map((field, i) => (
                  <div className="col-12" key={i}>
                    <textarea
                      className="form-control"
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={(e) =>
                        setNuevoPaciente({ ...nuevoPaciente, [field.name]: e.target.value })
                      }
                    />
                  </div>
                ))}

                {/* Botones */}
                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button className="btn btn-secondary" onClick={() => {
                    setShowForm(false);
                    setNuevoPaciente(initialNuevoPacienteState);
                    setEditandoPacienteId(null);
                  }}>
                    Cancelar
                  </button>
                  <button
                    className={`btn ${editandoPacienteId ? "btn-primary" : "btn-success"}`}
                    onClick={editandoPacienteId ? handleGuardarEdicionPaciente : handleAgregarPaciente}
                  >
                    {editandoPacienteId ? "💾 Guardar Cambios" : "✅ Guardar Paciente"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUSCADOR */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control form-control-lg shadow-sm"
            placeholder="🔍 Buscar pacientes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* TARJETAS DE PACIENTES */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {pacientesFiltrados.map((p) => (
            <div key={p.id} className="col">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-bold" style={{ color: "#2271B2", backgroundColor: "#E9F2FB" }}>
                    {p.nombre}
                  </h5>
                  <div className="card-text">
                    <p className="mb-1">
                      <strong>DNI:</strong> {p.dni || "N/A"}
                    </p>
                    <p className="mb-1">
                      <strong>Edad:</strong> {calcularEdad(p.fechaNacimiento)} años
                    </p>
                    <p className="mb-1">
                      <strong>Diagnóstico:</strong> {p.diagnostico || "No especificado"}
                    </p>
                    <p className="mb-0">
                      <strong>Última consulta:</strong> {p.createdAt?.toDate().toLocaleDateString() || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 d-flex justify-content-end gap-2">
                <Link href={`/terapia?pacienteId=${p.id}`} legacyBehavior>
                    <button className="btn btn-sm btn-success fw-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill me-1" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-.94 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                      </svg>
                      Iniciar Terapia
                    </button>
                  </Link>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleVerPaciente(p)}>
                    👁️ Ver
                  </button>
                  
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditarPaciente(p)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminarPaciente(p.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE VER PACIENTE */}
      {mostrarModalVer && pacienteSeleccionado && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#E9F2FB" }}>
                <h5 className="modal-title fw-bold" style={{ color: "#2271B2" }}>
                  Detalles del Paciente: {pacienteSeleccionado.nombre}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModalVer}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>DNI:</strong> {pacienteSeleccionado.dni || "N/A"}
                    </p>
                    <p>
                      <strong>Fecha de Nacimiento:</strong>{" "}
                      {pacienteSeleccionado.fechaNacimiento?.toDate().toLocaleDateString() || "N/A"}{" "}
                      ({calcularEdad(pacienteSeleccionado.fechaNacimiento)} años)
                    </p>
                    <p>
                      <strong>Género:</strong> {pacienteSeleccionado.genero || "N/A"}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {pacienteSeleccionado.direccion
                      || "N/A"}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {pacienteSeleccionado.telefono || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong> {pacienteSeleccionado.email || "N/A"}
                      </p>
                      <p>
                        <strong>Contacto de Emergencia:</strong> {pacienteSeleccionado.contactoEmergencia || "N/A"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Diagnóstico Principal:</strong> {pacienteSeleccionado.diagnostico || "No especificado"}
                      </p>
                      <p>
                        <strong>Motivo de Consulta:</strong> {pacienteSeleccionado.motivoConsulta || "N/A"}
                      </p>
                      <p>
                        <strong>Antecedentes Médicos:</strong> {pacienteSeleccionado.antecedentes || "N/A"}
                      </p>
                      <p>
                        <strong>Observaciones:</strong> {pacienteSeleccionado.observaciones || "N/A"}
                      </p>
                      <p>
                        <strong>Fecha de Registro:</strong> {pacienteSeleccionado.createdAt?.toDate().toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalVer}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }