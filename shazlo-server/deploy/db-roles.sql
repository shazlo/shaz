-- Least-privilege Postgres roles for the Core database (docs/architecture.md section 2.5.1).
-- Run once per environment as a superuser, passing passwords as psql variables:
--
--   psql -U postgres -d shazlo_core \
--     -v core_migrate_pw="'...'" -v core_app_pw="'...'" -v backup_ro_pw="'...'" \
--     -f deploy/db-roles.sql
--
-- core_migrate  owns the schema and runs migrations (used only by the deploy "migrate" step)
-- core_app      the running web, worker and beat processes: data access only, no DDL
-- backup_ro     read-only, used by the nightly dump job

CREATE ROLE core_migrate LOGIN PASSWORD :core_migrate_pw;
CREATE ROLE core_app LOGIN PASSWORD :core_app_pw;
CREATE ROLE backup_ro LOGIN PASSWORD :backup_ro_pw;

REVOKE ALL ON DATABASE shazlo_core FROM PUBLIC;
GRANT CONNECT ON DATABASE shazlo_core TO core_migrate, core_app, backup_ro;

-- The migrate role owns everything it creates.
ALTER SCHEMA public OWNER TO core_migrate;
GRANT USAGE ON SCHEMA public TO core_app, backup_ro;

-- Objects created by core_migrate in future migrations are readable and writable by core_app.
ALTER DEFAULT PRIVILEGES FOR ROLE core_migrate IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO core_app;
ALTER DEFAULT PRIVILEGES FOR ROLE core_migrate IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO core_app;
ALTER DEFAULT PRIVILEGES FOR ROLE core_migrate IN SCHEMA public
    GRANT SELECT ON TABLES TO backup_ro;

-- The pgvector extension must be created by a superuser (once, before the first migration):
CREATE EXTENSION IF NOT EXISTS vector;
