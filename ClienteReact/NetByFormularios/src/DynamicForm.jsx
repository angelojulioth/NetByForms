import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./dynamic-form.css";

const DynamicForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const getForm = async (formId) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/Forms/${formId}`
        );
        if (response.ok) {
          const form = await response.json();
          console.log(form); //todo revisar
          setForm(form);
        } else {
          throw new Error("Fallo en la obtención del formulario");
        }
      } catch (error) {
        console.error("Fallo en la obtención del formulario:", error);
        alert("Fallo en la obtención del formulario. Intenta nuevamente.");
      }
    };

    getForm(formId);
  }, [formId]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderField = (field) => {
    const { type, name, label, required, options } = field;

    switch (type) {
      case "text":
      case "email":
      case "date":
      case "number":
        return (
          <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              className="form-input"
            />
          </div>
        );
      case "textarea":
        return (
          <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <textarea
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              className="form-textarea"
            />
          </div>
        );
      case "select":
      case "multiselect":
        return (
          <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <select
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={(e) =>
                handleInputChange(
                  name,
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              required={required}
              multiple={type === "multiselect"}
              className="form-select"
            >
              {options.map((option, index) => (
                <option key={`${name}-${option}-${index}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case "boolean":
        return (
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={formData[name] || false}
              onChange={(e) => handleInputChange(name, e.target.checked)}
              required={required}
              className="form-checkbox"
            />
            <label htmlFor={name}>{label}</label>
          </div>
        );
      case "radio":
        return (
          <div className="form-group">
            <label>{label}</label>
            <div className="radio-group">
              {options.map((option, index) => (
                <div
                  key={`${name}-${option}-${index}`}
                  className="radio-option"
                >
                  <input
                    type="radio"
                    id={`${name}-${option}`}
                    name={name}
                    value={option}
                    checked={formData[name] === option}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    required={required}
                  />
                  <label htmlFor={`${name}-${option}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );
      case "masked":
        return (
          <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
              type="text"
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              className="form-input masked"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const validateForm = (formFields) => {
    for (const field of formFields) {
      if (field.required && !formData[field.name]) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateForm(form.fields)) {
      setCurrentFormIndex(currentFormIndex + 1);
    } else {
      alert("Por favor llena todos los campos requeridos.");
    }
  };

  const handlePrevious = () => {
    setCurrentFormIndex(currentFormIndex - 1);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (validateForm(form.fields)) {
      const createSubmissionObject = (form) => {
        return {
          Name: form.name,
          Fields: form.fields.map((field) => ({
            Type: field.type,
            Label: field.label,
            Name: field.name,
            Required: field.required,
            Options: field.options || [],
            Value:
              formData[field.name] || (field.type === "multiselect" ? [] : ""),
          })),
          NestedForms: form.nestedForms
            ? form.nestedForms.map((nestedForm) =>
                createSubmissionObject(nestedForm)
              )
            : [],
        };
      };

      const submissionData = createSubmissionObject(form);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/Forms/${formId}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData),
          }
        );

        if (!response.ok) {
          throw new Error("Fallo en el envío del formulario");
        }

        alert("Formulario enviado correctamente!");
      } catch (error) {
        console.error("Error en envío de formulario :", error);
        alert("Error en envío de formulario. Por favor intenta nuevamente.");
      }
    } else {
      alert("Porfavor llena todos los campos requeridos.");
    }
  };

  if (!form) {
    return <div className="loading">Cargando...</div>;
  }

  const currentForm =
    currentFormIndex === 0 ? form : form.nestedForms?.[currentFormIndex - 1];

  return (
    <div className="dynamic-form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>{currentForm.name}</h2>
        </div>
        <form className="dynamic-form" onSubmit={submitForm}>
          <div className="form-content">
            {currentForm.fields.map((field) => (
              <React.Fragment key={field.id}>
                {renderField(field)}
              </React.Fragment>
            ))}
          </div>
          <div className="form-footer">
            <div className="step-buttons">
              {[...Array((form.nestedForms?.length || 0) + 1)].map(
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`step-button ${
                      index === currentFormIndex ? "active" : ""
                    }`}
                    onClick={() => {
                      if (index === 0 || validateForm(form.fields)) {
                        setCurrentFormIndex(index);
                      } else {
                        alert("Porfavor llena todos los campos requeridos.");
                      }
                    }}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
            <div className="navigation-buttons">
              {currentFormIndex > 0 && (
                <button
                  type="button"
                  className="nav-button"
                  onClick={handlePrevious}
                >
                  Anterior
                </button>
              )}
              {currentFormIndex < (form.nestedForms?.length || 0) ? (
                <button
                  type="button"
                  className="nav-button"
                  onClick={handleNext}
                >
                  Siguiente
                </button>
              ) : (
                <button type="submit" className="nav-button submit-button">
                  Enviar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
