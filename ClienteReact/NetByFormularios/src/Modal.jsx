// Modal.jsx
import React, { useState, useEffect } from "react";
import { isTokenValid } from "./utils/authUtils"; // utilidad de val de token
import VisualizeForm from "./VisualizeForm"; // visualizador de formularios llenados

const Modal = ({ uniqueId, submissionId, onClose }) => {
  const [submissionData, setSubmissionData] = useState(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      const validateToken = isTokenValid();
      if (!validateToken) {
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/Forms/${uniqueId}/submissions/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissionData(data);
      } else {
        console.error(
          "Fallo en la obtención de los datos de formulario ingresado"
        );
      }
    };

    fetchSubmissionData();
  }, [uniqueId, submissionId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains("modal-overlay")) {
        onClose();
      }
    };

    // TODO: cambiar evento manejado con js vainilla
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!submissionData) {
    return null;
  }

  const handleVisualize = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisualizing(true);
      setIsAnimating(false);
    }, 300); // encaja con la duración de la animación de salida
  };

  const handleCloseVisualize = () => {
    setIsVisualizing(false);
  };

  return (
    <div className="modal-overlay">
      {!isVisualizing && (
        <div className={`modal-content ${isAnimating ? "hide-left" : ""}`}>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <h2>Detalles de formulario ingresado</h2>
          <pre>{JSON.stringify(submissionData, null, 2)}</pre>
          <button className="visualize-button" onClick={handleVisualize}>
            Visualizar Formulario
          </button>
        </div>
      )}
      {isVisualizing && (
        <VisualizeForm
          submission={submissionData}
          onClose={handleCloseVisualize}
        />
      )}
      {/* TODO estilo ingresado en el mismo componente, trasladar a css externo */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap");

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 0.3s ease-out;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 80%;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-family: "Roboto Mono", monospace;
          transition: transform 0.3s ease-out;
        }
        .modal-content.hide-left {
          transform: translateX(-100%);
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        .close-button:hover {
          color: #333;
        }
        .visualize-button {
          margin-top: 20px;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: #007bff;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .visualize-button:hover {
          background-color: #0056b3;
        }
        pre {
          white-space: pre-wrap; /* previene overflow de texto */
          word-wrap: break-word; /* previene overflow de texto */
          font-size: 1rem;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
