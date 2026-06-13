import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreatePlan.css';

const defaultSubjects = [
  {
    id: 'fundamentos',
    icon: '📘',
    name: 'Fundamentos matemáticos',
    desc: 'Repasa álgebra, operaciones básicas, ecuaciones, funciones y temas base para cálculo.',
    topics: ['Álgebra básica', 'Operaciones aritméticas', 'Ecuaciones lineales y cuadráticas', 'Funciones y gráficas', 'Trigonometría básica']
  },
  {
    id: 'diferencial',
    icon: '📈',
    name: 'Cálculo diferencial',
    desc: 'Estudia límites, derivadas, continuidad, reglas de derivación y aplicaciones.',
    topics: ['Límites y continuidad', 'Definición de la derivada', 'Reglas de derivación (cadena, producto, cociente)', 'Derivadas de funciones trigonométricas/exponenciales', 'Aplicaciones de la derivada (optimización, máximos y mínimos)']
  },
  {
    id: 'integral',
    icon: '∫',
    name: 'Cálculo integral',
    desc: 'Organiza tu estudio de integrales, áreas bajo la curva, métodos de integración y ejercicios.',
    topics: ['Integrales definidas e indefinidas', 'Teorema fundamental del cálculo', 'Métodos de integración (sustitución, por partes)', 'Áreas y volúmenes de revolución', 'Aplicaciones de la integral']
  },
  {
    id: 'probabilidad',
    icon: '📊',
    name: 'Probabilidad y estadística',
    desc: 'Practica medidas de tendencia central, probabilidad, gráficos, muestreo y análisis de datos.',
    topics: ['Medidas de tendencia central', 'Distribuciones de frecuencia y gráficos', 'Conceptos de probabilidad y combinatoria', 'Distribuciones de probabilidad (Binomial, Normal)', 'Muestreo e intervalos de confianza']
  },
  {
    id: 'fisica',
    icon: '⚙️',
    name: 'Física',
    desc: 'Repasa movimiento, fuerza, energía, leyes físicas, fórmulas y problemas prácticos.',
    topics: ['Cinemática (MRU, caída libre, parabólico)', 'Dinámica (leyes de Newton, fricción)', 'Trabajo, energía y potencia', 'Conservación del momento lineal', 'Electromagnetismo básico']
  },
  {
    id: 'varias-variables',
    icon: '🧮',
    name: 'Cálculo de varias variables',
    desc: 'Estudia funciones de varias variables, derivadas parciales, gradientes y aplicaciones.',
    topics: ['Espacio tridimensional y vectores', 'Funciones de varias variables y límites', 'Derivadas parciales y gradiente', 'Integrales múltiples (dobles y triples)', 'Teoremas de integración vectorial']
  },
  {
    id: 'ecuaciones-dif',
    icon: '📐',
    name: 'Ecuaciones diferenciales',
    desc: 'Organiza temas como ecuaciones de primer orden, segundo orden y métodos de solución.',
    topics: ['Ecuaciones de primer orden', 'Ecuaciones de orden superior', 'Transformada de Laplace', 'Sistemas de ecuaciones diferenciales', 'Soluciones en series de potencias']
  }
];

