import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopicContent } from '../data/subjectContent';
import './Study.css';

// Component for rendering a practical exercise with a toggleable hint and solution
function PracticalExerciseItem({ exercise, index }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="study__exercise study__exercise--practical">
      <div className="study__exercise-header">
        <h3>Ejercicio Práctico #{index + 1}</h3>
      </div>
      <div className="study__exercise-problem">
        <strong>Enunciado:</strong>
        <pre>{exercise.question}</pre>
      </div>

      <div className="practical-actions">
        {exercise.hint && (
          <button
            type="button"
            className="study__btn-action study__btn-action--hint"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? 'Ocultar pista' : 'Ver pista 💡'}
          </button>
        )}
        <button
          type="button"
          className="study__btn-action study__btn-action--solution"
          onClick={() => setShowSolution(!showSolution)}
        >
          {showSolution ? 'Ocultar solución' : 'Revelar solución 🔑'}
        </button>
      </div>

      {showHint && exercise.hint && (
        <div className="exercise-hint animate-in">
          <strong>Pista:</strong> {exercise.hint}
        </div>
      )}

      {showSolution && (
        <div className="exercise-solution-reveal animate-in">
          <strong>Solución detallada:</strong>
          <p>{exercise.solution}</p>
        </div>
      )}
    </div>
  );
}

