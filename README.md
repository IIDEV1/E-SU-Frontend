# E-SU Frontend

Frontend for a document-management system built with React and TypeScript.

The project includes authenticated routes, role-based access control, document workflows, administration screens, notifications, and audit views. It is part of my web-development portfolio and demonstrates how I structure a medium-sized React application around routes, features, services, and reusable UI.

## Features

- Authentication and password recovery
- Protected routes
- Permission-based access to administrative pages
- Dashboard
- Document listing, creation, editing, details, approval, returned items, and archive
- User, role, department, and category management
- Notifications
- Audit log
- Settings

## Tech stack

- React 18
- TypeScript
- Vite
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- ESLint
- Prettier

## Run locally

Requirements: Node.js and npm.

```bash
git clone https://github.com/IIDEV1/E-SU-Frontend.git
cd E-SU-Frontend
npm install
cp .env.example .env
npm run dev
```

The API URL is configured through:

```env
VITE_API_URL=...
```

Some screens require a compatible running backend and an authorized user account.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run type-check
npm run preview
```

## Project structure

```text
src/
├── app/          # application shell, routes, query client
├── components/   # reusable UI
├── features/     # feature-specific logic
├── layouts/      # page layouts
├── pages/        # route-level pages
├── services/     # API client, endpoints, token handling
├── hooks/        # reusable hooks
├── types/        # shared TypeScript types
└── utils/        # utilities
```

## Architecture notes

The route map in `src/app/App.tsx` separates public pages from authenticated pages. Administrative areas are wrapped with permission checks such as `users.manage`, `documents.approve`, `departments.manage`, `categories.manage`, `audit.view`, and `settings.manage`.

API requests are centralized in `src/services/api.ts`. The client attaches access tokens automatically and attempts a refresh flow after a 401 response.

## Portfolio note

This repository demonstrates frontend architecture, API integration, authentication flows, and permission-aware routing. The README documents what is visible in the source code; it does not claim that every workflow has been independently end-to-end tested.
