-- ================================================================
-- my1040taxprep — Supabase migration
-- Run this in the Supabase SQL Editor to create all tables.
-- ================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------
-- tax_returns
-- ----------------------------------------------------------------
create table if not exists tax_returns (
    id          uuid primary key default uuid_generate_v4(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    tax_year    integer not null default 2023,
    filing_status text not null default 'single',
    status      text not null default 'draft',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists idx_tax_returns_user_id on tax_returns(user_id);

-- RLS
alter table tax_returns enable row level security;

create policy "Users can view own returns"
    on tax_returns for select
    using (auth.uid() = user_id);

create policy "Users can insert own returns"
    on tax_returns for insert
    with check (auth.uid() = user_id);

create policy "Users can update own returns"
    on tax_returns for update
    using (auth.uid() = user_id);

create policy "Users can delete own returns"
    on tax_returns for delete
    using (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- form_data
-- ----------------------------------------------------------------
create table if not exists form_data (
    id          uuid primary key default uuid_generate_v4(),
    return_id   uuid not null references tax_returns(id) on delete cascade,
    form_name   text not null,
    data        jsonb not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (return_id, form_name)
);

create index if not exists idx_form_data_return_id on form_data(return_id);

-- RLS
alter table form_data enable row level security;

create policy "Users can view own form data"
    on form_data for select
    using (
        exists (
            select 1 from tax_returns
            where tax_returns.id = form_data.return_id
            and tax_returns.user_id = auth.uid()
        )
    );

create policy "Users can insert own form data"
    on form_data for insert
    with check (
        exists (
            select 1 from tax_returns
            where tax_returns.id = form_data.return_id
            and tax_returns.user_id = auth.uid()
        )
    );

create policy "Users can update own form data"
    on form_data for update
    using (
        exists (
            select 1 from tax_returns
            where tax_returns.id = form_data.return_id
            and tax_returns.user_id = auth.uid()
        )
    );

create policy "Users can delete own form data"
    on form_data for delete
    using (
        exists (
            select 1 from tax_returns
            where tax_returns.id = form_data.return_id
            and tax_returns.user_id = auth.uid()
        )
    );


-- ----------------------------------------------------------------
-- generated_pdfs
-- ----------------------------------------------------------------
create table if not exists generated_pdfs (
    id            uuid primary key default uuid_generate_v4(),
    return_id     uuid not null references tax_returns(id) on delete cascade,
    filename      text not null,
    storage_path  text not null,
    created_at    timestamptz not null default now()
);

create index if not exists idx_generated_pdfs_return_id on generated_pdfs(return_id);

-- RLS
alter table generated_pdfs enable row level security;

create policy "Users can view own generated pdfs"
    on generated_pdfs for select
    using (
        exists (
            select 1 from tax_returns
            where tax_returns.id = generated_pdfs.return_id
            and tax_returns.user_id = auth.uid()
        )
    );

create policy "Users can insert own generated pdfs"
    on generated_pdfs for insert
    with check (
        exists (
            select 1 from tax_returns
            where tax_returns.id = generated_pdfs.return_id
            and tax_returns.user_id = auth.uid()
        )
    );

create policy "Users can delete own generated pdfs"
    on generated_pdfs for delete
    using (
        exists (
            select 1 from tax_returns
            where tax_returns.id = generated_pdfs.return_id
            and tax_returns.user_id = auth.uid()
        )
    );
