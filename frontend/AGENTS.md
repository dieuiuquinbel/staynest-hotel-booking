# Frontend UI Instructions

This frontend uses React 19, Vite, React Router, TanStack React Query, Zustand, Axios, and Tailwind CSS 3.4.

## Required Design Approach

When editing UI, apply `design-taste-frontend`, `high-end-visual-design`, and `redesign-existing-projects` in a practical way:

- Audit the current component first.
- Preserve current data flow and component responsibilities.
- Improve typography, spacing, hierarchy, responsive behavior, hover/focus/active states, and visual consistency.
- Keep the design appropriate for a hotel booking product, not a dark AI SaaS template.

## Existing Stack

- Styling: Tailwind CSS v3.4 through `tailwind.config.js` and `src/index.css`.
- Brand color currently uses `brand` red/pink tokens in Tailwind.
- Public UI lives mostly under `src/pages/public`, `src/pages/rooms`, `src/pages/bookings`, and `src/components/public`.
- Admin UI lives under `src/pages/admin` and `src/components/admin`.
- Shared layout is under `src/components/layout`.

## Visual Direction

- Keep DieuBel recognizable, but make it feel more like a premium hotel marketplace.
- Use photography-led layouts for public hotel pages.
- Prefer warm white, soft neutral surfaces, and one locked brand accent. Do not introduce random purple/blue AI gradients.
- Use the existing `brand` palette unless there is a strong reason to adjust it project-wide.
- Use spacious public sections, but keep admin screens compact and operational.
- Use semantic HTML where possible: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`.

## Typography

- Avoid browser-default-looking typography. Use the existing font stack unless adding a font is specifically requested and dependency/loading is handled properly.
- Headlines should have stronger hierarchy, balanced wrapping, and tighter line-height.
- Body text should be limited to readable widths around `60-70ch` where appropriate.
- Use `font-medium` and `font-semibold` for hierarchy instead of only regular/bold.
- For prices, counts, revenue, dates, and booking IDs, use tabular numbers with `font-variant-numeric: tabular-nums` or Tailwind arbitrary CSS if needed.

## Layout Rules

- Prefer CSS Grid over complicated flex percentage math.
- Avoid `h-screen`; use `min-h-[100dvh]` for viewport-height layouts.
- Keep page containers around `max-w-7xl` or a deliberate equivalent.
- Avoid generic three-card rows when a richer hotel layout would work better: use asymmetric grids, feature bands, comparison rows, or image-led sections.
- Do not put cards inside cards unless there is a real nested workflow such as a modal or detail panel.
- Use stable dimensions for room cards, search controls, tables, metric tiles, and QR/payment panels so hover/loading states do not shift layout.

## Interaction States

- Every button, link-like control, form field, tab, filter chip, room card, and admin action needs visible hover, focus, and active states.
- Focus rings must be visible and keyboard-accessible.
- Avoid `window.alert()` for user-facing errors; use inline messages, banners, or existing notification patterns.
- Use transforms and opacity for animation. Avoid animating layout properties such as `top`, `left`, `width`, or `height`.
- Keep motion subtle enough for booking and admin workflows.

## Components To Treat Carefully

- `src/components/search/ThanhTimKiem.jsx`: booking search must stay fast, legible, and mobile-friendly.
- `src/components/rooms/ThePhong.jsx`: room cards must clearly show image, title, location, capacity, price, availability, and primary action.
- `src/pages/bookings/DatPhong.jsx`: do not obscure booking details, payment state, voucher state, or confirmation errors.
- `src/components/layout/DauTrang.jsx`: navigation must show current page and account state clearly.
- `src/components/admin/*`: admin changes should improve scanning, status clarity, and action safety, not make the UI decorative.

## Copy Rules

- Keep Vietnamese labels and domain wording.
- Avoid generic marketing cliches such as "Elevate", "seamless", "next-gen", "game changer", or vague luxury claims.
- Prefer concrete hotel-booking copy: room type, location, guest count, payment status, check-in state, voucher value, invoice state.

## Verification

After frontend changes:

- Run `npm run build` from this `frontend/` folder when feasible.
- Check desktop and mobile responsive layouts for changed screens.
- Confirm text does not overflow buttons, cards, search fields, tables, or modals.
- Confirm no new dependency was imported without being listed in `package.json`.
