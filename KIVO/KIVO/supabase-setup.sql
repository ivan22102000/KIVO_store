-- Kivo Store Database Setup Script
-- Execute this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100) DEFAULT 'general',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_percent INTEGER NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (starts_at < ends_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_uid ON profiles(auth_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_product_id ON promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON promotions(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (auth_uid, email, phone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = auth_uid);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_uid);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE auth_uid = auth.uid() AND is_admin = TRUE
        )
    );

-- RLS Policies for products
-- Everyone can view products
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (TRUE);

-- Only admins can manage products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE auth_uid = auth.uid() AND is_admin = TRUE
        )
    );

-- RLS Policies for promotions
-- Everyone can view promotions
CREATE POLICY "Anyone can view promotions" ON promotions
    FOR SELECT USING (TRUE);

-- Only admins can manage promotions
CREATE POLICY "Admins can manage promotions" ON promotions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE auth_uid = auth.uid() AND is_admin = TRUE
        )
    );

-- Insert sample data (optional)
-- Sample products
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
(
    'MacBook Pro 14"',
    'Potencia profesional con el chip M2 Pro. Ideal para desarrollo y diseño.',
    2499.00,
    15,
    'electronics',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
),
(
    'AirPods Pro',
    'Cancelación de ruido activa y sonido espacial personalizado.',
    249.00,
    8,
    'electronics',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
),
(
    'iPhone 15 Pro',
    'El smartphone más avanzado con titanio y cámara de 48MP.',
    1199.00,
    12,
    'electronics',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
),
(
    'Desk Setup Pro',
    'Kit completo para oficina en casa con diseño minimalista.',
    899.00,
    5,
    'home',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
),
(
    'iPad Pro 12.9"',
    'Tablet profesional con chip M2 y soporte para Apple Pencil.',
    1399.00,
    7,
    'electronics',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
),
(
    'Apple Watch Series 9',
    'El reloj inteligente más avanzado con monitoreo de salud.',
    449.00,
    20,
    'electronics',
    'https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
);

-- Create admin user (replace with actual auth user UUID after creating user in Supabase Auth)
-- First, create user in Supabase Auth UI or via API, then insert profile:
-- INSERT INTO profiles (auth_uid, email, is_admin) VALUES ('YOUR_AUTH_USER_UUID', 'admin@kivo.com', TRUE);

-- Create sample promotion (after creating admin user)
-- INSERT INTO promotions (title, product_id, discount_percent, starts_at, ends_at, created_by)
-- SELECT 
--     'Oferta Especial MacBook Pro',
--     (SELECT id FROM products WHERE name = 'MacBook Pro 14"' LIMIT 1),
--     15,
--     NOW(),
--     NOW() + INTERVAL '30 days',
--     (SELECT id FROM profiles WHERE is_admin = TRUE LIMIT 1);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Kivo Store database setup completed successfully!' as message;
