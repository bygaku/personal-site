"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

const LENS = {
  CELL: 46,
  RADIUS: 330,
  AMOUNT: 0.5,
  STEP: 7,
  EASE: 0.12
}

const svgURI = (s) => "data:image/svg+xml;utf8," + encodeURIComponent(s);

const musicCover = (w, h, a, b, mark) => svgURI(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${Array.from({ length: 9 }, (_, i) =>
      `<circle cx="${w * 0.5}" cy="${h * 0.52}" r="${(Math.min(w, h) * 0.07) * (i + 1)}" fill="none" stroke="rgba(255,255,255,${0.26 - i * 0.024})" stroke-width="1.6"/>`
    ).join("")}
    <text x="${w * 0.06}" y="${h * 0.92}" font-family="monospace" font-size="${Math.min(w, h) * 0.075}" letter-spacing="${Math.min(w, h) * 0.02}" fill="rgba(255,255,255,0.82)">${mark}</text>
  </svg>
`);

const eventCover = (w, h, a, b, mark) => svgURI(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${Array.from({ length: 26 }, (_, i) => {
      const bh = (0.12 + Math.abs(Math.sin(i * 1.7)) * 0.6) * h;
      return `<rect x="${(i / 26) * w + w * 0.006}" y="${h - bh - h * 0.16}" width="${w / 26 - w * 0.012}" height="${bh}" fill="rgba(255,255,255,${0.1 + (i % 4) * 0.05})"/>`;
    }).join("")}
    <text x="${w * 0.06}" y="${h * 0.93}" font-family="monospace" font-size="${Math.min(w, h) * 0.075}" letter-spacing="${Math.min(w, h) * 0.02}" fill="rgba(255,255,255,0.82)">${mark}</text>
  </svg>
`);

const devCover = (w, h, a, b, mark) => svgURI(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient>
      <pattern id="p" width="${w / 14}" height="${w / 14}" patternUnits="userSpaceOnUse">
        <path d="M ${w / 14} 0 L 0 0 0 ${w / 14}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#p)"/>
    <rect x="${w * 0.5 - Math.min(w, h) * 0.17}" y="${h * 0.5 - Math.min(w, h) * 0.17}" width="${Math.min(w, h) * 0.34}" height="${Math.min(w, h) * 0.34}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
    <text x="${w * 0.06}" y="${h * 0.93}" font-family="monospace" font-size="${Math.min(w, h) * 0.075}" letter-spacing="${Math.min(w, h) * 0.02}" fill="rgba(255,255,255,0.85)">${mark}</text>
  </svg>
`);

const otherCover = (w, h, a, b, mark) => svgURI(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${Array.from({ length: 14 }, (_, i) => {
      const y = (i + 0.5) * (h / 14);
      const x2 = w * (0.18 + Math.abs(Math.sin(i * 2.1)) * 0.62);
      return `<rect x="${w * 0.12}" y="${y}" width="${x2}" height="${h * 0.012}" fill="rgba(255,255,255,${0.08 + (i % 3) * 0.06})"/>`;
    }).join("")}
    <text x="${w * 0.06}" y="${h * 0.93}" font-family="monospace" font-size="${Math.min(w, h) * 0.075}" letter-spacing="${Math.min(w, h) * 0.02}" fill="rgba(255,255,255,0.85)">${mark}</text>
  </svg>
`);

/* ------------------------------------------------------------
   名義マスタ。
   id が安定キー（microCMS の contentId に対応）。
   name は表示用で、改名時はここだけ書き換える。
   作品側は必ず id で参照し、表示名で引かないこと。
   ------------------------------------------------------------ */
const ALIASES = [
  { id: "gvku",   name: "GVKU",    dark: "#9D8CFF", light: "#5B45D6", order: 1 },
  { id: "fanion", name: "fanion.", dark: "#FF8065", light: "#C0442A", order: 2 },
  { id: "yugaku", name: "yugaku",  dark: "#7ED8F0", light: "#0F7B9E", order: 3 },
];

const ALIAS_BY_ID = Object.fromEntries(ALIASES.map((a) => [a.id, a]));
const aliasName = (id) => ALIAS_BY_ID[id]?.name ?? "";

