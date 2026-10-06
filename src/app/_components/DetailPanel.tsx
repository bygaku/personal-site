"use client";

import React, { useEffect, useRef } from "react";

import { SquareCover } from "./WorkCard";
import { accentOf, coverOf, fmtDate, KIND_LABEL, linkLabel, selJoin } from "./work";

import { aliasesOf, type Work } from "@/types/works";

export default function DetailPanel({ work, light, onClose }: {
  work: Work;
  light: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const cover = coverOf(work);
  const names = aliasesOf(work).map((a) => a.name).join(" / ");

  // カバー下の小文字欄。音源はクレジット、イベントは共演。
  const note =
    work.kind === "music" ? work.credits :
    work.kind === "event" ? work.lineup :
    undefined;

  // 本文が空なら一行説明を出す（development / other は summary が必須）
  const lead =
    work.body?.trim() ||
    (work.kind === "development" || work.kind === "other" ? work.summary : "");

  const rows: [string, string][] =
    work.kind === "music"
      ? [["名義", work.alias?.name ?? ""], ["形態", selJoin(work.format, ", ")], ["レーベル", work.label ?? ""],
         ["品番", work.catalog ?? ""], ["収録曲数", work.trackCount ? String(work.trackCount) : ""],
         ["リリース", fmtDate(work.date)]]
      : work.kind === "event"
        ? [["区分", selJoin(work.role, ", ")], ["会場", work.venue], ["エリア", work.area],
           ["出演名義", names],
           ["開催日", [fmtDate(work.date), fmtDate(work.endDate)].filter(Boolean).join(" – ")]]
        : work.kind === "development"
          ? [["種別", selJoin(work.category, ", ")], ["技術", selJoin(work.stack, ", ")],
             ["動作環境", selJoin(work.platform, ", ")], ["状態", selJoin(work.status, ", ")],
             ["バージョン", work.version ?? ""], ["公開", fmtDate(work.date)]]
          : work.kind === "other"
            ? [["区分", selJoin(work.category, ", ")], ["相手先", work.partner ?? ""],
               ["関連名義", names], ["日付", fmtDate(work.date)]]
            : [];

  return (
    <div className="gf-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="gf-panel" style={{ "--accent": accentOf(work, light) } as React.CSSProperties}
        role="dialog" aria-modal="true" aria-label={work.title}>
        <button ref={closeRef} className="gf-close" onClick={onClose} aria-label="閉じる">✕</button>
        <div className="gf-panel-grid">
          <div className="gf-panel-cover">
            <SquareCover src={cover} alt={`${work.title} のカバー`} />
            {note && <p className="gf-note">{note}</p>}
          </div>
          <div className="gf-panel-body">
            <span className="gf-kind is-static">{KIND_LABEL[work.kind]}</span>
            <h2 className="gf-panel-title">{work.title}</h2>
            {/* body はリッチエディタの HTML 文字列。summary のときは素のテキスト */}
            <div className="gf-panel-lead" dangerouslySetInnerHTML={{ __html: lead }} />
            <dl className="gf-spec">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="gf-spec-row"><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="gf-links">
              {(work.links ?? []).map((l, i) => (
                <a key={`${l.url}-${i}`} href={l.url} className="gf-link" target="_blank" rel="noreferrer noopener">
                  {linkLabel(l)}<span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