// Component for rendering interactive mini-games (Flashcards & Concept Matching)
function InteractiveGames({ games }) {
  const [activeGame, setActiveGame] = useState('flashcards'); // 'flashcards' | 'matching'
  const [flippedCards, setFlippedCards] = useState({});

  // Matching game state
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState({}); // { leftText: rightText }
  const [wrongMatch, setWrongMatch] = useState(null); // { left, right }
  const [shuffledLeft, setShuffledLeft] = useState([]);
  const [shuffledRight, setShuffledRight] = useState([]);

  const flashcardGame = games?.find(g => g.type === 'flashcards');
  const matchingGame = games?.find(g => g.type === 'matching');

  // Initialize matching game
  const initMatching = useCallback(() => {
    if (matchingGame?.data?.pairs) {
      const pairs = matchingGame.data.pairs;
      const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
      setShuffledLeft(shuffle(pairs.map(p => p.left)));
      setShuffledRight(shuffle(pairs.map(p => p.right)));
      setMatchedPairs({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongMatch(null);
    }
  }, [matchingGame]);

  useEffect(() => {
    initMatching();
    setFlippedCards({});
  }, [games, initMatching]);

  const toggleCard = (idx) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleLeftClick = (text) => {
    if (matchedPairs[text]) return;
    if (wrongMatch) return;
    setSelectedLeft(text);
    if (selectedRight) {
      checkMatch(text, selectedRight);
    }
  };

  const handleRightClick = (text) => {
    const isAlreadyMatched = Object.values(matchedPairs).includes(text);
    if (isAlreadyMatched) return;
    if (wrongMatch) return;
    setSelectedRight(text);
    if (selectedLeft) {
      checkMatch(selectedLeft, text);
    }
  };

  const checkMatch = (leftText, rightText) => {
    const originalPair = matchingGame.data.pairs.find(p => p.left === leftText);
    if (originalPair && originalPair.right === rightText) {
      setMatchedPairs(prev => ({ ...prev, [leftText]: rightText }));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setWrongMatch({ left: leftText, right: rightText });
      setSelectedLeft(null);
      setSelectedRight(null);
      setTimeout(() => {
        setWrongMatch(null);
      }, 1000);
    }
  };

  return (
    <div className="study__games">
      <div className="study__games-nav">
        {flashcardGame && (
          <button
            type="button"
            className={`study__games-tab ${activeGame === 'flashcards' ? 'study__games-tab--active' : ''}`}
            onClick={() => setActiveGame('flashcards')}
          >
            🗂️ Flashcards
          </button>
        )}
        {matchingGame && (
          <button
            type="button"
            className={`study__games-tab ${activeGame === 'matching' ? 'study__games-tab--active' : ''}`}
            onClick={() => setActiveGame('matching')}
          >
            🧩 Emparejar Conceptos
          </button>
        )}
      </div>

      <div className="study__games-board">
        {activeGame === 'flashcards' && flashcardGame && (
          <div className="flashcards-game animate-in">
            <p className="game-instruction">Haz click en cada tarjeta para ver la respuesta o fórmula asociada.</p>
            <div className="flashcards-grid">
              {flashcardGame.data.map((card, i) => (
                <div
                  key={i}
                  className="flashcard-scene"
                  onClick={() => toggleCard(i)}
                >
                  <div className={`flashcard ${flippedCards[i] ? 'is-flipped' : ''}`}>
                    <div className="flashcard__face flashcard__face--front">
                      <span className="flashcard-badge">Concepto #{i + 1}</span>
                      <p className="flashcard-text">{card.front}</p>
                      <span className="flashcard-action">Click para revelar 🔄</span>
                    </div>
                    <div className="flashcard__face flashcard__face--back">
                      <span className="flashcard-badge">Explicación</span>
                      <p className="flashcard-text">{card.back}</p>
                      <span className="flashcard-action">Volver a ver 🔄</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeGame === 'matching' && matchingGame && (
          <div className="matching-game animate-in">
            <p className="game-instruction">Une cada término de la izquierda con su descripción correcta de la derecha.</p>
            
            {Object.keys(matchedPairs).length === matchingGame.data.pairs.length && (
              <div className="game-success-message animate-in">
                🎉 ¡Excelente trabajo! Has completado todas las parejas de forma correcta.
                <button type="button" className="btn-secondary btn-sm" style={{ marginLeft: '15px' }} onClick={initMatching}>Reiniciar juego</button>
              </div>
            )}

            <div className="matching-columns">
              <div className="matching-column">
                <h4>Conceptos</h4>
                {shuffledLeft.map((text, idx) => {
                  const isMatched = !!matchedPairs[text];
                  const isSelected = selectedLeft === text;
                  const isWrong = wrongMatch?.left === text;
                  let cls = 'matching-item';
                  if (isMatched) cls += ' matching-item--matched';
                  else if (isSelected) cls += ' matching-item--selected';
                  else if (isWrong) cls += ' matching-item--wrong';

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={cls}
                      onClick={() => handleLeftClick(text)}
                      disabled={isMatched}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>

              <div className="matching-column">
                <h4>Definiciones</h4>
                {shuffledRight.map((text, idx) => {
                  const isMatched = Object.values(matchedPairs).includes(text);
                  const isSelected = selectedRight === text;
                  const isWrong = wrongMatch?.right === text;
                  let cls = 'matching-item';
                  if (isMatched) cls += ' matching-item--matched';
                  else if (isSelected) cls += ' matching-item--selected';
                  else if (isWrong) cls += ' matching-item--wrong';

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={cls}
                      onClick={() => handleRightClick(text)}
                      disabled={isMatched}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Study() {
  const { user } = useAuth();

  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);

  // AI Generated Content States
  const [generatedContent, setGeneratedContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Quiz evaluation states
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);


  const resetTopicFlow = useCallback(() => {
    setQuizSubmitted(false);
    setAnswers({});
  }, []);

  // Fetch plan list
  useEffect(() => {
    if (!user) return;

    const fetchPlanes = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/planes?usuario_id=${user.id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setPlanes(data.planes);

          if (data.planes.length > 0) {
            const savedPlanId = localStorage.getItem('active_plan_id');
            const foundPlan = data.planes.find((p) => p.id === parseInt(savedPlanId, 10));
            const initialPlan = foundPlan || data.planes[0];

            setSelectedPlan(initialPlan);

            const temas = initialPlan.temas || [];
            const incomplete = temas.find((t) => !t.completed);
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

  // Load/Generate topic content dynamically
  useEffect(() => {
    if (!selectedPlan || !activeTopicId) return;

    const activeTopic = (selectedPlan.temas || []).find((t) => t.id === activeTopicId);
    if (!activeTopic) return;

    // Reset quiz states for the new topic
    resetTopicFlow();

    // If already completed in db, set quiz submitted to true
    if (activeTopic.completed) {
      setQuizSubmitted(true);
    }

    // Check if the topic already has generated content saved in database
    if (activeTopic.content) {
      setGeneratedContent(activeTopic.content);
      return;
    }

    // Call AI Generation Endpoint
    const generateTopicContent = async () => {
      try {
        setContentLoading(true);
        setError('');
        const res = await fetch(`/api/planes/${selectedPlan.id}/generar-tema`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: activeTopicId })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setGeneratedContent(data.content);
          
          // Cache the content locally in memory inside selectedPlan
          const updatedTemas = selectedPlan.temas.map((t) =>
            t.id === activeTopicId ? { ...t, content: data.content } : t
          );
          const updatedPlan = { ...selectedPlan, temas: updatedTemas };
          setSelectedPlan(updatedPlan);
          setPlanes((prev) => prev.map((p) => (p.id === selectedPlan.id ? updatedPlan : p)));
        } else {
          console.warn('Backend generation failed, using static fallback content');
          const fallback = getTopicContent(selectedPlan.materia, activeTopic.name);
          setGeneratedContent(fallback);
        }
      } catch (err) {
        console.error('Network error loading content, using fallback:', err);
        const fallback = getTopicContent(selectedPlan.materia, activeTopic.name);
        setGeneratedContent(fallback);
      } finally {
        setContentLoading(false);
      }
    };

    generateTopicContent();
  }, [activeTopicId, selectedPlan?.id, resetTopicFlow]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('active_plan_id', plan.id);
    resetTopicFlow();

    const temas = plan.temas || [];
    const incomplete = temas.find((t) => !t.completed);
    const initialTopic = incomplete || temas[0];
    setActiveTopicId(initialTopic ? initialTopic.id : null);
  };

  const handleSelectTopic = (topicId) => {
    setActiveTopicId(topicId);
  };

  const togglePlanStatus = async (newStatus) => {
    if (!selectedPlan) return;

    try {
      const res = await fetch(`/api/planes/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedPlan = data.plan;
        setSelectedPlan(updatedPlan);
        setPlanes((prev) => prev.map((p) => (p.id === selectedPlan.id ? updatedPlan : p)));
      }
    } catch (err) {
      console.error('Error al actualizar estado del plan:', err);
    }
  };

  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plan de estudio?')) return;

    try {
      const res = await fetch(`/api/planes/${planId}`, { method: 'DELETE' });

      if (res.ok) {
        const updatedPlanes = planes.filter((p) => p.id !== planId);
        setPlanes(updatedPlanes);

        if (selectedPlan?.id === planId) {
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

  const saveTopicProgress = async (topicId, progressData) => {
    if (!selectedPlan) return;

    const updatedTemas = selectedPlan.temas.map((t) =>
      t.id === topicId ? { ...t, ...progressData } : t
    );

    const updatedPlan = { ...selectedPlan, temas: updatedTemas };
    setSelectedPlan(updatedPlan);
    setPlanes((prev) => prev.map((p) => (p.id === selectedPlan.id ? updatedPlan : p)));

    try {
      setSaving(true);
      await fetch(`/api/planes/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temas: updatedTemas }),
      });
    } catch (err) {
      console.error('Error al guardar progreso:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (quizSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const getScoreData = (content) => {
    if (!content?.quiz?.length) return { score: 0, correct: 0, total: 0 };

    let correct = 0;
    content.quiz.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });

    return {
      score: Math.round((correct / content.quiz.length) * 100),
      correct,
      total: content.quiz.length,
    };
  };

  const getWeakAreas = (content) => {
    const areas = new Set();
    content.quiz.forEach((q, i) => {
      if (answers[i] !== q.correct && q.weakArea) {
        areas.add(q.weakArea);
      }
    });
    return [...areas];
  };

  const getStrongAreas = (content) => {
    const areas = new Set();
    content.quiz.forEach((q, i) => {
      if (answers[i] === q.correct && q.weakArea) {
        areas.add(q.weakArea);
      }
    });
    return [...areas];
  };

  const submitQuiz = async () => {
    if (!activeTopic || !generatedContent) return;

    const { score } = getScoreData(generatedContent);
    const weakAreas = getWeakAreas(generatedContent);

    setQuizSubmitted(true);

    await saveTopicProgress(activeTopic.id, {
      completed: true,
      testSubmitted: true,
      score,
      weakAreas,
    });
  };

  const activePlans = planes.filter((p) => p.estado === 'activo');
  const finishedPlans = planes.filter((p) => p.estado === 'finalizado');

  if (loading) {
    return (
      <div className="study study--loading">
        <div className="study__loader">Cargando tus planes de estudio...</div>
      </div>
    );
  }

  if (error && planes.length === 0) {
    return (
      <div className="study">
        <div className="study__empty">
          <p className="study__error-msg">{error}</p>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (planes.length === 0 || !selectedPlan) {
    return (
      <div className="study">
        <div className="study__empty">
          <span className="study__empty-icon">📚</span>
          <h2>Aún no tienes planes de estudio</h2>
          <p>Crea tu primer plan personalizado y comienza a estudiar con contenido universitario estructurado.</p>
          <Link to="/crear-plan" className="btn-primary">
            Crear mi primer plan
          </Link>
        </div>
      </div>
    );
  }

  const activeTopic =
    (selectedPlan.temas || []).find((t) => t.id === activeTopicId) || selectedPlan.temas[0];

  const completedCount = (selectedPlan.temas || []).filter((t) => t.completed).length;
  const totalCount = (selectedPlan.temas || []).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allTopicsCompleted = totalCount > 0 && completedCount === totalCount;

  const scoreData = generatedContent ? getScoreData(generatedContent) : { score: 0, correct: 0, total: 0 };
  const weakAreas = generatedContent && quizSubmitted ? getWeakAreas(generatedContent) : [];
  const strongAreas = generatedContent && quizSubmitted ? getStrongAreas(generatedContent) : [];

  return (
    <div className="study">
      <div className="study__layout">
        <aside className="study__sidebar">
          <section className="study__sidebar-section">
            <h3 className="study__sidebar-title">Cursos activos</h3>
            {activePlans.length === 0 ? (
              <p className="study__sidebar-empty">No hay cursos activos</p>
            ) : (
              activePlans.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  className={`study__course ${selectedPlan.id === p.id ? 'study__course--active' : ''}`}
                  onClick={() => handleSelectPlan(p)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan(p)}
                >
                  <span className="study__course-icon">{p.icon}</span>
                  <span className="study__course-name">{p.materia}</span>
                  <button
                    type="button"
                    className="study__course-delete"
                    onClick={(e) => handleDeletePlan(p.id, e)}
                    title="Eliminar plan"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </section>

          <section className="study__sidebar-section">
            <h3 className="study__sidebar-title">Cursos finalizados</h3>
            {finishedPlans.length === 0 ? (
              <p className="study__sidebar-empty">No hay cursos finalizados</p>
            ) : (
              finishedPlans.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  className={`study__course ${selectedPlan.id === p.id ? 'study__course--active' : ''}`}
                  onClick={() => handleSelectPlan(p)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan(p)}
                >
                  <span className="study__course-icon">{p.icon}</span>
                  <span className="study__course-name">{p.materia}</span>
                  <span className="study__course-badge">✓</span>
                  <button
                    type="button"
                    className="study__course-delete"
                    onClick={(e) => handleDeletePlan(p.id, e)}
                    title="Eliminar plan"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </section>

          <Link to="/crear-plan" className="btn-secondary study__new-plan">
            + Nuevo plan
          </Link>

          <div className="study__sidebar-divider" />

          <div className="study__plan-card">
            <span className="study__plan-icon">{selectedPlan.icon}</span>
            <h2 className="study__plan-name">{selectedPlan.materia}</h2>
            <p className="study__plan-meta">
              {selectedPlan.tiempo_dias} días · {selectedPlan.horas_diarias} hrs/día
            </p>
            <div className="study__progress-bar">
              <div className="study__progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="study__progress-label">
              {progress}% · {completedCount}/{totalCount} temas
            </p>
          </div>
        </aside>

        <main className="study__main">
          <header className="study__header">
            <div className="study__header-info">
              <span className="study__header-course">{selectedPlan.materia}</span>
              <h1 className="study__header-topic">
                {activeTopic ? activeTopic.name : 'Selecciona un tema'}
              </h1>
              <div className="study__header-progress">
                <div className="study__progress-bar study__progress-bar--inline">
                  <div className="study__progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}% del curso</span>
              </div>
            </div>
            <div className="study__header-actions">
              {selectedPlan.estado === 'activo' ? (
                <button
                  type="button"
                  className="btn-secondary study__status-btn"
                  onClick={() => togglePlanStatus('finalizado')}
                >
                  Finalizar curso
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary study__status-btn"
                  onClick={() => togglePlanStatus('activo')}
                >
                  Reabrir curso
                </button>
              )}
            </div>
          </header>

          {/* HORIZONTAL TOPIC TABS */}
          {selectedPlan.temas?.length > 0 && (
            <div className="study__tabs-nav">
              {selectedPlan.temas.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`study__tab-btn ${topic.id === activeTopicId ? 'study__tab-btn--active' : ''} ${topic.completed ? 'study__tab-btn--completed' : ''}`}
                  onClick={() => handleSelectTopic(topic.id)}
                >
                  <span className="study__tab-status-icon">{topic.completed ? '✓' : topic.id}</span>
                  <span className="study__tab-name-text">{topic.name}</span>
                  {topic.score != null && <span className="study__tab-score-badge">{topic.score}%</span>}
                </button>
              ))}
            </div>
          )}

          {allTopicsCompleted && selectedPlan.estado === 'activo' && (
            <div className="study__completion-banner">
              <p>Ya completaste todos los temas. Puedes finalizar el curso.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => togglePlanStatus('finalizado')}
              >
                Finalizar curso
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {contentLoading && (
            <div className="study__ai-loading animate-in">
              <div className="study__ai-spinner"></div>
              <h2>IA de Antigravity creando tu material de estudio...</h2>
              <p>Estamos estructurando la teoría, fórmulas y diseñando los mini-juegos interactivos con base en tu tiempo de estudio ({selectedPlan.tiempo_dias * selectedPlan.horas_diarias} hrs en total).</p>
            </div>
          )}

          {/* ERROR EN LA CARGA */}
          {error && planes.length > 0 && (
            <div className="study__empty">
              <p className="study__error-msg">{error}</p>
            </div>
          )}

          {/* UNIFIED STUDY MATERIAL CONTENT */}
          {activeTopic && generatedContent && !contentLoading && (
            <article className="study__guide animate-in">
              {/* 1. OBJETIVO */}
              <section className="study__section">
                <h2 className="study__section-title">🎯 Objetivo del tema</h2>
                <p className="study__text">{generatedContent.objective}</p>
              </section>

              {/* 2. TEORÍA */}
              <section className="study__section">
                <h2 className="study__section-title">📖 Explicación Teórica</h2>
                <p className="study__text" style={{ whiteSpace: 'pre-wrap' }}>{generatedContent.explanation}</p>
              </section>

              {/* 3. CONCEPTOS CLAVE */}
              {generatedContent.keyConcepts?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">💡 Conceptos clave</h2>
                  <ul className="study__list">
                    {generatedContent.keyConcepts.map((concept, i) => (
                      <li key={i}>{concept}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 4. FÓRMULAS */}
              {generatedContent.formulas?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">📐 Fórmulas y definiciones</h2>
                  <div className="study__formulas">
                    {generatedContent.formulas.map((f, i) => (
                      <pre key={i} className="study__formula">{f}</pre>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. EJERCICIOS RESUELTOS */}
              {generatedContent.solvedExercises?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">✅ Ejercicios Resueltos</h2>
                  {generatedContent.solvedExercises.map((ex, i) => (
                    <div key={i} className="study__exercise">
                      <div className="study__exercise-header">
                        <h3>{ex.title}</h3>
                        <span className="study__badge">{ex.difficulty}</span>
                      </div>
                      <div className="study__exercise-problem">
                        <strong>Problema:</strong>
                        <pre>{ex.problem}</pre>
                      </div>
                      <div className="study__exercise-solution">
                        <strong>Solución:</strong>
                        <ol>
                          {ex.solution.map((step, si) => (
                            <li key={si}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <p className="study__exercise-answer">
                        <strong>Respuesta:</strong> {ex.finalAnswer}
                      </p>
                    </div>
                  ))}
                </section>
              )}

              {/* 6. EJERCICIOS PRÁCTICOS */}
              {generatedContent.practicalExercises?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">✍️ Ejercicios Prácticos</h2>
                  <p className="study__section-subtitle">Intenta resolver estos problemas por tu cuenta para poner en práctica tus conocimientos.</p>
                  {generatedContent.practicalExercises.map((ex, i) => (
                    <PracticalExerciseItem key={i} exercise={ex} index={i} />
                  ))}
                </section>
              )}

              {/* 7. MINI JUEGOS INTERACTIVOS */}
              {generatedContent.miniGames?.length > 0 && (
                <section className="study__section study__section--games">
                  <h2 className="study__section-title">🎮 Mini-Juegos Didácticos</h2>
                  <InteractiveGames games={generatedContent.miniGames} />
                </section>
              )}

              {/* 8. TEST DE AUTOEVALUACIÓN */}
              {generatedContent.quiz?.length > 0 && (
                <section className="study__section study__section--quiz">
                  <h2 className="study__section-title">📝 Test de Autoevaluación</h2>
                  
                  {quizSubmitted && Object.keys(answers).length === 0 ? (
                    /* Previously completed topic card */
                    <div className="study__quiz-completed-banner">
                      <span className="banner-icon">🏆</span>
                      <div>
                        <h3>¡Ya has aprobado este test!</h3>
                        <p>Completaste este tema con una calificación de <strong>{activeTopic.score || 100}%</strong>.</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setQuizSubmitted(false);
                          setAnswers({});
                        }}
                      >
                        Volver a tomar el test
                      </button>
                    </div>
                  ) : !quizSubmitted ? (
                    <div className="study__quiz animate-in">
                      <p className="study__quiz-intro">
                        Responde las {generatedContent.quiz.length} preguntas del test para evaluar tu comprensión y marcar este tema como completado.
                      </p>

                      {generatedContent.quiz.map((q, qi) => (
                        <div key={qi} className="study__question">
                          <p className="study__question-text">{q.question}</p>
                          <div className="study__options">
                            {q.options.map((opt, oi) => (
                              <label
                                key={oi}
                                className={`study__option ${answers[qi] === oi ? 'study__option--selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`q${qi}`}
                                  checked={answers[qi] === oi}
                                  onChange={() => handleAnswer(qi, oi)}
                                />
                                <span className="study__option-marker" />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="study__quiz-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={submitQuiz}
                          disabled={Object.keys(answers).length < generatedContent.quiz.length || saving}
                        >
                          {saving ? 'Guardando...' : 'Enviar respuestas del test'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="study__results animate-in">
                      <div className="study__result-header-card">
                        <p className="study__result-score">
                          Obtuviste <strong>{scoreData.score}%</strong> ({scoreData.correct} de {scoreData.total} correctas)
                        </p>
                      </div>

                      {generatedContent.quiz.map((q, qi) => {
                        const isCorrect = answers[qi] === q.correct;
                        return (
                          <div
                            key={qi}
                            className={`study__question study__question--review ${isCorrect ? 'study__question--correct' : 'study__question--wrong'}`}
                          >
                            <p className="study__question-text">
                              {isCorrect ? '✓' : '✗'} {q.question}
                            </p>
                            <div className="study__options">
                              {q.options.map((opt, oi) => {
                                let cls = 'study__option';
                                if (oi === q.correct) cls += ' study__option--correct';
                                else if (answers[qi] === oi) cls += ' study__option--wrong';
                                return (
                                  <div key={oi} className={cls}>
                                    {opt}
                                    {oi === q.correct && <span className="study__option-tag">Correcta</span>}
                                  </div>
                                );
                              })}
                            </div>
                            {q.explanation && (
                              <p className="study__explanation">{q.explanation}</p>
                            )}
                          </div>
                        );
                      })}

                      <div className="study__result-grid">
                        <div className="study__result-item study__result-item--strong">
                          <h3>Puntos fuertes</h3>
                          {strongAreas.length > 0 ? (
                            <ul>
                              {strongAreas.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>Sigue estudiando para identificar fortalezas.</p>
                          )}
                        </div>
                        <div className="study__result-item study__result-item--weak">
                          <h3>Puntos débiles detectados</h3>
                          {weakAreas.length > 0 ? (
                            <ul>
                              {weakAreas.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No se detectaron áreas débiles. ¡Excelente!</p>
                          )}
                        </div>
                      </div>

                      <div className="study__quiz-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setAnswers({});
                          }}
                        >
                          Repetir test
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </article>
          )}

          {!activeTopic && (
            <div className="study__prompt">
              <p>Selecciona un tema del temario para comenzar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
