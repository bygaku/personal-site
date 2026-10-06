/**
 * docs/microcms-schema.md の設計どおりに microCMS の API 5本を作成する。
 *
 *   node scripts/create-microcms-apis.mjs            # マネジメントAPIで作成
 *   node scripts/create-microcms-apis.mjs --dry-run  # スキーマJSONを書き出すだけ
 *
 * --dry-run は docs/microcms/<endpoint>.json を生成する。マネジメントAPIの権限が
 * 使えない場合は、管理画面の「API作成 → ファイルインポートする場合はこちらから」で
 * そのJSONを読み込めば同じ結果になる。
 *
 * alias を最初に作る。music / event / other がコンテンツ参照で alias を指すため。
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- 環境変数 ---------- */

const loadEnvLocal = () => {
  const text = readFileSync(join(root, ".env.local"), "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
};

/* ---------- フィールド定義のヘルパ ---------- */

// selectItems の id はサービス内で一意な任意文字列。10桁の英数字を振る。
const rid = () => Math.random().toString(36).slice(2, 12);

const text = (fieldId, name, required = false) => ({ fieldId, name, kind: "text", required });
const textArea = (fieldId, name, required = false) => ({ fieldId, name, kind: "textArea", required });
const rich = (fieldId, name) => ({ fieldId, name, kind: "richEditorV2", required: false });
const media = (fieldId, name, required = false) => ({ fieldId, name, kind: "media", required });
const mediaList = (fieldId, name) => ({ fieldId, name, kind: "mediaList", required: false });
const date = (fieldId, name, required = false) => ({ fieldId, name, kind: "date", required });
const number = (fieldId, name, required = false) => ({ fieldId, name, kind: "number", required });
const bool = (fieldId, name, required = false) => ({ fieldId, name, kind: "boolean", required });

const select = (fieldId, name, values, { required = false, multiple = false } = {}) => ({
  fieldId,
  name,
  kind: "select",
  required,
  selectItems: values.map((value) => ({ id: rid(), value })),
  multipleSelect: multiple,
});

const relation = (fieldId, name, endpoint, required = false) => ({
  fieldId,
  name,
  kind: "relation",
  required,
  referencedApiEndpoint: endpoint,
  listViewFieldId: "name",
});

const relationList = (fieldId, name, endpoint) => ({
  fieldId,
  name,
  kind: "relationList",
  required: false,
  referencedApiEndpoint: endpoint,
  listViewFieldId: "name",
});

const links = () => ({
  fieldId: "links",
  name: "リンク",
  kind: "repeater",
  required: false,
  customFieldIds: ["link"],
});

/* ---------- カスタムフィールド link ---------- */

// カスタムフィールドはAPI単位。作品4本それぞれに同じものを持たせる。
const linkCustomField = () => ({
  fieldId: "link",
  name: "リンク",
  fields: [
    select(
      "platform",
      "種別",
      [
        "Spotify", "Apple Music", "Bandcamp", "YouTube", "YouTube Music",
        "SoundCloud", "Beatport", "LINE MUSIC", "ダウンロード", "GitHub",
        "ドキュメント", "デモ", "イベントページ", "記事", "写真",
        "公式サイト", "その他",
      ],
      { required: true },
    ),
    text("url", "URL", true),
    text("label", "表示名の上書き"),
  ],
  fieldOrderByColumn: [["platform", "url", "label"]],
});

/* ---------- API 5本 ---------- */

const apis = [
  {
    name: "名義",
    endpoint: "alias",
    type: "list",
    apiFields: [
      text("name", "名義", true),
      text("nameEn", "英字表記", true),
      text("colorDark", "アクセント色（ダーク）", true),
      text("colorLight", "アクセント色（ライト）", true),
      textArea("bio", "紹介文"),
      media("image", "イメージ"),
      text("siteUrl", "個別サイト"),
      bool("active", "現在も活動中", true),
      number("order", "表示順", true),
    ],
  },
  {
    name: "音源リリース",
    endpoint: "music",
    type: "list",
    apiFields: [
      text("title", "タイトル", true),
      relation("alias", "名義", "alias", true),
      date("date", "リリース日", true),
      media("cover", "ジャケット", true),
      select("format", "形態", ["Single", "EP", "Album", "Compilation", "Remix", "その他"], { required: true }),
      text("label", "レーベル"),
      text("catalog", "品番"),
      number("trackCount", "収録曲数"),
      rich("body", "解説"),
      textArea("credits", "クレジット"),
      links(),
      bool("featured", "ピックアップ"),
    ],
    customFields: [linkCustomField()],
  },
  {
    name: "ライブ・イベント",
    endpoint: "event",
    type: "list",
    apiFields: [
      text("title", "イベント名", true),
      select("role", "関わり方", ["出演", "主催", "主催・出演", "DJ", "ゲスト", "音響・制作"], { required: true }),
      date("date", "開催日", true),
      date("endDate", "終了日"),
      text("venue", "会場", true),
      text("area", "エリア", true),
      relationList("alias", "出演名義", "alias"),
      media("cover", "メインビジュアル", true),
      mediaList("photos", "写真"),
      textArea("lineup", "共演"),
      rich("body", "内容"),
      links(),
      bool("featured", "ピックアップ"),
    ],
    customFields: [linkCustomField()],
  },
  {
    name: "ソフトウェア",
    endpoint: "development",
    type: "list",
    apiFields: [
      text("title", "名称", true),
      select("category", "種別", ["プラグイン", "ミドルウェア", "ライブラリ", "Webアプリ", "ツール", "その他"], { required: true }),
      date("date", "公開日", true),
      media("cover", "イメージ", true),
      select(
        "stack",
        "技術",
        [
          "C", "C++", "C++17", "C++20", "Rust", "TypeScript", "JavaScript",
          "Python", "JUCE", "CMake", "WebAssembly", "React", "Next.js",
          "RtMidi", "VST3 SDK", "OpenGL",
        ],
        { required: true, multiple: true },
      ),
      select("platform", "動作環境", ["Windows", "macOS", "Linux", "Web", "iOS", "VST3", "AU", "CLAP"], { multiple: true }),
      select("status", "状態", ["公開中", "開発中", "アーカイブ"], { required: true }),
      text("version", "バージョン"),
      text("summary", "一行説明", true),
      rich("body", "詳細"),
      links(),
      bool("featured", "ピックアップ"),
    ],
    customFields: [linkCustomField()],
  },
  {
    name: "その他の活動",
    endpoint: "other",
    type: "list",
    apiFields: [
      text("title", "タイトル", true),
      select(
        "category",
        "区分",
        ["寄稿・執筆", "インタビュー", "楽曲提供", "デザイン", "映像", "機材・制作環境", "その他"],
        { required: true },
      ),
      date("date", "日付", true),
      media("cover", "イメージ", true),
      text("partner", "相手先・媒体"),
      relationList("alias", "関連名義", "alias"),
      text("summary", "一行説明", true),
      rich("body", "詳細"),
      links(),
      bool("featured", "ピックアップ"),
    ],
    customFields: [linkCustomField()],
  },
];

/* ---------- 実行 ---------- */

const dryRun = process.argv.includes("--dry-run");

if (dryRun) {
  const dir = join(root, "docs", "microcms");
  mkdirSync(dir, { recursive: true });
  for (const api of apis) {
    const body = { apiFields: api.apiFields, customFields: api.customFields ?? [] };
    const file = join(dir, `${api.endpoint}.json`);
    writeFileSync(file, JSON.stringify(body, null, 2) + "\n", "utf8");
    console.log(`wrote docs/microcms/${api.endpoint}.json  (${api.apiFields.length} fields)`);
  }
  console.log("\n管理画面の「API作成 → ファイルインポートする場合はこちらから」で読み込めます。");
  console.log("alias から順に取り込んでください（参照先が先に必要）。");
  process.exit(0);
}

const env = loadEnvLocal();
const domain = env.MICROCMS_SERVICE_DOMAIN;
const apiKey = env.MICROCMS_API_KEY;

if (!domain || !apiKey) {
  console.error(".env.local に MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が必要です。");
  process.exit(1);
}

let failed = 0;

for (const api of apis) {
  const res = await fetch(`https://${domain}.microcms-management.io/api/v1/apis`, {
    method: "POST",
    headers: { "X-MICROCMS-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(api),
  });

  const text = await res.text();

  if (res.status === 201) {
    console.log(`✓ ${api.endpoint}  (${api.apiFields.length} fields)`);
  } else if (res.status === 409) {
    console.log(`- ${api.endpoint}  already exists, skipped`);
  } else {
    failed++;
    console.error(`✗ ${api.endpoint}  HTTP ${res.status}  ${text}`);
    if (res.status === 403) {
      console.error(
        "  APIキーに「API作成」権限がありません。" +
          "microCMS の サービス設定 → APIキー → 権限 で有効にしてください。",
      );
      break;
    }
  }
}

process.exit(failed > 0 ? 1 : 0);
