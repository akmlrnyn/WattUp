"use client";

import { useEffect, useState } from "react";

import { getGridStatus } from "../../domain/grid-window";

interface GridStatusBannerProps {
  initialNow: string;
}

export function GridStatusBanner({
  initialNow,
}: GridStatusBannerProps) {
  const [now, setNow] = useState(
    () => new Date(initialNow),
  );

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    const interval = window.setInterval(
      updateNow,
      30_000,
    );

    updateNow();

    return () => window.clearInterval(interval);
  }, []);

  const status = getGridStatus(now);

  return (
    <section
      className={`status-banner ${status.window}`}
      aria-live="polite"
    >
      <div className="status-dot" aria-hidden />

      <div>
        <strong>{status.title}</strong>
        <span>{status.subtitle}</span>
      </div>
    </section>
  );
}