const KIND_COLOR = {
  all:         { dark: "#9FB4CE", light: "#4E5F76" },
  music:       { dark: "#8FA6C4", light: "#41597A" },
  event:       { dark: "#E8B44C", light: "#8F6404" },
  development: { dark: "#5FD3A6", light: "#0C7B57" },
  other:       { dark: "#C7B9A6", light: "#7A6752" },
};

const KIND_LABEL = {
  music:       "MUSIC",
  event:       "LIVE / EVENT",
  development: "DEVELOP",
  other:       "OTHER",
};

const KIND_CHIPS = [
  ["all", "ALL"],
  ["music", "MUSIC"],
  ["event", "LIVE / EVENT"],
  ["development", "DEVELOP"],
  ["other", "OTHER"],
];

/** 対応表に無いキーが来ても落ちないよう、既定色にフォールバックする */
const FALLBACK = { dark: "#9FB4CE", light: "#4E5F76" };
const pick = (entry, light) => (entry ?? FALLBACK)[light ? "light" : "dark"];

/** 作品に紐づく名義ID。種別ごとの持ち方の違いをここで吸収する */
const aliasIdsOf = (work) =>
  work.kind === "music" ? [work.aliasId] : (work.aliasIds ?? []);

/** その作品のアクセント色。音源は名義の色、それ以外はカテゴリの色 */
const accentOf = (work, light) =>
  pick(work.kind === "music" ? ALIAS_BY_ID[work.aliasId] : KIND_COLOR[work.kind], light);

const WORKS = [
  {
    id: "none-01", kind: "music", title: "None", date: "2027-01-01",
    aliasId: "gvku", format: "Single", label: "None Records", catalog: "NON-001",
    cover: musicCover(900, 900, "#351461", "#2e635e", "GV / SGL"),
    body: "Body field",
    links: [
      { label: "Spotify", url: "#" },
      { label: "Apple Music", url: "#" },
      { label: "Bandcamp", url: "#" },
    ],
  },
  {
    id: "none-02", kind: "music", title: "None", date: "2028-01-01",
    aliasId: "fanion", format: "Album", label: "self-released", catalog: "NON-002",
    cover: musicCover(900, 900, "#e05353", "#071018", "FAN / LP"),
    body: "Body field",
    links: [
      { label: "Spotify", url: "#" },
      { label: "Apple Music", url: "#" },
      { label: "Bandcamp", url: "#" }
    ],
  },
  {
    id: "none-03", kind: "music", title: "None", date: "2029-01-01",
    aliasId: "yugaku", format: "EP", label: "Unknown Records", catalog: "NON-003",
    cover: musicCover(900, 900, "#5992b3", "#b2c0b8", "YGK / EP"),
    body: "Body field",
    links: [
      { label: "Spotify", url: "#" },
      { label: "Apple Music", url: "#" },
      { label: "Bandcamp", url: "#" }
    ],
  },
  {
    id: "synth-frontier-7", kind: "event", title: "SYNTH FRONTIER vol.7", date: "2026-03-14",
    role: "出演", venue: "福岡 / STEREO HALL", aliasIds: ["gvku"],
    cover: eventCover(900, 900, "#5A3F10", "#17110A", "LIVE / 2026"),
    body: "Body field",
    links: [
      { label: "イベント詳細", url: "#" },
      { label: "アーカイブ", url: "#" }
    ],
  },
  {
    id: "denshi-yakai-12", kind: "event", title: "電子音楽夜会 #12", date: "2025-10-25",
    role: "主催", venue: "福岡 / BASE-9", aliasIds: ["fanion", "yugaku"],
    cover: eventCover(900, 900, "#4A3A14", "#141008", "HOST / 2025"),
    body: "Body field",
    links: [
      { label: "イベントページ", url: "#" },
      { label: "レポート", url: "#" }
    ],
  },
  {
    id: "crystalline-party", kind: "event", title: "Lattice release party", date: "2025-07-06",
    role: "主催 / 出演", venue: "福岡 / OTO GALLERY", aliasIds: ["yugaku"],
    cover: eventCover(1920, 1080, "#3E3416", "#12100A", "REL / 2025"),
    note: "Note field",
    body: "Body field",
    links: [
      { label: "写真", url: "#" },
      { label: "インスタレーション解説", url: "#" }
    ],
  },
  {
    id: "resobus", kind: "development", title: "ResoBus", date: "2026-01-10",
    format: "VST3 / AU プラグイン", stack: ["C++17", "JUCE", "CMake"],
    cover: devCover(900, 900, "#0F4034", "#07130F", "VST3"),
    body: "Body field",
    links: [
      { label: "ダウンロード", url: "#" },
      { label: "GitHub", url: "#" },
      { label: "ドキュメント", url: "#" }
    ],
  },
  {
    id: "wasm-wav", kind: "development", title: "wasm-wav", date: "2025-12-01",
    format: "Web アプリケーション", stack: ["Rust", "WebAssembly", "TypeScript"],
    cover: devCover(900, 900, "#0C3A3E", "#071214", "WASM"),
    body: "Body field",
    links: [
      { label: "アプリを開く", url: "#" },
      { label: "GitHub", url: "#" }
    ],
  },
  {
    id: "midiroutekit", kind: "development", title: "MidiRouteKit", date: "2025-05-20",
    format: "ミドルウェア / ライブラリ", stack: ["C++17", "CMake", "RtMidi"],
    cover: devCover(1200, 800, "#134037", "#08140F", "LIB"),
    note: "Note field",
    body: "Body field",
    links: [
      { label: "GitHub", url: "#" },
      { label: "APIリファレンス", url: "#" }
    ],
  },
  {
    id: "other-01", kind: "other", title: "None", date: "2026-06-20",
    category: "寄稿・執筆", partner: "None Magazine", aliasIds: [],
    summary: "Summary field",
    cover: otherCover(900, 900, "#3A3630", "#14120F", "TEXT"),
    body: "Body field",
    links: [
      { label: "記事", url: "#" }
    ],
  },
  {
    id: "other-02", kind: "other", title: "None", date: "2025-09-02",
    category: "楽曲提供", partner: "None Project", aliasIds: ["gvku"],
    summary: "Summary field",
    cover: otherCover(1400, 900, "#45392C", "#17120D", "PROV"),
    note: "Note field",
    body: "Body field",
    links: [
      { label: "公式サイト", url: "#" },
      { label: "試聴", url: "#" }
    ],
  },
];

