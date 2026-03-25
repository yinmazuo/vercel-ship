import { loadMarketingConfig } from "../lib/marketing-config";

const foundation = [
  {
    title: "Narrative-first landing page",
    body: "A visible story arc, conversion-ready sections, and enough structure to become a real product site."
  },
  {
    title: "Live configuration",
    body: "Announcement copy, hero language, and maintenance messaging can be driven from Edge Config without redeploying."
  },
  {
    title: "Starter-ready foundation",
    body: "Simple App Router structure with enough polish to demo immediately and enough headroom to keep shipping."
  }
];

const releaseSteps = [
  "Publish the launch narrative before app onboarding is complete.",
  "Use Edge Config to switch announcements and hero messaging during rollout.",
  "Keep the site deployable even when optional services are not connected yet."
];

export default async function HomePage() {
  const { config, hasEdgeConfig, edgeConfigError } = await loadMarketingConfig();

  const highlights = foundation.map((item, index) =>
    index === 0 ? { ...item, title: config.featuredStory } : item
  );

  return (
    <main>
      <section className="announcement">
        <div>
          <strong>{config.featuredStoryLabel}</strong>
          <p>{config.announcement}</p>
        </div>
        <span className={`status ${config.maintenanceMode ? "warn" : "ok"}`}>
          {config.maintenanceMode ? "Maintenance mode on" : "Shipping live"}
        </span>
      </section>
      <section className="hero">
        <span>VERCEL SHIP DEMO</span>
        <h1>{config.heroTitle}</h1>
        <p>{config.heroBody}</p>
        <div className="actions">
          <a className="button primary" href={config.primaryCtaUrl}>
            {config.primaryCtaLabel}
          </a>
          <a className="button secondary" href={config.secondaryCtaUrl}>
            {config.secondaryCtaLabel}
          </a>
        </div>
      </section>
      <section className="story-grid">
        <article className="card spotlight">
          <p className="eyebrow">Why teams ship this first</p>
          <h2>Marketing can move independently while the product surface catches up.</h2>
          <p>
            The page is opinionated enough to demo immediately, while configuration lives outside the codebase
            once Edge Config is connected.
          </p>
        </article>
        <article className="card config-card">
          <p className="eyebrow">Runtime state</p>
          <h2>Configuration source</h2>
          <ul className="stack">
            <li>Edge Config connected: {hasEdgeConfig ? "yes" : "no"}</li>
            <li>Maintenance mode: {config.maintenanceMode ? "enabled" : "disabled"}</li>
            <li>Primary CTA: {config.primaryCtaLabel}</li>
            <li>Fallback-safe build: yes</li>
          </ul>
          {edgeConfigError ? <p className="error">Edge Config error: {edgeConfigError}</p> : null}
        </article>
      </section>
      <section className="grid" id="highlights">
        {highlights.map((item) => (
          <article className="card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
      <section className="roadmap">
        <div>
          <p className="eyebrow">Rollout pattern</p>
          <h2>What this demo proves</h2>
        </div>
        <ol>
          {releaseSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
