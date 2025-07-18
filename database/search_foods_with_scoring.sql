-- Enhanced PostgreSQL function for searching foods with relevance scoring
-- Implements fuzzy matching, multi-word boost scoring, and proximity analysis
-- Uses pg_trgm extension for similarity calculations and trigram-based indexing

-- Drop existing function to avoid conflicts
DROP FUNCTION IF EXISTS search_foods_with_scoring(text, integer);

CREATE OR REPLACE FUNCTION search_foods_with_scoring(
  p_search_term text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id bigint,
  name text,
  ean text,
  macros jsonb,
  source jsonb,
  created_at timestamptz
) 
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_search text;
  search_words text[];
  word_count integer;
BEGIN
  -- Handle empty search term
  IF p_search_term IS NULL OR trim(p_search_term) = '' THEN
    RETURN QUERY
    SELECT 
      f.id,
      f.name,
      f.ean,
      f.macros::jsonb,
      f.source,
      f.created_at
    FROM public.foods f
    WHERE f.name != '' AND f.name != '.'
    ORDER BY f.name ASC
    LIMIT p_limit;
    RETURN;
  END IF;

  -- Normalize search term (remove diacritics and convert to lowercase)
  normalized_search := lower(
    translate(
      p_search_term,
      'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
      'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
    )
  );
  
  -- Split search term into words
  search_words := string_to_array(trim(normalized_search), ' ');
  search_words := array_remove(search_words, '');
  word_count := array_length(search_words, 1);

  -- Return scored results
  RETURN QUERY
  WITH scored_foods AS (
    SELECT 
      f.id,
      f.name,
      f.ean,
      f.macros::jsonb,
      f.source,
      f.created_at,
      -- Normalize food name for comparison
      lower(
        translate(
          f.name,
          'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
          'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
        )
      ) as normalized_name,
      -- Calculate relevance score
      CASE
        -- Exact match (highest priority)
        WHEN lower(
          translate(
            f.name,
            'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
            'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
          )
        ) = normalized_search THEN 1.0
        
        -- All words present (second highest priority)
        WHEN word_count > 1 AND (
          SELECT COUNT(*)
          FROM unnest(search_words) as word
          WHERE lower(
            translate(
              f.name,
              'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
              'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
            )
          ) LIKE '%' || word || '%'
        ) = word_count THEN 0.8 + (
          -- Proximity bonus: higher score if words are closer together
          CASE 
            WHEN length(f.name) <= length(p_search_term) * 1.5 THEN 0.15
            WHEN length(f.name) <= length(p_search_term) * 2 THEN 0.1
            ELSE 0.05
          END
        )
        
        -- Partial word matches (lower priority)
        WHEN word_count > 1 THEN 0.4 * (
          SELECT COUNT(*)::float / word_count
          FROM unnest(search_words) as word
          WHERE lower(
            translate(
              f.name,
              'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
              'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
            )
          ) LIKE '%' || word || '%'
        )
        
        -- Fuzzy similarity using pg_trgm (lowest priority)
        ELSE similarity(
          lower(
            translate(
              f.name,
              'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
              'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
            )
          ),
          normalized_search
        ) * 0.6
      END as relevance_score
    FROM public.foods f
    WHERE f.name != '' AND f.name != '.'
      AND (
        -- Use ILIKE for basic matching (handles most cases efficiently)
        lower(
          translate(
            f.name,
            'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
            'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
          )
        ) LIKE '%' || normalized_search || '%'
        OR
        -- Use similarity for fuzzy matching (more expensive but catches typos)
        similarity(
          lower(
            translate(
              f.name,
              'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
              'aaaaaeeeeiiiioooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
            )
          ),
          normalized_search
        ) > 0.2
      )
  )
  SELECT 
    sf.id,
    sf.name,
    sf.ean,
    sf.macros,
    sf.source,
    sf.created_at
  FROM scored_foods sf
  -- WHERE sf.relevance_score > 0.1  -- Filter out very low relevance results
  ORDER BY 
    sf.relevance_score DESC,  -- Primary sort by relevance
    sf.name ASC               -- Secondary sort by name for consistent ordering
  LIMIT p_limit;
END;
$$;

-- Ensure required indexes exist for optimal performance
CREATE INDEX IF NOT EXISTS idx_foods_name_gin ON public.foods USING gin(name gin_trgm_ops) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_foods_name_lower ON public.foods USING btree(lower(name)) TABLESPACE pg_default;

-- Note: This function requires pg_trgm extension
-- Run in Supabase SQL Editor as superuser if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;