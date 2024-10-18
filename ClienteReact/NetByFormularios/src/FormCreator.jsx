import React, { useState } from "react";
import "./form-creator.css";
import { isTokenValid } from "./utils/authUtils"; // utilidad de comprobación para validez del token

// TODO refactorizado en sub-componentes para mejorar la legibilidad y mantenibilidad

const FormCreator = () => {
  const [formName, setFormName] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [nestedForms, setNestedForms] = useState([]);
  const [currentField, setCurrentField] = useState({
    type: "text",
    label: "",
    name: "",
    required: false,
    options: [],
  });
  const [currentNestedForm, setCurrentNestedForm] = useState({
    name: "",
    fields: [],
  });
  const [isCreatingNestedForm, setIsCreatingNestedForm] = useState(false);

  // establecer los tipos de campo disponibles
  const fieldTypes = [
    "text",
    "textarea",
    "number",
    "email",
    "date",
    "select",
    "multiselect",
    "checkbox",
  ];

  const addField = (targetFields, setTargetFields) => {
    setTargetFields([...targetFields, { ...currentField, id: Date.now() }]);
    setCurrentField({
      type: "text",
      label: "",
      name: "",
      required: false,
      options: [],
    });
  };

  const removeField = (id, targetFields, setTargetFields) => {
    setTargetFields(targetFields.filter((field) => field.id !== id));
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentField({
      ...currentField,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentField.options];
    newOptions[index] = value;
    setCurrentField({ ...currentField, options: newOptions });
  };

  const addOption = () => {
    setCurrentField({
      ...currentField,
      options: [...currentField.options, ""],
    });
  };

  const startNestedForm = () => {
    setIsCreatingNestedForm(true);
    setCurrentNestedForm({ name: "", fields: [] });
  };

  const saveNestedForm = () => {
    if (currentNestedForm.name && currentNestedForm.fields.length > 0) {
      setNestedForms([
        ...nestedForms,
        { ...currentNestedForm, id: Date.now() },
      ]);
      setIsCreatingNestedForm(false);
      setCurrentNestedForm({ name: "", fields: [] });
    } else {
      alert("Provee un nombre para el formulario anidado y al menos un campo.");
    }
  };

  const cancelNestedForm = () => {
    setIsCreatingNestedForm(false);
    setCurrentNestedForm({ name: "", fields: [] });
  };

  const removeNestedForm = (id) => {
    setNestedForms(nestedForms.filter((form) => form.id !== id));
  };

  const saveForm = async () => {
    try {
      const validateToken = isTokenValid();
      if (!validateToken) {
        return;
      }

      // tomar el token actual del almacenamiento local ya que la comprobación fue válida
      const token = localStorage.getItem("token");

      // de-estructurar los campos del formulario y los formularios anidados en un nuevo objeto
      const formData = {
        name: formName,
        fields: formFields.map(({ id, ...field }) => ({
          ...field,
          options: field.options.length > 0 ? field.options : [],
        })),
        nestedForms:
          nestedForms.length > 0
            ? nestedForms.map(({ id, ...nestedForm }) => ({
                ...nestedForm,
                fields: nestedForm.fields.map(({ id, ...field }) => ({
                  ...field,
                  options: field.options.length > 0 ? field.options : [],
                })),
              }))
            : [],
      };

      // enviar los datos del formulario al servidor / request POST para crear formularios
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/Forms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Formulario guardado con éxito! Su Id único es: ${result.uniqueId}`
        );
      } else {
        const errorData = await response.json();

        // todo borrar mensaje de consola a producción
        console.error("Error guardando formulario:", errorData);
        alert(
          "Fallo en guardado de formulario. Por favor revisa los datos del formulario e intenta nuevamente."
        );
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Fallo en guardado de formulario. Por favor intenta nuevamente.");
    }
  };

  return (
    <div className="form-creator">
      <div className="sidebar">
        <h2>Agregar campos</h2>
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Tipo de campo
          </label>
          <select
            id="type"
            name="type"
            value={currentField.type}
            onChange={handleFieldChange}
            className="form-select"
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type === "text" && "Texto"}
                {type === "textarea" && "Área de texto"}
                {type === "number" && "Número"}
                {type === "email" && "Correo electrónico"}
                {type === "date" && "Fecha"}
                {type === "select" && "Seleccionar"}
                {type === "multiselect" && "Selección múltiple"}
                {type === "checkbox" && "CheckBox / Casilla de verificación"}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="label" className="form-label">
            Label del campo
          </label>
          <input
            id="label"
            name="label"
            value={currentField.label}
            onChange={handleFieldChange}
            placeholder="Ingresa un valor"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Nombre del campo
          </label>
          <input
            id="name"
            name="name"
            value={currentField.name}
            onChange={handleFieldChange}
            placeholder="Ingresa un nombre"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="required" className="form-label">
            Marcar como requerido
          </label>
          <input
            type="checkbox"
            id="required"
            name="required"
            checked={currentField.required}
            onChange={handleFieldChange}
            className="form-checkbox"
          />
        </div>
        {(currentField.type === "select" ||
          currentField.type === "multiselect") && (
          <div className="form-group options-container">
            <label className="form-label">Options</label>
            {currentField.options.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="form-input"
              />
            ))}
            <button onClick={addOption} className="form-button secondary">
              + Agregar Opción
            </button>
          </div>
        )}
        <button
          onClick={() => addField(formFields, setFormFields)}
          className="form-button"
        >
          + Agregar campo al formulario principal
        </button>
      </div>
      <div className="main-content">
        <div className="form-group">
          <label htmlFor="formName" className="form-label">
            Nombre del Formulario
          </label>
          <input
            id="formName"
            name="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ingresa un nombre"
            className="form-input"
          />
        </div>
        <div className="form-preview">
          <h2>Previsualización de formulario</h2>
          {formFields.map((field) => (
            <div key={field.id} className="preview-field">
              <div className="preview-field-info">
                <div className="preview-field-label">{field.label}</div>
                <div className="preview-field-type">Tipo: {field.type}</div>
                <div className="preview-field-name">Nombre: {field.name}</div>
                <div className="preview-field-required">
                  Requerido: {field.required ? "Sí" : "No"}
                </div>
              </div>
              <button
                onClick={() => removeField(field.id, formFields, setFormFields)}
                className="form-button danger"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        <div className="nested-forms">
          <h2>Formularios Anidados (Dependientes)</h2>
          {nestedForms.map((nestedForm) => (
            <div key={nestedForm.id} className="nested-form-preview">
              <h3>{nestedForm.name}</h3>
              {nestedForm.fields.map((field) => (
                <div key={field.id} className="preview-field">
                  <div className="preview-field-info">
                    <div className="preview-field-label">{field.label}</div>
                    <div className="preview-field-type">Type: {field.type}</div>
                    <div className="preview-field-name">Name: {field.name}</div>
                    <div className="preview-field-required">
                      Requerido: {field.required ? "Sí" : "No"}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeField(field.id, nestedForm.fields, (fields) =>
                        setNestedForms(
                          nestedForms.map((nf) =>
                            nf.id === nestedForm.id
                              ? { ...nestedForm, fields }
                              : nf
                          )
                        )
                      )
                    }
                    className="form-button danger"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  addField(nestedForm.fields, (fields) =>
                    setNestedForms(
                      nestedForms.map((nf) =>
                        nf.id === nestedForm.id ? { ...nestedForm, fields } : nf
                      )
                    )
                  )
                }
                className="form-button"
              >
                + Agregar campo a {nestedForm.name}
              </button>
              <button
                onClick={() => removeNestedForm(nestedForm.id)}
                className="form-button danger"
              >
                Remover formulario anidado
              </button>
            </div>
          ))}
        </div>
        {isCreatingNestedForm ? (
          <div className="nested-form-creator">
            <h2>Crear formulario anidado</h2>
            <div className="form-group">
              <label htmlFor="nestedFormName" className="form-label">
                Nombre de formulario anidado
              </label>
              <input
                id="nestedFormName"
                name="nestedFormName"
                value={currentNestedForm.name}
                onChange={(e) =>
                  setCurrentNestedForm({
                    ...currentNestedForm,
                    name: e.target.value,
                  })
                }
                placeholder="Enter nested form name"
                className="form-input"
              />
            </div>
            <div className="nested-form-fields">
              <h3>Campos de formulario anidado</h3>
              {currentNestedForm.fields.map((field) => (
                <div key={field.id} className="preview-field">
                  <div className="preview-field-info">
                    <div className="preview-field-label">{field.label}</div>
                    <div className="preview-field-type">Tipo: {field.type}</div>
                    <div className="preview-field-name">
                      Nombre: {field.name}
                    </div>
                    <div className="preview-field-required">
                      Requerido: {field.required ? "Sí" : "No"}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeField(
                        field.id,
                        currentNestedForm.fields,
                        (fields) =>
                          setCurrentNestedForm({
                            ...currentNestedForm,
                            fields,
                          })
                      )
                    }
                    className="form-button danger"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  addField(currentNestedForm.fields, (fields) =>
                    setCurrentNestedForm({ ...currentNestedForm, fields })
                  )
                }
                className="form-button"
              >
                + Agregar campo a formulario anidado
              </button>
            </div>
            <div className="nested-form-actions">
              <button onClick={saveNestedForm} className="form-button">
                Guardar formulario anidado
              </button>
              <button
                onClick={cancelNestedForm}
                className="form-button secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={startNestedForm} className="form-button">
            + Agregar formulario anidado
          </button>
        )}
        <button onClick={saveForm} className="form-button">
          Guardar formulario
        </button>
      </div>
    </div>
  );
};

export default FormCreator;
