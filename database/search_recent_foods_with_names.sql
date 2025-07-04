-- PostgreSQL function for searching recent foods with joined names
-- This function efficiently searches recent foods by joining with foods and recipes tables
-- Supports Portuguese diacritic-insensitive search using client-side normalization approach

-- Drop any existing function to avoid signature conflicts
DROP FUNCTION IF EXISTS search_recent_foods_with_names(integer, text, integer);
DROP FUNCTION IF EXISTS search_recent_foods_with_names(bigint, text, integer);

CREATE OR REPLACE FUNCTION search_recent_foods_with_names(
  p_user_id bigint,
  p_search_term text DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id bigint,
  user_id bigint,
  type text,
  reference_id bigint,
  last_used timestamp with time zone,
  times_used integer,
  name text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- If no search term provided, return recent foods with names (no filtering)
  IF p_search_term IS NULL OR p_search_term = '' THEN
    RETURN QUERY
    SELECT 
      rf.id,
      rf.user_id,
      rf.type,
      rf.reference_id,
      rf.last_used,
      rf.times_used,
      COALESCE(f.name, r.name) as name
    FROM public.recent_foods rf
    LEFT JOIN public.foods f ON rf.type = 'food' AND rf.reference_id = f.id
    LEFT JOIN public.recipes r ON rf.type = 'recipe' AND rf.reference_id = r.id
    WHERE rf.user_id = p_user_id
    ORDER BY rf.last_used DESC
    LIMIT p_limit;
  ELSE
    -- Search with diacritic-insensitive filtering
    -- Note: Using client-side normalized search term approach to match existing patterns
    RETURN QUERY
    SELECT 
      rf.id,
      rf.user_id,
      rf.type,
      rf.reference_id,
      rf.last_used,
      rf.times_used,
      COALESCE(f.name, r.name) as name
    FROM public.recent_foods rf
    LEFT JOIN public.foods f ON rf.type = 'food' AND rf.reference_id = f.id
    LEFT JOIN public.recipes r ON rf.type = 'recipe' AND rf.reference_id = r.id
    WHERE rf.user_id = p_user_id
      AND (
        f.name ILIKE '%' || p_search_term || '%' OR
        r.name ILIKE '%' || p_search_term || '%'
      )
    ORDER BY rf.last_used DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- Create index for performance on foods.name if it doesn't exist (matches existing schema)
CREATE INDEX IF NOT EXISTS idx_foods_name_gin ON public.foods USING gin(name gin_trgm_ops) TABLESPACE pg_default;

-- Create index for performance on recipes.name if it doesn't exist  
CREATE INDEX IF NOT EXISTS idx_recipes_name_gin ON public.recipes USING gin(name gin_trgm_ops) TABLESPACE pg_default;

-- Create composite index for recent_foods performance (matches existing schema)
CREATE INDEX IF NOT EXISTS idx_recent_foods_user_last_used ON public.recent_foods USING btree(user_id, last_used DESC) TABLESPACE pg_default;

-- Enable pg_trgm extension for trigram-based text search (if not already enabled)
-- This needs to be run as superuser in Supabase dashboard:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;