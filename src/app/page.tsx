import HomeView from "./HomeView";

import { getAliases, getWorks } from "@/lib/works";

/** Works ページと同じく、Webhook による再ビルドを前提に静的生成する */
export const dynamic = "force-static";

const PICK_LIMIT = 5;

export default async function HomePage() {
  const [works, aliases] = await Promise.all([getWorks(), getAliases()]);

  // featured が1件も無いうちは最新で埋める。入稿直後に空の棚を見せないため。
  const featured = works.filter((w) => w.featured);
  const picksAreFeatured = featured.length > 0;
  const picks = (picksAreFeatured ? featured : works).slice(0, PICK_LIMIT);

  return <HomeView aliases={aliases} picks={picks} picksAreFeatured={picksAreFeatured} />;
}
