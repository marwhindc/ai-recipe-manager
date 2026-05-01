# Design System: Saffron / AI Recipe Manager
**Reference Project:** Culinary-Canvas › artifacts/saffron

---

## 1. Visual Theme & Atmosphere

Warm, intimate, and editorial. The app feels like a well-kept recipe notebook — analog warmth expressed through digital type and clean structure. The palette leans into earthy spice tones (saffron, paprika, olive) laid over a near-white cream background, giving every screen a soft, naturally lit quality. Density is deliberately low: generous whitespace, open grids, and breathing room between sections create a calm, unhurried experience. The mobile column is capped at 440 px and floats as a rounded "phone slab" on desktop, framed by a warm radial gradient backdrop — reinforcing the feeling of a personal, contained cooking companion rather than a sprawling web app.

---

## 2. Color Palette & Roles

| Descriptive Name | Hex | HSL Token | Functional Role |
|---|---|---|---|
| **Warm Saffron** | `#f0a83c` | `38 85% 62%` | Accent color, gradient highlights, "New" badge backgrounds |
| **Spiced Paprika** | `#e07255` | `14 72% 62%` | Primary action color — active nav tab, focus rings, CTA buttons, icon tints |
| **Dusty Olive** | `#6e7d45` | `95 28% 42%` | Supportive accent for secondary labels and tags |
| **Parchment Cream** | `#faf7f2` | `36 38% 97%` | App background and column fill — the "page" of the notebook |
| **Deep Espresso** | `#3d3028` | `24 14% 22%` | Primary text, headings, active pill labels — near-black with warmth |
| **Soft Border** | `#e8dfd4` | `30 20% 90%` | Dividers, card outlines, input strokes — whisper-quiet separation |
| **Muted Stone** | `#ede8e1` | `30 20% 94%` | Chip backgrounds, skeleton loaders, secondary surfaces |
| **Faded Slate** | `#918880` | `24 8% 46%` | Secondary text, timestamps, metadata labels |
| **Pure White** | `#ffffff` | `0 0% 100%` | Card surfaces, input backgrounds, icon container fills |

### Usage notes
- **Paprika** (`#e07255`) is the single primary accent — used sparingly and intentionally on the most important interactive elements.
- **Espresso** (`#3d3028`) on a **Cream** (`#faf7f2`) background is the default reading pair for all body content.
- Active filter pills invert to **Espresso** background with **Cream** text — not paprika — giving a high-contrast but warm toggle state.
- Gradient surfaces (Add Recipe sheet featured card) blend Saffron and Paprika at low opacity (`/30`, `/20`) for a sun-warmed glow rather than a solid color block.

---

## 3. Typography Rules

**Typeface:** Plus Jakarta Sans exclusively — a single geometric humanist sans-serif used for every typographic role. There is no decorative serif; all hierarchy is achieved through weight, size, and tracking alone.

**Weight scale:**
- `400` (Regular) — body text, ingredient lists, descriptions, metadata
- `500` (Medium) — UI labels, filter chips, tab bar labels, card subtitles
- `600` (SemiBold) — section headings, page titles
- `700` (Bold) — display headings (`.font-serif`/`.font-display` classes), drawer titles, recipe card names
- `800` (ExtraBold) — reserved for the app wordmark "Saffron" and major hero numbers

**Display heading style (`.font-display`):**
- Font weight: `700`
- Letter spacing: `-0.02em` (tight — pulls letterforms together for editorial authority)
- Applied to: page H1/H2 headings, recipe card titles, drawer action titles, section labels

**Body / UI text style:**
- Letter spacing: default (`0`) — no adjustment
- Line height: `leading-tight` for card titles (prevents widow lines in 2-column grid), `leading-relaxed` for paragraph content in recipe detail

**Micro-label style:**
- `text-xs` + `uppercase` + `tracking-[0.18em]` (very wide) + `font-medium`
- Used for section eyebrows like "YOUR LIBRARY" above a count heading
- Creates a strong typographic rhythm pairing wide micro-caps with a tightly-tracked display heading directly below

