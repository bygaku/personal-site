# microCMS スキーマ設計 — music-portfolio

APIを **5本** 作ります。`alias`（名義マスタ）＋ 作品4種。すべて **リスト形式** です。

```
alias        リスト形式    名義マスタ（名義の数だけ入る）
music        リスト形式    音源リリース
event        リスト形式    ライブ・イベント出演
development  リスト形式    ソフトウェア
other        リスト形式    上記に収まらない活動・制作物
```

さらに、作品4本すべてで使う **カスタムフィールド `link`** を作ります。

---

## 名義が変わる前提での設計

名義は将来 **追加・改名・削除されうる** ものとして扱います。設計上の要点は1つです。

> **表示名をキーに使わない。キーは `contentId`。**

`alias` API のコンテンツIDを安定キーとし、画面に出る文字列は `name` フィールドから読みます。
この分離があると、改名は `name` を書き換えるだけで済み、参照している側は一切変わりません。

逆に、作品側に名義名を文字列で持たせたり、コード内で `ALIASES["GVKU"]` のように
表示名で引いたりすると、改名のたびに全データとコードの修正が必要になります。

**コンテンツIDは後から変更できません。** 名義名そのものではなく、将来改名しても違和感の少ない
短い英小文字のスラッグを付けてください（例: `gvku` / `fanion` / `yugaku`）。
改名時にIDが実態と合わなくなっても、表示には一切影響しないので放置して問題ありません。

名義を削除するときは、参照している作品が残っていないか先に確認します。
参照先が消えると、作品側の `alias` が `null` になります。

---

## 0. カスタムフィールド: `link`

各APIの「カスタムフィールド」タブで作成し、`links`（繰り返しフィールド）から参照します。
カスタムフィールドはAPI単位なので、`music` / `event` / `development` / `other` の4本で
同じものを作る必要があります。

| フィールドID | 表示名 | 種類 | 必須 | 備考 |
|---|---|---|---|---|
| `platform` | 種別 | セレクトフィールド | ✓ | 下記から単一選択 |
| `url` | URL | テキストフィールド | ✓ | |
| `label` | 表示名の上書き | テキストフィールド | | 空なら `platform` をそのまま表示 |

**`platform` の選択肢**

```
Spotify / Apple Music / Bandcamp / YouTube / YouTube Music / SoundCloud /
Beatport / LINE MUSIC / ダウンロード / GitHub / ドキュメント / デモ /
イベントページ / 記事 / 写真 / 公式サイト / その他
```

---

## 1. `alias` — 名義マスタ

`music` / `event` / `other` から参照します。

| フィールドID | 表示名 | 種類 | 必須 | 備考 |
|---|---|---|---|---|
| `name` | 名義 | テキストフィールド | ✓ | 表示用。**改名時はここだけ直す** |
| `nameEn` | 英字表記 | テキストフィールド | ✓ | 検索・ソート用 |
| `colorDark` | アクセント色（ダーク） | テキストフィールド | ✓ | 例: `#9D8CFF` |
| `colorLight` | アクセント色（ライト） | テキストフィールド | ✓ | 例: `#5B45D6` |
| `bio` | 紹介文 | テキストエリア | | Aboutページや名義フィルタの説明に |
| `image` | イメージ | 画像 | | |
| `siteUrl` | 個別サイト | テキストフィールド | | 名義別サイトを作ったときのリンク |
| `active` | 現在も活動中 | 真偽値 | ✓ | 休止名義をフィルタから隠したいとき用 |
| `order` | 表示順 | 数字 | ✓ | フィルタチップの並び順 |

コンテンツIDは手入力で `gvku` / `fanion` / `yugaku` のようなスラッグにします。

---

## 2. `music` — 音源リリース

