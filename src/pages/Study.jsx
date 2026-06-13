import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Study.css';

// Rich Mock Dictionary for course topics
const subjectContent = {
  'fundamentos matemáticos': {
    'álgebra básica': {
      guide: 'El álgebra básica utiliza letras para representar números y formular relaciones matemáticas. Las reglas de los signos y las leyes de exponentes son fundamentales.',
      code: 'Ejemplo de ecuación:\n3x + 5 = 20\n3x = 15\nx = 5',
      tip: 'Siempre comprueba tu solución sustituyendo el valor obtenido en la ecuación original.',
      errors: [
        'Confundir las leyes de signos (ej. (-x)*(-y) = +xy).',
        'No aplicar la misma operación a ambos lados de la igualdad.',
        'Sumar términos con diferentes variables (ej. 2x + 3y no es 5xy).'
      ],
      quiz: [
        { question: '1. Si 2x - 4 = 10, ¿cuánto vale x?', options: ['x = 7', 'x = 3', 'x = 5'], correct: 0 },
        { question: '2. ¿Cuál es el resultado de x³ * x⁴?', options: ['x¹²', 'x⁷', '2x⁷'], correct: 1 }
      ]
    },
    'operaciones aritméticas': {
      guide: 'Las operaciones aritméticas son la base de las matemáticas: suma, resta, multiplicación y división. Es clave entender el orden de las operaciones (PEMDAS).',
      code: 'Orden de operaciones (PEMDAS):\n1. Paréntesis\n2. Exponentes\n3. Multiplicación/División\n4. Suma/Resta',
      tip: 'Recuerda que la multiplicación y la división tienen la misma prioridad y se resuelven de izquierda a derecha.',
      errors: [
        'Ignorar el orden de precedencia (ej. resolver sumas antes que multiplicaciones).',
        'Errores al restar números negativos.',
        'División entre cero (no definida).'
      ],
      quiz: [
        { question: '1. ¿Cuál es el resultado de 6 + 2 * 3?', options: ['24', '12', '10'], correct: 1 },
        { question: '2. ¿Cuál es el resultado de 10 - 3 + 2?', options: ['9', '5', '11'], correct: 0 }
      ]
    }
  },
  'cálculo diferencial': {
    'límites y continuidad': {
      guide: 'Un límite describe el comportamiento de una función cerca de un punto, en lugar de en ese punto específico. La continuidad requiere que el límite coincida con el valor de la función.',
      code: 'lim (x->2) (x² - 4)/(x - 2)\n= lim (x->2) (x-2)(x+2)/(x-2)\n= lim (x->2) (x+2) = 4',
      tip: 'Si al evaluar un límite obtienes 0/0, busca factorizar o racionalizar para eliminar la indeterminación.',
      errors: [
        'Evaluar directamente sin simplificar límites indeterminados.',
        'Asumir que si f(a) no existe, el límite tampoco existe.',
        'Olvidar comprobar los límites laterales para continuidad.'
      ],
      quiz: [
        { question: '1. ¿Qué valor toma el límite lim (x->3) (x² - 9)/(x - 3)?', options: ['3', '6', 'Indefinido'], correct: 1 },
        { question: '2. Una función f(x) es continua en x=a si:', options: ['f(a) existe', 'lim (x->a) f(x) existe', 'Ambas y son iguales'], correct: 2 }
      ]
    },
    'definición de la derivada': {
      guide: 'La derivada es el límite de la razón de cambio promedio cuando el intervalo de tiempo tiende a cero. Representa la pendiente de la recta tangente.',
      code: 'f\'(x) = lim (h->0) [f(x+h) - f(x)] / h\nPara f(x) = x²:\nf\'(x) = lim [((x+h)² - x²) / h] = 2x',
      tip: 'La derivada en un punto representa físicamente la velocidad instantánea.',
      errors: [
        'Olvidar dividir entre h al aplicar la definición de límite.',
        'No calcular el límite, sino simplemente restar los valores.',
        'Confundir derivada con la ecuación de la recta secante.'
      ],
      quiz: [
        { question: '1. ¿Cuál es la interpretación geométrica de la derivada?', options: ['La pendiente de la recta tangente', 'El área bajo la curva', 'La intersección con el eje Y'], correct: 0 },
        { question: '2. Si f(x) = x², ¿cuál es su derivada f\'(x)?', options: ['x', '2x', '2'], correct: 1 }
      ]
    }
  },
  'cálculo integral': {
    'integrales definidas e indefinidas': {
      guide: 'La integración es el proceso inverso de la derivación. Las integrales indefinidas incluyen una constante C, mientras que las definidas calculan un valor neto.',
      code: '∫ x² dx = (x³ / 3) + C\n∫[0 a 2] x dx = [x²/2] de 0 a 2 = 2',
      tip: '¡Nunca olvides colocar la constante de integración (+ C) en las integrales indefinidas!',
      errors: [
        'Olvidar la constante de integración (+ C).',
        'No cambiar los límites de integración al hacer un cambio de variable.',
        'Integrar incorrectamente las funciones trigonométricas base.'
      ],
      quiz: [
        { question: '1. ¿Cuál es la integral indefinida de f(x) = 3x²?', options: ['x³ + C', '3x³ + C', '6x + C'], correct: 0 },
        { question: '2. El teorema fundamental del cálculo conecta:', options: ['Límites y continuidad', 'Derivadas e integrales', 'Sumas y productos'], correct: 1 }
      ]
    }
  },
  'física': {
    'cinemática (mru, caída libre, parabólico)': {
      guide: 'La cinemática estudia el movimiento de los cuerpos sin atender a las causas que lo producen. Es clave identificar si la aceleración es constante o cero.',
      code: 'MRU: d = v * t\nMRUA: d = v₀*t + 0.5*a*t²\nCaída libre: a = g = 9.8 m/s²',
      tip: 'Dibuja siempre un sistema de referencia antes de definir los signos de tus velocidades y aceleraciones.',
      errors: [
        'Confundir velocidad constante (MRU) con velocidad variable (MRUA).',
        'Equivocar el signo de la gravedad (g) según el marco de referencia.',
        'Mezclar unidades de kilómetros por hora con metros por segundo.'
      ],
      quiz: [
        { question: '1. Un objeto cae libremente desde el reposo. ¿Cuál es su aceleración?', options: ['Varía con la masa', '9.8 m/s²', 'Disminuye conforme cae'], correct: 1 },
        { question: '2. En el MRU, la velocidad es:', options: ['Cero', 'Constante', 'Variable'], correct: 1 }
      ]
    }
  }
};

