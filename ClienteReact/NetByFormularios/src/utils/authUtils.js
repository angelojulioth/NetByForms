// utils/authUtils.js
// esta utilidad sirve para la comprobación de validez del token tanto en el cliente
// como en el servidor. En el cliente, se utiliza para verificar si el token almacenado
// en el almacenamiento local es válido. En el servidor, se utiliza para verificar si
// el token enviado en la solicitud es válido.
export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("tokenExpiration");

  // remover token y tiempo de expiración del token del almacenamiento local
  const removeToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
  };

  // verificacion del lado de cliente para la existencia de keys de token, o tiempo de exp
  if (!token || !tokenExpiration || new Date().getTime() > tokenExpiration) {
    removeToken();
    return false;
  }

  // revisión fallback para verificar la validez del token del lado del servidor
  return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Auth/validaToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.valid) {
        removeToken();
        return false;
      }
      return true;
    })
    .catch(() => {
      removeToken();
      return false;
    });
};
