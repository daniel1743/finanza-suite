-- =============================================
-- FIN MEMORY SYSTEM - Financia Suite
-- =============================================
-- Ejecutar en Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query
-- PUEDE EJECUTARSE MULTIPLES VECES SIN ERROR

-- =============================================
-- 1. TABLA: fim_user_memory (Long-Term Memory)
-- =============================================
CREATE TABLE IF NOT EXISTS fim_user_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Profile
    user_name VARCHAR(100),
    language VARCHAR(10) DEFAULT 'es',
    tone_preference VARCHAR(20) DEFAULT 'directo', -- directo, amigable, formal
    financial_goal VARCHAR(50), -- ahorrar, pagar_deudas, invertir, ordenarme
    income_frequency VARCHAR(20), -- semanal, quincenal, mensual
    risk_tolerance VARCHAR(10) DEFAULT 'medio', -- bajo, medio, alto

    -- Financial Context (JSONB for flexibility)
    debts JSONB DEFAULT '[]',
    -- Format: [{"type": "tarjeta_credito", "amount": 5000, "status": "activa"}]

    fixed_expenses JSONB DEFAULT '[]',
    -- Format: [{"name": "alquiler", "amount": 800, "frequency": "mensual"}]

    habits JSONB DEFAULT '[]',
    -- Format: [{"pattern": "gastos_hormiga", "confidence": 0.8}]

    important_events JSONB DEFAULT '[]',
    -- Format: [{"date": "2026-01-15", "event": "Pagó deuda X", "tags": ["deuda", "meta"]}]

    -- Summary
    conversation_summary TEXT,
    recent_intent VARCHAR(50),

    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_date TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas si no existen (para actualizaciones)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fim_user_memory' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE fim_user_memory ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fim_user_memory' AND column_name = 'onboarding_date') THEN
        ALTER TABLE fim_user_memory ADD COLUMN onboarding_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Indice para busqueda rapida
CREATE INDEX IF NOT EXISTS idx_fim_user_memory_user_id ON fim_user_memory(user_id);

-- =============================================
-- 2. TABLA: fim_conversation_history (Short-Term Memory)
-- =============================================
CREATE TABLE IF NOT EXISTS fim_conversation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    intent VARCHAR(50), -- detected intent for this message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_fim_conversation_user_id ON fim_conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_fim_conversation_created_at ON fim_conversation_history(created_at DESC);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE fim_user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE fim_conversation_history ENABLE ROW LEVEL SECURITY;

-- ELIMINAR POLITICAS EXISTENTES (para evitar errores)
DROP POLICY IF EXISTS "Users can view own memory" ON fim_user_memory;
DROP POLICY IF EXISTS "Users can insert own memory" ON fim_user_memory;
DROP POLICY IF EXISTS "Users can update own memory" ON fim_user_memory;
DROP POLICY IF EXISTS "Users can delete own memory" ON fim_user_memory;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propia memoria" ON fim_user_memory;
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propia memoria" ON fim_user_memory;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propia memoria" ON fim_user_memory;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propia memoria" ON fim_user_memory;

DROP POLICY IF EXISTS "Users can view own conversations" ON fim_conversation_history;
DROP POLICY IF EXISTS "Users can insert own conversations" ON fim_conversation_history;
DROP POLICY IF EXISTS "Users can delete own conversations" ON fim_conversation_history;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias conversaciones" ON fim_conversation_history;
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propias conversaciones" ON fim_conversation_history;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias conversaciones" ON fim_conversation_history;

-- Crear politicas para fim_user_memory
CREATE POLICY "Users can view own memory" ON fim_user_memory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memory" ON fim_user_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memory" ON fim_user_memory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memory" ON fim_user_memory
    FOR DELETE USING (auth.uid() = user_id);

-- Crear politicas para fim_conversation_history
CREATE POLICY "Users can view own conversations" ON fim_conversation_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON fim_conversation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON fim_conversation_history
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. FUNCION: Limpiar historial antiguo (mantener ultimos 25)
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_fim_messages(p_user_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM fim_conversation_history
    WHERE user_id = p_user_id
    AND id NOT IN (
        SELECT id FROM fim_conversation_history
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 25
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. FUNCION: Actualizar last_updated automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_fim_memory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (recrear si existe)
DROP TRIGGER IF EXISTS update_fim_memory_timestamp_trigger ON fim_user_memory;
CREATE TRIGGER update_fim_memory_timestamp_trigger
    BEFORE UPDATE ON fim_user_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_fim_memory_timestamp();

-- =============================================
-- VERIFICACION
-- =============================================
SELECT 'Tablas creadas:' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('fim_user_memory', 'fim_conversation_history');

SELECT 'Columnas de fim_user_memory:' as status;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'fim_user_memory'
ORDER BY ordinal_position;
