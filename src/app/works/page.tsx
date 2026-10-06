import { getAliases, getWorks } from "@/lib/works";

import WorksView from "./WorksView";

/**
 * ビルド時に取り込んで静的配信する。コンテンツ公開時は microCMS の Webhook が
 * Vercel の再ビルドを起こすため、リクエストごとの取得は要らない。
 */
export const dynamic = "force-static";

export default async function WorksPage() {
  const [works, aliases] = await Promise.all([getWorks(), getAliases()]);

  return <WorksView works={works} aliases={aliases} />;
}
