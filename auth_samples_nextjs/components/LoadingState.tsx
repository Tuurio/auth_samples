"use client";

export function LoadingState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <div>
        <h2 className="card-title">{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
    </div>
  );
}
