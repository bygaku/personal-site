# music-portfolio

複数の音楽名義とソフトウェア開発を1つに統合した個人ポートフォリオサイト。
Next.js (App Router) + TypeScript + Tailwind CSS、CMS は microCMS、ホスティングは Vercel。

回答は日本語。

## コマンド

- `npm run dev` — 開発サーバー（http://localhost:3000）
- `npm run build` — 本番ビルド。型エラーはここで出る
- `npm run lint` — ESLint

## Git / デプロイ

- `main` が本番。push すると Vercel が本番デプロイする。**`main` へ直接 commit しない。**
- 作業ブランチを切り、Vercel の Preview URL で確認してから PR で `main` にマージする。
- ブランチ名は `<type>/<短い英語の内容>`。type は `feat` / `fix` / `refactor` / `style` / `docs` / `chore`。
  例: `feat/works-microcms`, `fix/cover-aspect-ratio`
- コミットメッセージは Conventional Commits。`<type>: <日本語の要約>`。
  例: `feat: Works ページを microCMS に接続`
- IMPORTANT: commit と push は **指示されたときだけ** 実行する。作業の区切りで自動的に行わない。
- 1コミット1目的。無関係な変更を混ぜない。
- `.env.local` と `node_modules/` と `.next/` は絶対にコミットしない。
- GitHub Actions は使わない。CI/CD は Vercel が担当する。
- CMS の公開時は Vercel Webhook が再ビルドを起こすため、コンテンツ更新でコードを触らない。

## アーキテクチャ

- `src/app/page.tsx` がルート `/` を担当する（`src/app/home/` ではない）
- `src/app/works/` — サイト唯一の CMS 駆動ページ。他のページは静的なコードでよい
- `src/lib/` — microCMS クライアントと `getWorks()` などの取得ユーティリティ
- `src/types/` — 型定義

## microCMS

API は5本。`alias`（名義マスタ）/ `music` / `event` / `development` / `other`。

- IMPORTANT: `kind`（`music` | `event` | `development` | `other`）は CMS に存在しない。
  どの API から取得したかに応じて `getWorks()` が付与する判別子。CMS 側に追加しない。
- 並び順は手入力の `date` フィールドを使う。`publishedAt` は入稿日であり、
  過去作を後から登録すると実際のリリース日・開催日と順序が食い違う。
- セレクトフィールドは単一選択でも 配列で返る（`format: ["EP"]`）。型は `string[]` で受ける。
- `getList` の `limit` 既定値は 10。必ず明示する（最大100）。
- コンテンツ参照はオブジェクトが丸ごと入る。名義色は `work.alias.colorDark` で引ける。
- 環境変数: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`（`.env.local`、サーバー側のみ）
- スキーマ詳細は @docs/microcms-schema.md

## Works ページの実装ルール

- IMPORTANT: `kind` による分岐は4種すべてを明示し、末尾にフォールバックを置く。
  「それ以外は development」と書かない。種別名の不一致で別分岐に流れ込み、
  存在しないフィールドを参照して実行時に落ちた事故が起きている。

  ```ts
  work.kind === "music"       ? ... :
  work.kind === "event"       ? ... :
  work.kind === "development" ? ... :
  work.kind === "other"       ? ... :
  ""
  ```

- `kind` を増やしたときは `KIND_COLOR` と `KIND_LABEL` とフィルタのチップ配列も同時に更新する。
  どれか1つ漏れると表示が既定色に落ちる。
- アクセント色は名義・カテゴリごとに `{ dark, light }` の対で持ち、`accentOf()` 経由でのみ解決する。
  コンポーネント内に色をハードコードしない。対応表に無いキーは既定色にフォールバックし、
  ページ全体を落とさない。
- カバー画像は常に 1:1 で表示するが、元画像を切り抜かない。同じ画像を2枚重ね、
  背景は `object-fit: cover` + blur、前景は `object-fit: contain`。正方形なら背景は自然に隠れる。
- 背景グリッドのレンズ効果のパラメータは `LENS` 定数に集約する。
- テーマ色は CSS カスタムプロパティで定義し、`.gf-root` / `.gf-root.is-light` で切り替える。
  JS からインライン注入する色（アクセント）だけは `{ dark, light }` の対で持つ。
- 名義は `contentId` を安定キーとして参照する。表示名（`name`）をキーや比較に使わない。
  名義は改名されうるため、表示名で引くと改名時に全データとコードの修正が必要になる。

## コードスタイル

- コードスタイルは ESLint に委譲する。リンターエラーが出たらその出力に従って修正する。
- 新規ファイルは `.tsx` / `.ts`。既存の `src/app/works/page.jsx` は microCMS 接続時に
  まとめて型付けするため、依頼されるまで TypeScript へ変換しない。

## 進め方

- ダミーデータで画面を完成させてから実データに繋ぐ。
- 新機能は最小構成で動かし、動作確認してから作り込む。