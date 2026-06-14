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

function generateFallbackContent(materia, topicName, totalHours) {
  const formattedTopic = topicName.toLowerCase();
  let objective = `Comprender los fundamentos de ${topicName} y su aplicación práctica en ${materia}.`;
  let explanation = `En esta lección de ${totalHours} horas totales de estudio, exploramos ${topicName}. Analizamos sus principios fundamentales y cómo resolver problemas utilizando metodologías sistemáticas.`;
  let keyConcepts = [`Concepto clave de ${topicName}`, `Aplicación práctica en ${materia}`];
  let formulas = [`Fórmula de ${topicName}: E = mc² (simulado)`];
  let solvedExercises = [
    {
      title: `Ejercicio resuelto de ${topicName}`,
      difficulty: 'Universitario',
      problem: `Dado un sistema en el contexto de ${topicName}, calcular el estado final.`,
      solution: [
        'Paso 1: Identificar las variables de estado del problema.',
        'Paso 2: Aplicar la ley fundamental correspondiente.',
        'Paso 3: Realizar los cálculos algebraicos y simplificar.'
      ],
      finalAnswer: 'Solución del ejercicio'
    }
  ];
  let practicalExercises = [
    {
      question: `¿Cómo aplicarías los conceptos de ${topicName} para resolver un caso real?`,
      hint: 'Piensa en las condiciones iniciales y las leyes de conservación.',
      solution: 'Se deben plantear las ecuaciones, aplicar las condiciones de borde e integrar.'
    }
  ];
  let miniGames = [
    {
      type: 'flashcards',
      data: [
        { front: `¿Qué es ${topicName}?`, back: `Es un concepto clave de la materia ${materia}.` },
        { front: '¿Cuál es el primer paso para resolver problemas?', back: 'Identificar las variables y hacer un diagrama.' },
        { front: '¿Por qué es importante este tema?', back: 'Permite modelar sistemas físicos e informáticos del mundo real.' }
      ]
    },
    {
      type: 'matching',
      data: {
        pairs: [
          { left: 'Estado Inicial', right: 'Condiciones de partida del sistema' },
          { left: 'Modelo', right: 'Representación matemática simplificada' },
          { left: 'Variable', right: 'Elemento que cambia de valor en el tiempo' },
          { left: 'Solución', right: 'Resultado verificado tras el análisis' }
        ]
      }
    }
  ];
  let quiz = [
    {
      question: `¿Cuál es el objetivo principal al estudiar ${topicName}?`,
      options: [
        'Comprender sus leyes y poder predecir el comportamiento del sistema',
        'Memorizar fórmulas sin entender el contexto',
        'Evitar hacer cálculos prácticos',
        'Ninguno de los anteriores'
      ],
      correct: 0,
      explanation: 'El enfoque universitario busca la comprensión profunda y la capacidad de modelado.',
      weakArea: 'Conceptos fundamentales'
    },
    {
      question: `Para resolver un problema complejo de ${topicName}, lo primero es:`,
      options: [
        'Hacer operaciones al azar',
        'Analizar el problema, identificar variables y plantear un modelo',
        'Buscar la solución final directamente',
        'Ignorar las unidades de medida'
      ],
      correct: 1,
      explanation: 'Un método sistemático es fundamental para el éxito en ciencias e ingeniería.',
      weakArea: 'Metodología de resolución'
    }
  ];

  if (formattedTopic.includes('límite') || formattedTopic.includes('limit') || formattedTopic.includes('límites')) {
    objective = 'Dominar el cálculo de límites y determinar la continuidad de funciones.';
    explanation = `En este módulo de ${totalHours} horas, revisaremos límites algebraicos y trigonométricos. Los límites describen el comportamiento de una función cerca de un punto.`;
    keyConcepts = ['Límites laterales', 'Indeterminación 0/0', 'Continuidad formal'];
    formulas = ['lim(x→0) sin(x)/x = 1', 'lim(x→a) f(x) = f(a) para continuidad'];
    solvedExercises = [
      {
        title: 'Límite con racionalización',
        difficulty: 'Universitario',
        problem: 'Calcular lim(x→4) (√x - 2) / (x - 4)',
        solution: [
          'Paso 1: Evaluar en x=4. Da la indeterminación 0/0.',
          'Paso 2: Multiplicar numerador y denominador por el conjugado (√x + 2).',
          'Paso 3: El numerador queda (x - 4). El denominador es (x - 4)(√x + 2).',
          'Paso 4: Cancelar (x - 4) y evaluar: 1 / (√4 + 2) = 1/4.'
        ],
        finalAnswer: '1/4'
      }
    ];
    practicalExercises = [
      {
        question: 'Calcular lim(x→0) tan(2x) / x',
        hint: 'Usa la identidad tan(u) = sin(u)/cos(u) y el límite fundamental sin(u)/u → 1.',
        solution: 'Reescribe como (sin(2x)/x) * (1/cos(2x)) = 2 * (sin(2x)/2x) * (1/cos(2x)). Al evaluar x→0, queda 2 * 1 * 1 = 2.'
      }
    ];
    miniGames[0].data = [
      { front: 'Límite', back: 'Valor al que se aproxima una función cuando la variable se acerca a un punto.' },
      { front: 'Discontinuidad Evitable', back: 'Existe el límite pero no es igual al valor evaluado de la función.' },
      { front: 'Regla de L\'Hôpital', back: 'Método que utiliza derivadas para evaluar límites indeterminados 0/0 o ∞/∞.' }
    ];
    miniGames[1].data.pairs = [
      { left: 'Indeterminación', right: 'Expresión como 0/0 que requiere más análisis' },
      { left: 'Continuidad', right: 'El límite coincide con el valor de la función' },
      { left: 'Límite Lateral', right: 'Aproximación por la izquierda o derecha' },
      { left: 'Conjugado', right: 'Técnica de multiplicar por (a+b) para eliminar raíces' }
    ];
    quiz = [
      {
        question: 'Si lim(x→a) f(x) = 0 y lim(x→a) g(x) = 0, ¿qué se puede afirmar a priori sobre lim(x→a) f(x)/g(x)?',
        options: [
          'El límite no existe.',
          'Es igual a 0.',
          'Es una indeterminación de tipo 0/0; su valor real depende del comportamiento relativo de f y g al aproximarse a a.',
          'Es siempre igual a 1.'
        ],
        correct: 2,
        explanation: 'La forma 0/0 es una indeterminación. El valor real del límite dependerá de cómo se aproximen ambas funciones a cero (por ejemplo, aplicando la Regla de L\'Hôpital o simplificación algebraica).',
        weakArea: 'Concepto de Indeterminación'
      },
      {
        question: 'Si una función f(x) cumple que f(1) = 3, pero lim(x→1) f(x) = 5, ¿cuál de las siguientes afirmaciones es correcta?',
        options: [
          'La función es continua en x = 1.',
          'f(x) presenta una discontinuidad inevitable de salto infinito.',
          'f(x) presenta una discontinuidad evitable en x = 1.',
          'La derivada f\'(1) debe ser 0.'
        ],
        correct: 2,
        explanation: 'Una discontinuidad es evitable si el límite en el punto existe pero difiere del valor de la función, es decir, lim(x→c) f(x) ≠ f(c).',
        weakArea: 'Definición de Continuidad'
      }
    ];
  } else if (formattedTopic.includes('derivada') || formattedTopic.includes('deriv') || formattedTopic.includes('derivación')) {
    objective = 'Calcular derivadas usando reglas estándar y aplicarlas en optimización.';
    explanation = `La derivada mide la tasa de cambio instantánea. Dedicaremos ${totalHours} horas a dominar las reglas del producto, cociente y cadena, así como optimización.`;
    keyConcepts = ['Tasa de cambio', 'Regla de la cadena', 'Máximos y mínimos'];
    formulas = ["f'(x) = lim(h→0) [f(x+h)-f(x)]/h", "(uv)' = u'v + uv'"];
    solvedExercises = [
      {
        title: 'Derivada con regla de la cadena',
        difficulty: 'Universitario',
        problem: 'Derivar f(x) = sin(x² + 1)',
        solution: [
          'Paso 1: Identificar la función externa (sin) y la interna (x² + 1).',
          'Paso 2: Derivada de la externa evaluada en la interna: cos(x² + 1).',
          'Paso 3: Derivada de la interna: 2x.',
          'Paso 4: Multiplicar ambas partes: f\'(x) = 2x · cos(x² + 1).'
        ],
        finalAnswer: "f'(x) = 2x·cos(x²+1)"
      }
    ];
    practicalExercises = [
      {
        question: 'Encontrar el punto crítico de f(x) = x² - 4x + 5 y determinar si es máximo o mínimo.',
        hint: 'Calcula la primera derivada, iguala a cero y evalúa el signo de la segunda derivada.',
        solution: "f'(x) = 2x - 4 = 0 => x = 2. Como f''(x) = 2 > 0, es un mínimo local."
      }
    ];
    miniGames[0].data = [
      { front: 'Punto Crítico', back: 'Punto donde la primera derivada es cero o no existe.' },
      { front: 'Concavidad', back: 'Propiedad determinada por el signo de la segunda derivada.' },
      { front: 'Optimización', back: 'Proceso de encontrar los valores máximos o mínimos de una función.' }
    ];
    miniGames[1].data.pairs = [
      { left: "f'(x) > 0", right: 'La función es creciente' },
      { left: "f'(x) = 0", right: 'Punto de tangente horizontal (candidato a extremo)' },
      { left: "f''(x) < 0", right: 'Función cóncava hacia abajo (máximo local)' },
      { left: 'Derivada', right: 'Pendiente de la recta tangente en un punto' }
    ];
    quiz = [
      {
        question: 'Si una función f(x) tiene f\'(c) = 0 y f\'\'(c) = 0, ¿qué se puede concluir con certeza sobre el punto c?',
        options: [
          'Que c es un máximo local.',
          'Que c es un mínimo local.',
          'Que c es un punto de inflexión.',
          'El criterio de la segunda derivada no es concluyente; se requiere analizar derivadas de orden superior o el cambio de signo de f\'.'
        ],
        correct: 3,
        explanation: 'Si la segunda derivada es cero, el criterio de la segunda derivada no decide. Puede ser un extremo o un punto de inflexión (ej: y=x³ vs y=x⁴ en x=0).',
        weakArea: 'Criterio de la segunda derivada'
      },
      {
        question: '¿Cuál de las siguientes afirmaciones respecto a la diferenciabilidad de f(x) = |x| en x = 0 es correcta?',
        options: [
          'Es diferenciable porque es una función continua en toda la recta real.',
          'La derivada en x = 0 es 0 porque es el punto más bajo de la curva.',
          'No es diferenciable en x = 0 porque los límites laterales del cociente incremental difieren (dan 1 y -1).',
          'Su derivada en x = 0 es 1.'
        ],
        correct: 2,
        explanation: 'La función valor absoluto tiene un "pico" en x=0. Los límites laterales de la pendiente de la secante son 1 (por la derecha) y -1 (por la izquierda), por lo que la derivada no existe en ese punto.',
        weakArea: 'Diferenciabilidad y continuidad'
      }
    ];
  } else if (formattedTopic.includes('poo') || formattedTopic.includes('objeto') || formattedTopic.includes('clase') || formattedTopic.includes('orientada a objetos')) {
    objective = 'Comprender la Programación Orientada a Objetos: clases, encapsulamiento, herencia y polimorfismo.';
    explanation = `Aprenderemos a modelar sistemas usando objetos. En estas ${totalHours} horas analizaremos los pilares de la POO en Java y cómo escribir código modular.`;
    keyConcepts = ['Encapsulamiento', 'Herencia', 'Polimorfismo', 'Clases abstractas'];
    formulas = ['public class Estudiante extends Persona { ... }'];
    solvedExercises = [
      {
        title: 'Creación de una clase encapsulada',
        difficulty: 'Básico',
        problem: 'Crear una clase CuentaBancaria con atributo saldo privado, constructor y métodos depositar y retirar.',
        solution: [
          'Paso 1: Declarar private double saldo.',
          'Paso 2: Crear el constructor que inicialice el saldo.',
          'Paso 3: Implementar depositar(double cant) sumando al saldo si cant > 0.',
          'Paso 4: Implementar retirar(double cant) restando al saldo si hay fondos suficientes.'
        ],
        finalAnswer: 'Clase CuentaBancaria implementada con private saldo'
      }
    ];
    practicalExercises = [
      {
        question: '¿Qué es el polimorfismo y cómo se implementa en Java?',
        hint: 'Piensa en métodos sobrescritos (@Override) y referencias de clases base.',
        solution: 'Permite que una referencia de clase padre invoque el método específico de la subclase instanciada en tiempo de ejecución.'
      }
    ];
    miniGames[0].data = [
      { front: 'Clase', back: 'Plantilla o molde para crear objetos.' },
      { front: 'Encapsulamiento', back: 'Ocultar los detalles de implementación y restringir acceso directo a atributos.' },
      { front: 'Polimorfismo', back: 'Habilidad de un objeto de tomar varias formas (ej: sobrescritura de métodos).' }
    ];
    miniGames[1].data.pairs = [
      { left: 'private', right: 'Acceso restringido solo a la misma clase' },
      { left: 'extends', right: 'Palabra clave para implementar herencia' },
      { left: 'interface', right: 'Contrato que define métodos sin implementación' },
      { left: 'new', right: 'Operador para instanciar un objeto' }
    ];
    quiz = [
      {
        question: 'En Java, si una clase hija sobrescribe un método de la clase padre heredando la misma firma, pero cambia el tipo de retorno a un subtipo del tipo de retorno original (ej. retornar ArrayList en vez de List):',
        options: [
          'Provoca un error de compilación por firma incompatible.',
          'Es una sobrescritura válida permitida desde Java 5 (conocida como retorno covariante).',
          'El compilador lo interpreta como una sobrecarga de métodos.',
          'Solo se permite si la clase padre es una interfaz y no una clase regular.'
        ],
        correct: 1,
        explanation: 'Java permite los retornos covariantes en la sobrescritura, lo cual significa que el método de la subclase puede devolver un tipo derivado del tipo de retorno declarado en la clase base.',
        weakArea: 'Retorno covariante en POO'
      },
      {
        question: '¿Cuál de las siguientes describe con mayor precisión la diferencia entre clase abstracta e interfaz a partir de Java 8?',
        options: [
          'Las interfaces ya no permiten herencia múltiple.',
          'Las clases abstractas pueden almacenar variables de instancia que representan un estado mutable, mientras que las interfaces solo pueden declarar constantes implícitas (public static final).',
          'Las interfaces ya no pueden contener métodos sin implementación.',
          'Las clases abstractas solo permiten métodos con visibilidad protegida.'
        ],
        correct: 1,
        explanation: 'A pesar de que las interfaces modernas permiten métodos por defecto y estáticos con cuerpo, la diferencia clave sigue siendo el estado: las clases abstractas pueden tener constructores y variables de instancia no constantes, mientras que las interfaces solo admiten variables implícitamente estáticas y constantes.',
        weakArea: 'Clases abstractas vs Interfaces'
      }
    ];
  }

  const supportVideos = [
    {
      title: `Explicación completa de ${topicName} - ${materia}`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicName + ' ' + materia + ' explicación universitaria')}`,
      description: `Video explicativo con los fundamentos teóricos de ${topicName}.`
    },
    {
      title: `Ejercicios resueltos de ${topicName}`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicName + ' ' + materia + ' ejercicios resueltos')}`,
      description: `Práctica guiada con ejercicios paso a paso de ${topicName}.`
    },
    {
      title: `${topicName} - Conceptos avanzados y aplicaciones`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicName + ' ' + materia + ' conceptos avanzados')}`,
      description: `Profundización en los conceptos clave y aplicaciones prácticas.`
    }
  ];

  return {
    objective,
    explanation,
    keyConcepts,
    formulas,
    solvedExercises,
    practicalExercises,
    miniGames,
    quiz,
    supportVideos
  };
}

async function generateTopicContentWithOpenAI(materia, topicName, totalHours) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('⚠️ No se detectó OPENAI_API_KEY. Usando fallback de generación local.');
    return generateFallbackContent(materia, topicName, totalHours);
  }

  try {
    const systemPrompt = `Eres un tutor de ciencias e ingeniería universitario de primer nivel. Tu tarea es generar material de estudio personalizado y de alta calidad para un tema específico de una asignatura.
