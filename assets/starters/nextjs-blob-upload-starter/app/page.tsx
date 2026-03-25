const files = [
  { name: "launch-homepage.png", status: "queued for Blob upload" },
  { name: "design-notes.pdf", status: "ready for signed URL" },
  { name: "team-retro.mov", status: "placeholder preview" }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>PixelDrop turns uploads into a product surface, not a generic form.</h1>
        <p>
          The starter leaves the Blob integration as the default plan while still giving users a complete
          interface to extend after deployment.
        </p>
        <div className="dropzone">Drop files here once Blob is provisioned.</div>
      </section>
      <section className="layout">
        <article className="panel">
          <h2>Planned Capability</h2>
          <p>Storage: Vercel Blob</p>
          <p>Optional auth can be added later if uploads need ownership and permissions.</p>
        </article>
        <article className="panel">
          <h2>Recent Files</h2>
          <div className="files">
            {files.map((file) => (
              <div className="file" key={file.name}>
                <strong>{file.name}</strong>
                <p>{file.status}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
