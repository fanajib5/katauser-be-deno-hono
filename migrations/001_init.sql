-- migration: 0001_init
-- name: Initial schema for KataUser

-- Table: schema_migrations (pelacak migrasi)
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: organizations
CREATE TABLE public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: users
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- admin | member
  password_hash TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: projects
CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- katauser.com/[slug]
  subdomain TEXT UNIQUE, -- ideas.project.katauser.com
  custom_domain TEXT UNIQUE, -- feedback.client.com
  domain_verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: feedback
CREATE TABLE public.feedback (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id), -- pengguna internal (opsional)
  type TEXT NOT NULL DEFAULT 'suggestion', -- suggestion | bug | praise | other
  content TEXT NOT NULL,
  name TEXT, -- nama pengguna yang kasih feedback (anonim)
  email TEXT, -- email pengguna (opsional)
  source TEXT NOT NULL, -- embed | public_page | api
  source_url TEXT, -- dari halaman mana
  status TEXT NOT NULL DEFAULT 'baru', -- baru | ditinjau | ditindaklanjuti
  metadata JSONB, -- device, browser, location
  received_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tags
CREATE TABLE public.tags (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: feedback_tags (many-to-many)
CREATE TABLE public.feedback_tags (
  feedback_id TEXT NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (feedback_id, tag_id)
);

-- Table: feedback_analysis (AI/analisis otomatis)
CREATE TABLE public.feedback_analysis (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL UNIQUE REFERENCES feedback(id) ON DELETE CASCADE,
  sentiment_score FLOAT,
  sentiment_label TEXT, -- positive | negative | neutral
  topics JSONB, -- ['pricing', 'ux']
  language TEXT,
  summary TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
