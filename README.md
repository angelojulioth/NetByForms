# WebApp de formularios

# Instrucciones

## Web API .NET

La carpeta APIFormularios contiene la solución y el proyecto de la API Web

## Cliente React

El cliente react usa vite como builder, se usa el archivo .env para establecer la url que compone
los endpoints que escuchan del lado del servicio, cambiar la configuración VITE_API_BASE_URL=https://localhost:7144
según sea necesario

## Imágenes de Funcionalidad

Contiene imágenes del funcionamiento de la aplicación desde el cliente react

## Base de datos

El archivo `MigracionesSQL.sql` contiene el script inicial para poblar la base de datos y crear los stored
procedures.

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