// Fallback topic generator
function getTopicContent(subjectName, topicName) {
  const sName = subjectName.toLowerCase();
  const tName = topicName.toLowerCase();

  if (subjectContent[sName] && subjectContent[sName][tName]) {
    return subjectContent[sName][tName];
  }

  // Find partial match
  const matchedSubject = Object.keys(subjectContent).find(k => sName.includes(k) || k.includes(sName));
  if (matchedSubject) {
    const matchedTopic = Object.keys(subjectContent[matchedSubject]).find(k => tName.includes(k) || k.includes(tName));
    if (matchedTopic) {
      return subjectContent[matchedSubject][matchedTopic];
    }
  }

  // Generic fallback
  return {
    guide: `Guía rápida de estudio para el tema "${topicName}". En esta sección aprenderás los conceptos clave, fórmulas y aplicaciones prácticas necesarias para dominar este tema de tu plan de ${subjectName}.`,
    code: `// Fórmulas / Conceptos clave de: ${topicName}\n- Concepto 1: Definición y análisis conceptual básico.\n- Concepto 2: Métodos de resolución de problemas asociados.\n- Nota: Realiza ejercicios constantes para dominar la materia.`,
    tip: `💡 Tip de Estudio: Dedica 25 minutos al estudio teórico de "${topicName}" y realiza al menos 3 ejercicios prácticos antes de autoevaluarte.`,
    errors: [
      `Intentar resolver problemas complejos de ${topicName} sin entender los fundamentos.`,
      `Confundir términos y aplicar fórmulas incorrectas en el desarrollo.`,
      `Olvidar comprobar y validar los resultados numéricos obtenidos.`
    ],
    quiz: [
      {
        question: `1. ¿Cuál es la mejor estrategia para aprender el tema "${topicName}"?`,
        options: [
          'Estudiar la teoría detalladamente y resolver problemas prácticos',
          'Memorizar el temario la noche antes del examen',
          'No realizar ejercicios prácticos'
        ],
        correct: 0
      },
      {
        question: `2. ¿Por qué es importante identificar los errores comunes de ${topicName}?`,
        options: [
          'Para evitarlos proactivamente durante las evaluaciones',
          'No es importante, los errores no importan',
          'Para memorizar soluciones incorrectas'
        ],
        correct: 0
      }
    ]
  };
}

