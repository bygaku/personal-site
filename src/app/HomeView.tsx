"use client";

import Link from "next/link";
import React, { useState } from "react";

import DetailPanel from "./_components/DetailPanel";
import { GF_CSS } from "./_components/gfCss";
import LensGrid from "./_components/LensGrid";
import { aliasAccent, pick } from "./_components/work";
import WorkCard from "./_components/WorkCard";

import type { Alias, Work } from "@/types/works";

export default function HomeView({ aliases, picks, picksAreFeatured }: {
  aliases: Alias[];
  picks: Work[];
  /** featured が1件も無いときは最新を出しているので、見出しを変える */
  picksAreFeatured: boolean;
}) {
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState<Work | null>(null);

  return (
    <div className={"gf-root" + (light ? " is-light" : "")}>
      <style>{GF_CSS}</style>
      <LensGrid light={light} />

      <div className="gf-page">
        <header className="gf-head">
          <div className="gf-head-row">
            <nav className="gf-nav">
              <Link href="/" className="is-here" aria-current="page">HOME</Link>
              <Link href="/works">WORKS</Link>
            </nav>
            <button className="gf-theme" onClick={() => setLight((v) => !v)}
              aria-pressed={light} aria-label="テーマを切り替える">
              {light ? "DARK" : "LIGHT"}
            </button>
          </div>
          <p className="gf-eyebrow">Gaku FUJII</p>
          <h1 className="gf-h1">MUSIC &amp;<br />SOFTWARE</h1>
          <p className="gf-lede">
            複数の名義で音楽をつくり、ソフトウェアを書いています。<br />
            名義ごとに分かれていた活動を、ここで1つにまとめています。
          </p>
        </header>

        <section className="gf-section" aria-labelledby="gf-aliases">
          <div className="gf-section-head">
            <h2 className="gf-section-title" id="gf-aliases">Aliases</h2>
          </div>

          {aliases.length === 0 ? (
            <div className="gf-empty"><p>まだ名義が登録されていません。</p></div>
          ) : (
            <div className="gf-alias-grid">
              {aliases.map((a) => (
                <article key={a.id} className="gf-alias-card"
                  style={{ "--accent": pick(aliasAccent(a), light) } as React.CSSProperties}>
                  <h3 className="gf-alias-name">{a.name}</h3>
                  <p className="gf-alias-en">{a.nameEn}</p>
                  {a.bio && <p className="gf-alias-bio">{a.bio}</p>}
                  {a.siteUrl && (
                    <a className="gf-alias-link" href={a.siteUrl} target="_blank" rel="noreferrer noopener">
                      SITE<span aria-hidden="true"> ↗</span>
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="gf-section" aria-labelledby="gf-picks">
          <div className="gf-section-head">
            <h2 className="gf-section-title" id="gf-picks">
              {picksAreFeatured ? "Pick up" : "Latest"}
            </h2>
            <Link href="/works" className="gf-more">すべて見る →</Link>
          </div>

          {picks.length === 0 ? (
            <div className="gf-empty"><p>まだ作品が登録されていません。</p></div>
          ) : (
            <div className="gf-list">
              {picks.map((w) => <WorkCard key={w.id} work={w} light={light} onOpen={setOpen} />)}
            </div>
          )}
        </section>

        <footer className="gf-foot">
          掲載内容は microCMS から配信しています。
        </footer>
      </div>

      {open && <DetailPanel work={open} light={light} onClose={() => setOpen(null)} />}
    </div>
  );
}
