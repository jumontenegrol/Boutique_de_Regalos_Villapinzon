-- Boutique de Regalos Villapinzón · pega todo en Supabase > SQL Editor > Run
create table categories(id serial primary key, name text not null, slug text unique not null, note text);
create table products(id uuid primary key default gen_random_uuid(), category_id int references categories, name text not null, description text, price int not null check(price>=0), stock int not null default 0 check(stock>=0), images text[] not null default '{}', active bool not null default true, created_at timestamptz default now());
create table customers(id uuid primary key default gen_random_uuid(), name text not null, phone text unique not null, created_at timestamptz default now());
create sequence order_seq;
create table orders(id uuid primary key default gen_random_uuid(), number text unique not null default 'BR-'||lpad(nextval('order_seq')::text,4,'0'), customer_id uuid references customers, personalization text, total int not null default 0, status text not null default 'pendiente' check(status in('pendiente','confirmado','enviado','entregado','cancelado')), created_at timestamptz default now());
create table order_items(id serial primary key, order_id uuid references orders on delete cascade, product_id uuid references products, qty int not null check(qty between 1 and 99), unit_price int not null);
create table admins(user_id uuid primary key references auth.users on delete cascade);

create function is_admin() returns bool language sql security definer stable set search_path=public as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;

-- Seguridad (RLS): el público solo lee catálogo; todo lo demás es del admin
do $$ declare t text; begin
 foreach t in array array['categories','products','customers','orders','order_items'] loop
  execute format('alter table %I enable row level security',t);
  execute format('create policy "admin all" on %I for all using(is_admin()) with check(is_admin())',t);
 end loop; end $$;
alter table admins enable row level security;
create policy "self" on admins for select using(user_id=auth.uid());
create policy "read" on categories for select using(true);
create policy "read" on products for select using(active);

-- El cliente crea pedidos SOLO con esta función (precios calculados en el servidor)
create function create_order(p_name text, p_phone text, p_personalization text, p_items jsonb) returns text
language plpgsql security definer set search_path=public as $$
declare c uuid; o uuid; n text; tot int:=0; it jsonb; pr products;
begin
 insert into customers(name,phone) values(trim(p_name),regexp_replace(p_phone,'\D','','g'))
  on conflict(phone) do update set name=excluded.name returning id into c;
 insert into orders(customer_id,personalization) values(c,nullif(trim(p_personalization),'')) returning id,number into o,n;
 for it in select * from jsonb_array_elements(p_items) loop
  select * into pr from products where id=(it->>'id')::uuid and active;
  if not found then raise exception 'Producto no disponible'; end if;
  insert into order_items(order_id,product_id,qty,unit_price) values(o,pr.id,(it->>'qty')::int,pr.price);
  tot:=tot+pr.price*(it->>'qty')::int;
 end loop;
 update orders set total=tot where id=o;
 return n;
end $$;
grant execute on function create_order to anon, authenticated;

-- El admin confirma el pago: descuenta stock y marca "confirmado" (falla si no alcanza el stock)
create function confirm_order(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 if not is_admin() then raise exception 'No autorizado'; end if;
 if (select status from orders where id=p_id)<>'pendiente' then raise exception 'Solo se confirman pedidos pendientes'; end if;
 update products p set stock=p.stock-i.qty from order_items i where i.order_id=p_id and i.product_id=p.id;
 update orders set status='confirmado' where id=p_id;
end $$;
grant execute on function confirm_order to authenticated;

-- Imágenes
insert into storage.buckets(id,name,public) values('products','products',true) on conflict do nothing;
create policy "admin upload" on storage.objects for all using(bucket_id='products' and is_admin()) with check(bucket_id='products' and is_admin());

-- Categorías iniciales
insert into categories(name,slug,note) values
('Agendas','agendas',null),('Termos','termos',null),('Joyas','joyas',null),
('Cajas para ocasiones especiales','cajas',null),
('Tazas personalizables','tazas','Las tazas llevan más detalles: te recomendamos escribirnos por WhatsApp para diseñarla contigo.'),
('Bolsos','bolsos',null),('Peluches','peluches',null),('Para hacer café','cafe',null);

-- Admins (máx. 3): primero crea cada usuario en Authentication > Users, luego:
-- insert into admins select id from auth.users where email in ('correo1@...','correo2@...','correo3@...');
