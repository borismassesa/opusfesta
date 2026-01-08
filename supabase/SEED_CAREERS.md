# Careers Seed Data

This file contains sample job postings to prepopulate the careers page.

## How to Run

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `seed_careers.sql`
4. Click "Run" to execute

### Option 2: Via psql
```bash
psql $DATABASE_URL -f supabase/seed_careers.sql
```

### Option 3: Via Supabase CLI
```bash
supabase db reset --db-url $DATABASE_URL < supabase/seed_careers.sql
```

## What's Included

The seed file includes 10 sample job postings across different departments:
- Engineering (3 positions)
- Design (1 position)
- Marketing (2 positions)
- Sales (1 position)
- Customer Success (1 position)
- Product (1 position)
- Operations (1 position)

All positions are set to `is_active = true` and include:
- Job titles
- Departments
- Locations (Dar es Salaam, Remote)
- Employment types (Full-time, Part-time)
- Descriptions
- Requirements arrays
- Responsibilities arrays
- Salary ranges in TZS
