export const externalResources = {
  calculoDiferencial: [
    { title: 'Khan Academy - Límites y continuidad', url: 'https://es.khanacademy.org/math/differential-calculus/dc-limits' },
    { title: 'OpenStax - The Limit of a Function', url: 'https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function' },
    { title: 'OpenStax - Defining the Derivative', url: 'https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative' },
    { title: 'MIT OCW - Single Variable Calculus', url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/' },
  ],
  calculoIntegral: [
    { title: 'Khan Academy - Cálculo integral', url: 'https://es.khanacademy.org/math/integral-calculus' },
    { title: 'Khan Academy - Introducción a integrales definidas', url: 'https://es.khanacademy.org/math/ap-calculus-ab/ab-integration-new/ab-6-1/v/definite-integrals-intro' },
    { title: 'MIT OCW - Problem Sets Single Variable Calculus', url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/1.-differentiation/part-a-definition-and-basic-rules/problem-set-1/' },
  ],
  fisica: [
    { title: "OpenStax University Physics - Newton's Laws", url: 'https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws' },
    { title: 'MIT OCW - Classical Mechanics', url: 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/' },
    { title: 'MIT OCW - Classical Mechanics Assignments', url: 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/pages/assignments/' },
  ],
  java: [
    { title: 'Oracle - Java Tutorials: Object-Oriented Programming Concepts', url: 'https://docs.oracle.com/javase/tutorial/java/concepts/index.html' },
    { title: 'Oracle - Java Tutorials: Interfaces and Inheritance', url: 'https://docs.oracle.com/javase/tutorial/java/IandI/index.html' },
    { title: 'W3Resource - Java Exercises with Solutions', url: 'https://www.w3resource.com/java-exercises/' },
    { title: 'W3Resource - Java Array Exercises', url: 'https://www.w3resource.com/java-exercises/array/index.php' },
  ],
};

const quizMeta = (question, options, correct, explanation, weakArea) => ({
  question, options, correct, explanation, weakArea,
});

export const subjectContent = {
  'cálculo diferencial': {
    'límites y continuidad': {
      objective: 'Dominar el cálculo de límites con indeterminaciones algebraicas y trigonométricas, y determinar continuidad en puntos críticos usando definición formal y técnicas avanzadas.',
      explanation: 'El límite formal describe el comportamiento de f(x) cuando x se aproxima a un valor. A nivel universitario se trabajan indeterminaciones 0/0 mediante factorización avanzada, identidades trigonométricas, expansión de Taylor y la regla de L\'Hôpital. La continuidad en x=a exige que exista f(a), que exista lim(x→a) f(x) y que ambos coincidan.',
      keyConcepts: [
        'Definición ε-δ de límite',
        'Indeterminaciones 0/0 y ∞/∞',
        'Límites trigonométricos fundamentales',
        'Continuidad y tipos de discontinuidad',
        'Expansión de Taylor para límites',
      ],
      formulas: [
        'lim(x→0) sin(x)/x = 1',
        'lim(x→0) (1 - cos(x))/x² = 1/2',
        'lim(x→0) (e^x - 1 - x)/x² = 1/2',
        'Regla de L\'Hôpital: lim f/g = lim f\'/g\' (bajo condiciones)',
      ],
      solvedExercises: [
        {
          title: 'Límite con expansión de Taylor',
          difficulty: 'Universitario',
          problem: 'Calcular L = lim(x→0) (e^x - 1 - x) / x²',
          solution: [
            'Paso 1: Evaluar en x=0 → 0/0. Usar expansión de Taylor: e^x = 1 + x + x²/2 + x³/6 + O(x⁴).',
            'Paso 2: Sustituir en el numerador: (1 + x + x²/2 + x³/6 + ...) - 1 - x = x²/2 + x³/6 + ...',
            'Paso 3: Dividir entre x²: (x²/2 + x³/6 + ...) / x² = 1/2 + x/6 + ...',
            'Paso 4: Tomar límite cuando x→0 → todos los términos con x desaparecen.',
          ],
          finalAnswer: 'L = 1/2',
          sourceName: 'OpenStax - The Limit of a Function',
          sourceUrl: externalResources.calculoDiferencial[1].url,
        },
        {
          title: 'Límite trigonométrico con identidades',
          difficulty: 'Universitario',
          problem: 'Calcular lim(x→0) (1 - cos(2x)) / (x · sin(x))',
          solution: [
            'Paso 1: Usar identidad 1 - cos(2x) = 2 sin²(x).',
            'Paso 2: Sustituir: 2 sin²(x) / (x · sin(x)) = 2 sin(x) / x.',
            'Paso 3: Aplicar lim(x→0) sin(x)/x = 1.',
            'Paso 4: Resultado = 2.',
          ],
          finalAnswer: '2',
          sourceName: 'Khan Academy - Límites y continuidad',
          sourceUrl: externalResources.calculoDiferencial[0].url,
        },
      ],
      videos: [
        { title: 'Límites y continuidad - Khan Academy', platform: 'Khan Academy', url: externalResources.calculoDiferencial[0].url },
        { title: 'Single Variable Calculus - MIT OCW', platform: 'MIT OCW', url: externalResources.calculoDiferencial[3].url },
      ],
      links: externalResources.calculoDiferencial,
      quiz: [
        quizMeta('¿Cuál es lim(x→0) (e^x - 1 - x)/x²?', ['0', '1/2', '1', '∞'], 1, 'Por Taylor: e^x ≈ 1 + x + x²/2, el numerador ≈ x²/2.', 'Expansión de Taylor'),
        quizMeta('Si f tiene discontinuidad evitable en x=a, entonces:', ['lim(x→a) f(x) existe pero f(a) no coincide o no existe', 'Los límites laterales son infinitos', 'f no tiene límite en a'], 0, 'Discontinuidad evitable: el límite existe pero hay un "hueco".', 'Continuidad'),
        quizMeta('lim(x→0) sin(3x)/x es igual a:', ['0', '1', '3', '1/3'], 2, 'sin(3x)/x = 3 · sin(3x)/(3x) → 3·1 = 3.', 'Límites trigonométricos'),
        quizMeta('¿Cuándo NO se puede aplicar L\'Hôpital directamente?', ['Cuando la forma es 0/0', 'Cuando la forma es 0·∞ sin reescribir', 'Cuando f\' y g\' existen y g\'≠0'], 1, '0·∞ debe convertirse a 0/0 o ∞/∞ antes de aplicar L\'Hôpital.', 'Regla de L\'Hôpital'),
        quizMeta('Una función es continua en [a,b] si:', ['Es continua solo en el interior', 'Es continua en (a,b), f(a) y f(b) existen y los límites laterales coinciden', 'Tiene derivada en todo el intervalo'], 1, 'Continuidad en intervalo cerrado requiere continuidad interior más límites laterales en extremos.', 'Continuidad en intervalos'),
      ],
    },
    'definición de la derivada': {
      objective: 'Comprender la derivada como límite del cociente incremental, aplicar derivación implícita y resolver problemas de razón de cambio y optimización.',
      explanation: 'La derivada f\'(x) mide la tasa instantánea de cambio. Se define como lim(h→0)[f(x+h)-f(x)]/h. La diferenciabilidad implica continuidad, pero no al revés. Las aplicaciones universitarias incluyen optimización con criterios de primera y segunda derivada, derivación implícita y regla de la cadena combinada con producto y cociente.',
      keyConcepts: ['Definición formal de derivada', 'Derivación implícita', 'Regla de la cadena compuesta', 'Optimización con criterio de segunda derivada', 'Razones de cambio relacionadas'],
      formulas: [
        "f'(x) = lim(h→0) [f(x+h) - f(x)] / h",
        'Regla del producto: (uv)\' = u\'v + uv\'',
        'Regla de la cadena: (f(g(x)))\' = f\'(g(x))·g\'(x)',
        'Criterio: f\'(c)=0 y f\'\'(c)>0 → mínimo local',
      ],
      solvedExercises: [
        {
          title: 'Optimización: caja de volumen máximo',
          difficulty: 'Universitario',
          problem: 'De una lámina cuadrada de lado 12 cm se recortan cuadrados de lado x en las esquinas para formar una caja abierta. Hallar x que maximiza el volumen.',
          solution: [
            'Paso 1: Dimensiones de la caja: base (12-2x)², altura x. V(x) = x(12-2x)².',
            'Paso 2: Expandir: V(x) = x(144 - 48x + 4x²) = 144x - 48x² + 4x³.',
            'Paso 3: V\'(x) = 144 - 96x + 12x² = 12(x² - 8x + 12).',
            'Paso 4: V\'(x)=0 → x = 2 o x = 6. Descartar x=6 (base nula). V\'\'(2) < 0 → máximo.',
          ],
          finalAnswer: 'x = 2 cm',
          sourceName: 'OpenStax - Defining the Derivative',
          sourceUrl: externalResources.calculoDiferencial[2].url,
        },
        {
          title: 'Derivación implícita',
          difficulty: 'Universitario',
          problem: 'Si x² + xy + y² = 7, hallar dy/dx en el punto (2, 1).',
          solution: [
            'Paso 1: Derivar implícitamente: 2x + y + x(dy/dx) + 2y(dy/dx) = 0.',
            'Paso 2: Factorizar dy/dx: dy/dx · (x + 2y) = -(2x + y).',
            'Paso 3: dy/dx = -(2x + y)/(x + 2y).',
            'Paso 4: En (2,1): dy/dx = -(4+1)/(2+2) = -5/4.',
          ],
          finalAnswer: 'dy/dx = -5/4',
          sourceName: 'MIT OCW - Single Variable Calculus',
          sourceUrl: externalResources.calculoDiferencial[3].url,
        },
      ],
      videos: [
        { title: 'Defining the Derivative - OpenStax', platform: 'OpenStax', url: externalResources.calculoDiferencial[2].url },
        { title: 'Cálculo diferencial - Khan Academy', platform: 'Khan Academy', url: 'https://es.khanacademy.org/math/differential-calculus' },
      ],
      links: externalResources.calculoDiferencial,
      quiz: [
        quizMeta('Si f es diferenciable en x=c, entonces:', ['f es continua en c', 'f tiene máximo en c', 'f\'(c)=0 siempre'], 0, 'Diferenciabilidad implica continuidad, pero no al revés.', 'Relación continuidad-diferenciabilidad'),
        quizMeta('La derivada de f(x)=1/x usando definición es:', ['1/x²', '-1/x²', '-1/x'], 1, 'Con cociente de diferencias y simplificación algebraica se obtiene -1/x².', 'Definición de derivada'),
        quizMeta('En optimización, f\'\'(c)>0 con f\'(c)=0 indica:', ['Máximo local', 'Mínimo local', 'Punto de inflexión'], 1, 'Segunda derivada positiva → concavidad hacia arriba → mínimo.', 'Optimización'),
        quizMeta('Para f(g(x)), la derivada es:', ["f'(x)·g'(x)", "f'(g(x))·g'(x)", "f(g'(x))"], 1, 'Regla de la cadena: derivada exterior evaluada en interior × derivada interior.', 'Regla de la cadena'),
        quizMeta('Razón de cambio: si r² + h² = 25 y dr/dt=3, ¿cuál es dh/dt cuando r=3, h=4?', ['-9/4', '9/4', '-3/4'], 0, 'Derivar: 2r(dr/dt) + 2h(dh/dt)=0 → dh/dt = -r/h · dr/dt = -9/4.', 'Razones de cambio'),
      ],
    },
  },
  'cálculo integral': {
    'integrales definidas e indefinidas': {
      objective: 'Resolver integrales mediante sustitución, integración por partes y sustitución trigonométrica; calcular áreas entre curvas y volúmenes de revolución.',
      explanation: 'La integral indefinida es la antiderivada; la integral definida representa el área neta bajo la curva y se conecta con la derivada mediante el Teorema Fundamental del Cálculo. Las técnicas avanzadas incluyen integración por partes (ILATE), sustitución trigonométrica para raíces cuadradas y cálculo de volúmenes con el método de discos o capas.',
      keyConcepts: ['Teorema Fundamental del Cálculo', 'Integración por partes (ILATE)', 'Sustitución trigonométrica', 'Áreas entre curvas', 'Volúmenes de revolución'],
      formulas: [
        '∫ u dv = uv - ∫ v du',
        '∫[a,b] f(x)dx = F(b) - F(a)',
        'Área entre curvas: ∫[a,b] (f(x) - g(x))dx',
        'Volumen (discos): V = π∫[a,b] [R(x)]² dx',
      ],
      solvedExercises: [
        {
          title: 'Integración por partes',
          difficulty: 'Universitario',
          problem: 'Calcular I = ∫ x² ln(x) dx',
          solution: [
            'Paso 1: ILATE → u = ln(x), dv = x²dx → du = dx/x, v = x³/3.',
            'Paso 2: I = (x³/3)ln(x) - ∫ (x³/3)(1/x)dx = (x³/3)ln(x) - (1/3)∫ x²dx.',
            'Paso 3: ∫ x²dx = x³/3.',
            'Paso 4: I = (x³/3)ln(x) - x³/9 + C.',
          ],
          finalAnswer: 'I = (x³/3)ln(x) - x³/9 + C',
          sourceName: 'Khan Academy - Cálculo integral',
          sourceUrl: externalResources.calculoIntegral[0].url,
        },
        {
          title: 'Área entre curvas',
          difficulty: 'Universitario',
          problem: 'Hallar el área entre y = x² y y = 2x en [0, 2].',
          solution: [
            'Paso 1: Puntos de intersección: x² = 2x → x(x-2)=0 → x=0, x=2.',
            'Paso 2: En [0,2], 2x ≥ x², entonces área = ∫₀² (2x - x²)dx.',
            'Paso 3: ∫(2x - x²)dx = x² - x³/3 |₀² = 4 - 8/3 = 4/3.',
          ],
          finalAnswer: 'A = 4/3 u²',
          sourceName: 'MIT OCW - Problem Sets',
          sourceUrl: externalResources.calculoIntegral[2].url,
        },
      ],
      videos: [
        { title: 'Cálculo integral - Khan Academy', platform: 'Khan Academy', url: externalResources.calculoIntegral[0].url },
        { title: 'Integrales definidas - Khan Academy', platform: 'Khan Academy', url: externalResources.calculoIntegral[1].url },
      ],
      links: externalResources.calculoIntegral,
      quiz: [
        quizMeta('∫ x·e^x dx por partes con u=x da:', ['x·e^x - e^x + C', 'x·e^x + C', 'e^x + C'], 0, 'u=x, dv=e^xdx → uv - ∫vdu = xe^x - e^x + C.', 'Integración por partes'),
        quizMeta('Para ∫√(9-x²)dx la sustitución adecuada es:', ['x = 3sin(θ)', 'x = 3tan(θ)', 'x = 9sin(θ)'], 0, 'Forma √(a²-u²) → u = a·sin(θ).', 'Sustitución trigonométrica'),
        quizMeta('El Teorema Fundamental del Cálculo (Parte 1) establece:', ['d/dx ∫[a,x] f(t)dt = f(x)', '∫ f = F(b)-F(a) siempre', 'Toda función es integrable'], 0, 'La derivada de la integral acumulada recupera el integrando.', 'Teorema Fundamental'),
        quizMeta('Volumen al rotar y=x² sobre [0,1] en eje x:', ['π/5', 'π/3', '2π/5'], 0, 'V = π∫₀¹ x⁴ dx = π/5.', 'Volúmenes de revolución'),
        quizMeta('∫[1,e] (1/x)dx es:', ['1', 'e-1', '0'], 0, '∫(1/x)dx = ln(x)|₁ᵉ = 1 - 0 = 1.', 'Integrales definidas'),
      ],
    },
  },
  'física': {
    'cinemática (mru, caída libre, parabólico)': {
      objective: 'Analizar movimiento en 1D y 2D usando descomposición vectorial, ecuaciones de MRUA y tiro parabólico con condiciones de frontera.',
      explanation: 'La cinemática describe el movimiento sin considerar fuerzas. En tiro parabólico se descompone en MRU horizontal y MRUA vertical. Las ecuaciones vectoriales permiten calcular alcance, altura máxima y tiempo de vuelo. A nivel universitario se incluyen problemas con ángulos variables y lanzamiento desde alturas distintas del suelo.',
      keyConcepts: ['Descomposición vectorial', 'MRUA y caída libre', 'Tiro parabólico', 'Alcance y altura máxima', 'Gráficas x-t, v-t, a-t'],
      formulas: [
        'x(t) = x₀ + v₀ₓ·t',
        'y(t) = y₀ + v₀ᵧ·t - ½gt²',
        'R = (v₀²·sin(2θ))/g',
        'h_max = (v₀²·sin²θ)/(2g)',
      ],
      solvedExercises: [
        {
          title: 'Tiro parabólico: alcance máximo',
          difficulty: 'Universitario',
          problem: 'Proyectil lanzado con v₀=40 m/s, θ=30°, g=9.8 m/s². Calcular alcance en terreno plano.',
          solution: [
            'Paso 1: R = (v₀²·sin(2θ))/g.',
            'Paso 2: sin(60°) = √3/2 ≈ 0.866.',
            'Paso 3: R = (1600 × 0.866)/9.8 ≈ 141.4 m.',
          ],
          finalAnswer: 'R ≈ 141.4 m',
          sourceName: 'OpenStax University Physics',
          sourceUrl: externalResources.fisica[0].url,
        },
        {
          title: 'Caída libre con condición inicial',
          difficulty: 'Universitario',
          problem: 'Una piedra se suelta desde 45 m de altura. ¿Cuánto tarda en llegar al suelo? (g=10 m/s²)',
          solution: [
            'Paso 1: y₀=45, v₀=0. Ecuación: y = 45 - 5t².',
            'Paso 2: y=0 → 45 = 5t² → t²=9 → t=3 s.',
          ],
          finalAnswer: 't = 3 s',
          sourceName: 'MIT OCW - Classical Mechanics',
          sourceUrl: externalResources.fisica[1].url,
        },
      ],
      videos: [
        { title: 'Classical Mechanics - MIT OCW', platform: 'MIT OCW', url: externalResources.fisica[1].url },
      ],
      links: externalResources.fisica,
      quiz: [
        quizMeta('En el punto más alto del tiro parabólico:', ['vₓ=0, vᵧ=0', 'vₓ=v₀cosθ, vᵧ=0', 'vₓ=0, vᵧ=-g'], 1, 'Solo la componente vertical se anula; la horizontal permanece constante.', 'Tiro parabólico'),
        quizMeta('El alcance máximo en terreno plano ocurre con θ=', ['30°', '45°', '60°'], 1, 'sin(2θ) es máximo cuando 2θ=90° → θ=45°.', 'Alcance máximo'),
        quizMeta('En caída libre sin resistencia, la aceleración es:', ['Dependiente del tiempo', 'Constante g hacia abajo', 'Cero al llegar al suelo'], 1, 'Idealmente g ≈ 9.8 m/s² constante.', 'Caída libre'),
        quizMeta('Si duplicamos v₀ manteniendo θ, el alcance:', ['Se duplica', 'Se cuadruplica', 'No cambia'], 1, 'R ∝ v₀², duplicar v₀ cuadruplica R.', 'Proporcionalidad en alcance'),
        quizMeta('La ecuación y(t) en MRUA vertical es:', ['y = v₀t', 'y = y₀ + v₀t - ½gt²', 'y = ½gt² siempre'], 1, 'Modelo estándar con aceleración constante -g.', 'Ecuaciones cinemáticas'),
      ],
    },
    'dinámica (leyes de newton, fricción)': {
      objective: 'Aplicar las leyes de Newton a planos inclinados con fricción, sistemas de bloques conectados y diagramas de cuerpo libre.',
      explanation: 'La dinámica relaciona fuerzas con aceleración mediante ΣF = ma. En planos inclinados se descomponen peso en componentes paralela y perpendicular. La fricción estática y cinética limitan el movimiento. Los sistemas de bloques requieren ecuaciones acopladas para cada cuerpo.',
      keyConcepts: ['Diagrama de cuerpo libre', 'Plano inclinado con fricción', 'Sistemas de bloques', 'Fricción estática vs cinética', 'Segunda ley de Newton'],
      formulas: [
        'ΣF = ma',
        'f_s ≤ μ_s·N, f_k = μ_k·N',
        'En plano inclinado: P_paralelo = mg·sin(θ), N = mg·cos(θ)',
      ],
      solvedExercises: [
        {
          title: 'Plano inclinado con fricción',
          difficulty: 'Universitario',
          problem: 'Bloque de 5 kg en plano de 30° con μ_k=0.2. ¿Aceleración? (g=10 m/s²)',
          solution: [
            'Paso 1: Fuerzas paralelas: mg·sin(30°) - μ_k·mg·cos(30°) = ma.',
            'Paso 2: 5·10·0.5 - 0.2·5·10·(√3/2) = 5a.',
            'Paso 3: 25 - 8.66 = 5a → a ≈ 3.27 m/s².',
          ],
          finalAnswer: 'a ≈ 3.27 m/s²',
          sourceName: "OpenStax - Newton's Laws",
          sourceUrl: externalResources.fisica[0].url,
        },
        {
          title: 'Sistema Atwood con dos masas',
          difficulty: 'Universitario',
          problem: 'Masas m₁=3 kg y m₂=5 kg unidas por cuerda ideal. Hallar aceleración y tensión.',
          solution: [
            'Paso 1: m₂ baja → (m₂-m₁)g = (m₁+m₂)a.',
            'Paso 2: a = 2g/8 = 2.5 m/s².',
            'Paso 3: T = m₁(g+a) = 3(12.5) = 37.5 N.',
          ],
          finalAnswer: 'a = 2.5 m/s², T = 37.5 N',
          sourceName: 'MIT OCW - Classical Mechanics',
          sourceUrl: externalResources.fisica[1].url,
        },
      ],
      videos: [
        { title: 'Classical Mechanics - MIT OCW', platform: 'MIT OCW', url: externalResources.fisica[1].url },
      ],
      links: externalResources.fisica,
      quiz: [
        quizMeta('En plano inclinado sin fricción, la aceleración es:', ['g', 'g·sin(θ)', 'g·cos(θ)'], 1, 'Componente del peso paralela al plano = mg·sin(θ).', 'Plano inclinado'),
        quizMeta('La fricción estática máxima es:', ['μ_k·N', 'μ_s·N', 'mg'], 1, 'f_s,max = μ_s·N antes de deslizar.', 'Fricción'),
        quizMeta('En sistema Atwood, si m₂>m₁, m₂:', ['Sube', 'Baja', 'Permanece estático'], 1, 'La masa mayor tira del sistema hacia abajo.', 'Sistemas de bloques'),
        quizMeta('Primera ley de Newton describe:', ['Inercia en ausencia de fuerza neta', 'F=ma siempre', 'Conservación de energía'], 0, 'Sin fuerza neta, velocidad constante (incluido reposo).', 'Leyes de Newton'),
        quizMeta('Si duplicamos μ_k en plano inclinado, la aceleración:', ['Aumenta', 'Disminuye', 'No cambia'], 1, 'Mayor fricción reduce aceleración neta.', 'Fricción en planos'),
      ],
    },
  },
  'programación en java': {
    'programación orientada a objetos': {
      objective: 'Diseñar clases con encapsulamiento, herencia e interfaces; implementar arreglos de objetos y validación de datos en problemas tipo sistema universitario.',
      explanation: 'La POO modela entidades del mundo real mediante clases, objetos, herencia e interfaces. En Java, el encapsulamiento protege el estado interno con modificadores de acceso. Las interfaces definen contratos que múltiples clases pueden implementar. Los arreglos de objetos permiten gestionar colecciones de entidades como estudiantes o cursos.',
      keyConcepts: ['Clases y objetos', 'Encapsulamiento', 'Herencia y polimorfismo', 'Interfaces', 'Arreglos de objetos'],
      formulas: [],
      solvedExercises: [
        {
          title: 'Sistema de estudiantes con validación',
          difficulty: 'Universitario',
          problem: 'Implementar clase Estudiante con nombre, matrícula y promedio. Validar que promedio esté en [0,10] y matrícula no sea vacía.',
          solution: [
            'Paso 1: Atributos privados con getters/setters.',
            'Paso 2: setPromedio(double p): if (p<0 || p>10) throw IllegalArgumentException.',
            'Paso 3: setMatricula(String m): if (m==null || m.isBlank()) throw IllegalArgumentException.',
            'Paso 4: Constructor que valida al instanciar.',
          ],
          finalAnswer: 'Clase con validación en setters y constructor',
          sourceName: 'Oracle - OOP Concepts',
          sourceUrl: externalResources.java[0].url,
        },
        {
          title: 'Herencia: Empleado y Profesor',
          difficulty: 'Universitario',
          problem: 'Clase base Empleado con calcularSalario(). Profesor extiende y añade horasExtra con sobrescritura de calcularSalario().',
          solution: [
            'Paso 1: class Empleado { protected double base; double calcularSalario(){ return base; } }',
            'Paso 2: class Profesor extends Empleado { int horasExtra; @Override double calcularSalario(){ return base + horasExtra*150; } }',
            'Paso 3: Polimorfismo: Empleado e = new Profesor(); e.calcularSalario() usa versión de Profesor.',
          ],
          finalAnswer: 'Salario profesor = base + horasExtra × 150',
          sourceName: 'Oracle - Interfaces and Inheritance',
          sourceUrl: externalResources.java[1].url,
        },
      ],
      videos: [
        { title: 'OOP Concepts - Oracle', platform: 'Oracle', url: externalResources.java[0].url },
        { title: 'Interfaces and Inheritance - Oracle', platform: 'Oracle', url: externalResources.java[1].url },
      ],
      links: externalResources.java,
      quiz: [
        quizMeta('¿Qué principio POO oculta detalles internos?', ['Herencia', 'Encapsulamiento', 'Polimorfismo'], 1, 'Encapsulamiento restringe acceso con private/protected.', 'Encapsulamiento'),
        quizMeta('Una interface en Java:', ['Puede tener métodos con cuerpo (Java 8+)', 'Permite herencia múltiple de clases', 'Reemplaza constructores'], 0, 'Interfaces modernas permiten default/static methods.', 'Interfaces'),
        quizMeta('Polimorfismo significa:', ['Un objeto puede tomar múltiples formas', 'Solo herencia simple', 'No usar @Override'], 0, 'Referencia de superclase apuntando a subclase.', 'Polimorfismo'),
        quizMeta('Arreglo Estudiante[] almacena:', ['Referencias a objetos Estudiante', 'Solo primitivos', 'Copias de clases'], 0, 'Los arreglos de objetos guardan referencias.', 'Arreglos de objetos'),
        quizMeta('Validación de datos debe hacerse:', ['En setters y constructores', 'Solo en main', 'Nunca en POO'], 0, 'Validar al modificar estado mantiene invariantes.', 'Validación de datos'),
      ],
    },
  },
};

function buildGenericContent(subjectName, topicName) {
  return {
    objective: `Comprender los fundamentos teóricos y aplicados de "${topicName}" dentro del curso universitario de ${subjectName}, con énfasis en demostraciones, modelado y resolución de problemas tipo examen.`,
    explanation: `Este tema aborda "${topicName}" desde una perspectiva universitaria: definiciones formales, teoremas centrales, métodos de resolución sistemáticos y aplicaciones en ingeniería o ciencias. Se recomienda deducir resultados clave en lugar de memorizar fórmulas aisladas.`,
    keyConcepts: [
      `Definiciones formales de ${topicName}`,
      'Métodos de demostración y resolución',
      'Aplicaciones en problemas de frontera',
      'Análisis de casos límite e indeterminaciones',
    ],
    formulas: [
      `Ecuación rectora del tema: G(x, y, dx) = 0`,
      'Criterio de convergencia o conservación aplicable',
      'Condición de contorno o estado inicial',
    ],
    solvedExercises: [
      {
        title: `Problema tipo examen: ${topicName} (I)`,
        difficulty: 'Universitario',
        problem: `Plantear y resolver un problema representativo de ${topicName} identificando variables, restricciones y método analítico adecuado.`,
        solution: [
          'Paso 1: Identificar datos, incógnitas y supuestos del modelo.',
          'Paso 2: Aplicar la formulación matemática o algorítmica del tema.',
          'Paso 3: Resolver con justificación de cada paso.',
          'Paso 4: Verificar consistencia dimensional y condiciones de frontera.',
        ],
        finalAnswer: 'Solución verificada según criterios del tema',
        sourceName: 'Khan Academy',
        sourceUrl: 'https://es.khanacademy.org/',
      },
      {
        title: `Problema tipo examen: ${topicName} (II)`,
        difficulty: 'Universitario',
        problem: `Analizar un caso con condición crítica o singular en ${topicName} y determinar el comportamiento límite.`,
        solution: [
          'Paso 1: Detectar puntos críticos, singularidades o casos especiales.',
          'Paso 2: Aplicar análisis de límites o regularización.',
          'Paso 3: Interpretar el resultado en contexto del curso.',
        ],
        finalAnswer: 'Comportamiento límite determinado analíticamente',
        sourceName: "Paul's Online Notes",
        sourceUrl: 'https://tutorial.math.lamar.edu/',
      },
    ],
    videos: [
      { title: `${topicName} - Khan Academy`, platform: 'Khan Academy', url: `https://es.khanacademy.org/` },
      { title: `Búsqueda académica: ${topicName}`, platform: 'YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicName + ' universidad')}` },
    ],
    links: [
      { title: `Recursos de ${subjectName}`, url: 'https://es.khanacademy.org/' },
      { title: "Notas universitarias - Paul's Online Notes", url: 'https://tutorial.math.lamar.edu/' },
    ],
    quiz: [
      quizMeta(`¿Cuál es el enfoque correcto para ${topicName}?`, ['Identificar el modelo, aplicar el método formal y verificar condiciones', 'Sustituir valores al azar', 'Ignorar condiciones de frontera'], 0, 'El método sistemático es estándar en cursos universitarios.', 'Metodología de resolución'),
      quizMeta(`Un punto singular en ${topicName} indica:`, ['Comportamiento que requiere análisis especial', 'Que no hay solución', 'Que se puede cancelar sin justificar'], 0, 'Las singularidades exigen estudio de límites o casos.', 'Análisis de singularidades'),
      quizMeta(`La verificación de una solución en ${topicName} debe incluir:`, ['Comprobar condiciones iniciales/de frontera', 'Solo el resultado numérico', 'Ninguna comprobación'], 0, 'Validar condiciones es parte esencial de la demostración.', 'Verificación de soluciones'),
      quizMeta(`En exámenes universitarios de ${topicName}, se valora principalmente:`, ['Justificación de cada paso', 'Solo la respuesta final', 'Memorización sin contexto'], 0, 'La justificación demuestra comprensión profunda.', 'Estrategia de examen'),
      quizMeta(`Ante un problema no convencional de ${topicName}:`, ['Adaptar el método base al nuevo contexto', 'Abandonar el problema', 'Copiar una fórmula sin analizar'], 0, 'La flexibilidad metodológica distingue nivel universitario.', 'Pensamiento crítico'),
    ],
  };
}

export function getTopicContent(subjectName, topicName) {
  const sName = subjectName.toLowerCase().trim();
  const tName = topicName.toLowerCase().trim();

  if (subjectContent[sName]?.[tName]) {
    return subjectContent[sName][tName];
  }

  const matchedSubject = Object.keys(subjectContent).find(
    (k) => sName.includes(k) || k.includes(sName)
  );
  if (matchedSubject) {
    const matchedTopic = Object.keys(subjectContent[matchedSubject]).find(
      (k) => tName.includes(k) || k.includes(tName)
    );
    if (matchedTopic) {
      return subjectContent[matchedSubject][matchedTopic];
    }
  }

  return buildGenericContent(subjectName, topicName);
}
