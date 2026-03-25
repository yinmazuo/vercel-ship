import { NextResponse } from "next/server";

import { loadMarketingConfig } from "../../../lib/marketing-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { config, hasEdgeConfig, edgeConfigError } = await loadMarketingConfig();

  return NextResponse.json({
    hasEdgeConfig,
    edgeConfigError,
    maintenanceMode: config.maintenanceMode,
    primaryCtaLabel: config.primaryCtaLabel
  });
}
