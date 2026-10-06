/** microCMS が全コンテンツに自動で付ける */
type MicroCMSBase = {
  id: string; // ← contentId。名義の安定キーはこれ
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

export type MicroCMSImage = {
  url: string;
  width: number; // ← 正方形判定に使える
  height: number;
};

export type Alias = MicroCMSBase & {
  name: string;
  nameEn: string;
  colorDark: string;
  colorLight: string;
  bio?: string;
  image?: MicroCMSImage;
  siteUrl?: string;
  active: boolean;
  order: number;
};

export type Link = {
  fieldId: "link";
  platform: string[]; // ← セレクトは単一選択でも配列で返る
  url: string;
  label?: string;
};

type Common = MicroCMSBase & {
  title: string;
  date: string;
  cover: MicroCMSImage;
  body?: string;
  links?: Link[];
  featured?: boolean;
};

export type MusicWork = Common & {
  kind: "music";
  alias: Alias;
  format: string[];
  label?: string;
  catalog?: string;
  trackCount?: number;
  credits?: string;
};

export type EventWork = Common & {
  kind: "event";
  role: string[];
  endDate?: string;
  venue: string;
  area: string;
  alias?: Alias[];
  photos?: MicroCMSImage[];
  lineup?: string;
};

export type DevelopmentWork = Common & {
  kind: "development";
  category: string[];
  stack: string[];
  platform?: string[];
  status: string[];
  version?: string;
  summary: string;
};

export type OtherWork = Common & {
  kind: "other";
  category: string[];
  partner?: string;
  alias?: Alias[];
  summary: string;
};

export type Work = MusicWork | EventWork | DevelopmentWork | OtherWork;

/**
 * 作品に紐づく名義を、種別の違いを吸収して配列で返す。
 * 参照先の名義を削除すると microCMS は null を返すため、落として返す。
 */
export const aliasesOf = (work: Work): Alias[] => {
  // development だけ名義を持たない。4種すべて明示し、末尾にフォールバックを置く。
  const raw: (Alias | null | undefined)[] =
    work.kind === "music"       ? [work.alias] :
    work.kind === "event"       ? (work.alias ?? []) :
    work.kind === "development" ? [] :
    work.kind === "other"       ? (work.alias ?? []) :
    [];

  return raw.filter((a): a is Alias => a != null);
};