| フィールドID | 表示名 | 種類 | 必須 | 備考 |
|---|---|---|---|---|
| `title` | タイトル | テキストフィールド | ✓ | |
| `alias` | 名義 | コンテンツ参照（`alias`） | ✓ | |
| `date` | リリース日 | 日時 | ✓ | **ソートの基準。`publishedAt` は使わない** |
| `cover` | ジャケット | 画像 | ✓ | 正方形でなくてOK |
| `format` | 形態 | セレクトフィールド | ✓ | Single / EP / Album / Compilation / Remix / その他 |
| `label` | レーベル | テキストフィールド | | 自主なら空欄 → フロントで `self-released` と表示 |
| `catalog` | 品番 | テキストフィールド | | |
| `trackCount` | 収録曲数 | 数字 | | |
| `body` | 解説 | リッチエディタ | | |
| `credits` | クレジット | テキストエリア | | |
| `links` | リンク | 繰り返しフィールド（`link`） | | 配信先など |
| `featured` | ピックアップ | 真偽値 | | Homeに出す用 |

---

## 3. `event` — ライブ・イベント

| フィールドID | 表示名 | 種類 | 必須 | 備考 |
|---|---|---|---|---|
| `title` | イベント名 | テキストフィールド | ✓ | |
| `role` | 関わり方 | セレクトフィールド | ✓ | 出演 / 主催 / 主催・出演 / DJ / ゲスト / 音響・制作 |
| `date` | 開催日 | 日時 | ✓ | |
| `endDate` | 終了日 | 日時 | | 複数日開催のときだけ |
| `venue` | 会場 | テキストフィールド | ✓ | |
| `area` | エリア | テキストフィールド | ✓ | 将来エリア別に絞れるよう会場と分ける |
| `alias` | 出演名義 | 複数コンテンツ参照（`alias`） | | 複数名義で出ることがあるので「複数」 |
| `cover` | メインビジュアル | 画像 | ✓ | フライヤーや当日写真 |
| `photos` | 写真 | 複数画像 | | 詳細パネルのギャラリー用 |
| `lineup` | 共演 | テキストエリア | | |
| `body` | 内容 | リッチエディタ | | |
| `links` | リンク | 繰り返しフィールド（`link`） | | |
| `featured` | ピックアップ | 真偽値 | | |

---

## 4. `development` — ソフトウェア

| フィールドID | 表示名 | 種類 | 必須 | 備考 |
|---|---|---|---|---|
| `title` | 名称 | テキストフィールド | ✓ | |
| `category` | 種別 | セレクトフィールド | ✓ | プラグイン / ミドルウェア / ライブラリ / Webアプリ / ツール / その他 |
| `date` | 公開日 | 日時 | ✓ | |
| `cover` | イメージ | 画像 | ✓ | スクリーンショットやロゴ |
| `stack` | 技術 | セレクトフィールド（**複数選択可**） | ✓ | 下記 |
| `platform` | 動作環境 | セレクトフィールド（**複数選択可**） | | Windows / macOS / Linux / Web / iOS / VST3 / AU / CLAP |
| `status` | 状態 | セレクトフィールド | ✓ | 公開中 / 開発中 / アーカイブ |
| `version` | バージョン | テキストフィールド | | |
| `summary` | 一行説明 | テキストフィールド | ✓ | カード下に出す短い説明 |
| `body` | 詳細 | リッチエディタ | | |
| `links` | リンク | 繰り返しフィールド（`link`） | | |
| `featured` | ピックアップ | 真偽値 | | |

**`stack` の選択肢（増えたら足す）**

```
C / C++ / C++17 / C++20 / Rust / TypeScript / JavaScript / Python /
JUCE / CMake / WebAssembly / React / Next.js / RtMidi / VST3 SDK / OpenGL
```

---

## 5. `other` — その他の活動・制作物

上の4本に収まらないものを受けるAPIです。**フィールドをあえて緩く** しています。
種類が増えてきたら、頻出するものを独立したAPIに切り出してください。

