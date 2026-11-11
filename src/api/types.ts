import type { Lang } from "../i18n/copy";

export type { Lang };

/** Standard API envelope wrapper for content endpoints */
export interface ApiEnvelope<T> {
  locale: Lang;
  data: T;
}

/** Hero Background Slide model (type: image|video) */
export interface HeroSlide {
  id?: number | string;
  type: "image" | "video";
  media_url: string;
  poster_url?: string | null;
  caption?: string | null;
}

/** Hero Featured Card model */
export interface HeroCard {
  id?: number | string;
  image_url: string;
  badge: string;
  title: string;
  subtitle: string;
}

/** Hero Metric / Fact model */
export interface HeroStat {
  id?: number | string;
  number: string;
  label: string;
}

/** Hero section payload */
export interface HeroSection {
  eyebrow?: string;
  brand_tag?: string;
  kicker?: string;
  title?: string;
  body?: string;
  cta_primary?: string;
  cta_secondary?: string;
  checks?: string[];
  card_label?: string;
  slides?: HeroSlide[];
  cards?: HeroCard[];
  stats?: HeroStat[];
}

/** News Item model */
export interface NewsItem {
  id?: number | string;
  date: string; // Y-m-d
  title: string;
  excerpt: string;
  link?: string | null;
}

/** Journey Stage Tag */
export interface JourneyTag {
  id?: number | string;
  name: string;
}

/** Journey Stage model */
export interface JourneyStage {
  id?: number | string;
  step: number;
  title: string;
  heading?: string;
  description: string;
  image_url?: string | null;
  tags?: Array<JourneyTag | string>;
}

/** Journey section payload */
export interface JourneySection {
  kicker?: string;
  title?: string;
  subtitle?: string;
  cta_title?: string;
  cta_body?: string;
  cta_button?: string;
  stages: JourneyStage[];
}

/** Tag model */
export interface TagItem {
  id?: number | string;
  name: string;
}

/** At A Glance Item model */
export interface GlanceItem {
  id?: number | string;
  number: string;
  title: string;
  description: string;
}

/** Glance section payload */
export interface GlanceSection {
  kicker?: string;
  items: GlanceItem[];
}

/** Quality Standard model */
export interface StandardItem {
  id?: number | string;
  number: string;
  title: string;
  description: string;
}

/** Standards section payload */
export interface StandardsSection {
  kicker?: string;
  title?: string;
  subtitle?: string;
  items: StandardItem[];
}

/** Portfolio Project model */
export interface ProjectItem {
  id?: number | string;
  slug?: string;
  kicker?: string;
  title: string;
  category?: string;
  description?: string | null;
  image_url: string;
}

/** Work section payload */
export interface WorkSection {
  kicker?: string;
  title?: string;
  subtitle?: string;
  next_label?: string;
  next_title?: string;
  next_body?: string;
  next_cta?: string;
  projects: ProjectItem[];
}

/** Architectural Service model */
export interface ServiceItem {
  id?: number | string;
  title: string;
  tags: string[];
  summary?: string | null;
  description: string;
}

/** Services section payload */
export interface ServicesSection {
  kicker?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  items: ServiceItem[];
}

/** Brand Client / Partner model */
export interface ClientItem {
  id?: number | string;
  name: string;
  logo_url?: string | null;
  website?: string | null;
}

/** Clients section payload */
export interface ClientsSection {
  kicker?: string;
  title?: string;
  subtitle?: string;
  items: ClientItem[];
}

/** Brand guidelines section payload */
export interface BrandSection {
  palette_title?: string;
  palette?: Array<{ name: string; hex: string }>;
  palette_usage?: string;
  type_title?: string;
  type_items?: Array<{ name: string; role: string }>;
  donts_title?: string;
  donts?: string[];
}

/** Contact section payload */
export interface ContactSection {
  kicker?: string;
  title?: string;
  subtitle?: string;
  label_details?: string;
  disclaimer?: string;
}

/** Footer section payload */
export interface FooterSection {
  company?: string;
  speciality?: string;
  capabilities?: string;
  workshop?: string;
  brandline?: string;
  copyright?: string;
  guidelines?: string;
}

/** Full Site Payload returned by GET /api/v1/site?locale={{locale}} */
export interface SitePayload {
  locale: Lang;
  generated_at?: string;
  hero?: HeroSection;
  news?: NewsItem[];
  glance?: GlanceSection;
  journey?: JourneySection;
  services?: ServicesSection;
  work?: WorkSection;
  standards?: StandardsSection;
  clients?: ClientsSection;
  brand?: BrandSection;
  contact?: ContactSection;
  footer?: FooterSection;
}

/** Booth specification output submitted inside project brief */
export interface BriefSpecification {
  width?: number;
  depth?: number;
  height?: number;
  booth_type?: string;
  industry?: string;
  styles?: string[];
  colors?: string[];
  features?: string[];
  budget?: number;
  company?: string;
  notes?: string;
}

/** POST /api/v1/briefs payload */
export interface BriefSubmission {
  name: string;
  contact: string;
  details: string;
  locale?: Lang;
  website?: string; // Honeypot field (bots fill it, humans leave empty)
  specification?: BriefSpecification;
}

/** POST /api/v1/briefs response */
export interface BriefResponse {
  ok: boolean;
  id?: number | string;
  message: string;
}