export default function Study() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // State
  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  
  // Quiz and chat states
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch plans on mount/user change
  useEffect(() => {
    if (!user) return;

    const fetchPlanes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/planes?usuario_id=${user.id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setPlanes(data.planes);
          
          // Select initial plan
          if (data.planes.length > 0) {
            const savedPlanId = localStorage.getItem('active_plan_id');
            const foundPlan = data.planes.find(p => p.id === parseInt(savedPlanId));
            const initialPlan = foundPlan || data.planes[0];
            
            setSelectedPlan(initialPlan);
            
            // Set initial active topic (first incomplete topic, or first topic)
            const temas = initialPlan.temas || [];
            const incomplete = temas.find(t => !t.completed);
            const initialTopic = incomplete || temas[0];
            if (initialTopic) {
              setActiveTopicId(initialTopic.id);
            }
          }
        } else {
          setError(data.message || 'Error al obtener tus planes de estudio.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, [user]);

  // Handle plan switch
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('active_plan_id', plan.id);
    
    // Reset quiz and chat for new plan
    setAnswers({});
    setQuizSubmitted(false);
    
    const temas = plan.temas || [];
    const incomplete = temas.find(t => !t.completed);
    const initialTopic = incomplete || temas[0];
    if (initialTopic) {
      setActiveTopicId(initialTopic.id);
    } else {
      setActiveTopicId(null);
    }
  };

  // Reset quiz when topic changes
  useEffect(() => {
    setAnswers({});
    setQuizSubmitted(false);
    
    if (selectedPlan && activeTopicId) {
      const activeTopic = (selectedPlan.temas || []).find(t => t.id === activeTopicId);
      if (activeTopic) {
        setMessages([
          {
            from: 'bot',
            text: `Hola, soy tu tutor IA. Pregúntame cualquier duda sobre el tema <strong>${activeTopic.name}</strong> de tu curso de <strong>${selectedPlan.materia}</strong>. 🤖`
          }
        ]);
      }
    }
  }, [activeTopicId, selectedPlan]);

  // Toggle topic completion in DB
  const toggleTopicCompleted = async (topicId) => {
    if (!selectedPlan) return;

    const updatedTemas = selectedPlan.temas.map(t => {
      if (t.id === topicId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    // Optimistic UI update
    const updatedPlan = { ...selectedPlan, temas: updatedTemas };
    setSelectedPlan(updatedPlan);
    setPlanes(prev => prev.map(p => p.id === selectedPlan.id ? updatedPlan : p));

    try {
      await fetch(`/api/planes/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ temas: updatedTemas })
      });
    } catch (err) {
      console.error('Error al actualizar tema:', err);
    }
  };

  // Toggle plan active/finished status
  const togglePlanStatus = async (newStatus) => {
    if (!selectedPlan) return;

    try {
      const res = await fetch(`/api/planes/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local list
        const updatedPlan = data.plan;
        setSelectedPlan(updatedPlan);
        setPlanes(prev => prev.map(p => p.id === selectedPlan.id ? updatedPlan : p));
      }
    } catch (err) {
      console.error('Error al actualizar estado del plan:', err);
    }
  };

  // Delete study plan
  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plan de estudio?')) return;

    try {
      const res = await fetch(`/api/planes/${planId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const updatedPlanes = planes.filter(p => p.id !== planId);
        setPlanes(updatedPlanes);
        
        if (selectedPlan && selectedPlan.id === planId) {
          if (updatedPlanes.length > 0) {
            handleSelectPlan(updatedPlanes[0]);
          } else {
            setSelectedPlan(null);
            setActiveTopicId(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quiz helper functions
  const handleAnswer = (qIndex, oIndex) => {
    if (quizSubmitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  // Chat message send
  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedPlan || !activeTopicId) return;

    const activeTopic = selectedPlan.temas.find(t => t.id === activeTopicId);
    if (!activeTopic) return;

    const userMsg = { from: 'user', text: chatInput };
    
    // Custom responsive tutor bot message
    const botMsg = {
      from: 'bot',
      text: `Esa es una excelente pregunta sobre el tema <strong>${activeTopic.name}</strong>. Recuerda que la clave en ${selectedPlan.materia} es comprender la lógica detrás del concepto. Te sugiero repasar los errores comunes listados a la izquierda y realizar el test de autoevaluación. ⚡`
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setChatInput('');
  };

  // Categorize plans
  const activePlans = planes.filter(p => p.estado === 'activo');
  const finishedPlans = planes.filter(p => p.estado === 'finalizado');

  if (loading) {
    return (
      <div className="study study-loading">
        <div className="loading-spinner">Cargando tus planes de estudio...</div>
      </div>
    );
  }

  // Empty state if no plans exist
  if (planes.length === 0 || !selectedPlan) {
    return (
      <div className="study">
        <div className="study__empty-state animate-in">
          <span className="study__empty-icon">📚</span>
          <h2>Aún no tienes planes de estudio</h2>
          <p>Crea tu primer plan personalizado de ciencias básicas o materias personalizadas y organízate con IA.</p>
          <Link to="/crear-plan" className="btn-primary">
            Crear mi primer plan ⚡
          </Link>
        </div>
      </div>
    );
  }

  // Active topic object
  const activeTopic = (selectedPlan.temas || []).find(t => t.id === activeTopicId) || selectedPlan.temas[0];
  
  // Calculate completion percentage
  const completedCount = (selectedPlan.temas || []).filter(t => t.completed).length;
  const totalCount = (selectedPlan.temas || []).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get topic contents
  const content = activeTopic ? getTopicContent(selectedPlan.materia, activeTopic.name) : null;

  // Score calculation
  const getScore = () => {
    if (!content || !content.quiz) return 0;
    let correct = 0;
    content.quiz.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    return Math.round((correct / content.quiz.length) * 100);
  };

  return (
    <div className="study">
      <div className="study__layout">
        {/* SIDEBAR: COURSES & TOPICS LIST */}
        <aside className="study__sidebar">
          
          {/* ACTIVE COURSES */}
          <div className="study__courses-section">
            <h3>Cursos Activos</h3>
            {activePlans.length === 0 ? (
              <p className="no-courses-lbl">No hay cursos activos</p>
            ) : (
              activePlans.map(p => (
                <div
                  key={p.id}
                  className={`study__course-btn ${selectedPlan.id === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectPlan(p)}
                >
                  <span className="study__course-icon">{p.icon}</span>
                  <span className="study__course-name">{p.materia}</span>
                  <button
                    className="study__course-del-btn"
                    onClick={(e) => handleDeletePlan(p.id, e)}
                    title="Eliminar plan"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* FINISHED COURSES */}
          <div className="study__courses-section">
            <h3>Cursos Finalizados</h3>
            {finishedPlans.length === 0 ? (
              <p className="no-courses-lbl">No hay cursos finalizados</p>
            ) : (
              finishedPlans.map(p => (
                <div
                  key={p.id}
                  className={`study__course-btn ${selectedPlan.id === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectPlan(p)}
                >
                  <span className="study__course-icon">{p.icon}</span>
                  <span className="study__course-name">{p.materia}</span>
                  <span className="study__course-badge">🏆</span>
                  <button
                    className="study__course-del-btn"
                    onClick={(e) => handleDeletePlan(p.id, e)}
                    title="Eliminar plan"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ACTION BUTTON */}
          <Link to="/crear-plan" className="btn-secondary sidebar-new-plan-btn">
            ➕ Nuevo Plan de Estudio
          </Link>

          <div className="study__sidebar-divider"></div>

          {/* SELECTION STATISTICS */}
          <div className="study__subject-card">
            <span className="study__subject-icon">{selectedPlan.icon}</span>
            <h2>{selectedPlan.materia}</h2>
            <p>Duración: {selectedPlan.tiempo_dias} días ({selectedPlan.horas_diarias} hrs/día)</p>

            <div className="study__progress-stats">
              <div className="study__stat">
                <strong>{progress}%</strong>
                <span>avance</span>
              </div>
              <div className="study__stat">
                <strong>{totalCount}</strong>
                <span>temas</span>
              </div>
            </div>

            <div className="study__progress-bar">
              <div
                className="study__progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* TEMARIO */}
          {selectedPlan.temas && selectedPlan.temas.length > 0 && (
            <div className="study__topics">
              <h3>Temario</h3>
              {selectedPlan.temas.map((topic) => (
                <button
                  key={topic.id}
                  className={`study__topic ${topic.completed ? 'completed' : ''} ${topic.id === activeTopicId ? 'active' : ''}`}
                  onClick={() => setActiveTopicId(topic.id)}
                >
                  <span
                    className="study__topic-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTopicCompleted(topic.id);
                    }}
                    title={topic.completed ? 'Desmarcar tema' : 'Completar tema'}
                  >
                    {topic.completed ? '✓' : topic.id}
                  </span>
                  <span className="topic-text-el">{topic.name}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* STUDY CONTENT WINDOW */}
        <main className="study__content">
          {/* HERO DYNAMIC CARD */}
          <div className="study__hero">
            <div>
              <span className="section-label">
                {selectedPlan.estado === 'activo' ? '🔴 En Curso Activo' : '🏆 Curso Finalizado'}
              </span>
              <h2>{activeTopic ? activeTopic.name : 'Selecciona un tema'}</h2>
              <p>
                Ruta de aprendizaje configurada para {selectedPlan.materia}. Dedícale {selectedPlan.horas_diarias} horas hoy para completar tu objetivo.
              </p>
            </div>

            <div className="study__hero-actions">
              {selectedPlan.estado === 'activo' ? (
                <button
                  className="btn-primary study__btn-finish"
                  onClick={() => togglePlanStatus('finalizado')}
                >
                  Finalizar Curso 🏆
                </button>
              ) : (
                <>
                  <span className="study__badge-completed">¡Finalizado! 🎓</span>
                  <button
                    className="btn-secondary"
                    onClick={() => togglePlanStatus('activo')}
                  >
                    Reabrir Curso
                  </button>
                </>
              )}
            </div>
          </div>

          {/* STUDY MATERIAL GRID */}
          {activeTopic && content ? (
            <div className="study__grid">
              
              {/* GUIDE */}
              <article className="study__panel study__panel--guide">
                <div className="study__panel-header">
                  <h3>📖 Guía Rápida</h3>
                  <span className="study__panel-tag">Conceptos Clave</span>
                </div>
                <p>{content.guide}</p>
                {content.code && (
                  <div className="study__code-box">
                    <pre><code>{content.code}</code></pre>
                  </div>
                )}
                <div className="study__tip">
                  {content.tip}
                </div>
              </article>

              {/* COMMON ERRORS */}
              <article className="study__panel study__panel--errors">
                <div className="study__panel-header">
                  <h3>⚠️ Errores Comunes</h3>
                  <span className="study__panel-tag study__panel-tag--warn">Evita esto</span>
                </div>
                <ul className="study__error-list">
                  {content.errors.map((errText, idx) => (
                    <li key={idx}>{errText}</li>
                  ))}
                </ul>
              </article>

              {/* TUTOR CHAT AI */}
              <article className="study__panel study__panel--chat">
                <div className="study__panel-header">
                  <h3>🤖 Tutor Inteligente IA</h3>
                  <span className="study__panel-tag study__panel-tag--success">Activo</span>
                </div>
                <div className="study__chat-box">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`study__chat-msg study__chat-msg--${msg.from}`}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  ))}
                </div>
                <form className="study__chat-input" onSubmit={sendChat}>
                  <input
                    type="text"
                    placeholder={`Pregúntale al tutor sobre ${activeTopic.name}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">Enviar</button>
                </form>
              </article>

              {/* QUIZ PANEL */}
              <article className="study__panel study__panel--quiz">
                <div className="study__panel-header">
                  <h3>📝 Test de Autoevaluación</h3>
                  <span className="study__panel-tag">{content.quiz.length} preguntas</span>
                </div>

                <div className="study__quiz-questions">
                  {content.quiz.map((q, qi) => (
                    <div key={qi} className="study__question">
                      <p className="study__question-text">{q.question}</p>
                      {q.options.map((opt, oi) => {
                        let optClass = 'study__option';
                        if (answers[qi] === oi) optClass += ' selected';
                        if (quizSubmitted) {
                          if (oi === q.correct) optClass += ' correct';
                          else if (answers[qi] === oi) optClass += ' wrong';
                        }
                        return (
                          <label key={oi} className={optClass}>
                            <input
                              type="radio"
                              name={`q${qi}`}
                              checked={answers[qi] === oi}
                              onChange={() => handleAnswer(qi, oi)}
                              disabled={quizSubmitted}
                            />
                            <span className="study__option-radio"></span>
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <button
                    className="btn-primary"
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length < content.quiz.length}
                  >
                    Finalizar test
                  </button>
                ) : (
                  <div className="study__quiz-result">
                    Tu resultado: <strong>{getScore()}%</strong>
                  </div>
                )}
              </article>

              {/* DIAGNOSIS PANEL */}
              <article className="study__panel study__panel--diagnosis">
                <div className="study__panel-header">
                  <h3>🔍 Diagnóstico IA</h3>
                  <span className="study__panel-tag">Recomendaciones</span>
                </div>

                {quizSubmitted ? (
                  <>
                    <p className="study__score">
                      Resultado estimado: <strong>{getScore()}%</strong>
                    </p>
                    {getScore() < 80 ? (
                      <>
                        <div className="study__weak-item">
                          <h4>Punto débil detectado</h4>
                          <p>Dificultad en aplicar los métodos prácticos de {activeTopic.name}.</p>
                        </div>
                        <div className="study__weak-item">
                          <h4>Refuerzo recomendado</h4>
                          <p>Repasa los ejercicios resueltos en la Guía y discútelo con el Tutor IA.</p>
                        </div>
                      </>
                    ) : (
                      <div className="study__weak-item study__weak-item--success">
                        <h4>¡Excelente dominio!</h4>
                        <p>Has comprendido perfectamente los conceptos clave de {activeTopic.name}. ¡Sigue así!</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="study__pending">
                    Completa el test para ver tu diagnóstico personalizado.
                  </p>
                )}
              </article>
            </div>
          ) : (
            <div className="study__select-prompt">
              <h3>Selecciona un tema del temario para comenzar a estudiar.</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
