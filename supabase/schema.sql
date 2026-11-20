-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 size text not null default '',
 min_price integer not null default 0 check (min_price >= 0),
 max_price integer not null default 0 check (max_price >= min_price),
 image_url text,
 sort_order integer not null default 0,
 active boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
 id integer primary key check (id = 1),
 value jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

-- Public can only read active products and public shop contact details.
create policy "public read active products" on public.products
 for select using (active = true);
create policy "public read shop settings" on public.site_settings
 for select using (true);

-- Only users explicitly added to admin_users can manage products/settings.
create policy "admins manage products" on public.products
 for all using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
 with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admins manage settings" on public.site_settings
 for all using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
 with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "admins read admin list" on public.admin_users
 for select using (user_id = auth.uid());

insert into public.products(name,size,min_price,max_price,sort_order,active) values
 ('تغيير ليدات شاشة 32 بوصة','32 بوصة',600,850,1,true),
 ('تغيير ليدات شاشة 40 بوصة','40 بوصة',700,950,2,true),
 ('تغيير ليدات شاشة 43 بوصة','43 بوصة',850,1200,3,true),
 ('تغيير ليدات شاشة 50 بوصة','50 بوصة',1500,2200,4,true),
 ('تغيير ليدات شاشة 55 بوصة','55 بوصة',2000,2800,5,true)
 on conflict do nothing;

insert into public.site_settings(id,value) values (1,
 '{"shop_name":"المركز الفني للصيانة","engineer":"المهندس رضا محمد فتحي","phone1":"01066216816","phone2":"01145319938","whatsapp":"01066216816","address":"قرية الوفاء – البر التاني – بجوار مسجد الحاج محمد فتحي"}'::jsonb)
 on conflict (id) do nothing;

-- Product images storage bucket. Public read; authenticated admins can upload/update/delete.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
 on conflict (id) do nothing;

create policy "public view product images" on storage.objects
 for select using (bucket_id = 'product-images');
create policy "admins upload product images" on storage.objects
 for insert to authenticated with check (
  bucket_id = 'product-images' and exists(select 1 from public.admin_users a where a.user_id = auth.uid())
 );
create policy "admins update product images" on storage.objects
 for update to authenticated using (
  bucket_id = 'product-images' and exists(select 1 from public.admin_users a where a.user_id = auth.uid())
 ) with check (
  bucket_id = 'product-images' and exists(select 1 from public.admin_users a where a.user_id = auth.uid())
 );
create policy "admins delete product images" on storage.objects
 for delete to authenticated using (
  bucket_id = 'product-images' and exists(select 1 from public.admin_users a where a.user_id = auth.uid())
 );
