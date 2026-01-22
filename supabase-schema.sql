-- ========================================
-- SCHEMA COMPLETO PARA FINANCIA SUITE
-- ========================================
-- Ejecutar este archivo en el SQL Editor de Supabase
-- Dashboard: https://supabase.com/dashboard/project/yrjsgirfugblxzkocsqx/sql

-- ========================================
-- 1. TABLA: profiles
-- ========================================
-- Se crea automaticamente cuando un usuario se registra

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'CLP',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios para documentacion
COMMENT ON TABLE public.profiles IS 'Perfil de usuario extendido';
COMMENT ON COLUMN public.profiles.currency IS 'Moneda preferida del usuario (CLP, USD, EUR, etc.)';

-- ========================================
-- 2. TABLA: transactions
-- ========================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  category TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  person TEXT, -- Para multi-usuario dentro de una cuenta (Juan, Maria, etc.)
  necessity TEXT CHECK (necessity IN ('Necesario', 'Prescindible', 'Ahorro', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

COMMENT ON TABLE public.transactions IS 'Gastos e ingresos del usuario';

-- ========================================
-- 3. TABLA: budgets
-- ========================================

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);

COMMENT ON TABLE public.budgets IS 'Presupuestos por categoria';

-- ========================================
-- 4. TABLA: goals
-- ========================================

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#6366f1',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

COMMENT ON TABLE public.goals IS 'Metas de ahorro del usuario';

-- ========================================
-- 5. TABLA: chat_messages
-- ========================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

COMMENT ON TABLE public.chat_messages IS 'Historial del chat con IA';

-- ========================================
-- 6. TABLA: categories (opcional, para personalizar)
-- ========================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  color TEXT DEFAULT '#6b7280',
  type TEXT DEFAULT 'expense' CHECK (type IN ('income', 'expense', 'both')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Insertar categorias por defecto (globales, user_id = NULL)
INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
  (NULL, 'Alimentacion', '🍔', '#ef4444', 'expense', TRUE),
  (NULL, 'Transporte', '🚗', '#f97316', 'expense', TRUE),
  (NULL, 'Entretenimiento', '🎬', '#8b5cf6', 'expense', TRUE),
  (NULL, 'Salud', '🏥', '#10b981', 'expense', TRUE),
  (NULL, 'Servicios', '💡', '#3b82f6', 'expense', TRUE),
  (NULL, 'Compras', '🛍️', '#ec4899', 'expense', TRUE),
  (NULL, 'Vivienda', '🏠', '#6366f1', 'expense', TRUE),
  (NULL, 'Educacion', '📚', '#14b8a6', 'expense', TRUE),
  (NULL, 'Otros', '📦', '#6b7280', 'expense', TRUE),
  (NULL, 'Salario', '💰', '#22c55e', 'income', TRUE),
  (NULL, 'Freelance', '💼', '#0ea5e9', 'income', TRUE),
  (NULL, 'Inversiones', '📈', '#a855f7', 'income', TRUE),
  (NULL, 'Otros Ingresos', '💵', '#84cc16', 'income', TRUE)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.categories IS 'Categorias personalizables por usuario';

-- ========================================
-- 7. FUNCIONES Y TRIGGERS
-- ========================================

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_transactions ON public.transactions;
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_budgets ON public.budgets;
CREATE TRIGGER set_updated_at_budgets
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_goals ON public.goals;
CREATE TRIGGER set_updated_at_goals
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 8. FUNCION: Crear perfil al registrarse
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil cuando se registra usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES: profiles
-- ========================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- POLICIES: transactions
-- ========================================

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLICIES: budgets
-- ========================================

DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLICIES: goals
-- ========================================

DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLICIES: chat_messages
-- ========================================

DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLICIES: categories
-- ========================================

-- Todos pueden ver categorias por defecto (user_id = NULL)
DROP POLICY IF EXISTS "Anyone can view default categories" ON public.categories;
CREATE POLICY "Anyone can view default categories" ON public.categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- ========================================
-- 10. VISTAS UTILES (opcional)
-- ========================================

-- Vista: Resumen mensual de gastos
CREATE OR REPLACE VIEW public.monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', date) AS month,
  type,
  SUM(amount) AS total,
  COUNT(*) AS count
FROM public.transactions
GROUP BY user_id, DATE_TRUNC('month', date), type;

-- Vista: Gastos por categoria del mes actual
CREATE OR REPLACE VIEW public.current_month_by_category AS
SELECT
  user_id,
  category,
  SUM(amount) AS total,
  COUNT(*) AS count
FROM public.transactions
WHERE
  type = 'expense'
  AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id, category;

-- ========================================
-- FIN DEL SCHEMA
-- ========================================
-- Para ejecutar: Copiar todo este contenido al SQL Editor de Supabase
-- URL: https://supabase.com/dashboard/project/yrjsgirfugblxzkocsqx/sql
