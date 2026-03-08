// StyleCard.jsx
export default function StyleCard({ style, onPickStyle }) {
  const title =
    style?.title || `${style?.brandName || ""} ${style?.styleName || ""}`.trim();

  const imageUrl = style?.styleImage
    ? `https://www.ssactivewear.com/${String(style.styleImage).replace(/^\/+/, "")}`
    : null;

  return (
    <button
      type="button"
      className="card h-100 text-start shadow-sm border-0"
      style={{ cursor: "pointer", overflow: "hidden" }}
      onClick={() => onPickStyle?.(style)}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: 300,
            objectFit: "contain",
            background: "#f8f9fa",
          }}
          loading="lazy"
        />
      )}

      <div className="card-body">
        <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
          {title}
        </div>
        <div className="small text-muted mt-2"></div>
        <div className="small text-muted mt-2">{style?.styleName}{" | "}{style?.baseCategory}</div>
      </div>

      <div className="card-footer bg-transparent border-0 pt-0">
        <span
          className="btn btn-sm btn-outline-primary w-100"
          onClick={() => onPickStyle?.(style)}
        >
          View style
        </span>
      </div>
    </button>
  );
}
