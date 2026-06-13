import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTopicContent } from '../data/subjectContent';
import './Study.css';

export default function Study() {
  const { user } = useAuth();

  const [planes, setPlanes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);

  const [contentFinished, setContentFinished] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const resetTopicFlow = useCallback(() => {
    setContentFinished(false);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setAnswers({});
  }, []);

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
    resetTopicFlow();
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
    if (!activeTopic || !content) return;

    const { score } = getScoreData(content);
    const weakAreas = getWeakAreas(content);

    setQuizSubmitted(true);

    await saveTopicProgress(activeTopic.id, {
      completed: true,
      testSubmitted: true,
      score,
      weakAreas,
    });
  };

  const handleStartQuiz = () => {
    setContentFinished(true);
    setShowQuiz(true);
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

  if (error) {
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

  const content = activeTopic ? getTopicContent(selectedPlan.materia, activeTopic.name) : null;
  const scoreData = content ? getScoreData(content) : { score: 0, correct: 0, total: 0 };
  const weakAreas = content && quizSubmitted ? getWeakAreas(content) : [];
  const strongAreas = content && quizSubmitted ? getStrongAreas(content) : [];

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

          {selectedPlan.temas?.length > 0 && (
            <nav className="study__topics">
              <h3 className="study__sidebar-title">Temario</h3>
              {selectedPlan.temas.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`study__topic ${topic.completed ? 'study__topic--done' : ''} ${topic.id === activeTopicId ? 'study__topic--active' : ''}`}
                  onClick={() => handleSelectTopic(topic.id)}
                >
                  <span className="study__topic-num">{topic.completed ? '✓' : topic.id}</span>
                  <span className="study__topic-name">{topic.name}</span>
                  {topic.score != null && (
                    <span className="study__topic-score">{topic.score}%</span>
                  )}
                </button>
              ))}
            </nav>
          )}
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

          {activeTopic && content && !showQuiz && (
            <article className="study__guide">
              <section className="study__section">
                <h2 className="study__section-title">Objetivo del tema</h2>
                <p className="study__text">{content.objective}</p>
              </section>

              <section className="study__section">
                <h2 className="study__section-title">Explicación</h2>
                <p className="study__text">{content.explanation}</p>
              </section>

              {content.keyConcepts?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">Conceptos clave</h2>
                  <ul className="study__list">
                    {content.keyConcepts.map((concept, i) => (
                      <li key={i}>{concept}</li>
                    ))}
                  </ul>
                </section>
              )}

              {content.formulas?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">Fórmulas y definiciones</h2>
                  <div className="study__formulas">
                    {content.formulas.map((f, i) => (
                      <pre key={i} className="study__formula">{f}</pre>
                    ))}
                  </div>
                </section>
              )}

              {content.solvedExercises?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">Ejercicios resueltos</h2>
                  {content.solvedExercises.map((ex, i) => (
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
                      {ex.sourceUrl && (
                        <a
                          href={ex.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="study__source-link"
                        >
                          Fuente: {ex.sourceName}
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {content.videos?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">Videos de apoyo</h2>
                  <div className="study__resources">
                    {content.videos.map((vid, i) => (
                      <a
                        key={i}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="study__resource"
                      >
                        <span className="study__resource-icon">▶</span>
                        <div>
                          <strong>{vid.title}</strong>
                          {vid.platform && <span>{vid.platform}</span>}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {content.links?.length > 0 && (
                <section className="study__section">
                  <h2 className="study__section-title">Links de apoyo</h2>
                  <div className="study__resources">
                    {content.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="study__resource"
                      >
                        <span className="study__resource-icon">↗</span>
                        <div>
                          <strong>{link.title}</strong>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <footer className="study__guide-footer">
                <button type="button" className="btn-primary study__start-quiz" onClick={handleStartQuiz}>
                  Ya terminé de estudiar, hacer test
                </button>
              </footer>
            </article>
          )}

          {activeTopic && content && showQuiz && (
            <div className="study__quiz-area">
              {!quizSubmitted ? (
                <section className="study__section study__quiz">
                  <h2 className="study__section-title">Test del tema</h2>
                  <p className="study__quiz-intro">
                    Responde las {content.quiz.length} preguntas. Necesitas contestar todas para enviar.
                  </p>

                  {content.quiz.map((q, qi) => (
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
                      className="btn-secondary"
                      onClick={resetTopicFlow}
                    >
                      Volver al contenido
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={submitQuiz}
                      disabled={Object.keys(answers).length < content.quiz.length || saving}
                    >
                      {saving ? 'Guardando...' : 'Enviar test'}
                    </button>
                  </div>
                </section>
              ) : (
                <div className="study__results">
                  <section className="study__section study__result-card">
                    <h2 className="study__section-title">Resultado</h2>
                    <p className="study__result-score">
                      Obtuviste <strong>{scoreData.score}%</strong> ({scoreData.correct} de {scoreData.total} correctas)
                    </p>
                  </section>

                  {content.quiz.map((q, qi) => {
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

                  <section className="study__section study__result-card">
                    <h2 className="study__section-title">Resumen de desempeño</h2>
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
                          <p>Repasa el contenido para identificar fortalezas.</p>
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
                    <div className="study__result-item study__result-item--review">
                      <h3>Qué repasar ahora</h3>
                      {weakAreas.length > 0 ? (
                        <ul>
                          {weakAreas.map((a, i) => (
                            <li key={i}>
                              Revisa la sección de <strong>{a}</strong> en la guía de estudio y los ejercicios resueltos.
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Continúa con el siguiente tema del temario.</p>
                      )}
                    </div>
                  </section>

                  <div className="study__quiz-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={resetTopicFlow}
                    >
                      Volver a estudiar
                    </button>
                  </div>
                </div>
              )}
            </div>
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
