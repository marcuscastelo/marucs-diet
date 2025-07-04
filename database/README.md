# Database Setup for Recent Foods Search

This directory contains database functions and setup for the enhanced recent foods search functionality.

## Setup Instructions

1. **Create required tables** (if not already created):
   ```bash
   # Run in Supabase SQL Editor in this order:
   # 1. foods.sql (creates foods table)
   # 2. recipes.sql (creates recipes table) 
   # 3. recent_foods.sql (creates recent_foods table)
   ```

2. **Execute the SQL function** in Supabase dashboard:
   ```bash
   # Run the contents of search_recent_foods_with_names.sql in Supabase SQL Editor
   ```

3. **Enable required extensions** (if not already enabled):
   ```sql
   -- Run as superuser in Supabase dashboard
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

## How It Works

### Server-Side Search Function
- `search_recent_foods_with_names()` efficiently joins recent_foods with foods/recipes tables
- Returns only matching results, reducing data transfer
- Supports Portuguese diacritic-insensitive search
- Maintains chronological ordering of recent items

### Application Integration
- `fetchUserRecentFoods()` now accepts optional `search` parameter
- When search is provided, uses server-side function via `supabase.rpc()`
- When no search, uses existing optimized table query
- Backward compatible with existing code

### Performance Optimizations
- GIN indexes on food/recipe names for fast text search
- Composite index on recent_foods(user_id, last_used DESC)
- Server-side filtering reduces network overhead

## Usage Example

```typescript
// Without search (existing behavior)
const recentFoods = await fetchUserRecentFoods(userId, 20)

// With search (new functionality)
const searchResults = await fetchUserRecentFoods(userId, 20, "arroz")
```

## Benefits

- ✅ Reduces data transfer (only matching results returned)
- ✅ Leverages PostgreSQL's text search capabilities  
- ✅ Maintains chronological ordering of recent items
- ✅ Supports Portuguese diacritics server-side
- ✅ Backward compatible with existing code
- ✅ Follows existing architectural patterns