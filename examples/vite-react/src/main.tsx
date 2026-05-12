/** @jsxImportSource react */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { startEditor } from '../../../src';
import './styles.css';

function ShowcaseHero() {
  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">PatchUI playground</p>
        <h1>Adjust spacing, typography, cards, lists, and controls on a live React canvas.</h1>
        <p className="hero-text">
          This page intentionally mixes editorial blocks, dashboard widgets, faux carousel cards, and interactive controls
          so the visual editor has a much richer surface to inspect.
        </p>
      </div>
      <div className="hero-actions">
        <button className="cta cta-primary">Try the editor</button>
        <button className="cta cta-secondary">Inspect components</button>
      </div>
      <div className="hero-stats">
        <article className="stat-card">
          <span className="stat-label">Edits saved</span>
          <strong className="stat-value">248</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Prompt retries cut</span>
          <strong className="stat-value">42%</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Live preview</span>
          <strong className="stat-value">Instant</strong>
        </article>
      </div>
    </section>
  );
}

function CarouselStrip() {
  const slides = [
    { title: 'Editorial card', tag: 'Spacing', accent: 'accent-sand' },
    { title: 'Compact pricing', tag: 'Radius', accent: 'accent-blue' },
    { title: 'Feature stack', tag: 'Typography', accent: 'accent-coral' },
    { title: 'Stats widget', tag: 'Shadow', accent: 'accent-olive' }
  ];

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Horizontal cards</p>
          <h2>Carousel-style strip</h2>
        </div>
        <p className="section-note">Useful for testing nested cards, pills, titles, and tight controls.</p>
      </div>
      <div className="carousel-strip">
        {slides.map((slide) => (
          <article key={slide.title} className={`carousel-card ${slide.accent}`}>
            <span className="pill">{slide.tag}</span>
            <h3>{slide.title}</h3>
            <p>Change the gap, radius, color balance, and typography to see prompt exports become more precise.</p>
            <button className="text-link">Open module</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContentGrid() {
  return (
    <section className="content-grid">
      <article className="feature-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Feature panel</p>
            <h2>Layout cards with layered content</h2>
          </div>
        </div>
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-badge">01</div>
            <div>
              <h3>Inspect live DOM</h3>
              <p>Hover, outline, and inspect computed values without leaving the app canvas.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-badge">02</div>
            <div>
              <h3>Preview visual edits</h3>
              <p>Inline style overrides help you find the exact numbers before handing the change back to code.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-badge">03</div>
            <div>
              <h3>Export a structured prompt</h3>
              <p>Capture the exact delta instead of reprompting with vague visual descriptions.</p>
            </div>
          </div>
        </div>
      </article>

      <aside className="pricing-panel">
        <p className="section-kicker">Pricing mock</p>
        <h2>Starter plan</h2>
        <p className="price-row">
          <span className="price-value">$24</span>
          <span className="price-unit">/month</span>
        </p>
        <ul className="check-list">
          <li>Unlimited element inspection</li>
          <li>Live spacing and typography tweaks</li>
          <li>Prompt export for AI coding tools</li>
        </ul>
        <button className="cta cta-primary cta-wide">Start editing</button>
      </aside>
    </section>
  );
}

function EditorialSection() {
  return (
    <section className="editorial-panel">
      <div className="editorial-copy">
        <p className="section-kicker">Editorial block</p>
        <h2>Pages with mixed visual density are the best way to stress test a visual editor.</h2>
        <p>
          Try selecting headings, body copy, buttons, stat chips, pricing cards, and faux carousel items. This helps us
          tune the hover tooltip, the property panel, and prompt output against a realistic UI surface.
        </p>
      </div>
      <div className="editorial-quote">
        <span className="quote-mark">“</span>
        <p>The best design playground is one with enough variety to break the boring assumptions early.</p>
      </div>
    </section>
  );
}

function App() {
  return (
    <main className="page-shell">
      <div className="page-stack">
        <ShowcaseHero />
        <CarouselStrip />
        <ContentGrid />
        <EditorialSection />
      </div>
    </main>
  );
}

if (import.meta.env.DEV) {
  startEditor();
}

createRoot(document.getElementById('root')!).render(<App />);
