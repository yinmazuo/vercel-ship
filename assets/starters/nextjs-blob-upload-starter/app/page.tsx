import { UploadConsole } from "../components/upload-console";

const examples = [
  { name: "launch-homepage.png", status: "Upload product marketing assets" },
  { name: "design-notes.pdf", status: "Share internal specs through a public demo surface" },
  { name: "team-retro.mov", status: "Keep media previews inside the same release flow" }
];

export default function HomePage() {
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main>
      <section className="hero">
        <h1>PixelDrop turns uploads into a product surface, not a generic form.</h1>
        <p>
          This starter uses a linked Blob store for real uploads and keeps the UI simple enough to extend
          into an asset hub, customer intake flow, or media review tool.
        </p>
        <div className="hero-status">
          <span className={`status ${hasBlob ? "ok" : "warn"}`}>
            {hasBlob ? "Blob connected" : "Awaiting Blob provisioning"}
          </span>
          <p>{hasBlob ? "Uploads are writing to the linked store." : "Provision Blob to unlock uploads."}</p>
        </div>
      </section>
      <section className="layout">
        <article className="panel">
          <p className="eyebrow">Storage capability</p>
          <h2>Blob is part of the actual demo flow.</h2>
          <p>Storage: Vercel Blob</p>
          <p>Optional auth can be added later if uploads need ownership and permissions.</p>
        </article>
        <article className="panel">
          <p className="eyebrow">Suggested use</p>
          <h2>Recent file patterns</h2>
          <div className="files">
            {examples.map((file) => (
              <div className="file" key={file.name}>
                <strong>{file.name}</strong>
                <p>{file.status}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
      <UploadConsole enabled={hasBlob} />
    </main>
  );
}
