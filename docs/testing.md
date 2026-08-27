# Frontend testing

Unit and integration checks:

```powershell
npm test
npm run test:run
```

The Release 1 browser workflow uses a real local backend and intentionally is not part of frontend CI: it creates a uniquely named `E2E-*` category and document, and needs real accounts with the employee, manager, office, and admin roles.

Start the backend on `http://127.0.0.1:8000/api/v1` (or set `E2E_API_URL`), then run:

```powershell
$env:E2E_EMPLOYEE_EMAIL = "employee@example.test"
$env:E2E_EMPLOYEE_PASSWORD = "..."
$env:E2E_MANAGER_EMAIL = "manager@example.test"
$env:E2E_MANAGER_PASSWORD = "..."
$env:E2E_OFFICE_EMAIL = "office@example.test"
$env:E2E_OFFICE_PASSWORD = "..."
$env:E2E_ADMIN_EMAIL = "admin@example.test"
$env:E2E_ADMIN_PASSWORD = "..."
npm run test:e2e
```

Playwright uses its managed Chromium by default. If Chrome is installed locally, set `PLAYWRIGHT_BROWSER_CHANNEL=chrome`; otherwise install a browser once with `npx playwright install chromium`.
