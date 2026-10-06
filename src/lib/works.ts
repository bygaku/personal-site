import { createClient } from "microcms-js-sdk";

import type { Alias, Work } from "@/types/works";

/**
 * クライアントは遅延生成する。モジュール読み込み時に作ると、環境変数が未設定の
 * 環境（Vercel に値を入れる前のビルドなど）で import しただけで落ちる。
 */
let cached: ReturnType<typeof createClient> | null = null;

const getClient = () => {
  if (cached) return cached;

  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;

  if (!serviceDomain || !apiKey) {
    throw new Error(
      "MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が未設定です。" +
        "ローカルは .env.local、本番は Vercel の Environment Variables に設定してください。",
    );
  }

  cached = createClient({ serviceDomain, apiKey });
  return cached;
};

// limit の既定値は 10。指定しないと 11 件目から取れない。最大 100。
const q = { limit: 100, orders: "-date" };

export async function getWorks(): Promise<Work[]> {
  const client = getClient();

  const [music, event, development, other] = await Promise.all([
    client.getList({ endpoint: "music", queries: q }),
    client.getList({ endpoint: "event", queries: q }),
    client.getList({ endpoint: "development", queries: q }),
    client.getList({ endpoint: "other", queries: q }),
  ]);

  // kind は microCMS 側に存在しない。どの API から取ってきたかをここで付ける。
  return [
    ...music.contents.map((c) => ({ ...c, kind: "music" as const })),
    ...event.contents.map((c) => ({ ...c, kind: "event" as const })),
    ...development.contents.map((c) => ({ ...c, kind: "development" as const })),
    ...other.contents.map((c) => ({ ...c, kind: "other" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date)) as Work[];
}

/** フィルタのチップ用。order 順、休止名義を除く */
export async function getAliases(): Promise<Alias[]> {
  const res = await getClient().getList<Alias>({
    endpoint: "alias",
    queries: { limit: 100, orders: "order", filters: "active[equals]true" },
  });
  return res.contents;
}
