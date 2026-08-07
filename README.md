# Home & Small Business IT Services — V1

Local-first web application for a Melbourne home and small-business IT service.

## What is included

- responsive public service website
- computer repair, networking, NBN, business IT, security, remote support and hardware service areas
- Refurbished & Tested Equipment catalogue design
- protected `/admin` business console
- Omar Manaa (`omar.manaa@gmail.com`) is the only production admin allowlisted in server code
- dashboard for jobs, quotes, parts, repairs, completions and monthly revenue
- data model for customers, devices, jobs, job notes, quotes, quote line items, inventory and file metadata
- D1-ready structured data and R2-ready file/image storage bindings
- generated database migration under `drizzle/`
- responsive desktop/tablet/mobile layouts

## Run locally in VS Code / Windows

Requirements: Node.js 22.13 or newer and npm.

Open the project folder in VS Code, then in PowerShell run:

```powershell
npm install
npm run dev
```

Vite will show the local URL in the terminal (normally `http://localhost:5173`).
Open it in your browser.

Useful pages:

- `/` — public website
- `/admin` — business console

In development only, `/admin` opens as `Omar Manaa (local)` so the admin UI can be tested without putting a real password or secret in the project. This local shortcut is conditional on the development runtime and is not used in a production build.

Stop the server with `Ctrl+C`.

## Administrator security

The production admin allowlist is intentionally checked on the server, not in browser JavaScript. The allowed identity is:

```text
omar.manaa@gmail.com
```

The application does **not** contain or store Omar's Gmail password. Production sign-in is designed to use a managed identity layer and then enforce the exact email allowlist on the server. Before public deployment, the final hosting identity configuration must be enabled and tested with both an authorised and an unauthorised account.

Security rules for the production admin area:

- authentication and authorisation are separate checks
- only the exact allowlisted email can enter `/admin`
- no password is committed to source control
- admin checks happen server-side
- protected admin pages are dynamically rendered
- persistent business data belongs in D1, not browser local storage
- uploaded files/images belong in R2, with metadata in D1
- secrets/tokens must be hosting environment variables, never source files
- production deployment should use HTTPS only

## Business data model

The V1 schema deliberately keeps customer, device and job identity separate. A customer can have multiple devices and jobs; a job can have notes and a quote; a quote has line items; inventory can be used for internal parts or marked for public equipment sales.

This avoids merging customers by name and gives the system a safe base for future CRM, invoicing, warranty and follow-up workflows.

## V1 vs next operational milestone

This version is ready for local review of the design, navigation, data structure and admin dashboard. Before treating the application as the live operational system, complete and test the following workflows:

1. create/edit customers and devices
2. create jobs and move them through statuses
3. quote creation, GST totals, PDF and accept/reject flow
4. inventory adjustments and stock deduction
5. R2 equipment/product photo uploads
6. customer contact/support request form delivery
7. backup/export and restore strategy
8. production authentication/access configuration
9. audit logging for sensitive admin changes
10. end-to-end browser and mobile testing

Do not enter real customer information while testing the V1 locally.

## Production build

The included hosting build scripts target the managed Linux build environment. The production artifact has been validated with `npm run build` in that environment. For local Windows UI testing, use `npm run dev` as above.
