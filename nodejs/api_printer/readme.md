# Dependencias de la API
- Nodejs: v16.13.1+
- pdf-to-printer: v5.2.0+

# Forma de uso
- Abrir una terminal.
- Dirigirse a la carpeta raíz de la api.
- Ejecutar el comando 'npm install' (solo la primera vez).
- Ejecutar el comando 'npm start'.
- Para modificaciones en la api se puede usar el comando 'npm run dev' para desarrollo.
- La api está disponible en el puerto 5178, si desea cambiarlo editar el archivo 'bin/www'

# Rutas

### Rutas se encuentran en la carpeta routes en el archivo index.js
- '/': Ruta con verbo GET que brinda al usuario la interfaz para cambiar la impresora por defecto
- '/print': Ruta con verbo POST que recibe el archivo binario PDF y lo envia ala impresora seleccionada por defecto, este endpoint utiliza la carpeta 'api_printer_tmp' para almacenar de forma temporal el PDF que recibe del cliente, una vez acaba la ejecución del endpoint el archivo temporal se elimina.
- '/change': Ruta con verbo POST que recibe un objeto dentro del body de la peticion '{ printer: "impresora" }', cambia la impresora por defecto que utiliza la api.
- '/show-printers': ruta con verbo GET que se utiliza para mostrar en consola las impresosar disponibles en el sistema.

# Aplicacion web
- Creada a base de Jade templates, la interfaz de usuario se encuentra en 'views/index.jade'
- La logica de la aplicación se encuentra en 'public/javascripts/index.js' en este archivo se encuentra la logica para realizar las peticiones a la api desde la aplicación web.