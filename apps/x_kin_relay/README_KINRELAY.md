# KinRelay - Care Management System

A comprehensive care management platform connecting families with caregivers and specialists, featuring detailed task tracking, medication management, and reporting.

## Features

### Two Main Modes

#### 1. Search Mode

- **For Families**: Search for qualified caregivers, nurses, and specialists
- **For Specialists**: Find families needing care services
- Advanced filtering by specialization, rating, location, languages, and hourly rate
- Profile browsing with ratings and reviews

#### 2. Care Tool Mode

- **For Specialists/Caregivers**:
  - Daily task management across multiple care categories
  - Medication administration tracking
  - Incident reporting
  - Real-time data entry for client care
- **For Family Members**:
  - View comprehensive daily reports
  - Monitor task completion rates
  - Track medication compliance
  - Review incidents and caregiver notes
  - Access historical data and trends

### Care Categories

- **Patrón de Sueño** (Sleep Pattern)
- **Cuidado Personal** (Personal Care)
- **Hidratación** (Hydration)
- **Nutrición** (Nutrition)
- **Movilidad** (Mobility)
- **Continencia/Incontinencia** (Continence/Incontinence)
- **Actividad** (Activity)
- **Administración de Medicamentos** (Medication Administration)
- **Patrón de Conducta** (Behavior Pattern)
- **Incidente** (Incident)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS Modules, CSS-in-JS

## Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Git

### 1. Clone and Install

```bash
cd /Users/marcocasanova/stratosone/apps/x_kin_relay
pnpm install
```

### 2. Configure Supabase

#### A. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### B. Set Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### C. Run Migrations

Execute the migration files in order using the Supabase SQL Editor:

1. **Main Schema** (`supabase/migrations/20260102_kinrelay_complete_schema.sql`)

   - Creates all tables, enums, and relationships
   - Sets up Row Level Security policies
   - Creates triggers and functions

2. **Seed Data** (`supabase/migrations/20260102_seed_care_categories.sql`)
   - Populates care categories and subcategories
   - Spanish/English translations included

**To run migrations:**

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `20260102_kinrelay_complete_schema.sql`
4. Click "Run"
5. Repeat for `20260102_seed_care_categories.sql`

Alternatively, if using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Update Supabase Client

Ensure `/src/lib/supabaseClient.ts` is configured correctly:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client-side
export const createClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Database Schema

KinRelay integrates with the existing Stratos database. All KinRelay tables use the `kr_` prefix.

### Core Tables

- **profiles**: Shared user profiles from Stratos auth system
- **kr_caregiver_profiles**: Extended profile data for KinRelay users (specialists, nurses, caregivers, family)
- **kr_clients**: People receiving care
- **kr_care_assignments**: Links specialists to clients
- **kr_care_categories**: Main care categories
- **kr_care_subcategories**: Subcategories with input types
- **kr_medications**: Medication prescriptions
- **kr_medication_administrations**: Medication tracking
- **kr_tasks**: Daily care tasks
- **kr_incidents**: Incident reports
- **kr_behavior_patterns**: Behavioral tracking
- **kr_sleep_patterns**: Sleep tracking
- **kr_activity_logs**: General activity tracking
- **kr_reviews**: Specialist ratings
- **kr_messages**: Communication between users

### User Roles

- **family**: Family members managing care for loved ones
- **specialist**: Healthcare specialists providing care
- **nurse**: Registered nurses
- **caregiver**: Professional caregivers
- **admin**: System administrators

## API Endpoints

### Clients

- `GET /api/clients` - List all authorized clients
- `GET /api/clients?id={id}` - Get single client
- `POST /api/clients` - Create client (family only)
- `PUT /api/clients` - Update client
- `DELETE /api/clients?id={id}` - Delete client

### Medications

- `GET /api/medications` - List medications
- `GET /api/medications?client_id={id}` - Get client medications
- `POST /api/medications` - Add medication
- `PUT /api/medications` - Update medication
- `DELETE /api/medications?id={id}` - Remove medication

### Tasks

- `GET /api/tasks` - List tasks
- `GET /api/tasks?client_id={id}&date={date}` - Get tasks for date
- `POST /api/tasks` - Create task
- `PUT /api/tasks` - Update task
- `DELETE /api/tasks?id={id}` - Delete task

### Medication Administrations

- `GET /api/medication-administrations` - List administrations
- `POST /api/medication-administrations` - Record administration
- `PUT /api/medication-administrations` - Update administration

### Incidents

- `GET /api/incidents` - List incidents
- `GET /api/incidents?client_id={id}&date={date}` - Get incidents
- `POST /api/incidents` - Report incident

### Care Categories

- `GET /api/care-categories` - List all categories
- `GET /api/care-categories?include_subcategories=true` - Include subcategories

### Search

- `GET /api/search` - Simple profile search
- `POST /api/search` - Advanced search with filters

## Key Components

### TaskManager

Daily task management interface with category-based organization.

```tsx
import TaskManager from "@/components/TaskManager";

<TaskManager clientId="..." userRole="specialist" />;
```

### ClientForm

Multi-step form for creating/editing client profiles.

```tsx
import ClientForm from "@/components/ClientForm";

<ClientForm mode="create" onSubmit={handleSubmit} />;
```

### ClientReports

Comprehensive daily reports for family members.

```tsx
import ClientReports from "@/components/ClientReports";

<ClientReports clientId="..." userRole="family" />;
```

### SpecialistSearch

Search interface for finding specialists or families.

```tsx
import SpecialistSearch from "@/components/SpecialistSearch";

<SpecialistSearch userRole="family" />;
```

## Security

### Row Level Security (RLS)

All tables have RLS policies ensuring:

- Users can only access their own data
- Family members can view/edit their clients
- Specialists can access assigned clients only
- Care categories are publicly viewable
- Messages are private between sender/recipient

### Authentication

Using Supabase Auth with email/password by default. Can be extended to support:

- OAuth providers (Google, Facebook, etc.)
- Magic links
- Phone authentication

## Development

### Adding New Care Categories

1. Insert into `care_categories` table
2. Add subcategories in `care_subcategories`
3. Update TypeScript types if needed
4. No code changes required - UI updates automatically

### Adding New User Roles

1. Update `user_role` enum in migration
2. Update TypeScript types in `/src/types/kinrelay.ts`
3. Add RLS policies for new role
4. Update API route authorization logic

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- ActivityForm.test.tsx

# Run with coverage
pnpm test:coverage
```

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check that environment variables are set correctly
2. **RLS policy errors**: Verify user is authenticated and has correct role
3. **Migration errors**: Run migrations in correct order
4. **Type errors**: Run `pnpm build` to check for TypeScript errors

### Database Reset

If you need to reset the database:

```sql
-- Run in Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run migrations
```

## Support

For issues or questions:

- Check existing GitHub issues
- Review Supabase documentation
- Contact development team

## License

Proprietary - All rights reserved

## Version

1.0.0 - Initial Release (January 2026)
