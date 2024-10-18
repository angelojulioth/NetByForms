import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login-screen.css";

const LoginScreen = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/Auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // manejar login exitoso si la respuesta es 200 OK
        const token = data.token;
        const expirationTime = new Date().getTime() + data.expira * 60 * 1000; // Convertir minutos a milisegundos

        localStorage.setItem("token", token);
        localStorage.setItem("tokenExpiration", expirationTime);

        // actualizar el estado de loggedIn
        setLoggedIn(true);

        // redireccionar a la creacción de formularios
        navigate("/crear");
      } else {
        setError("Nombre de usuario o password incorrectos.");
      }
    } catch (err) {
      setError("Ha occurrido un error. Por favor intenta nuevamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h1 className="login-title">Login</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Accediendo..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
