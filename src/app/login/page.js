"use client";

import { useState } from "react";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import  "./login.module.css"

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleAction = async (action) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (action === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setErrorMessage(
        `Error al ${
          action === "login" ? "iniciar sesión" : "registrarse"
        }: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header>
        <nav
          style={{ backgroundColor: "#2271B2" }}
          className="navbar navbar-expand-lg navbar-dark fixed-top shadow"
        >
          <div className="container-fluid">
            <Link href="/" className="navbar-brand fw-bold">
              VertiGone
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav"></div>
          </div>
        </nav>
      </header>

      {/* CONTENIDO DIVIDIDO EN 2 COLUMNAS */}
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: "-100px" }}>
        <div className="row w-100 h-100">
          
          {/* Columna izquierda: formulario */}
          <div className="col-md-6 d-flex align-items-center justify-content-center">
            <motion.div
              className="card shadow p-4"
              style={{ maxWidth: "400px", width: "100%" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-center" style={{ color: "#2271B2" }}>
                Iniciar sesión
              </h2>

              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction("login")}
                disabled={isLoading}
                className="btn btn-primary w-100 mb-3 d-flex justify-content-center align-items-center " 
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                      
                    ></span>
                    Procesando...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </motion.button>

              <div className="text-center text-muted mb-2">o</div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction("register")}
                disabled={isLoading}
                className="btn btn-outline-primary w-100"
              >
                Crear nueva cuenta
              </motion.button>
            </motion.div>
          </div>

          {/* Columna derecha: imagen */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-4">
            <img
              src="https://raw.githubusercontent.com/gpolania/Proyecto_grado/main/foto_inicio.png"
              alt="Imagen de inicio"
              className="img-fluid"
              style={{ maxHeight: "100%", objectFit: "contain" ,}}
            />
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginPage;
