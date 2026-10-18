-- Supabase-compatible application schema. auth.users/auth.uid and roles are provided
-- by Supabase; the isolated WASM SQL lab creates them in scripts/lab-bootstrap.sql.
create table public.program_versions(id text primary key, version integer not null check(version>0), training_days integer not null check(training_days between 1 and 7), synthetic boolean not null check(synthetic), content jsonb not null);
alter table public.program_versions enable row level security;
create policy published_synthetic on public.program_versions for select to authenticated using (synthetic);
grant select on public.program_versions to authenticated;
create table public.sessions(id uuid primary key,user_id uuid not null references auth.users(id),prescription jsonb not null,status text not null default 'active' check(status in ('active','partial','completed')),revision integer not null default 0,unique(user_id,id));
create table public.actual_sets(id uuid primary key,user_id uuid not null,session_id uuid not null,ordinal integer not null check(ordinal>0),revision integer not null check(revision>0),confirmed boolean not null,actual_values jsonb not null,unique(user_id,session_id,ordinal),foreign key(user_id,session_id) references public.sessions(user_id,id));
create table public.effort_reports(session_id uuid primary key,user_id uuid not null,value integer check(value between 1 and 10),scale text not null,scale_version integer not null check(scale_version>0),revision integer not null check(revision>0),reported_at timestamptz not null default now(),report_source text not null check(report_source='user'),foreign key(user_id,session_id) references public.sessions(user_id,id));
create table public.audit_events(id bigint generated always as identity primary key,user_id uuid not null,session_id uuid not null,action text not null,before_value jsonb,after_value jsonb,created_at timestamptz not null default now(),foreign key(user_id,session_id) references public.sessions(user_id,id));
create table public.mutation_receipts(user_id uuid not null,mutation_id uuid not null,session_id uuid not null,payload jsonb not null,response jsonb not null,primary key(user_id,mutation_id),foreign key(user_id,session_id) references public.sessions(user_id,id));
create table public.schedules(user_id uuid primary key references auth.users(id),revision integer not null default 0,data jsonb not null,preferences jsonb not null default '{}',updated_at timestamptz not null default now());
create table public.schedule_audit(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id),before_value jsonb,after_value jsonb,created_at timestamptz not null default now());
create table public.recommendation_runs(id bigint generated always as identity primary key,user_id uuid not null,session_id uuid not null,context_revision integer not null,input_snapshot jsonb not null,output jsonb not null,created_at timestamptz not null default now(),foreign key(user_id,session_id) references public.sessions(user_id,id));
-- Read-only user access. All writes through narrow ownership-validating RPCs.
do $$ declare t text; begin foreach t in array array['sessions','actual_sets','effort_reports','audit_events','mutation_receipts','schedules','schedule_audit','recommendation_runs'] loop
execute format('alter table public.%I enable row level security',t);
execute format('create policy own_read on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
execute format('grant select on public.%I to authenticated',t);
end loop; end $$;
create function public.valid_set_values(v jsonb) returns boolean language plpgsql immutable set search_path=pg_catalog as $$
declare l jsonb; r numeric; s numeric; ir numeric; begin
 if jsonb_typeof(v)<>'object' or not(v ?& array['load','reps','seconds','rir','rirCapped']) then return false; end if;
 if jsonb_typeof(v->'rirCapped')<>'boolean' then return false;end if;
 if (v->'reps'='null'::jsonb)=(v->'seconds'='null'::jsonb) then return false;end if;
 if v->'reps'<>'null'::jsonb then if jsonb_typeof(v->'reps')<>'number' then return false;end if;r=(v->>'reps')::numeric;if r<=0 or r>999 or r<>trunc(r) then return false;end if;end if;
 if v->'seconds'<>'null'::jsonb then if jsonb_typeof(v->'seconds')<>'number' then return false;end if;s=(v->>'seconds')::numeric;if s<=0 or s>86400 then return false;end if;end if;
 if v->'rir'<>'null'::jsonb then if jsonb_typeof(v->'rir')<>'number' then return false;end if;ir=(v->>'rir')::numeric;if ir<0 or ir>5 or ir<>trunc(ir) then return false;end if;end if;
 if (v->>'rirCapped')::boolean and coalesce(ir<>5,true) then return false;end if;
 l=v->'load';if jsonb_typeof(l)<>'object' then return false;end if;
 if l->>'kind' in ('none','bodyweight') then return true;end if;
 if l->>'kind' not in ('external','assisted','added_bodyweight') or l->>'kind' is null then return false;end if;
 if not(l ?& array['value','unit','basis']) then return false;end if;
 if jsonb_typeof(l->'value')<>'number' or (l->>'value')::numeric<0 or l->>'unit' not in ('lb','kg') or l->>'basis' not in ('total_bar','per_dumbbell','single_implement','machine_stack') then return false;end if;
 if l->>'kind'<>'external' and l->>'basis'<>'single_implement' then return false;end if;
 return true;
 exception when others then return false;
end $$;
revoke all on function public.valid_set_values(jsonb) from public;
create function public.apply_mutation(p_session uuid,p_mutation uuid,p jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid=auth.uid(); ss public.sessions; oldr public.mutation_receipts; item jsonb; oldset public.actual_sets; rid uuid; expected integer; result jsonb; prior jsonb; v numeric; er public.effort_reports; countdone integer;
begin
 if uid is null then raise exception 'Unauthorized' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||p_mutation::text,0));
 select * into oldr from public.mutation_receipts where user_id=uid and mutation_id=p_mutation;
 if found then if oldr.payload<>p or oldr.session_id<>p_session then raise exception 'Idempotency key payload mismatch' using errcode='P0001';end if;return oldr.response;end if;
 select * into ss from public.sessions where id=p_session and user_id=uid for update;
 if not found then raise exception 'Session not accessible' using errcode='42501';end if;
 if p->>'type'='sets' then
 if ss.status<>'active' then raise exception 'Reopen before changing performed sets';end if;
 if jsonb_typeof(p->'items')<>'array' or jsonb_array_length(p->'items') not between 1 and 20 then raise exception 'Invalid set group';end if;
 for item in select value from jsonb_array_elements(p->'items') loop
 if jsonb_typeof(item->'ordinal')<>'number' or (item->>'ordinal')::numeric<>trunc((item->>'ordinal')::numeric) or (item->>'ordinal')::integer not between 1 and (ss.prescription->>'setCount')::integer then raise exception 'Invalid set ordinal';end if;
 if jsonb_typeof(item->'expectedRevision')<>'number' or (item->>'expectedRevision')::numeric<>trunc((item->>'expectedRevision')::numeric) or (item->>'expectedRevision')::integer<0 or jsonb_typeof(item->'confirmed')<>'boolean' then raise exception 'Invalid confirmation';end if;
 if not public.valid_set_values(item->'values') then raise exception 'Invalid actual values' using errcode='23514';end if;
 rid=(item->>'id')::uuid;expected=(item->>'expectedRevision')::integer;
 select * into oldset from public.actual_sets where id=rid;
 if found and (oldset.user_id<>uid or oldset.session_id<>p_session or oldset.ordinal<>(item->>'ordinal')::integer) then raise exception 'Set not accessible' using errcode='42501';end if;
 if coalesce(oldset.revision,0)<>expected then raise exception 'Set revision conflict' using errcode='P0001';end if;
 prior=case when oldset.id is null then null else to_jsonb(oldset) end;
 insert into public.actual_sets(id,user_id,session_id,ordinal,revision,confirmed,actual_values) values(rid,uid,p_session,(item->>'ordinal')::integer,expected+1,(item->>'confirmed')::boolean,item->'values') on conflict(id) do update set revision=excluded.revision,confirmed=excluded.confirmed,actual_values=excluded.actual_values;
 insert into public.audit_events(user_id,session_id,action,before_value,after_value) values(uid,p_session,case when (item->>'confirmed')::boolean then 'confirm_or_correct' else 'undo' end,prior,item);
 end loop;
 elsif p->>'type'='effort' then
 if ss.prescription->>'modality'<>'conditioning' then raise exception 'Effort report belongs to a conditioning session';end if;
 if jsonb_typeof(p->'expectedRevision')<>'number' or (p->>'expectedRevision')::numeric<0 or (p->>'expectedRevision')::numeric<>trunc((p->>'expectedRevision')::numeric) then raise exception 'Invalid report revision';end if;
 select * into er from public.effort_reports where session_id=p_session;
 if coalesce(er.revision,0)<>(p->>'expectedRevision')::integer then raise exception 'Effort revision conflict';end if;
 if not(p->'report' ?& array['value','scale','scaleVersion']) then raise exception 'Invalid report';end if;
 if p->'report'->'value'<>'null'::jsonb then
 if jsonb_typeof(p->'report'->'value')<>'number' then raise exception 'Invalid effort';end if;
 v=(p->'report'->>'value')::numeric;if v<1 or v>10 or v<>trunc(v) then raise exception 'Invalid effort' using errcode='23514';end if;end if;
 if jsonb_typeof(p->'report'->'scale')<>'string' or length(p->'report'->>'scale')=0 or jsonb_typeof(p->'report'->'scaleVersion')<>'number' or (p->'report'->>'scaleVersion')::numeric<1 or (p->'report'->>'scaleVersion')::numeric<>trunc((p->'report'->>'scaleVersion')::numeric) then raise exception 'Invalid scale';end if;
 insert into public.effort_reports(session_id,user_id,value,scale,scale_version,revision,report_source) values(p_session,uid,v,p->'report'->>'scale',(p->'report'->>'scaleVersion')::integer,coalesce(er.revision,0)+1,'user') on conflict(session_id) do update set value=excluded.value,scale=excluded.scale,scale_version=excluded.scale_version,revision=excluded.revision,reported_at=now();
 insert into public.audit_events(user_id,session_id,action,before_value,after_value) values(uid,p_session,'effort_report',case when er.session_id is null then null else to_jsonb(er) end,p->'report');
 elsif p->>'type' in ('finish','reopen') then
 if jsonb_typeof(p->'expectedRevision')<>'number' or (p->>'expectedRevision')::numeric<0 or (p->>'expectedRevision')::numeric<>trunc((p->>'expectedRevision')::numeric) then raise exception 'Invalid session revision';end if;
 if ss.revision<>(p->>'expectedRevision')::integer then raise exception 'Session revision conflict';end if;
 if p->>'type'='finish' then
 if p->>'status' not in ('completed','partial') then raise exception 'Invalid finish status';end if;
 select count(*) into countdone from public.actual_sets where user_id=uid and session_id=p_session and confirmed;
 if p->>'status'='completed' and countdone<>(ss.prescription->>'setCount')::integer then raise exception 'Unconfirmed sets cannot be completed';end if;
 end if;
 update public.sessions set status=case when p->>'type'='reopen' then 'active' else p->>'status' end where id=p_session;
 insert into public.audit_events(user_id,session_id,action,before_value,after_value) values(uid,p_session,p->>'type',to_jsonb(ss),p);
 else raise exception 'Invalid mutation type';end if;
 update public.sessions set revision=revision+1 where id=p_session;
 result=jsonb_build_object('mutationId',p_mutation,'sessionId',p_session,'revision',ss.revision+1);
 insert into public.mutation_receipts values(uid,p_mutation,p_session,p,result);
 return result;