/* ============================================================
   Background: grid with a cursor lens
   ============================================================ */
function LensGrid({ light }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { CELL, RADIUS, AMOUNT, STEP, EASE } = LENS;

    const LINE = light ? "rgba(60,92,132,0.16)" : "rgba(150,178,214,0.10)";
    const TINT = light
      ? ["rgba(12,74,132,0.95)", "rgba(40,96,150,0.42)"]
      : ["rgba(160,220,255,0.85)", "rgba(140,190,235,0.30)"];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, raf = 0, t = 0;
    let tx = -9999, ty = -9999;   // target (real cursor)
    let cx = -9999, cy = -9999;   // eased position actually drawn
    let pointerSeen = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // radial magnification: f(d) = d * (1 + A(1-u)^2), u = d/R
    // f(R) = R keeps the boundary seamless; monotonic while A < 3, so lines never fold
    const warp = (px, py) => {
      const dx = px - cx, dy = py - cy;
      const d = Math.hypot(dx, dy);
      if (d >= RADIUS || d === 0) return [px, py];
      const k = 1 - d / RADIUS;
      const s = 1 + AMOUNT * k * k;
      return [cx + dx * s, cy + dy * s];
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = LINE;

      const lensOn = cx > -5000;
      ctx.beginPath();

      for (let x = (W % CELL) / 2; x <= W; x += CELL) {
        const dx = x - cx;
        if (!lensOn || Math.abs(dx) >= RADIUS) {
          ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H);
          continue;
        }
        const half = Math.sqrt(RADIUS * RADIUS - dx * dx);
        const y0 = cy - half, y1 = cy + half;
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, Math.max(0, y0));
        ctx.moveTo(x + 0.5, Math.max(0, y0));
        for (let y = y0; y <= y1; y += STEP) {
          const [wx, wy] = warp(x, y);
          ctx.lineTo(wx, wy);
        }
        const [ex, ey] = warp(x, y1);
        ctx.lineTo(ex, ey);
        ctx.lineTo(x + 0.5, Math.min(H, y1));
        ctx.lineTo(x + 0.5, H);
      }

      for (let y = (H % CELL) / 2; y <= H; y += CELL) {
        const dy = y - cy;
        if (!lensOn || Math.abs(dy) >= RADIUS) {
          ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5);
          continue;
        }
        const half = Math.sqrt(RADIUS * RADIUS - dy * dy);
        const x0 = cx - half, x1 = cx + half;
        ctx.moveTo(0, y + 0.5); ctx.lineTo(Math.max(0, x0), y + 0.5);
        ctx.moveTo(Math.max(0, x0), y + 0.5);
        for (let x = x0; x <= x1; x += STEP) {
          const [wx, wy] = warp(x, y);
          ctx.lineTo(wx, wy);
        }
        const [ex, ey] = warp(x1, y);
        ctx.lineTo(ex, ey);
        ctx.lineTo(Math.min(W, x1), y + 0.5);
        ctx.lineTo(W, y + 0.5);
      }
      ctx.stroke();

      if (lensOn) {
        // recolour only the pixels that already carry a line
        const tint = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS);
        tint.addColorStop(0, TINT[0]);
        tint.addColorStop(0.55, TINT[1]);
        tint.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = tint;
        ctx.fillRect(cx - RADIUS, cy - RADIUS, RADIUS * 2, RADIUS * 2);
        ctx.globalCompositeOperation = "source-over";

        if (!light) {
          const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS * 1.3);
          bloom.addColorStop(0, "rgba(90,150,210,0.05)");
          bloom.addColorStop(1, "rgba(0,0,0,0)");
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = bloom;
          ctx.fillRect(cx - RADIUS * 1.3, cy - RADIUS * 1.3, RADIUS * 2.6, RADIUS * 2.6);
          ctx.globalCompositeOperation = "source-over";
        }
      }
    };

    const tick = () => {
      if (!pointerSeen) {
        t += 0.0042;
        tx = W * (0.5 + 0.3 * Math.sin(t));
        ty = H * (0.5 + 0.26 * Math.sin(t * 1.37 + 1.1));
      }
      if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) {
        cx = cx < -5000 ? tx : cx + (tx - cx) * EASE;
        cy = cy < -5000 ? ty : cy + (ty - cy) * EASE;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => { pointerSeen = true; tx = e.clientX; ty = e.clientY; };
    const onLeave = () => { pointerSeen = false; };
    const onResize = () => { resize(); draw(); };

    resize();
    if (reduce) {
      draw();
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [light]);

  return <canvas ref={canvasRef} className="gf-grid" aria-hidden="true" />;
}

