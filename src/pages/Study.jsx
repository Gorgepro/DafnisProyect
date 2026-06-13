import { useState } from 'react';
import './Study.css';

const topics = [
  { id: 1, name: 'Variables', completed: true },
  { id: 2, name: 'Condicionales', completed: true },
  { id: 3, name: 'Ciclo while', completed: false, active: true },
  { id: 4, name: 'Do-while', completed: false },
  { id: 5, name: 'Arreglos', completed: false },
];

const quizQuestions = [
  {
    question: '1. ¿Cuándo se ejecuta un ciclo while?',
    options: [
      'Cuando la condición es verdadera',
      'Siempre una sola vez',
      'Solo cuando hay arreglos',
    ],
    correct: 0,
  },
  {
    question: '2. ¿Qué pasa si la condición nunca cambia?',
    options: [
      'El programa termina',
      'El ciclo se repite infinitamente',
      'Se ejecuta una vez',
    ],
    correct: 1,
  },
  {
    question: '3. ¿Cuál es la diferencia entre while y do-while?',
    options: [
      'No hay diferencia',
      'do-while se ejecuta al menos una vez',
      'while es más rápido',
    ],
    correct: 1,
  },
  {
    question: '4. ¿Qué se necesita actualizar dentro de un while?',
    options: [
      'El nombre del programa',
      'La variable de control',
      'El tipo de datos',
    ],
    correct: 1,
  },
  {
    question: '5. ¿Para qué se usa un while con entrada del usuario?',
    options: [
      'Para decorar el código',
      'Para validar datos o crear menús',
      'Para definir variables',
    ],
    correct: 1,
  },
];

const chatMessages = [
  { from: 'bot', text: 'Hola, soy tu tutor IA. Pregúntame cualquier duda sobre el ciclo while.' },
  { from: 'user', text: '¿Cuándo uso while y cuándo uso for?' },
  { from: 'bot', text: 'Usa <strong>for</strong> cuando sabes cuántas veces se repetirá algo. Usa <strong>while</strong> cuando depende de una condición.' },
];

