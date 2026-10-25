import SiteApp from "@/components/site/SiteApp";
import { getConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cfg = await getConfig();
  return <SiteApp initial={cfg} />;
}