/* ============================================================
   1:1 cover — non-square sources get a blurred self-fill
   ============================================================ */
function SquareCover({ src, alt }) {
  return (
    <div className="gf-cover">
      <img src={src} alt="" aria-hidden="true" className="gf-cover-bg" />
      <div className="gf-cover-scrim" />
      <img src={src} alt={alt} className="gf-cover-img" />
    </div>
  );
}

/* ============================================================
   Card
   ============================================================ */
function WorkCard({ work, light, onOpen }) {
  const accent = accentOf(work, light);

  const sub =
    work.kind === "music"       ? aliasName(work.aliasId) :
    work.kind === "event"       ? work.venue :
    work.kind === "development" ? work.format :
    work.kind === "other"       ? work.category :
    "";

  const meta =
    work.kind === "music"       ? `${work.label} · ${work.catalog}` :
    work.kind === "event"       ? work.role :
    work.kind === "development" ? work.stack.join(" / ") :
    work.kind === "other"       ? (work.partner ?? "") :
    "";

  return (
    <button className="gf-card" style={{ "--accent": accent }} onClick={() => onOpen(work)}
      aria-label={`${work.title} の詳細を開く`}>
      <div className="gf-card-frame">
        <img src={work.cover} alt="" aria-hidden="true" className="gf-halo" />
        <SquareCover src={work.cover} alt={`${work.title} のカバー`} />
        <span className="gf-kind">{KIND_LABEL[work.kind]}</span>
      </div>
      <div className="gf-card-text">
        <h3 className="gf-card-title">{work.title}</h3>
        <p className="gf-card-sub">{sub}</p>
        <p className="gf-card-meta">{meta}</p>
      </div>
    </button>
  );
}

