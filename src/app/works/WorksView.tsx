"use client";

import Link from "next/link";
import React, { useState, useMemo, useCallback } from "react";

import DetailPanel from "../_components/DetailPanel";
import { GF_CSS } from "../_components/gfCss";
import LensGrid from "../_components/LensGrid";
import { aliasAccent, KIND_CHIPS, KIND_COLOR, pick, selJoin } from "../_components/work";
import WorkCard from "../_components/WorkCard";

import { aliasesOf, type Alias, type Work } from "@/types/works";

export default function WorksView({ works, aliases }: { works: Work[]; aliases: Alias[] }) {
  const [light, setLight] = useState(false);
  const [kind, setKind] = useState("all");
  const [alias, setAlias] = useState("all");   // 名義の contentId、または "all"
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [open, setOpen] = useState<Work | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = works.filter((w) => {
      if (kind !== "all" && w.kind !== kind) return false;
      // 名義は contentId で突き合わせる。表示名は改名されうるため使わない。
      if (alias !== "all" && !aliasesOf(w).some((a) => a.id === alias)) return false;
      if (!needle) return true;
      const hay = [
        w.title,
        w.kind === "music" ? [w.label, w.catalog, selJoin(w.format)] : [],
        w.kind === "event" ? [w.venue, w.area, selJoin(w.role), w.lineup] : [],
        w.kind === "development" ? [selJoin(w.category), selJoin(w.stack), selJoin(w.platform), w.summary] : [],
        w.kind === "other" ? [selJoin(w.category), w.partner, w.summary] : [],
        ...aliasesOf(w).map((a) => a.name),
      ].flat().filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
    return [...out].sort((a, b) =>
      sort === "new" ? b.date.localeCompare(a.date)
        : sort === "old" ? a.date.localeCompare(b.date)
          : a.title.localeCompare(b.title, "ja"));
  }, [works, kind, alias, q, sort]);

  const reset = useCallback(() => { setKind("all"); setAlias("all"); setQ(""); }, []);

  return (
    <div className={"gf-root" + (light ? " is-light" : "")}>
      <style>{GF_CSS}</style>
      <LensGrid light={light} />

      <div className="gf-page">
        <header className="gf-head">
          <div className="gf-head-row">
            <nav className="gf-nav">
              <Link href="/">HOME</Link>
              <Link href="/works" className="is-here" aria-current="page">WORKS</Link>
            </nav>
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
                style={{ "--accent": pick(KIND_COLOR[v], light) } as React.CSSProperties}
                onClick={() => setKind(v)} aria-pressed={kind === v}>{l}</button>
            ))}
          </div>

          <div className="gf-chips gf-chips-alias" role="group" aria-label="名義">
            <button className={"gf-chip is-alias" + (alias === "all" ? " is-on" : "")}
              style={{ "--accent": pick(KIND_COLOR.all, light) } as React.CSSProperties}
              onClick={() => setAlias("all")} aria-pressed={alias === "all"}>名義すべて</button>
            {aliases.map((a) => (
              <button key={a.id} className={"gf-chip is-alias" + (alias === a.id ? " is-on" : "")}
                style={{ "--accent": pick(aliasAccent(a), light) } as React.CSSProperties}
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
            <p>{works.length === 0 ? "まだ作品が登録されていません。" : "条件に一致する作品はありません。"}</p>
            {works.length > 0 && <button className="gf-reset" onClick={reset}>フィルターを外す</button>}
          </div>
        ) : (
          <div className="gf-list">
            {list.map((w) => <WorkCard key={w.id} work={w} light={light} onOpen={setOpen} />)}
          </div>
        )}

        <footer className="gf-foot">
          掲載内容は microCMS から配信しています。
        </footer>
      </div>

      {open && <DetailPanel work={open} light={light} onClose={() => setOpen(null)} />}
    </div>
  );
}
