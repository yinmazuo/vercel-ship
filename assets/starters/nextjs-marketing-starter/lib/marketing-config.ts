import { getAll } from "@vercel/edge-config";

type MarketingConfig = {
  announcement: string;
  maintenanceMode: boolean;
  heroTitle: string;
  heroBody: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  featuredStory: string;
  featuredStoryLabel: string;
};

export const defaultMarketingConfig: MarketingConfig = {
  announcement: "Demo mode is live. Publish the story now and evolve the product behind it later.",
  maintenanceMode: false,
  heroTitle: "Launch a story-shaped site before the rest of the stack lands.",
  heroBody:
    "This starter is built for teams that need a polished launch surface first, while product, onboarding, and deeper systems continue to take shape behind the scenes.",
  primaryCtaLabel: "View Highlights",
  primaryCtaUrl: "#highlights",
  secondaryCtaLabel: "Contact",
  secondaryCtaUrl: "mailto:hello@example.com",
  featuredStory: "Narrative-first landing page",
  featuredStoryLabel: "Storyline"
};

export async function loadMarketingConfig() {
  if (!process.env.EDGE_CONFIG) {
    return {
      config: defaultMarketingConfig,
      hasEdgeConfig: false,
      edgeConfigError: null as string | null
    };
  }

  try {
    const values = (await getAll([
      "announcement",
      "maintenance_mode",
      "hero_title",
      "hero_body",
      "primary_cta_label",
      "primary_cta_url",
      "secondary_cta_label",
      "secondary_cta_url",
      "featured_story",
      "featured_story_label"
    ])) as Record<string, unknown>;

    return {
      config: {
        announcement:
          typeof values.announcement === "string" && values.announcement.length > 0
            ? values.announcement
            : defaultMarketingConfig.announcement,
        maintenanceMode:
          typeof values.maintenance_mode === "boolean"
            ? values.maintenance_mode
            : defaultMarketingConfig.maintenanceMode,
        heroTitle:
          typeof values.hero_title === "string" && values.hero_title.length > 0
            ? values.hero_title
            : defaultMarketingConfig.heroTitle,
        heroBody:
          typeof values.hero_body === "string" && values.hero_body.length > 0
            ? values.hero_body
            : defaultMarketingConfig.heroBody,
        primaryCtaLabel:
          typeof values.primary_cta_label === "string" && values.primary_cta_label.length > 0
            ? values.primary_cta_label
            : defaultMarketingConfig.primaryCtaLabel,
        primaryCtaUrl:
          typeof values.primary_cta_url === "string" && values.primary_cta_url.length > 0
            ? values.primary_cta_url
            : defaultMarketingConfig.primaryCtaUrl,
        secondaryCtaLabel:
          typeof values.secondary_cta_label === "string" && values.secondary_cta_label.length > 0
            ? values.secondary_cta_label
            : defaultMarketingConfig.secondaryCtaLabel,
        secondaryCtaUrl:
          typeof values.secondary_cta_url === "string" && values.secondary_cta_url.length > 0
            ? values.secondary_cta_url
            : defaultMarketingConfig.secondaryCtaUrl,
        featuredStory:
          typeof values.featured_story === "string" && values.featured_story.length > 0
            ? values.featured_story
            : defaultMarketingConfig.featuredStory,
        featuredStoryLabel:
          typeof values.featured_story_label === "string" && values.featured_story_label.length > 0
            ? values.featured_story_label
            : defaultMarketingConfig.featuredStoryLabel
      },
      hasEdgeConfig: true,
      edgeConfigError: null as string | null
    };
  } catch (error) {
    return {
      config: defaultMarketingConfig,
      hasEdgeConfig: true,
      edgeConfigError: error instanceof Error ? error.message : "Unknown Edge Config error"
    };
  }
}
