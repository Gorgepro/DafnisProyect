import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection pool
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

// Test connection and initialize tables
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL (Neon)');
    
    // Create the usuarios table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "usuarios" verificada/creada correctamente');

    // Create the planes_estudio table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS planes_estudio (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        materia VARCHAR(100) NOT NULL,
        icon VARCHAR(10) DEFAULT '',
        tiempo_dias INT NOT NULL,
        horas_diarias INT NOT NULL,
        temas JSONB NOT NULL,
        estado VARCHAR(20) DEFAULT 'activo',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safe migration: add estado column if table existed without it
    await client.query(`
      ALTER TABLE planes_estudio
      ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';
    `);
    console.log('✅ Tabla "planes_estudio" verificada/creada correctamente');

    client.release();
  } catch (err) {
    console.error('❌ Error al conectar o inicializar la base de datos:', err.message);
  }
}

// Call database initialization (runs when serverless function is warmed up or when local server runs)
initializeDatabase();

// --- API ROUTES ---

// 1. Registro de Usuario
app.post('/api/auth/register', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    const userExists = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Este correo ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING id, nombre, correo',
      [nombre, correo, hashedPassword]
    );

    const newUser = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Cuenta creada correctamente.',
      user: { id: newUser.id, nombre: newUser.nombre, correo: newUser.correo },
    });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar usuario.' });
  }
});

// 2. Inicio de Sesión
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'El usuario no existe.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    res.status(200).json({
      success: true,
      message: 'Sesión iniciada.',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
      },
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al iniciar sesión.' });
  }
});

// 3. Crear Plan de Estudio
app.post('/api/planes', async (req, res) => {
  const { usuario_id, materia, icon, tiempo_dias, horas_diarias, temas } = req.body;

  if (!usuario_id || !materia || !tiempo_dias || !horas_diarias || !temas) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO planes_estudio (usuario_id, materia, icon, tiempo_dias, horas_diarias, temas, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'activo')
       RETURNING *`,
      [usuario_id, materia, icon || '📚', tiempo_dias, horas_diarias, JSON.stringify(temas)]
    );

    res.status(201).json({
      success: true,
      plan: result.rows[0],
      message: 'Plan de estudio creado con éxito.',
    });
  } catch (err) {
    console.error('Error al crear plan:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al crear plan de estudio.' });
  }
});

// 4. Obtener Planes de un Usuario
app.get('/api/planes', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ success: false, message: 'El id de usuario es obligatorio.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM planes_estudio WHERE usuario_id = $1 ORDER BY creado_en DESC',
      [usuario_id]
    );

    res.status(200).json({
      success: true,
      planes: result.rows,
    });
  } catch (err) {
    console.error('Error al obtener planes:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener planes de estudio.' });
  }
});

const VALID_ESTADOS = ['activo', 'finalizado'];

function validateEstado(estado) {
  return VALID_ESTADOS.includes(estado);
}

// 5. Actualizar Plan de Estudio (Temas o Estado)
app.put('/api/planes/:id', async (req, res) => {
  const { id } = req.params;
  const { temas, estado } = req.body;

  if (temas === undefined && estado === undefined) {
    return res.status(400).json({ success: false, message: 'Se requiere al menos un campo para actualizar.' });
  }

  if (estado !== undefined && !validateEstado(estado)) {
    return res.status(400).json({
      success: false,
      message: 'Estado inválido. Solo se permiten "activo" o "finalizado".',
    });
  }

  try {
    let query = 'UPDATE planes_estudio SET ';
    const values = [];
    let count = 1;

    if (temas !== undefined) {
      query += `temas = $${count}, `;
      values.push(JSON.stringify(temas));
      count++;
    }

    if (estado !== undefined) {
      query += `estado = $${count}, `;
      values.push(estado);
      count++;
    }

    // Remover la coma y espacio finales
    query = query.slice(0, -2);
    query += ` WHERE id = $${count} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan de estudio no encontrado.' });
    }

    res.status(200).json({
      success: true,
      plan: result.rows[0],
      message: 'Plan de estudio actualizado con éxito.',
    });
  } catch (err) {
    console.error('Error al actualizar plan:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al actualizar plan de estudio.' });
  }
});

// 6. Eliminar Plan de Estudio
app.delete('/api/planes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM planes_estudio WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan de estudio no encontrado.' });
    }

    res.status(200).json({
      success: true,
      message: 'Plan de estudio eliminado con éxito.',
    });
  } catch (err) {
    console.error('Error al eliminar plan:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al eliminar plan de estudio.' });
  }
});

// Run app.listen only if we are NOT in the Vercel serverless environment (local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local corriendo en http://localhost:${PORT}`);
  });
}

// Export default app for Vercel serverless function routing
export default app;
