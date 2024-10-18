// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "./utils/authUtils"; // importante utilidad de validación de token

// componente para manejar rutas privadas mientras un token es válido
// se envuelve componentes en este componente para asegurar que solo se rendericen
// si el token es válido
const PrivateRoute = ({ element: Component, ...rest }) => {
  return isTokenValid() ? <Component {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;
