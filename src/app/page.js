"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from './page.module.css';

const cardVariants = {
  offscreen: {
    y: 100,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

const floatAnimation = {
  hover: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const HomePage = () => {
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
            <div
              className="collapse navbar-collapse justify-content-end"
              id="navbarNav"
            >
            <ul className="navbar-nav gap-2">
            <li className="nav-item">
              <Link
                href="/login"
                className="btn btn-light fw-semibold"
                style={{ color: "#2271B2" }}
              >
                Iniciar sesión
              </Link>
            </li>
          </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div className={styles.mainContainer}>
        
        {/* Floating Device Preview */}
        <motion.div 
          className={styles.devicePreview}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.screen}>
            <motion.div 
              className={styles.screenContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="d-flex justify-content-center mb-4"
              >
                <img
                  src="https://raw.githubusercontent.com/gpolania/Proyecto_grado/main/Vert-gone%20Color.png"
                  alt="Logo Vertigo"
                  className="img-fluid"
                  style={{ maxWidth: "300px" }}
                />
              </motion.div>
               {/* Texto vertiGone estilizado */}
               <motion.div
                className={styles.titleText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                VertiGone
              </motion.div>

              <motion.div
                className={styles.animatedDots}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
            </motion.div>
          </div>
          <div className={styles.floatingOrbit} />
        </motion.div>

        {/* Information Section */}
        <div className={styles.contentSection}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Terapia Especializada<br/>
              <span className={styles.highlight}>para el Vértigo</span>
            </motion.h1>

            {/* Animated Cards */}
            <div className="row gy-4">
              <div className="col-12">
                <motion.div
                  variants={cardVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                >
                  <motion.div
                    className={styles.infoCard}
                    whileHover={{ scale: 1.02 }}
                    variants={floatAnimation}
                  >
                    <h5>¿Qué puedes hacer?</h5>
                    <p>  Lleva un seguimiento preciso del progreso terapéutico en
                      pacientes con vértigo. Registra, analiza y ajusta los
                      ángulos de reposicionamiento para lograr resultados más
                      efectivos.</p>
                    <div className={styles.cardLine} />
                  </motion.div>
                </motion.div>
              </div>

              <div className="col-12">
                <motion.div
                  variants={cardVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className={styles.infoCard}
                    whileHover={{ scale: 1.02 }}
                    variants={floatAnimation}
                  >
                    <h5>¿Quiénes pueden usarlo?</h5>
                    <p> La plataforma está diseñada para profesionales de la
                      salud, especialmente fonoaudiólogos y terapeutas que
                      realizan maniobras de reposicionamiento vestibular.</p>
                    <div className={styles.cardLine} />
                  </motion.div>
                </motion.div>
              </div>

              <div className="col-12">
                <motion.div
                  variants={cardVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className={styles.infoCard}
                    whileHover={{ scale: 1.02 }}
                    variants={floatAnimation}
                  >
                    <h5>¿Cómo empiezo?</h5>
                    <p> Si aún no tienes una cuenta, regístrate para comenzar.
                      Podrás asignar terapias, registrar avances, monitorear
                      los ángulos alcanzados y administrar la evolución de cada
                      paciente de forma eficiente.</p>
                    <div className={styles.cardLine} />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
    
    </>
  );
};

export default HomePage;