export default function CreatePlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // List of added subjects (stored in localStorage or defaulted)
  const [addedSubjects, setAddedSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(2);
  
  // Custom subject inputs
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('✨');
  const [customTopics, setCustomTopics] = useState([]);
  const [newCustomTopic, setNewCustomTopic] = useState('');

  // Catalog state
  const [showCatalog, setShowCatalog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize added subjects
  useEffect(() => {
    const stored = localStorage.getItem('added_subjects');
    let list = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        list = [];
      }
    }
    
    // Default pool: if nothing stored, pre-add the first 3
    if (list.length === 0) {
      list = [defaultSubjects[0], defaultSubjects[1], defaultSubjects[4]]; // Fundamentos, Cálculo Dif, Física
      localStorage.setItem('added_subjects', JSON.stringify(list));
    }
    
    setAddedSubjects(list);

    // Read URL query parameter if passed from Landing
    const paramMateria = searchParams.get('materia');
    if (paramMateria) {
      // Find matches in catalog
      const foundInCatalog = defaultSubjects.find(
        s => s.id === paramMateria || s.name.toLowerCase().includes(paramMateria.toLowerCase())
      );
      if (foundInCatalog) {
        // Ensure it's in added list
        const exists = list.some(s => s.id === foundInCatalog.id);
        if (!exists) {
          list = [...list, foundInCatalog];
          localStorage.setItem('added_subjects', JSON.stringify(list));
          setAddedSubjects(list);
        }
        setSelectedSubjectId(foundInCatalog.id);
        // Pre-select all topics of this subject
        setSelectedTopics(foundInCatalog.topics);
      }
    } else if (list.length > 0) {
      setSelectedSubjectId(list[0].id);
      setSelectedTopics(list[0].topics);
    }
  }, [searchParams]);

  // Handle subject change
  const handleSubjectSelect = (id) => {
    setSelectedSubjectId(id);
    const subject = addedSubjects.find(s => s.id === id);
    if (subject) {
      setSelectedTopics(subject.topics || []);
      setIsCreatingCustom(false);
    }
  };

  // Toggle topic selection
  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  // Add subject from default catalog
  const addFromCatalog = (subject) => {
    if (addedSubjects.some(s => s.id === subject.id)) {
      setError('Esta materia ya está agregada.');
      return;
    }
    const updated = [...addedSubjects, subject];
    setAddedSubjects(updated);
    localStorage.setItem('added_subjects', JSON.stringify(updated));
    setSelectedSubjectId(subject.id);
    setSelectedTopics(subject.topics);
    setShowCatalog(false);
    setError('');
  };

  // Remove subject from added list
  const removeSubject = (id, e) => {
    e.stopPropagation();
    const updated = addedSubjects.filter(s => s.id !== id);
    setAddedSubjects(updated);
    localStorage.setItem('added_subjects', JSON.stringify(updated));
    
    if (selectedSubjectId === id) {
      if (updated.length > 0) {
        setSelectedSubjectId(updated[0].id);
        setSelectedTopics(updated[0].topics || []);
      } else {
        setSelectedSubjectId('');
        setSelectedTopics([]);
      }
    }
  };

  // Add custom topic during creation
  const addCustomTopic = (e) => {
    e.preventDefault();
    if (!newCustomTopic.trim()) return;
    if (customTopics.includes(newCustomTopic.trim())) return;
    setCustomTopics([...customTopics, newCustomTopic.trim()]);
    setNewCustomTopic('');
  };

  // Remove custom topic from staging
  const removeCustomTopic = (index) => {
    setCustomTopics(customTopics.filter((_, i) => i !== index));
  };

  // Create custom subject
  const saveCustomSubject = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setError('Por favor, ingresa un nombre para la materia.');
      return;
    }
    if (customTopics.length === 0) {
      setError('Debes agregar al menos un tema.');
      return;
    }

    const newId = `custom-${Date.now()}`;
    const newSubj = {
      id: newId,
      icon: customIcon,
      name: customName,
      desc: 'Materia personalizada añadida por el estudiante.',
      topics: customTopics
    };

    const updated = [...addedSubjects, newSubj];
    setAddedSubjects(updated);
    localStorage.setItem('added_subjects', JSON.stringify(updated));
    
    // Select it
    setSelectedSubjectId(newId);
    setSelectedTopics(customTopics);
    
    // Reset custom states
    setCustomName('');
    setCustomIcon('✨');
    setCustomTopics([]);
    setIsCreatingCustom(false);
    setError('');
  };

  // Submit and create the plan in DB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedSubjectId) {
      setError('Por favor selecciona una materia.');
      return;
    }

    if (selectedTopics.length === 0) {
      setError('Por favor selecciona al menos un tema de interés para estudiar.');
      return;
    }

    const activeSubj = addedSubjects.find(s => s.id === selectedSubjectId);
    if (!activeSubj) return;

    setLoading(true);

    const planData = {
      usuario_id: user.id,
      materia: activeSubj.name,
      icon: activeSubj.icon,
      tiempo_dias: parseInt(days),
      horas_diarias: parseInt(hours),
      temas: selectedTopics.map((topicName, idx) => ({
        id: idx + 1,
        name: topicName,
        completed: false
      }))
    };

    try {
      const response = await fetch('/api/planes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Also save active plan id to localStorage so study page knows which one is selected
        localStorage.setItem('active_plan_id', data.plan.id);
        navigate('/estudiar');
      } else {
        setError(data.message || 'Error al guardar el plan de estudios.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de red al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const currentSubject = addedSubjects.find(s => s.id === selectedSubjectId);
  const remainingCatalog = defaultSubjects.filter(
    ds => !addedSubjects.some(as => as.name === ds.name)
  );

  return (
    <div className="create-plan">
      <div className="create-plan__bg">
        <div className="create-plan__orb create-plan__orb--1"></div>
        <div className="create-plan__orb create-plan__orb--2"></div>
      </div>

      <div className="container create-plan__container animate-in">
        <div className="create-plan__header">
          <span className="section-label">✦ Planificador Inteligente</span>
          <h1>Configura tu Plan de Estudio</h1>
          <p>Personaliza las materias, temas y tiempos para que la IA arme tu ruta de aprendizaje.</p>
        </div>

        {error && <div className="create-plan__error">{error}</div>}

        <div className="create-plan__layout">
          {/* LEFT: STEP FORM */}
          <form className="create-plan__form glass-card" onSubmit={handleSubmit}>
            
            {/* STEP 1: SELECT OR ADD SUBJECTS */}
            <div className="form-step">
              <div className="form-step__title">
                <span className="step-num">1</span>
                <div>
                  <h3>Selecciona tu Materia</h3>
                  <p>Escoge una de tus materias agregadas para estudiar hoy.</p>
                </div>
              </div>

              {/* LIST OF ADDED SUBJECTS */}
              <div className="added-grid">
                {addedSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`added-card ${selectedSubjectId === subject.id ? 'selected' : ''}`}
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    <span className="added-card__icon">{subject.icon}</span>
                    <div className="added-card__details">
                      <h4>{subject.name}</h4>
                      <p>{subject.desc ? subject.desc.substring(0, 50) + '...' : 'Materia personalizada'}</p>
                    </div>
                    {addedSubjects.length > 1 && (
                      <button
                        type="button"
                        className="added-card__remove"
                        onClick={(e) => removeSubject(subject.id, e)}
                        title="Eliminar materia de la lista"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {/* ADD NEW ACTION CARDS */}
                <div className="added-actions">
                  <button
                    type="button"
                    className="btn-add-subject btn-secondary"
                    onClick={() => {
                      setShowCatalog(true);
                      setIsCreatingCustom(false);
                    }}
                  >
                    ➕ Agregar del Catálogo
                  </button>
                  <button
                    type="button"
                    className="btn-add-subject btn-secondary"
                    onClick={() => {
                      setIsCreatingCustom(true);
                      setShowCatalog(false);
                      setSelectedSubjectId('');
                    }}
                  >
                    ✨ Crear Materia Personalizada
                  </button>
                </div>
              </div>
            </div>

            {/* CATALOG MODAL/DROPDOWN */}
            {showCatalog && (
              <div className="catalog-panel glass-card">
                <div className="catalog-panel__header">
                  <h4>Catálogo de Materias de Ciencias Básicas</h4>
                  <button type="button" onClick={() => setShowCatalog(false)}>Cerrar</button>
                </div>
                {remainingCatalog.length === 0 ? (
                  <p className="catalog-empty">Ya tienes todas las materias del catálogo agregadas.</p>
                ) : (
                  <div className="catalog-grid">
                    {remainingCatalog.map((subj, idx) => (
                      <div key={idx} className="catalog-card" onClick={() => addFromCatalog(subj)}>
                        <span className="catalog-card__icon">{subj.icon}</span>
                        <div>
                          <h5>{subj.name}</h5>
                          <p>{subj.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOM SUBJECT FORM */}
            {isCreatingCustom && (
              <div className="custom-subject-form glass-card">
                <h4>✨ Nueva Materia Personalizada</h4>
                
                <div className="form-group">
                  <label>Nombre de la materia</label>
                  <input
                    type="text"
                    placeholder="Ej. Programación en Python, Álgebra Lineal"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Icono (Emoji)</label>
                  <select value={customIcon} onChange={(e) => setCustomIcon(e.target.value)}>
                    <option value="✨">✨ Destello</option>
                    <option value="💻">💻 Computadora</option>
                    <option value="🧬">🧬 Genética / Biología</option>
                    <option value="🧪">🧪 Química</option>
                    <option value="📐">📐 Ecuaciones</option>
                    <option value="📚">📚 Libros</option>
                    <option value="🎨">🎨 Diseño</option>
                    <option value="🌍">🌍 Geografía</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Agregar Temas (mínimo 1)</label>
                  <div className="custom-topic-input">
                    <input
                      type="text"
                      placeholder="Ej. Tipos de datos, Variables, Bucles"
                      value={newCustomTopic}
                      onChange={(e) => setNewCustomTopic(e.target.value)}
                    />
                    <button type="button" className="btn-secondary" onClick={addCustomTopic}>Agregar</button>
                  </div>
                </div>

                {customTopics.length > 0 && (
                  <div className="custom-topics-list">
                    {customTopics.map((topic, index) => (
                      <span key={index} className="custom-topic-pill">
                        {topic}
                        <button type="button" onClick={() => removeCustomTopic(index)}>×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="custom-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsCreatingCustom(false)}>Cancelar</button>
                  <button type="button" className="btn-primary" onClick={saveCustomSubject}>Guardar Materia</button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT TOPICS */}
            {currentSubject && (
              <div className="form-step">
                <div className="form-step__title">
                  <span className="step-num">2</span>
                  <div>
                    <h3>Elige tus Temas de Interés</h3>
                    <p>Divide la materia en los temas que quieres incluir en este plan de estudios.</p>
                  </div>
                </div>

                <div className="topics-selection-grid">
                  {currentSubject.topics.map((topic, idx) => {
                    const isChecked = selectedTopics.includes(topic);
                    return (
                      <label key={idx} className={`topic-select-card ${isChecked ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTopicToggle(topic)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="topic-name">{topic}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: AVAILABLE TIME */}
            <div className="form-step">
              <div className="form-step__title">
                <span className="step-num">3</span>
                <div>
                  <h3>Establece tu Tiempo Disponible</h3>
                  <p>¿Cuánto tiempo tienes para realizar este plan y cuántas horas diarias estudiarás?</p>
                </div>
              </div>

              <div className="time-settings">
                <div className="time-group">
                  <label htmlFor="duration-days">Duración del plan (en días): <strong>{days} días</strong></label>
                  <input
                    id="duration-days"
                    type="range"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                  <div className="range-labels">
                    <span>1 día</span>
                    <span>15 días</span>
                    <span>30 días</span>
                  </div>
                </div>

                <div className="time-group">
                  <label htmlFor="daily-hours">Horas de estudio diarias: <strong>{hours} {hours === 1 ? 'hora' : 'horas'}</strong></label>
                  <input
                    id="daily-hours"
                    type="range"
                    min="1"
                    max="8"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                  <div className="range-labels">
                    <span>1 hr</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="btn-primary btn-submit-plan" disabled={loading}>
              {loading ? 'Generando tu plan con IA...' : 'Generar mi Ruta de Estudio ⚡'}
            </button>
          </form>

          {/* RIGHT: LIVE PREVIEW CARD */}
          <div className="create-plan__preview">
            <div className="preview-card glass-card">
              <h3>Resumen del Plan</h3>
              <div className="preview-divider"></div>
              
              {currentSubject ? (
                <>
                  <div className="preview-item">
                    <span className="preview-label">Materia</span>
                    <span className="preview-value">
                      <span className="preview-emoji">{currentSubject.icon}</span>
                      {currentSubject.name}
                    </span>
                  </div>

                  <div className="preview-item">
                    <span className="preview-label">Temas a evaluar</span>
                    <span className="preview-value">{selectedTopics.length} de {currentSubject.topics.length} temas</span>
                  </div>

                  <div className="preview-item">
                    <span className="preview-label">Tiempo total</span>
                    <span className="preview-value">{days} días ({days * hours} hrs de estudio total)</span>
                  </div>

                  <div className="preview-topics">
                    <h4>Temario incluido:</h4>
                    {selectedTopics.length === 0 ? (
                      <p className="no-topics-preview">Selecciona temas arriba para previsualizar tu temario.</p>
                    ) : (
                      <ul>
                        {selectedTopics.map((topic, i) => (
                          <li key={i}>✓ {topic}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <p className="no-subject-preview">Selecciona o agrega una materia a la izquierda para empezar.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
