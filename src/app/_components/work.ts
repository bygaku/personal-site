import type { Alias, Link as WorkLink, Work } from "@/types/works";

export type Accent = { dark: string; light: string };

export const KIND_COLOR: Record<string, Accent> = {
  all:         { dark: "#9FB4CE", light: "#4E5F76" },
  music:       { dark: "#8FA6C4", light: "#41597A" },
  event:       { dark: "#E8B44C", light: "#8F6404" },
  development: { dark: "#5FD3A6", light: "#0C7B57" },
  other:       { dark: "#C7B9A6", light: "#7A6752" },
};

export const KIND_LABEL: Record<Work["kind"], string> = {
  music:       "MUSIC",
  event:       "LIVE / EVENT",
  development: "DEVELOP",
  other:       "OTHER",
};

export const KIND_CHIPS: [string, string][] = [
  ["all", "ALL"],
  ["music", "MUSIC"],
  ["event", "LIVE / EVENT"],
  ["development", "DEVELOP"],
  ["other", "OTHER"],
];

/** 対応表に無いキーが来ても落ちないよう、既定色にフォールバックする */
const FALLBACK: Accent = { dark: "#9FB4CE", light: "#4E5F76" };

export const pick = (entry: Accent | null | undefined, light: boolean) =>
  (entry ?? FALLBACK)[light ? "light" : "dark"];

/** 名義のアクセント色は microCMS の colorDark / colorLight をそのまま使う */
export const aliasAccent = (a: Alias | null | undefined): Accent | null =>
  a ? { dark: a.colorDark, light: a.colorLight } : null;

/** その作品のアクセント色。音源は名義の色、それ以外はカテゴリの色 */
export const accentOf = (work: Work, light: boolean) =>
  pick(
    work.kind === "music" ? aliasAccent(work.alias) : KIND_COLOR[work.kind],
    light,
  );

/** セレクトフィールドは単一選択でも配列で返る */
export const sel = (v: string[] | undefined) => v?.[0] ?? "";
export const selJoin = (v: string[] | undefined, glue = " / ") => (v ?? []).join(glue);

/** microCMS の日時は ISO 文字列。表示は YYYY-MM-DD に切る */
export const fmtDate = (iso: string | undefined) => (iso ? iso.slice(0, 10) : "");

/** リンクの表示名。label が空なら platform をそのまま出す */
export const linkLabel = (l: WorkLink) => l.label?.trim() || sel(l.platform);

const svgURI = (s: string) => "data:image/svg+xml;utf8," + encodeURIComponent(s);

/** cover 未設定でもカード全体が崩れないよう、無地のプレースホルダを返す */
export const PLACEHOLDER = svgURI(
  `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#141A22"/></svg>`,
);

export const coverOf = (work: Work) => work.cover?.url ?? PLACEHOLDER;

/** カード2行目。種別ごとに意味の近いものを出す */
export const cardSub = (work: Work) =>
  work.kind === "music"       ? (work.alias?.name ?? "") :
  work.kind === "event"       ? [work.area, work.venue].filter(Boolean).join(" / ") :
  work.kind === "development" ? sel(work.category) :
  work.kind === "other"       ? sel(work.category) :
  "";

/** カード3行目。等幅で出す補助情報 */
export const cardMeta = (work: Work) =>
  work.kind === "music"       ? [work.label?.trim() || "self-released", work.catalog].filter(Boolean).join(" · ") :
  work.kind === "event"       ? sel(work.role) :
  work.kind === "development" ? selJoin(work.stack) :
  work.kind === "other"       ? (work.partner ?? "") :
  "";
