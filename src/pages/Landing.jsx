import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const subjects = [
  { icon: '📘', name: 'Fundamentos matemáticos', desc: 'Repasa álgebra, operaciones básicas, ecuaciones, funciones y temas base para cálculo.' },
  { icon: '📈', name: 'Cálculo diferencial', desc: 'Estudia límites, derivadas, continuidad, reglas de derivación y aplicaciones.' },
  { icon: '∫', name: 'Cálculo integral', desc: 'Organiza tu estudio de integrales, áreas bajo la curva, métodos de integración y ejercicios.' },
  { icon: '📊', name: 'Probabilidad y estadística', desc: 'Practica medidas de tendencia central, probabilidad, gráficos, muestreo y análisis de datos.' },
  { icon: '⚙️', name: 'Física', desc: 'Repasa movimiento, fuerza, energía, leyes físicas, fórmulas y problemas prácticos.' },
  { icon: '🧮', name: 'Cálculo de varias variables', desc: 'Estudia funciones de varias variables, derivadas parciales, gradientes y aplicaciones.' },
  { icon: '📐', name: 'Ecuaciones diferenciales', desc: 'Organiza temas como ecuaciones de primer orden, segundo orden y métodos de solución.' },
  { icon: '✨', name: 'Materia personalizada', desc: 'Agrega cualquier otra materia de ciencias básicas y genera un plan adaptado a tu nivel.' },
];

const benefits = [
  { icon: '🎯', title: 'Plan personalizado', desc: 'Se adapta a tu materia, nivel y tiempo disponible.' },
  { icon: '🔥', title: 'Prioriza lo difícil', desc: 'Te ayuda a enfocarte primero en los temas que más cuestan.' },
  { icon: '🧠', title: 'Quiz automático', desc: 'Comprueba si entendiste antes de seguir avanzando.' },
  { icon: '📊', title: 'Progreso visual', desc: 'Consulta qué tan preparado vas para cada examen.' },
];

const pills = [
  'Fundamentos matemáticos', 'Cálculo diferencial', 'Cálculo integral',
  'Física', 'Probabilidad y estadística', 'Ecuaciones diferenciales',
];

export default function Landing() {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__grid-lines"></div>
        </div>

        <div className="hero__content container">
          <div className="hero__text" ref={addRef}>
            <span className="section-label">✦ Estudia más inteligente</span>

            <h1 className="hero__title">
              Tu plan de estudio
              <span className="hero__title-gradient"> personalizado </span>
              en minutos.
            </h1>

            <p className="hero__subtitle">
              Elige una materia, escribe tus temas y recibe una ruta clara para estudiar antes de tu examen.
            </p>

            <div className="hero__actions">
              <Link to="/estudiar" className="btn-primary">
                Crear mi plan →
              </Link>
              <a href="#materias" className="btn-secondary">
                Ver materias
              </a>
            </div>
          </div>

          <div className="hero__preview" ref={addRef}>
            <div className="hero__preview-card glass-card">
              <h3>¿Qué necesitas estudiar?</h3>
              <div className="hero__pills">
                {pills.map((pill, i) => (
                  <span key={i} className="hero__pill" style={{ animationDelay: `${i * 0.15}s` }}>
                    {pill}
                  </span>
                ))}
              </div>
              <div className="hero__mini-box">
                <p>Selecciona una materia, agrega tus temas y deja que la IA organice tu estudio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem reveal" ref={addRef}>
        <div className="container">
          <div className="problem__icon">🎓</div>
          <h2>Deja de estudiar sin orden</h2>
          <p>
            Estudia Hoy IA te ayuda a decidir qué repasar primero según tu examen,
            tus temas difíciles y el tiempo que tienes disponible.
          </p>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="subjects reveal" id="materias" ref={addRef}>
        <div className="container">
          <div className="subjects__header">
            <span className="section-label">📚 Catálogo</span>
            <h2>Materias de ciencias básicas</h2>
            <p>
              Selecciona una materia de tronco común y genera un plan de estudio según tu examen,
              tus temas difíciles y el tiempo disponible.
            </p>
          </div>

          <div className="subjects__grid">
            {subjects.map((subject, i) => (
              <Link
                to="/estudiar"
                key={i}
                className="subject-card glass-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="subject-card__icon">{subject.icon}</span>
                <h3>{subject.name}</h3>
                <p>{subject.desc}</p>
                <span className="subject-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits reveal" id="beneficios" ref={addRef}>
        <div className="container">
          <div className="benefits__header">
            <span className="section-label">⚡ Ventajas</span>
            <h2>Beneficios principales</h2>
          </div>

          <div className="benefits__grid">
            {benefits.map((b, i) => (
              <div key={i} className="benefit-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="benefit-card__icon">{b.icon}</span>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta reveal" ref={addRef}>
        <div className="container">
          <div className="cta__card">
            <div className="cta__glow"></div>
            <h2>Empieza con una materia y recibe tu primer plan.</h2>
            <p>Convierte tu tiempo libre en una ruta clara de estudio.</p>
            <Link to="/estudiar" className="btn-primary">
              Generar mi plan ahora →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <span className="navbar__logo-icon">✦</span>
            <p>© 2026 Estudia Hoy IA — Proyecto para hackatón</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
