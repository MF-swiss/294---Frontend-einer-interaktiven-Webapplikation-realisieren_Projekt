export default function HomePage({ onNavigate }) {
  return (
    <div className="page-container">
      <section className="hero-section">
        <h1>Willkommen beim Mini Event-Planer</h1>
        <h3>Präsentiert von NovaSphere Events GmbH</h3>
      </section>

      <section className="menu-section">
        <button
          className="nav-button"
          onClick={() => onNavigate('pageone')}
        >
          Events Verwalten
        </button>
      </section>
    </div>
  );
}