import React, { useEffect } from "react";
import "./dynamic-form.css";

// componente visualizador de formularios llenados/ingresados
const VisualizeForm = ({ submission, onClose }) => {
  const { submissionData } = submission;
  const form = JSON.parse(submissionData);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains("visualize-form-overlay")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const renderField = (field) => {
    const { Type, Name, Label, Options, Value } = field;

    switch (Type) {
      case "text":
      case "email":
      case "date":
      case "number":
        return (
          <div className="form-group">
            <label htmlFor={Name}>{Label}</label>
            <input
              type={Type}
              id={Name}
              name={Name}
              className="form-input"
              value={Value}
              readOnly
            />
          </div>
        );
      case "textarea":
        return (
          <div className="form-group">
            <label htmlFor={Name}>{Label}</label>
            <textarea
              id={Name}
              name={Name}
              className="form-textarea"
              value={Value}
              readOnly
            />
          </div>
        );
      case "select":
      case "multiselect":
        return (
          <div className="form-group">
            <label htmlFor={Name}>{Label}</label>
            <select
              id={Name}
              name={Name}
              className="form-select"
              multiple={Type === "multiselect"}
              value={Value}
              readOnly
            >
              {Options.map((option, index) => (
                <option key={`${Name}-${option}-${index}`} value={option}>
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
              id={Name}
              name={Name}
              className="form-checkbox"
              checked={Value}
              readOnly
            />
            <label htmlFor={Name}>{Label}</label>
          </div>
        );
      case "radio":
        return (
          <div className="form-group">
            <label>{Label}</label>
            <div className="radio-group">
              {Options.map((option, index) => (
                <div
                  key={`${Name}-${option}-${index}`}
                  className="radio-option"
                >
                  <input
                    type="radio"
                    id={`${Name}-${option}`}
                    name={Name}
                    value={option}
                    checked={Value === option}
                    readOnly
                  />
                  <label htmlFor={`${Name}-${option}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="visualize-form-overlay">
      <div className="visualize-form-container">
        <div className="form-card">
          <div className="form-header">
            <h2>{form.Name}</h2>
          </div>
          <div className="form-content">
            {form.Fields.map((field) => (
              <React.Fragment key={field.Name}>
                {renderField(field)}
              </React.Fragment>
            ))}
            {form.NestedForms && form.NestedForms.length > 0 && (
              <div className="nested-forms">
                <h3>Nested Forms</h3>
                {form.NestedForms.map((nestedForm) => (
                  <div key={nestedForm.Name} className="nested-form">
                    <h4>{nestedForm.Name}</h4>
                    {nestedForm.Fields.map((field) => (
                      <React.Fragment key={field.Name}>
                        {renderField(field)}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-footer">
            <button className="nav-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .visualize-form-overlay {
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
        }
        .visualize-form-container {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 80%;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-family: "Roboto Mono", monospace;
          animation: slideIn 0.3s ease-out;
        }
        .form-card {
          width: 100%;
        }
        .form-header h2 {
          margin: 0;
        }
        .form-content {
          margin-top: 20px;
        }
        .form-footer {
          margin-top: 20px;
          text-align: right;
        }
        .nav-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: #007bff;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .nav-button:hover {
          background-color: #0056b3;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VisualizeForm;