**Size hierarchy (mobile):**
- App title / hero: `text-3xl` (30 px) — weight 600
- Page H2 / section count: `text-2xl` (24 px) — weight 700, display tracking
- Card titles: `text-base` (16 px) — weight 700, display tracking, `line-clamp-2`
- Body / descriptions: `text-sm` (14 px) — weight 400
- Metadata / chips / tabs: `text-xs` (12 px) — weight 500 or 600
- Micro eyebrow labels: `text-xs` + `tracking-[0.18em]` + uppercase

---

## 4. Component Stylings

### Buttons — Primary (FAB)
- Shape: Perfect circle (`rounded-full`), 56 × 56 px (`w-14 h-14`)
- Background: Paprika (`bg-paprika`)
- Icon: White, 24 px
- Shadow: `shadow-lg shadow-paprika/30` — warm-tinted drop shadow, not neutral grey
- Hover / press: `active:scale-95 transition-transform` — subtle haptic-feeling press-down
- Positioned: `fixed bottom-[84px] right-5` — sits just above the bottom tab bar

### Buttons — Primary Text (CTA)
- Shape: Pill-shaped (`rounded-full`), full width in forms
- Background: Paprika (`bg-paprika`)
- Text: White, `text-sm font-semibold`
- Padding: `px-6 py-3`

### Buttons — Secondary / Outline
- Shape: Pill-shaped (`rounded-full`)
- Background: White (`bg-white`)
- Border: 1 px Soft Border (`border border-border`)
- Text: Espresso
- Hover: `hover:bg-neutral-50`

### Buttons — Ghost Icon (back button, close button)
- Shape: Circle, `w-10 h-10` (40 px)
- Background: `bg-white/90 backdrop-blur`
- Icon: Espresso, 22 px
- Shadow: `shadow-md` when floating over imagery

### Filter / Category Pills
- Shape: Pill-shaped (`rounded-full`), `px-4 py-1.5`
- Inactive: White background, Espresso text, Soft Border stroke
- Active: Espresso background, Cream text, no visible stroke
- Size: `text-sm`, does not change size on activation — only fill/color flips
- Scroll: Horizontally scrollable row with `no-scrollbar`, `-mx-6 px-6` bleed to card edge

### Cards — Recipe Card (grid)
- Shape: Square aspect ratio image (`aspect-square`), **generously rounded corners** (`rounded-2xl` = 16 px)
- Image: Full-bleed `object-cover`, `group-hover:scale-105 duration-500` subtle zoom
- Shadow: `shadow-sm` at rest, `shadow-md` on hover
- Overlay: `bg-gradient-to-t from-black/40` appears on hover at `opacity-0 → opacity-100`
- Title: Below image, `font-serif font-medium` (700 weight), Espresso, `line-clamp-2`
- Metadata row: `text-xs text-muted-foreground font-medium` with Clock icon inline
- Background: `bg-muted` (stone) fills image area while loading
- Favorite badge: Small circle (`w-7 h-7 rounded-full bg-white/90 backdrop-blur`), top-right corner

### Cards — Action Sheet Options (Add Recipe drawer)
- Shape: **Very generously rounded** (`rounded-[1.5rem]` = 24 px)
- Featured card (Generate AI): Warm gradient fill — `from-saffron/30 via-paprika/10 to-paprika/20`, `border-saffron/30`
- Standard card (From scratch, Import): White background, Soft Border stroke
- Icon container: `w-12 h-12 rounded-2xl` — squircle feel, white fill with `shadow-sm` or `bg-paprika/10`
- Press state: `active:scale-[0.99]` — almost imperceptible scale-down for touch feedback

### Bottom Navigation Bar
- Background: `bg-white/95 backdrop-blur-md` — frosted glass effect, not fully opaque
- Top border: `border-t border-black/5` — near-invisible hairline
- Tab items: Icon (`24 px`) stacked above label (`text-[10px]`)
- Inactive: `text-muted-foreground`, strokeWidth `2`
- Active: `text-paprika`, `scale-110`, strokeWidth `2.5` (slightly bolder icon), dot indicator `w-1 h-1 bg-paprika rounded-full` anchored 2 px below icon
- Safe area: `paddingBottom: calc(env(safe-area-inset-bottom, 0px) + 12px)`

