export interface BBUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'team';
  created_at: string;
}

export interface BBSpace {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: SpaceTheme;
  logo_url: string | null;
  custom_domain: string | null;
  is_published: boolean;
  // Custom branding
  brand_logo_url: string | null;
  brand_primary_color: string;
  brand_accent_color: string;
  brand_font: string;
  brand_hide_powered_by: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpaceTheme {
  preset?: string;
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  border?: string;
}

export interface BBPage {
  id: string;
  space_id: string;
  title: string;
  slug: string;
  content: TiptapDoc;
  parent_id: string | null;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TiptapDoc {
  type: 'doc';
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface BBSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  goblink_payment_id: string | null;
  payment_method: 'stripe' | 'crypto' | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface BBTeamMember {
  id: string;
  space_id: string;
  user_id: string | null;
  email: string | null;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted';
  invite_token: string | null;
  invited_at: string;
  accepted_at: string | null;
}

export interface BBFeedback {
  id: string;
  space_id: string;
  page_id: string;
  helpful: boolean;
  comment: string | null;
  created_at: string;
}

export interface BBSpaceWithPageCount extends BBSpace {
  page_count: number;
}