Responde ÚNICAMENTE con un objeto JSON válido y estructurado según el esquema indicado.
El contenido debe adaptarse dinámicamente al tiempo disponible del usuario. Si el tiempo total de estudio es bajo (ej. 1-2 horas), sé muy sintético y directo a las fórmulas y conceptos clave. Si es alto, expande las explicaciones y la teoría.
Debes incluir ejercicios prácticos adicionales y al menos 2 mini-juegos interactivos para hacer el aprendizaje didáctico.
Además, DEBES incluir al menos 3 videos de apoyo de YouTube relevantes al tema. Para cada video, proporciona un título descriptivo y una URL de búsqueda de YouTube con el formato https://www.youtube.com/results?search_query=TERMINOS+DE+BUSQUEDA que lleve al estudiante directamente a resultados relevantes del tema.`;

    const userPrompt = `Asignatura: "${materia}"
Tema a generar: "${topicName}"
Tiempo disponible del estudiante para este plan: ${totalHours} horas en total.

Esquema JSON requerido:
{
  "objective": "Objetivo del tema (string)",
  "explanation": "Explicación teórica adaptada al tiempo de estudio (string)",
  "keyConcepts": ["Concepto 1", "Concepto 2", "Concepto 3"],
  "formulas": ["Fórmula 1", "Fórmula 2"],
  "solvedExercises": [
    {
      "title": "Título del ejercicio (string)",
      "difficulty": "Dificultad (string, ej: Básico, Intermedio, Universitario)",
      "problem": "Enunciado del problema (string)",
      "solution": ["Paso 1...", "Paso 2..."],
      "finalAnswer": "Respuesta final corta (string)"
    }
  ],
  "practicalExercises": [
    {
      "question": "Enunciado del ejercicio para que el alumno resuelva (string)",
      "hint": "Pista o consejo (string)",
      "solution": "Explicación paso a paso de la solución (string)"
    }
  ],
  "miniGames": [
    {
      "type": "flashcards",
      "data": [
        { "front": "Pregunta o término (string)", "back": "Respuesta o definición (string)" }
      ]
    },
    {
      "type": "matching",
      "data": {
        "pairs": [
          { "left": "Término corto (string)", "right": "Explicación o definición (string)" }
        ]
      }
    }
  ],
  "quiz": [
    {
      "question": "Pregunta del test. Debe ser desafiante, NO OBVIA, a nivel universitario, que exija análisis y deducción al estudiante (string)",
      "options": ["Opción 0", "Opción 1", "Opción 2", "Opción 3"],
      "correct": 0,
      "explanation": "Explicación de por qué es la correcta (string)",
      "weakArea": "Tema de debilidad a repasar si se falla (string)"
    }
  ],
  "supportVideos": [
    {
      "title": "Título descriptivo del video de apoyo (string)",
      "url": "https://www.youtube.com/results?search_query=terminos+de+busqueda+relevantes (string)",
      "description": "Breve descripción de qué cubre el video y por qué es útil (string)"
    }
  ]
}

Asegúrate de agregar al menos 3 flashcards y 4 parejas en el matching game. Genera de 3 a 5 preguntas en el quiz. IMPORTANTE: Las preguntas del quiz NO deben ser obvias ni de simple memorización; deben requerir análisis lógico, deducción matemática o conceptual y hacer pensar al alumno. DEBES incluir al menos 3 videos de apoyo en supportVideos con URLs de búsqueda de YouTube relevantes al tema y a la materia. Devuelve solo el JSON válido sin bloques de código markdown (\`\`\`json) ni texto adicional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error de API OpenAI:', errText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const resData = await response.json();
    const jsonString = resData.choices[0].message.content;
    const content = JSON.parse(jsonString);

    if (!content.objective || !content.explanation || !content.miniGames) {
      throw new Error('Estructura de respuesta inválida de la IA');
    }

    return content;
  } catch (error) {
    console.error('⚠️ Falló la llamada a OpenAI API. Usando fallback de generación local:', error.message);
    return generateFallbackContent(materia, topicName, totalHours);
  }
}

// 4.5. Generar contenido de tema por IA
app.post('/api/planes/:id/generar-tema', async (req, res) => {
  const { id } = req.params;
  const { topicId } = req.body;

  if (topicId === undefined) {
    return res.status(400).json({ success: false, message: 'El topicId es obligatorio.' });
  }

  try {
    const planRes = await pool.query('SELECT * FROM planes_estudio WHERE id = $1', [id]);
    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan de estudio no encontrado.' });
    }

    const plan = planRes.rows[0];
    const temas = plan.temas;
    
    const topicIdx = temas.findIndex(t => t.id === parseInt(topicId, 10));
    if (topicIdx === -1) {
      return res.status(404).json({ success: false, message: 'Tema no encontrado en el plan.' });
    }

    const topic = temas[topicIdx];

    if (topic.content) {
      return res.status(200).json({
        success: true,
        content: topic.content,
        message: 'Contenido cargado desde caché.'
      });
    }

    const totalHours = plan.tiempo_dias * plan.horas_diarias;
    const generatedContent = await generateTopicContentWithOpenAI(plan.materia, topic.name, totalHours);

    temas[topicIdx].content = generatedContent;

    await pool.query('UPDATE planes_estudio SET temas = $1 WHERE id = $2', [JSON.stringify(temas), id]);

    res.status(200).json({
      success: true,
      content: generatedContent,
      message: 'Contenido generado exitosamente con IA.'
    });

  } catch (err) {
    console.error('Error al generar tema con IA:', err.message);
    res.status(500).json({ success: false, message: 'Error en el servidor al generar contenido.' });
  }
});

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
