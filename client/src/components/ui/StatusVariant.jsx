// src/components/ui/StatusVariant.jsx
import React from "react";

export default function StatusVariant({ status }) {
  const styles = {
    approved: {
      background: "var(--green-bg)",
      color: "var(--green)",
      border: "1px solid #b8e8c8",
    },
    rejected: {
      background: "var(--red-bg)",
      color: "var(--red)",
      border: "1px solid #f0c4c4",
    },
    pending: {
      background: "var(--amber-pale)",
      color: "var(--amber)",
      border: "1px solid #f5d78e",
    },
    draft: {
      background: "var(--paper-dark)",
      color: "var(--ink-light)",
      border: "1px solid var(--paper-mid)",
    },
  };

  const s = styles[status] || styles.draft;

  return (
    <span
      style={{
        ...s,
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 4,
        fontSize: "0.7rem",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}