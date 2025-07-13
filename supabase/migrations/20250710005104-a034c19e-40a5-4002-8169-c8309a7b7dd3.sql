
-- Políticas para permitir operaciones CRUD en categorías (solo lectura pública ya existe)
CREATE POLICY "Allow full access to categories for authenticated users" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas para permitir operaciones CRUD en productos (solo lectura para productos activos ya existe)  
CREATE POLICY "Allow full access to products for authenticated users"
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas para el bucket de imágenes de productos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para subir archivos al storage
CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated uploads to category-images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Allow public access to product-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public access to category-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Allow authenticated delete from product-images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated delete from category-images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'category-images');
