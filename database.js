const { createClient } = require('@libsql/client');

// Esta función abrirá la conexión a la base de datos y se asegurará de que la tabla exista.
async function initializeDatabase() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        throw new Error("Variable de entorno 'TURSO_DATABASE_URL' no definida. Asegúrate de configurar tu archivo .env o las variables de entorno del hosting.");
    }

    const config = {
        url,
        authToken,
    };

    try {
        const db = createClient(config);

        // Crear la tabla si no existe.
        await db.execute(`
            CREATE TABLE IF NOT EXISTS diagnosticos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT,
                email TEXT,
                tipo_solucion TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                datos_json TEXT NOT NULL
            )
        `);

        console.log('✅ Conexión a la base de datos de Turso establecida y tabla asegurada.');
        return db;
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos de Turso:', error);
        process.exit(1); // Salir si no podemos conectar a la BD
    }
}

module.exports = { initializeDatabase };