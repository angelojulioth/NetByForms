import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "./utils/authUtils"; // importar la utilidad de validación de token
import Modal from "./Modal"; // Importar el componente Modal
import "./FormsList.css"; //

// componente sidebar para mostrar los ingresos de datos de un formulario
const Sidebar = ({ uniqueId, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const validateToken = isTokenValid();
      if (!validateToken) {
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/forms/${uniqueId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        // TODO borrar mensaje de consola en producción
        console.error("Fallo en la obtención de los ingresos de datos");
      }
    };

    if (uniqueId) {
      fetchSubmissions();
    }
  }, [uniqueId]);

  const handleSubmissionClick = (submissionId) => {
    setSelectedSubmission({ uniqueId, submissionId });
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
  };

  return (
    <div className="sidebar">
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      <h2>Ingresos para Formulario {uniqueId}</h2>
      {submissions.length === 0 ? (
        <p>No hay ningún ingreso para formulario {uniqueId}</p>
      ) : (
        <ul className="submissions-list">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="submission-item"
              onClick={() => handleSubmissionClick(submission.id)}
            >
              {Object.entries(submission).map(
                ([key, value]) =>
                  key !== "submissionData" && (
                    <div key={key} className="submission-field">
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </div>
                  )
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedSubmission && (
        <Modal
          uniqueId={selectedSubmission.uniqueId}
          submissionId={selectedSubmission.submissionId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// componente principal para mostrar la lista de formularios
// TODO agregar paginación y segmentar este archivo en dos componentes distintos
const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const navigate = useNavigate();

  const validateToken = isTokenValid();
  if (!validateToken) {
    return;
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchForms = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/forms`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        console.error("Fallo en obtener los formularios");
      }
    };

    fetchForms();
  }, []);

  const handleRowClick = (uniqueId) => {
    setSelectedFormId(uniqueId);
  };

  const handleCloseSidebar = () => {
    setSelectedFormId(null);
  };

  const handleCopyLink = (uniqueId) => {
    // conseguir la url del formulario actual en la lista para copiarla al portapapeles
    const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/formularios/${uniqueId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Enlace copiado al portapapeles!");
    });
  };

  const handleGoToForm = (uniqueId) => {
    navigate(`/formularios/${uniqueId}`);
  };

  const handleDeleteForm = async (uniqueId) => {
    // validar token antes de enviar la solicitud de eliminación
    const validateToken = isTokenValid();
    if (!validateToken) {
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/forms/${uniqueId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      setForms(forms.filter((form) => form.uniqueId !== uniqueId));
    } else {
      console.error("Fallo en eliminar el formulario");
    }
  };

  return (
    <div className="forms-container">
      <div className="forms-list">
        <table>
          <thead>
            <tr>
              <th>Id Único</th>
              <th>Nombre</th>
              <th>Ult. Fecha Actualización</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr
                key={form.uniqueId}
                onClick={() => handleRowClick(form.uniqueId)}
                className={selectedFormId === form.uniqueId ? "selected" : ""}
              >
                <td>{form.uniqueId}</td>
                <td>{form.name}</td>
                <td>{new Date(form.updatedAt).toLocaleString()}</td>
                <td>{new Date(form.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleCopyLink(form.uniqueId)}>
                    Copiar Link
                  </button>
                  <button onClick={() => handleGoToForm(form.uniqueId)}>
                    Ir a Formulario
                  </button>
                  <button
                    className="btn-del"
                    onClick={() => handleDeleteForm(form.uniqueId)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedFormId && (
        <Sidebar uniqueId={selectedFormId} onClose={handleCloseSidebar} />
      )}
    </div>
  );
};

export default FormsList;
