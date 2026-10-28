# MedKoppers

A Pharmacology MCQ practice test for MBBS students in Bangladesh. Built with Next.js, Tailwind CSS and Supabase.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run db:push              # apply database migrations
npm run seed                 # add dummy questions
npm run dev
```

Open http://localhost:3000.

See [CLAUDE.md](CLAUDE.md) for the project scope, schema and security rules.
