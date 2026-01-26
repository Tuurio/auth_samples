"use client";

export function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="feature">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
    </div>
  );
}