### Search Bar
- Shape: Pill-shaped (`rounded-full`), full width
- Background: White, 1 px Soft Border
- Shadow: `shadow-sm`
- Icon: Search (18 px), Faded Slate, absolutely positioned left-4
- Clear button: Circle icon button, right-3, appears only when query is non-empty
- Focus ring: `focus:ring-2 focus:ring-paprika/40` — warm paprika ring at 40 % opacity

### Add Recipe Drawer (Vaul)
- Handle: `w-12 h-1.5 rounded-full bg-black/10` — centered pill drag indicator
- Header corner: `rounded-t-[28px]` — very gentle curve meeting screen edges
- Background: Cream (`bg-cream`)
- Overlay: `bg-black/40`

### Inputs / Forms
- Shape: `rounded-xl` (12 px) for multi-line / form inputs
- Background: White, 1 px Soft Border
- Label: `text-sm font-medium text-espresso` above the input
- Focus: Paprika ring (`ring-paprika/40`)
- Helper/error text: `text-xs text-muted-foreground` below input

---

## 5. Layout Principles

### Mobile Column Shell
The app renders inside a centered `max-width: 440px` column (`.app-column`) that spans full viewport height using `height: 100dvh`. On desktop (≥ 768 px), the column floats with a warm box-shadow (`0 30px 80px -20px rgba(54,36,22,0.18)`) and rounded corners (`border-radius: 32px`), capped to `min(880px, 100dvh - 32px)` in height. The desktop backdrop is a radial-gradient saffron/paprika wash at low opacity — not a grey or neutral fill.

### Page Gutters
- Horizontal: `px-6` (24 px) on all page content — consistent, never narrower
- Top: `pt-6` (24 px) for the first content block beneath any sticky or absolute header
- Bottom: Pages that scroll below the bottom nav pad by `pb-28` (112 px) to prevent content hiding behind the tab bar

### Section Spacing
- Between major page sections: `space-y-6` (24 px vertical gap)
- Between related content items (card subtitle lines, metadata rows): `space-y-1` (4 px)
- Between list items: `gap-4` in vertical lists, `gap-3` in inline metadata rows
- Card grid: `grid-cols-2 gap-4` — two columns with 16 px gutters

### Hierarchy Pattern: Eyebrow + Display Heading
Repeat this two-line pattern to open each major content section:
1. Micro-label: `text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium`
2. Display heading: `font-serif text-2xl text-espresso leading-tight` directly below with no gap (`space-y-1`)

This pairing creates a strong rhythmic anchor at the top of every scrollable section.

### Hero Images
- Height: `h-[340px]` (fixed, not aspect-ratio) — tall enough to be cinematic on a phone
- Overlay: `bg-gradient-to-b from-black/30 to-transparent` — top-heavy scrim to allow white back/action buttons to remain legible over any image
- Floating controls: Positioned `top-4` with `px-6` alignment to page gutters

### Elevation and Layering
The UI is predominantly flat with minimal layering signals:
- Cards: `shadow-sm` at rest — whisper-soft, barely perceptible elevation (1–2 px diffuse)
- Hover / active cards: `shadow-md` — slight lift, not dramatic
- Floating action buttons: `shadow-lg shadow-paprika/30` — warm-tinted, intentional lift
- Bottom tab bar: No shadow; the hairline `border-black/5` top border is sufficient
- Modals / sheets: `bg-black/40` overlay creates depth contrast without heavy shadow styling on the sheet itself

### Scrolling
- All scrollable areas suppress native scrollbars via `.no-scrollbar`
- Horizontal scroll rows (filter chips) use `-mx-6 px-6` to bleed to screen edge while keeping content padded
- `overscroll-behavior-y: none` on body prevents rubber-band bounce from interfering with the drawer pull gesture
