"use client";

import React from "react";

import { accentOf, cardMeta, cardSub, coverOf, KIND_LABEL } from "./work";

import type { Work } from "@/types/works";

/**
 * 常に 1:1 で見せるカバー。元画像は切り抜かない。
 * 同じ画像を2枚重ね、背景は cover + blur、前景は contain。正方形なら背景は自然に隠れる。
 */
export function SquareCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="gf-cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" aria-hidden="true" className="gf-cover-bg" />
      <div className="gf-cover-scrim" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="gf-cover-img" />
    </div>
  );
}

export default function WorkCard({ work, light, onOpen }: {
  work: Work;
  light: boolean;
  onOpen: (w: Work) => void;
}) {
  const cover = coverOf(work);

  return (
    <button className="gf-card" style={{ "--accent": accentOf(work, light) } as React.CSSProperties}
      onClick={() => onOpen(work)} aria-label={`${work.title} の詳細を開く`}>
      <div className="gf-card-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" aria-hidden="true" className="gf-halo" />
        <SquareCover src={cover} alt={`${work.title} のカバー`} />
        <span className="gf-kind">{KIND_LABEL[work.kind]}</span>
      </div>
      <div className="gf-card-text">
        <h3 className="gf-card-title">{work.title}</h3>
        <p className="gf-card-sub">{cardSub(work)}</p>
        <p className="gf-card-meta">{cardMeta(work)}</p>
      </div>
    </button>
  );
}
