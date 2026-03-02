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

export interface BBTeamMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
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