end $$;
revoke all on function public.apply_mutation(uuid,uuid,jsonb) from public;
grant execute on function public.apply_mutation(uuid,uuid,jsonb) to authenticated;
create function public.save_schedule(expected integer,slots jsonb,prefs jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare uid uuid=auth.uid(); oldrow public.schedules;begin
 if uid is null then raise exception 'Unauthorized' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||'schedule',0));
 select * into oldrow from public.schedules where user_id=uid;
 if oldrow.data=slots and oldrow.preferences=prefs then return jsonb_build_object('revision',oldrow.revision,'data',slots);end if;
 if coalesce(oldrow.revision,0)<>expected then raise exception 'Schedule revision conflict';end if;
 if jsonb_typeof(slots)<>'array' or jsonb_array_length(slots) not between 1 and 200 then raise exception 'Invalid schedule';end if;
 insert into public.schedules values(uid,expected+1,slots,prefs,now()) on conflict(user_id) do update set revision=excluded.revision,data=excluded.data,preferences=excluded.preferences,updated_at=now();
 insert into public.schedule_audit(user_id,before_value,after_value) values(uid,oldrow.data,slots);
 return jsonb_build_object('revision',expected+1,'data',slots);
end $$;
revoke all on function public.save_schedule(integer,jsonb,jsonb) from public;
grant execute on function public.save_schedule(integer,jsonb,jsonb) to authenticated;
