import { getAll } from "@vercel/edge-config";

type FeatureFlags = {
  billingPlaceholderEnabled: boolean;
  usageAlertsEnabled: boolean;
  releaseStage: string;
};

const defaultFlags: FeatureFlags = {
  billingPlaceholderEnabled: true,
  usageAlertsEnabled: true,
  releaseStage: "pilot"
};

export async function loadFeatureFlags() {
  if (!process.env.EDGE_CONFIG) {
    return {
      flags: defaultFlags,
      hasEdgeConfig: false,
      edgeConfigError: null as string | null
    };
  }

  try {
    const values = (await getAll([
      "billing_placeholder_enabled",
      "usage_alerts_enabled",
      "release_stage"
    ])) as Record<string, unknown>;

    return {
      flags: {
        billingPlaceholderEnabled:
          typeof values.billing_placeholder_enabled === "boolean"
            ? values.billing_placeholder_enabled
            : defaultFlags.billingPlaceholderEnabled,
        usageAlertsEnabled:
          typeof values.usage_alerts_enabled === "boolean"
            ? values.usage_alerts_enabled
            : defaultFlags.usageAlertsEnabled,
        releaseStage:
          typeof values.release_stage === "string" && values.release_stage.length > 0
            ? values.release_stage
            : defaultFlags.releaseStage
      },
      hasEdgeConfig: true,
      edgeConfigError: null as string | null
    };
  } catch (error) {
    return {
      flags: defaultFlags,
      hasEdgeConfig: true,
      edgeConfigError: error instanceof Error ? error.message : "Unknown Edge Config error"
    };
  }
}
