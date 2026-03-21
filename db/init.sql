CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('ذكر', 'أنثى');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE health_status AS ENUM ('سليم', 'مرض مزمن', 'إعاقة', 'أخرى');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE doc_type AS ENUM ('هوية', 'صورة شخصية', 'وثيقة_أخرى');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_entity AS ENUM ('user','family','wife','member','document','export','auth');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  value BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_number TEXT NOT NULL UNIQUE,
  head_name TEXT NOT NULL,
  head_id_number TEXT NOT NULL UNIQUE,
  head_gender gender_type NOT NULL,
  head_birth_date DATE,
  phone TEXT,
  head_health_status health_status NOT NULL DEFAULT 'سليم',
  has_chronic_disease BOOLEAN NOT NULL DEFAULT FALSE,
  has_disability BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL UNIQUE REFERENCES families(id) ON DELETE CASCADE,
  name TEXT,
  id_number TEXT,
  age INT,
  health_status health_status DEFAULT 'سليم'
);

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INT NOT NULL,
  gender gender_type NOT NULL,
  health_status health_status NOT NULL DEFAULT 'سليم'
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type audit_entity NOT NULL,
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_families_file_number ON families(file_number);
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_documents_family_id ON documents(family_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_families_deleted_at ON families(deleted_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_families_updated_at ON families;
CREATE TRIGGER trg_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO counters(name, value)
VALUES ('family_file', 0)
ON CONFLICT (name) DO NOTHING;

INSERT INTO users(full_name, username, password_hash, role, is_active, force_password_change)
VALUES (
  'إبراهيم (المدير)',
  'admin',
  crypt('Admin@12345', gen_salt('bf', 10)),
  'admin',
  TRUE,
  FALSE
)
ON CONFLICT (username) DO NOTHING;