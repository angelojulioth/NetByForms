// App.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DynamicForm from "./DynamicForm";
import FormCreator from "./FormCreator";
import LoginScreen from "./LoginScreen";
import PrivateRoute from "./PrivateRoute";
import FormsList from "./FormsList";
import Navbar from "./Navbar";
import { isTokenValid } from "./utils/authUtils";

// campos de formulario dummy generado por utilidad de placeholder json a js
// TODO: remover, unicamente para tests
const fields = [
  { type: "text", name: "name", label: "Name" },
  { type: "email", name: "email", label: "Email" },
  { type: "date", name: "birthdate", label: "Birth Date" },
  { type: "textarea", name: "comments", label: "Comments" },
  {
    type: "select",
    name: "country",
    label: "Country",
    options: [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
    ],
  },
  {
    type: "multiselect",
    name: "languages",
    label: "Languages",
    options: [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
      // ... more options
    ],
  },
  { type: "boolean", name: "subscribe", label: "Subscribe to newsletter" },
  { type: "masked", name: "phone", label: "Phone Number" },
];

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const valid = await isTokenValid();
      setLoggedIn(valid);
    };

    checkToken();
    const interval = setInterval(checkToken, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path="/" element={<LoginScreen setLoggedIn={setLoggedIn} />} />
        {/* <Route path="/todos" element={<FormsList />} /> */}
        <Route path="/todos" element={<PrivateRoute element={FormsList} />} />
        <Route path="/crear" element={<PrivateRoute element={FormCreator} />} />
        <Route
          path="/formularios/:formId"
          element={<DynamicForm fields={fields} />}
        />
      </Routes>
    </Router>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
