"use client";

import { useEffect, useState } from "react";

type Props = {
  text?: string;
};

export default function WebDesignCallout({ text }: Props) {
  const storageKey = "webDesignCalloutHidden";
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "1") setHidden(true);
    } catch {
      // ignore
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
    setHidden(true);
  }

  if (!text || hidden) return null;

  return (
    <div className="general-callout" role="region" aria-label="Feature callout">
      <p>{text}</p>
      <button className="callout-close" aria-label="Dismiss callout" onClick={dismiss}>
        ×
      </button>
    </div>
  );
}
