# WebApp de formularios

# Instrucciones

## Web API .NET

La carpeta APIFormularios contiene la solución y el proyecto de la API Web

## Cliente React

El cliente react usa vite como builder, se usa el archivo `.env` para establecer la url que compone
los endpoints que escuchan del lado del servicio, cambiar la configuración VITE_API_BASE_URL=https://localhost:7144
según sea necesario.

Esto es un requisito para no tener la cadena del url quemada en todos los archivos/componentes que hagan request al servicio.

## Imágenes de Funcionalidad

Contiene imágenes del funcionamiento de la aplicación desde el cliente react

## Base de datos

Usar SQL Server

El archivo `MigracionesSQL.sql` contiene el script inicial para poblar la base de datos y crear los stored
procedures.

Deben estar ingresados todos los stored procedures para que funcione correctamente la capa de servicio del API

### Advertencia

Dentro del proyecto de la API Web .NET se encuentra `appsettings.json`, este archivo sirve para configuraciones
del servicio, desde la duración del token, etc. Sin embargo, la configuración que debemos tomar en consideración es
la cadena de conexión a la base de datos.

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=LAPTOP-DJ19MSGT;Database=NetByFormularios;User Id=sa;Password=ba;TrustServerCertificate=True"
  },
```

La clave es `ConnectionStrings` y es pertinente a nuestro entorno, o en el que se corra el motor de SQL Server, que
se coloque de manera correcta el valor de la cadena de conexión de la clave `DefaultConnection`.

Tomar en consideración que en la cadena de conexión que se encuentra subida se usa un id y un password
de un usuario local agregado como login a la instancia de sql server, esto se debe cambiar según corresponda.

# Capturas funcionalidad

![Form Login](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/login.png?raw=true)
![Form Login password ver campo](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/login-passwordsee.png?raw=true)
![Form Login password incorrecto](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/login-fail.png?raw=true)
![Form Creación 1](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-crear.png?raw=true)
![Form Creación 2](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-test1.png?raw=true)
![Form Creación 3](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-test2.png?raw=true)
![Form Creación 4](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-test3.png?raw=true)
![Form Enviado](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/form-enviado.png?raw=true)
![Form Guardado](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/form-guardado.png?raw=true)
![Form Enviar](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/form-ver-enviar.png?raw=true)
![Form Borrado](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-borrado.png?raw=true)
![Form Ingreso Requeridos](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/form-ingreso-requeridos.png?raw=true)
![Form Lista de plantillas de formularios](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-lista.png?raw=true)
![Form Ver detalles de ingresos al formulario](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-verregistros.png?raw=true)
![Form Ingresos](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-final1.png?raw=true)
![Form Detalles de un formulario ingresado](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-final2.png?raw=true)
![Form Visualización de un formulario ingresado](https://github.com/angelojulioth/NetByForms/blob/main/ImagenesFuncionalidad/forms-final3.png?raw=true)
