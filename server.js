// Cargar variables de entorno para seguridad
require('dotenv').config();

const express = require('express');
const path = require('path');
const { initializeDatabase } = require('./database.js'); // Importar el inicializador de la BD

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para servir archivos estáticos (HTML, CSS, JS del cliente)
app.use(express.static(path.join(__dirname, 'website')));

// Middleware para poder leer JSON del cuerpo de las peticiones
app.use(express.json());

// Función principal asíncrona para poder inicializar la base de datos primero
async function startServer() {
    // Inicializar la base de datos y obtener el objeto de conexión
    const db = await initializeDatabase();

    // Endpoint de la API para recibir y guardar el diagnóstico
    app.post('/api/enviar-diagnostico', async (req, res) => {
        console.log('📩 Recibiendo nuevo diagnóstico...');
        const datos = req.body;
        console.log('Datos recibidos:', JSON.stringify(datos, null, 2));

        if (!datos || Object.keys(datos).length === 0) {
            console.error('Error: El cuerpo de la solicitud está vacío.');
            return res.status(400).json({ message: 'El cuerpo de la solicitud no puede estar vacío.' });
        }

        try {
            // Extraer datos clave para las columnas de la tabla
            const nombre = datos.seccion1?.nombre || 'N/A';
            const email = datos.cierre?.email || 'N/A';
            const tipoSolucion = datos.seccion2?.tipoSolucion || 'N/A';
            const datosJsonString = JSON.stringify(datos); // Guardar el JSON completo

            console.log('Intentando insertar en la base de datos...');
            // Insertar los datos en la tabla 'diagnosticos'
            const result = await db.execute({
                sql: 'INSERT INTO diagnosticos (nombre, email, tipo_solucion, datos_json) VALUES (?, ?, ?, ?)',
                args: [nombre, email, tipoSolucion, datosJsonString]
            });

            console.log(`✅ Nuevo diagnóstico guardado con ID: ${result.lastInsertRowid}`);
            res.status(200).json({ message: 'Diagnóstico guardado correctamente.' });

        } catch (error) {
            console.error('❌ Error al guardar en la base de datos:', error);
            res.status(500).json({ message: 'Error interno del servidor al guardar el diagnóstico.' });
        }
    });

    // Iniciar el servidor
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log('✅ Servidor listo y conectado a Turso');
    });
}

startServer(); // Ejecutar la función principal