export default function Study() {
  const [activeTopic, setActiveTopic] = useState(3);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const completedCount = topics.filter(t => t.completed).length;
  const progress = Math.round((completedCount / topics.length) * 100);

  function handleAnswer(qIndex, oIndex) {
    if (quizSubmitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  }

  function submitQuiz() {
    setQuizSubmitted(true);
  }

  function getScore() {
    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    return Math.round((correct / quizQuestions.length) * 100);
  }

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { from: 'user', text: chatInput };
    const botMsg = {
      from: 'bot',
      text: 'Esa es una gran pregunta. Te recomiendo practicar con ejercicios de validación de entrada para reforzar tu comprensión del ciclo while. 💡',
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setChatInput('');
  }

  return (
    <div className="study">
      <div className="study__layout">
        {/* SIDEBAR */}
        <aside className="study__sidebar">
          <div className="study__subject-card">
            <span className="study__subject-icon">💻</span>
            <h2>Java</h2>
            <p>Aprende fundamentos de programación paso a paso.</p>

            <div className="study__progress-stats">
              <div className="study__stat">
                <strong>{progress}%</strong>
                <span>avance</span>
              </div>
              <div className="study__stat">
                <strong>{topics.length}</strong>
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

          <div className="study__topics">
            <h3>Temario</h3>
            {topics.map((topic) => (
              <button
                key={topic.id}
                className={`study__topic ${topic.completed ? 'completed' : ''} ${topic.id === activeTopic ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic.id)}
              >
                <span className="study__topic-badge">
                  {topic.completed ? '✓' : topic.id}
                </span>
                {topic.name}
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main className="study__content">
          {/* Hero */}
          <div className="study__hero">
            <div>
              <span className="section-label">Tema actual</span>
              <h2>Ciclo while en Java</h2>
              <p>
                Aprende a repetir instrucciones mientras se cumpla una condición.
                Este tema es clave para resolver problemas con validaciones y menús.
              </p>
            </div>
            <button className="btn-primary">Continuar estudiando</button>
          </div>

          {/* Grid */}
          <div className="study__grid">
            {/* Guide */}
            <article className="study__panel study__panel--guide">
              <div className="study__panel-header">
                <h3>📖 Guía rápida</h3>
                <span className="study__panel-tag">10 min</span>
              </div>
              <p>
                El ciclo <strong>while</strong> se usa cuando necesitas repetir una acción
                mientras una condición sea verdadera.
              </p>
              <div className="study__code-box">
                <pre><code>{`int contador = 1;

while (contador <= 5) {
  System.out.println(contador);
  contador++;
}`}</code></pre>
              </div>
              <div className="study__tip">
                <strong>💡 Idea clave:</strong> si la condición nunca cambia, el ciclo puede repetirse para siempre.
              </div>
            </article>

            {/* Errors */}
            <article className="study__panel study__panel--errors">
              <div className="study__panel-header">
                <h3>⚠️ Errores comunes</h3>
                <span className="study__panel-tag study__panel-tag--warn">Importante</span>
              </div>
              <ul className="study__error-list">
                <li>No actualizar la variable dentro del ciclo.</li>
                <li>Usar una condición que siempre sea verdadera.</li>
                <li>Confundir <strong>while</strong> con <strong>do-while</strong>.</li>
                <li>No validar correctamente los datos de entrada.</li>
              </ul>
            </article>

            {/* Chat */}
            <article className="study__panel study__panel--chat">
              <div className="study__panel-header">
                <h3>🤖 Tutor IA</h3>
                <span className="study__panel-tag study__panel-tag--success">Disponible</span>
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
                  placeholder="Escribe tu duda..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn-primary">Enviar</button>
              </form>
            </article>

            {/* Quiz */}
            <article className="study__panel study__panel--quiz">
              <div className="study__panel-header">
                <h3>📝 Test del tema</h3>
                <span className="study__panel-tag">{quizQuestions.length} preguntas</span>
              </div>

              <div className="study__quiz-questions">
                {quizQuestions.map((q, qi) => (
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
                  disabled={Object.keys(answers).length < quizQuestions.length}
                >
                  Finalizar test
                </button>
              ) : (
                <div className="study__quiz-result">
                  Tu resultado: <strong>{getScore()}%</strong>
                </div>
              )}
            </article>

            {/* Diagnosis */}
            <article className="study__panel study__panel--diagnosis">
              <div className="study__panel-header">
                <h3>🔍 Diagnóstico IA</h3>
                <span className="study__panel-tag">Después del test</span>
              </div>

              {quizSubmitted ? (
                <>
                  <p className="study__score">
                    Resultado estimado: <strong>{getScore()}%</strong>
                  </p>
                  {getScore() < 80 && (
                    <>
                      <div className="study__weak-item">
                        <h4>Punto débil detectado</h4>
                        <p>Confusión entre ciclo while y do-while.</p>
                      </div>
                      <div className="study__weak-item">
                        <h4>Refuerzo recomendado</h4>
                        <p>Practica ejercicios de validación de entrada y menús repetitivos.</p>
                      </div>
                    </>
                  )}
                  {getScore() >= 80 && (
                    <div className="study__weak-item study__weak-item--success">
                      <h4>¡Excelente!</h4>
                      <p>Tienes un buen dominio de este tema. Puedes avanzar al siguiente.</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="study__pending">
                  Completa el test para ver tu diagnóstico personalizado.
                </p>
              )}
            </article>

            {/* Resources */}
            <article className="study__panel study__panel--resources">
              <div className="study__panel-header">
                <h3>📚 Material recomendado</h3>
                <span className="study__panel-tag">Apoyo</span>
              </div>

              <div className="study__resource">
                <div>
                  <h4>Ejercicios de ciclos</h4>
                  <p>Practica problemas básicos con while.</p>
                </div>
                <button className="btn-secondary">Ver</button>
              </div>

              <div className="study__resource">
                <div>
                  <h4>Comparación while vs do-while</h4>
                  <p>Refuerza las diferencias entre ambos ciclos.</p>
                </div>
                <button className="btn-secondary">Ver</button>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
