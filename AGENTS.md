# Codex Project Instructions

This is DieuBel, a full-stack hotel booking system. The frontend is a React + Vite + Tailwind CSS SPA, and the backend is an Express REST API.

## Default Workflow

- Read the relevant source files before changing code. Do not redesign blindly from screenshots or assumptions.
- Preserve existing business logic, API contracts, routing, authentication, booking states, voucher behavior, QR check-in behavior, and admin workflows unless the user explicitly asks to change them.
- Keep changes focused and reviewable. Do not rewrite the app or migrate frameworks for UI polish.
- Before importing any dependency, check the relevant `package.json`. Prefer the existing stack.
- After code changes in `frontend/`, run `npm run build` from `frontend/` when feasible.

## Skills To Apply

When the user asks for frontend UI, UX, redesign, landing page, hotel booking page, admin surface, or visual polish, apply these skills when relevant:

- `design-taste-frontend`
- `high-end-visual-design`
- `redesign-existing-projects`

For visual concept work before implementation, use:

- `imagegen-frontend-web`
- `image-to-code`

For architecture or onboarding questions, use:

- `understand-anything:understand`
- `understand-anything:understand-chat`

Do not try to use every installed skill. Choose only the skills that match the request.

## Design Read For This Project

Read this as a Vietnamese hotel booking product for travelers and hotel staff, with a premium hospitality language, leaning toward a polished marketplace and operations tool rather than a generic SaaS template.

Default design dials:

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 4`
- `VISUAL_DENSITY: 5` for admin screens, `3` for public marketing/booking screens

## Product Priorities

- Public pages should make rooms, destinations, trust, booking speed, and payment clarity easy to scan.
- Booking flows should feel calm, clear, and safe. Avoid decorative UI that distracts from dates, guests, room choices, price, voucher, and payment confirmation.
- Admin pages should be dense enough for repeated work, but not cramped. Prioritize table readability, filters, status clarity, and action confidence.
- Vietnamese text must remain natural and readable. Do not replace domain-specific Vietnamese labels with generic English copy.

## Guardrails

- Do not move installed skill folders into this project. Skills live globally under the agent skill directories.
- Do not edit generated invoices under `Hoa don admin/` unless the request is specifically about invoice output.
- Do not commit `.env` files or secrets.
- Do not delete user documents in `Tai lieu du an/`, `Tài liệu dự án/`, or similar documentation folders.
