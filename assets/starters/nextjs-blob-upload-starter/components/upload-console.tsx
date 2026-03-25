"use client";

import { useEffect, useState, useTransition } from "react";

type BlobFile = {
  pathname: string;
  url: string;
  size: number;
  uploadedAt?: string;
};

export function UploadConsole({ enabled }: { enabled: boolean }) {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [message, setMessage] = useState("Select a file to upload into the demo Blob store.");
  const [isPending, startTransition] = useTransition();

  async function refreshFiles() {
    if (!enabled) {
      setFiles([]);
      return;
    }

    const response = await fetch("/api/files", { cache: "no-store" });
    if (!response.ok) {
      setMessage("Blob listing failed. Check the project token and store linkage.");
      return;
    }

    const payload = (await response.json()) as { files: BlobFile[] };
    setFiles(payload.files);
  }

  useEffect(() => {
    startTransition(() => {
      void refreshFiles();
    });
  }, [enabled]);

  async function handleUpload(file: File | null) {
    if (!file || !enabled) {
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setMessage(`Uploading ${file.name}...`);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "Upload failed.");
      return;
    }

    setMessage(`${file.name} uploaded to Blob.`);
    await refreshFiles();
  }

  return (
    <section className="panel uploader">
      <div>
        <p className="eyebrow">Blob console</p>
        <h2>Upload assets and verify they land in the linked store.</h2>
        <p>{enabled ? message : "Provision Blob to enable uploads and file listing."}</p>
      </div>
      <label className={`dropzone ${enabled ? "" : "disabled"}`}>
        <input
          disabled={!enabled || isPending}
          onChange={(event) => {
            void handleUpload(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
          type="file"
        />
        <span>{enabled ? "Choose a file or drop one here." : "Blob store not connected yet."}</span>
      </label>
      <div className="files">
        {files.length > 0 ? (
          files.map((file) => (
            <a className="file" href={file.url} key={file.pathname} rel="noreferrer" target="_blank">
              <strong>{file.pathname.replace("demo-uploads/", "")}</strong>
              <p>{Math.max(1, Math.round(file.size / 1024))} KB</p>
            </a>
          ))
        ) : (
          <div className="file empty">
            <strong>No uploaded files yet</strong>
            <p>{enabled ? "The next upload will appear here." : "Provision Blob to start the file feed."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
