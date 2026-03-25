const highlights = [
  {
    title: "Narrative-first landing page",
    body: "A visible hero, polished sections, and a clear invitation to continue product work."
  },
  {
    title: "Free-default deployment path",
    body: "The starter builds without external dependencies and leaves optional space for Edge Config."
  },
  {
    title: "Starter-ready codebase",
    body: "Simple App Router structure so users can keep building without tearing down scaffolding."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <span>VERCEL SHIP DEMO</span>
        <h1>Launch a story-shaped site before the rest of the stack lands.</h1>
        <p>
          This starter is the default for marketing-style demos. It is intentionally complete enough to
          deploy now and opinionated enough to grow into a real product site.
        </p>
        <div className="actions">
          <a className="button primary" href="#highlights">
            View Highlights
          </a>
          <a className="button secondary" href="mailto:hello@example.com">
            Contact
          </a>
        </div>
      </section>
      <section className="grid" id="highlights">
        {highlights.map((item) => (
          <article className="card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
