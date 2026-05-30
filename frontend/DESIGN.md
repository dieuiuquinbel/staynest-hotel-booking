# DieuBel UI Design Guide

Use this as the design reference when improving the frontend.

## Brand Position

DieuBel should feel like a trustworthy Vietnamese hotel booking product: clear enough for first-time travelers, polished enough for premium stays, and efficient enough for reception/admin work.

## Palette

Base:

- Page background: white or warm-neutral off-white.
- Text: near-black neutral, not pure black for large surfaces.
- Borders: soft neutral lines with enough contrast.
- Accent: use the existing `brand` red/pink palette consistently.

Avoid:

- Random purple/blue AI gradients.
- Too many accent colors.
- Sudden unrelated dark sections in an otherwise light flow.
- Heavy black shadows on white cards.

## Public Pages

Prioritize:

- Large room/destination imagery.
- Clear search entry.
- Strong page headings with balanced line breaks.
- Trust signals near booking actions.
- Price, availability, amenities, and policies shown before commitment.

Good patterns:

- Image-led hero with search panel.
- Asymmetric destination grid.
- Room cards with stable image ratio and clear primary action.
- Sticky or repeated booking summary on long booking pages.
- Calm confirmation and payment states.

Avoid:

- Generic equal three-card feature rows everywhere.
- Decorative cards that do not help booking.
- Text-heavy sections without imagery or clear actions.

## Admin Pages

Prioritize:

- Fast scanning.
- Status labels that are visually distinct and consistent.
- Dense but readable grids.
- Clear primary action placement.
- Confirmation before risky actions.
- Empty, loading, and error states that explain what happened.

Good patterns:

- Compact metric tiles with tabular numbers.
- Filter bars that do not wrap awkwardly.
- Tables/lists with aligned status and action columns.
- Detail panels or split views for booking/customer/room management.

Avoid:

- Oversized marketing-style cards.
- Decorative motion.
- Low-contrast status chips.
- Layouts that hide important admin actions below the fold.

## Component Standards

Buttons:

- Primary buttons use the brand accent.
- Secondary buttons use neutral surfaces and clear borders.
- Destructive actions need distinct but restrained styling.
- Add hover, focus, active, and disabled states.

Cards:

- Use cards for rooms, booking summaries, admin records, and detail panels.
- Keep card radius consistent.
- Prefer subtle tinted shadows or borders; avoid generic `shadow-md`.

Forms:

- Labels must stay visible and clear.
- Required/error states must be inline.
- Inputs must have visible focus states.
- Mobile fields must remain easy to tap.

Images:

- Use meaningful `alt` text.
- Keep stable aspect ratios.
- Avoid overly dark overlays that make rooms hard to inspect.

Motion:

- Use subtle fade/translate for entrances only when it helps.
- Keep booking/admin interactions responsive.
- Respect reduced-motion if adding larger animation systems.

## Review Checklist

Before finishing a UI change, check:

- The page still works with current API/state logic.
- The design uses one visual language and one accent system.
- Mobile layout is not an afterthought.
- Vietnamese text fits and reads naturally.
- Loading, empty, error, hover, focus, active, and disabled states are handled where relevant.
- Build passes.
