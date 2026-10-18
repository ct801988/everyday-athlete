-- Isolated SQL lab only. NOT a Supabase Auth migration or a JWT verifier.
create role authenticated noinherit;
create role anon noinherit;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