/* ============================================================
   Detail panel
   ============================================================ */
function DetailPanel({ work, light, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!work) return null;
  const accent = accentOf(work, light);
  const names = aliasIdsOf(work).map(aliasName).filter(Boolean).join(" / ");

  const rows =
    work.kind === "music"
      ? [["名義", aliasName(work.aliasId)], ["形態", work.format], ["レーベル", work.label], ["品番", work.catalog], ["リリース", work.date]]
      : work.kind === "event"
        ? [["区分", work.role], ["会場", work.venue], ["出演名義", names], ["開催日", work.date]]
        : work.kind === "development"
          ? [["種別", work.format], ["技術", work.stack.join(", ")], ["公開", work.date]]
          : work.kind === "other"
            ? [["区分", work.category], ["相手先", work.partner], ["関連名義", names], ["日付", work.date]]
            : [];

  return (
    <div className="gf-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="gf-panel" style={{ "--accent": accent }} role="dialog" aria-modal="true" aria-label={work.title}>
        <button ref={closeRef} className="gf-close" onClick={onClose} aria-label="閉じる">✕</button>
        <div className="gf-panel-grid">
          <div className="gf-panel-cover">
            <SquareCover src={work.cover} alt={`${work.title} のカバー`} />
            {work.note && <p className="gf-note">{work.note}</p>}
          </div>
          <div className="gf-panel-body">
            <span className="gf-kind is-static">{KIND_LABEL[work.kind]}</span>
            <h2 className="gf-panel-title">{work.title}</h2>
            <p className="gf-panel-lead">{work.body}</p>
            <dl className="gf-spec">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="gf-spec-row"><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="gf-links">
              {work.links.map((l) => (
                <a key={l.label} href={l.url} className="gf-link" onClick={(e) => e.preventDefault()}>
                  {l.label}<span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */
export default function WorksPage() {
  const [light, setLight] = useState(false);
  const [kind, setKind] = useState("all");
  const [alias, setAlias] = useState("all");   // 名義の contentId、または "all"
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = WORKS.filter((w) => {
      if (kind !== "all" && w.kind !== kind) return false;
      if (alias !== "all" && !aliasIdsOf(w).includes(alias)) return false;
      if (!needle) return true;
      const hay = [
        w.title, w.label, w.catalog, w.venue, w.role, w.format, w.category,
        w.partner, w.summary,
        ...aliasIdsOf(w).map(aliasName),
        ...(w.stack || []),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
    return [...out].sort((a, b) =>
      sort === "new" ? b.date.localeCompare(a.date)
        : sort === "old" ? a.date.localeCompare(b.date)
          : a.title.localeCompare(b.title, "ja"));
  }, [kind, alias, q, sort]);

  const reset = useCallback(() => { setKind("all"); setAlias("all"); setQ(""); }, []);

  return (
    <div className={"gf-root" + (light ? " is-light" : "")}>
      <style>{CSS}</style>
      <LensGrid light={light} />

      <div className="gf-page">
        <header className="gf-head">
          <div className="gf-head-row">
            <p className="gf-eyebrow">Gaku FUJII</p>
            <button className="gf-theme" onClick={() => setLight((v) => !v)}
              aria-pressed={light} aria-label="テーマを切り替える">
              {light ? "DARK" : "LIGHT"}
            </button>
          </div>
          <h1 className="gf-h1">WORKS</h1>
          <p className="gf-lede">
            音源のリリース、ライブとイベント、自分で書いたソフトウェア、その他の活動。<br />
            すべて同じ棚に並べています。カードを押すと詳細が開きます。
          </p>
        </header>

        <div className="gf-controls">
          <div className="gf-chips" role="group" aria-label="カテゴリ">
            {KIND_CHIPS.map(([v, l]) => (
              <button key={v} className={"gf-chip" + (kind === v ? " is-on" : "")}
                style={{ "--accent": pick(KIND_COLOR[v], light) }}
                onClick={() => setKind(v)} aria-pressed={kind === v}>{l}</button>
            ))}
          </div>

          <div className="gf-chips gf-chips-alias" role="group" aria-label="名義">
            <button className={"gf-chip is-alias" + (alias === "all" ? " is-on" : "")}
              style={{ "--accent": pick(KIND_COLOR.all, light) }}
              onClick={() => setAlias("all")} aria-pressed={alias === "all"}>名義すべて</button>
            {ALIASES.map((a) => (
              <button key={a.id} className={"gf-chip is-alias" + (alias === a.id ? " is-on" : "")}
                style={{ "--accent": pick(a, light) }}
                onClick={() => setAlias(a.id)} aria-pressed={alias === a.id}>
                <i className="gf-dot" />{a.name}
              </button>
            ))}
          </div>

          <div className="gf-tools">
            <input className="gf-search" type="search" value={q} placeholder="タイトル・レーベル・品番で検索"
              onChange={(e) => setQ(e.target.value)} aria-label="作品を検索" />
            <select className="gf-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="並び替え">
              <option value="new">新しい順</option>
              <option value="old">古い順</option>
              <option value="title">タイトル順</option>
            </select>
            <span className="gf-count">{String(list.length).padStart(2, "0")} 件</span>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="gf-empty">
            <p>条件に一致する作品はありません。</p>
            <button className="gf-reset" onClick={reset}>フィルターを外す</button>
          </div>
        ) : (
          <div className="gf-list">
            {list.map((w) => <WorkCard key={w.id} work={w} light={light} onOpen={setOpen} />)}
          </div>
        )}

        <footer className="gf-foot">
          掲載中の画像・テキストはすべてレイアウト確認用のダミーです。本番では microCMS から配信します。
        </footer>
      </div>

      {open && <DetailPanel work={open} light={light} onClose={() => setOpen(null)} />}
    </div>
  );
}

/* ============================================================
   Styles
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');

.gf-root{
  --bg:#080B11; --panel:#0E131C; --line:#1B2330; --field:rgba(255,255,255,.02);
  --ink:#E6EAF2; --ink-dim:#8894A8; --ink-faint:#5D687B; --hover-line:#2D3B4F;
  --cover-bg:#05070B; --scrim:rgba(6,9,14,.28); --halo:.75; --halo-blur:26px;
  --overlay:rgba(4,6,10,.72); --chip-on:rgba(255,255,255,.03); --kind-ink:#05070B;
  position:relative; min-height:100vh; background:var(--bg); color:var(--ink);
  font-family:'Zen Kaku Gothic New',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
  transition:background .35s ease, color .35s ease;
}
.gf-root.is-light{
  --bg:#EDF0F4; --panel:#FFFFFF; --line:#D3DAE3; --field:rgba(255,255,255,.75);
  --ink:#141A22; --ink-dim:#57647A; --ink-faint:#8593A6; --hover-line:#9FAEC2;
  --cover-bg:#DDE3EA; --scrim:rgba(255,255,255,.14); --halo:.5; --halo-blur:30px;
  --overlay:rgba(225,230,237,.7); --chip-on:rgba(20,40,70,.045); --kind-ink:#FFFFFF;
}

.gf-grid{position:fixed; inset:0; width:100%; height:100%; z-index:0; pointer-events:none;}
.gf-page{position:relative; z-index:1; max-width:1560px; margin:0 auto; padding:56px 24px 96px;}

/* ---- header ---- */
.gf-head-row{display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px;}
.gf-eyebrow{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.28em;
  color:var(--ink-faint); text-transform:uppercase; margin:0;}
.gf-theme{background:transparent; border:1px solid var(--line); border-radius:2px;
  color:var(--ink-dim); padding:7px 13px; cursor:pointer;
  font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.2em;
  transition:color .2s,border-color .2s;}
.gf-theme:hover{color:var(--ink); border-color:var(--hover-line);}
.gf-h1{font-family:'IBM Plex Mono',monospace; font-weight:500; font-size:clamp(40px,7vw,84px);
  letter-spacing:.14em; line-height:1; margin:0 0 22px;}
.gf-lede{font-size:14px; line-height:2; color:var(--ink-dim); margin:0; max-width:52ch;}

/* ---- controls ---- */
.gf-controls{margin:52px 0 34px; border-top:1px solid var(--line); padding-top:22px;
  display:flex; flex-direction:column; gap:14px;}
.gf-chips{display:flex; flex-wrap:wrap; gap:8px;}
.gf-chip{appearance:none; cursor:pointer; background:transparent; color:var(--ink-dim);
  border:1px solid var(--line); border-radius:2px; padding:8px 14px;
  font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em;
  transition:color .2s,border-color .2s,background .2s;}
.gf-chip.is-alias{font-family:'Zen Kaku Gothic New',sans-serif; letter-spacing:.04em; font-size:12px;
  display:inline-flex; align-items:center; gap:8px;}
.gf-chip:hover{color:var(--ink); border-color:var(--hover-line);}
.gf-chip.is-on{color:var(--accent); border-color:var(--accent); background:var(--chip-on);}
.gf-dot{width:6px; height:6px; border-radius:50%; background:var(--accent); display:inline-block;}

.gf-tools{display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-top:4px;}
.gf-search{flex:1 1 240px; min-width:0; background:var(--field); color:var(--ink);
  border:1px solid var(--line); border-radius:2px; padding:10px 13px; font-size:13px;
  font-family:inherit; transition:border-color .2s;}
.gf-search::placeholder{color:var(--ink-faint);}
.gf-search:focus{outline:none; border-color:var(--hover-line);}
.gf-sort{background:var(--field); color:var(--ink-dim); border:1px solid var(--line);
  border-radius:2px; padding:10px 12px; font-size:12px; font-family:'IBM Plex Mono',monospace;}
.gf-sort:focus{outline:none; border-color:var(--hover-line);}
.gf-count{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.18em; color:var(--ink-faint);}

/* ---- grid of cards ---- */
.gf-list{display:grid; grid-template-columns:repeat(2,1fr); gap:14px;}
@media (min-width:600px){.gf-list{grid-template-columns:repeat(3,1fr); gap:18px;}}
@media (min-width:1000px){.gf-list{grid-template-columns:repeat(4,1fr); gap:22px;}}
@media (min-width:1400px){.gf-list{grid-template-columns:repeat(5,1fr);}}

.gf-card{appearance:none; background:none; border:0; padding:0; margin:0; cursor:pointer;
  text-align:left; color:inherit; font:inherit; display:block;}
.gf-card:focus-visible{outline:2px solid var(--accent); outline-offset:6px;}

.gf-card-frame{position:relative;}
.gf-halo{position:absolute; inset:6%; width:88%; height:88%; object-fit:cover;
  filter:blur(var(--halo-blur)) saturate(1.5); opacity:0; transform:scale(1);
  transition:opacity .35s ease, transform .35s ease; pointer-events:none; z-index:0;}
.gf-card:hover .gf-halo{opacity:var(--halo); transform:scale(1.14);}

.gf-cover{position:relative; aspect-ratio:1/1; overflow:hidden; border-radius:3px;
  background:var(--cover-bg); isolation:isolate;}
.gf-cover-bg{position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  transform:scale(1.35); filter:blur(22px) saturate(1.25) brightness(.85);}
.gf-cover-scrim{position:absolute; inset:0; background:var(--scrim);}
.gf-cover-img{position:relative; width:100%; height:100%; object-fit:contain; display:block;
  transition:transform .45s cubic-bezier(.2,.7,.2,1);}
.gf-card:hover .gf-cover-img{transform:scale(1.07);}

.gf-kind{position:absolute; left:8px; top:8px; z-index:2;
  font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.16em;
  padding:4px 7px; border-radius:2px; color:var(--kind-ink); background:var(--accent);
  opacity:0; transform:translateY(-3px); transition:opacity .28s, transform .28s;}
.gf-card:hover .gf-kind{opacity:.94; transform:translateY(0);}
.gf-kind.is-static{position:static; opacity:1; transform:none; display:inline-block; margin-bottom:14px;}

.gf-card-text{padding:12px 2px 0;}
.gf-card-title{font-size:14px; font-weight:500; margin:0 0 5px; line-height:1.45;}
.gf-card-sub{font-size:12px; color:var(--accent); margin:0 0 4px; min-height:1em;}
.gf-card-meta{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em;
  color:var(--ink-faint); margin:0; line-height:1.6;}

/* ---- empty / footer ---- */
.gf-empty{padding:80px 0; text-align:center; color:var(--ink-dim); font-size:14px;}
.gf-reset{margin-top:16px; background:none; border:1px solid var(--line); color:var(--ink);
  padding:9px 18px; border-radius:2px; cursor:pointer; font:inherit; font-size:13px;}
.gf-reset:hover{border-color:var(--hover-line);}
.gf-foot{margin-top:72px; padding-top:20px; border-top:1px solid var(--line);
  font-size:11px; color:var(--ink-faint); line-height:1.9;}

/* ---- detail ---- */
.gf-overlay{position:fixed; inset:0; z-index:40; display:flex; align-items:center; justify-content:center;
  padding:20px; background:var(--overlay); backdrop-filter:blur(10px);
  animation:gf-fade .22s ease both;}
.gf-panel{position:relative; width:min(1000px,100%); max-height:88vh; overflow-y:auto;
  background:var(--panel); border:1px solid var(--line); border-radius:4px;
  animation:gf-pop .34s cubic-bezier(.16,.9,.3,1) both;}
@keyframes gf-fade{from{opacity:0}to{opacity:1}}
@keyframes gf-pop{from{opacity:0; transform:scale(.94) translateY(14px)}to{opacity:1; transform:none}}
.gf-close{position:absolute; right:12px; top:12px; z-index:3; width:34px; height:34px;
  background:var(--field); border:1px solid var(--line); border-radius:2px;
  color:var(--ink-dim); cursor:pointer; font-size:13px;}
.gf-close:hover{color:var(--ink); border-color:var(--hover-line);}
.gf-panel-grid{display:grid; grid-template-columns:1fr;}
@media (min-width:820px){.gf-panel-grid{grid-template-columns:380px 1fr;}}
.gf-panel-cover{padding:26px;}
.gf-note{margin:12px 0 0; font-family:'IBM Plex Mono',monospace; font-size:10px;
  letter-spacing:.06em; color:var(--ink-faint);}
.gf-panel-body{padding:26px 30px 34px;}
@media (min-width:820px){.gf-panel-body{padding:34px 34px 34px 6px;}}
.gf-panel-title{font-size:clamp(24px,3.4vw,34px); font-weight:700; margin:0 0 18px; line-height:1.3;}
.gf-panel-lead{font-size:14px; line-height:2.05; color:var(--ink-dim); margin:0 0 26px;}
.gf-spec{margin:0 0 26px; border-top:1px solid var(--line);}
.gf-spec-row{display:grid; grid-template-columns:88px 1fr; gap:12px;
  padding:10px 0; border-bottom:1px solid var(--line);}
.gf-spec dt{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em;
  color:var(--ink-faint); margin:0; padding-top:2px;}
.gf-spec dd{margin:0; font-size:13px; color:var(--ink);}
.gf-links{display:flex; flex-wrap:wrap; gap:8px;}
.gf-link{text-decoration:none; font-size:12px; padding:9px 15px; border-radius:2px;
  border:1px solid var(--line); color:var(--ink-dim); transition:color .2s,border-color .2s;}
.gf-link:hover{color:var(--accent); border-color:var(--accent);}

@media (prefers-reduced-motion:reduce){
  .gf-card,.gf-cover-img,.gf-halo,.gf-kind,.gf-panel,.gf-overlay,.gf-root{transition:none!important; animation:none!important;}
}
`;
