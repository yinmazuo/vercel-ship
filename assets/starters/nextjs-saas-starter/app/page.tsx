const metrics = [
  { label: "Active Workspaces", value: "12" },
  { label: "Weekly Usage", value: "94%" },
  { label: "Queued Automations", value: "7" }
];

export default function HomePage() {
  return (
    <main>
      <div className="shell">
        <section className="hero">
          <span className="pill">DEFAULT SAAS STARTER</span>
          <h1>OrbitDesk keeps the dashboard shell intact while auth and data wiring land later.</h1>
          <p>
            This starter deliberately includes placeholders for Clerk and Neon so the generated plan can
            stay realistic without breaking the build before secrets exist.
          </p>
        </section>
        <section className="metrics">
          {metrics.map((metric) => (
            <article className="metric" key={metric.label}>
              <strong>{metric.value}</strong>
              <p>{metric.label}</p>
            </article>
          ))}
        </section>
        <section className="grid">
          <article className="panel">
            <h2>Planned Integrations</h2>
            <p>Auth: Clerk</p>
            <p>Database: Neon</p>
            <p>Config: optional Edge Config for feature flags</p>
          </article>
          <article className="panel">
            <h2>Next Steps</h2>
            <p>Create providers in `lib/` and connect protected pages once the approved plan is executed.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