| フィールドID | 表示名 | 種類 | 必須 | 備考 |
|---|---|---|---|---|
| `title` | タイトル | テキストフィールド | ✓ | |
| `category` | 区分 | セレクトフィールド | ✓ | 寄稿・執筆 / インタビュー / 楽曲提供 / デザイン / 映像 / 機材・制作環境 / その他 |
| `date` | 日付 | 日時 | ✓ | |
| `cover` | イメージ | 画像 | ✓ | |
| `partner` | 相手先・媒体 | テキストフィールド | | 掲載媒体名、提供先など |
| `alias` | 関連名義 | 複数コンテンツ参照（`alias`） | | 名義と無関係なものもあるので任意 |
| `summary` | 一行説明 | テキストフィールド | ✓ | |
| `body` | 詳細 | リッチエディタ | | |
| `links` | リンク | 繰り返しフィールド（`link`） | | |
| `featured` | ピックアップ | 真偽値 | | |

---

## 型定義

```ts
// src/types/works.ts

/** microCMS が全コンテンツに自動で付ける */
type MicroCMSBase = {
  id: string;            // ← contentId。名義の安定キーはこれ
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

export type MicroCMSImage = {
  url: string;
  width: number;   // ← 正方形判定に使える
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
  platform: string[];   // ← セレクトは単一選択でも配列で返る
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

/** 作品に紐づく名義を、種別の違いを吸収して配列で返す */
export const aliasesOf = (work: Work): Alias[] =>
  work.kind === "music" ? [work.alias] : (work.alias ?? []);
```

`kind` は **microCMS側には存在しません**。どのAPIから取ってきたかをフロント側で付けます。

---

## 取得

```ts
// src/lib/works.ts
import { createClient } from "microcms-js-sdk";

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

const q = { limit: 100, orders: "-date" };

export async function getWorks(): Promise<Work[]> {
  const [music, event, development, other] = await Promise.all([
    client.getList({ endpoint: "music", queries: q }),
    client.getList({ endpoint: "event", queries: q }),
    client.getList({ endpoint: "development", queries: q }),
    client.getList({ endpoint: "other", queries: q }),
  ]);

  return [
    ...music.contents.map((c) => ({ ...c, kind: "music" as const })),
    ...event.contents.map((c) => ({ ...c, kind: "event" as const })),
    ...development.contents.map((c) => ({ ...c, kind: "development" as const })),
    ...other.contents.map((c) => ({ ...c, kind: "other" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date)) as Work[];
}

/** フィルタのチップ用。order 順、休止名義を除く */
export async function getAliases(): Promise<Alias[]> {
  const res = await client.getList<Alias>({
    endpoint: "alias",
    queries: { limit: 100, orders: "order", filters: "active[equals]true" },
  });
  return res.contents;
}
```

`limit` の既定値は10です。指定しないと11件目から取れません。最大100。

---

## つまずきやすいところ

**セレクトフィールドは配列で返る**
単一選択に設定しても `format: ["EP"]` のように配列です。型を `string[]` にしておき、
表示時に `.join(", ")` するか `[0]` を取ります。

**コンテンツ参照はオブジェクトが丸ごと入る**
`music.alias` は文字列ではなく `Alias` オブジェクトです。名義色は `work.alias.colorDark` で
直接引けるので、フロント側に色のハードコードが要りません。
**単一参照はオブジェクト、複数参照は配列** で返る点に注意してください（`event` と `other` は配列）。

**参照先を削除すると `null` になる**
名義を消すと、参照していた作品の `alias` が `null` になります。表示側は
`work.alias?.name ?? ""` のように受けて、ページ全体が落ちないようにします。

**リッチエディタはHTML文字列**
`dangerouslySetInnerHTML` で描画します。スタイルは当たらないので、
`@tailwindcss/typography` の `prose` クラスを当てるのが楽です。

**コンテンツIDは後から変更できない**
`/works/[id]` を使うなら全コンテンツで分かりやすいIDを手入力してください。
あとから変えるとURLが死にます。

**画像の width / height**
microCMSが自動で返します。`cover.width === cover.height` で正方形判定できるので、
ブラー背景レイヤーを非正方形のときだけ描く最適化がそのまま書けます。
