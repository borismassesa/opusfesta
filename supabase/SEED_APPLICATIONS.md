# Seed Applications Data

This file contains seed data for job applications to help with testing and development of the careers feature.

## How to Run

### Option 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd /path/to/thefesta

# Run the seed file
supabase db execute --file supabase/seed_applications.sql
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `seed_applications.sql`
4. Click "Run" to execute

### Option 3: Using psql

```bash
# Connect to your Supabase database
psql -h <your-db-host> -U postgres -d postgres

# Run the seed file
\i supabase/seed_applications.sql
```

## What This Seeds

This seed file creates **12 sample job applications** with:

- Various application statuses (pending, reviewing, interviewed, hired, rejected)
- Different job postings (referencing jobs from `seed_careers.sql`)
- Realistic applicant information (names, emails, phone numbers)
- Cover letters, experience, education, and references
- Different application dates (spread over the past 10 days)
- Some applications with admin notes

## Application Statuses Included

- **Pending**: 5 applications
- **Reviewing**: 3 applications
- **Interviewed**: 2 applications
- **Hired**: 1 application
- **Rejected**: 1 application

## Notes

- Make sure you've run `seed_careers.sql` first, as these applications reference existing job postings
- The applications use realistic Tanzanian/Kenyan names and phone numbers
- Some applications include portfolio URLs and LinkedIn profiles
- Admin notes are included for some applications to demonstrate the notes feature

## Troubleshooting

If you get foreign key constraint errors, make sure:
1. You've run `seed_careers.sql` first to create the job postings
2. The job posting IDs in `seed_applications.sql` match the IDs in `seed_careers.sql`
