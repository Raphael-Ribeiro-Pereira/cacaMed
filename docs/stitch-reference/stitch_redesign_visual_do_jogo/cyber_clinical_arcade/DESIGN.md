---
name: Cyber Clinical Arcade
colors:
  surface: '#0c1322'
  surface-dim: '#0c1322'
  surface-bright: '#323949'
  surface-container-lowest: '#070e1d'
  surface-container-low: '#141b2b'
  surface-container: '#191f2f'
  surface-container-high: '#232a3a'
  surface-container-highest: '#2e3545'
  on-surface: '#dce2f7'
  on-surface-variant: '#b9cac4'
  inverse-surface: '#dce2f7'
  inverse-on-surface: '#293040'
  outline: '#83948f'
  outline-variant: '#3a4a46'
  surface-tint: '#00dfc1'
  primary: '#d7fff3'
  on-primary: '#00382f'
  primary-container: '#00f5d4'
  on-primary-container: '#006c5c'
  inverse-primary: '#006b5b'
  secondary: '#ffb2ba'
  on-secondary: '#670020'
  secondary-container: '#d4004b'
  on-secondary-container: '#ffe6e8'
  tertiary: '#fff4ec'
  on-tertiary: '#472a00'
  tertiary-container: '#ffd29f'
  on-tertiary-container: '#865400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#26fedc'
  primary-fixed-dim: '#00dfc1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#ffd9dc'
  secondary-fixed-dim: '#ffb2ba'
  on-secondary-fixed: '#400011'
  on-secondary-fixed-variant: '#910030'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0c1322'
  on-background: '#dce2f7'
  surface-variant: '#2e3545'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: 0.05em
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an electric, high-energy gamified medical environment—the "Cyber-Hospital Arcade". It balances rigor with high-tempo play, transforming clinical diagnostics, emergency room triage, and medical crosswords into an exhilarating tactical quest. The target audience comprises medical students, residents, and healthcare professionals who navigate high-stress environments and crave dopamine-rich, intellectually stimulating micro-learning sessions.

The aesthetic fuses **Tactile Glassmorphism** with **Futuristic Neon HUDs**:
- Deep, low-fatigue slate backgrounds punctuated by translucent diagnostic viewports.
- Neon vital telemetry glows (ECG lines, pulse monitors, reactive status halos).
- Rich gamification elements: chunky action surfaces, pressurized emergency switches, collectible diagnosis cards, and luminous XP progress modules.
- The interface feels responsive, tactile, and game-native—replacing sterile clinical software with an engaging, arcade-grade simulation experience.

## Colors

The palette operates strictly in dark mode, layering deep slate substrates with radiant chromatic accents:

- **Substrates & Dark Slate Bases:**
  - Canvas Deep: `#0B0F19` (main atmospheric background)
  - Surface Mid: `#111827` (card baselines, toolbars)
  - Surface Elevated: `#1A2234` (glass sheets, modal viewports, drawers)
  - Ghost Grid Lines: `rgba(255, 255, 255, 0.04)` and subtle ECG pulse traces.

- **Vital Neon Mint (Primary - `#00F5D4` / `#06D6A0`):** Represents stabilized patient vitals, correct crossword links, primary confirmation triggers, and active diagnostic channels. Glow effect: `0 0 16px rgba(0, 245, 212, 0.35)`.

- **Electric Crimson (Secondary - `#FF3366` / `#FF4B6E`):** Represents the Red Room (Sala Vermelha), critical decompensation, countdown pressure, and wrong clinical turns. Glow effect: `0 0 16px rgba(255, 51, 102, 0.45)`.

- **Radiant Amber (Tertiary - `#F59E0B` / `#FFB703`):** Represents XP yield, residency rank promotions, streak counters, gold coins, and achievement trophies.

- **Electrifying Violet (Accent / Specialty - `#8B5CF6` / `#7209B7`):** Assigned to rare clinical cases, differential diagnosis (DDX) power-ups, mystery syndromic packs, and legendary flashcards.

## Typography

The typographic hierarchy pairs friendly geometric curves with surgical monospace precision:

- **Display & Interface Headings (`Plus Jakarta Sans`):** Selected for its punchy, modern geometric curves. It keeps intense medical scenarios approachable, high-spirited, and legible during fast-paced play.
- **Body & Clinical Descriptions (`Plus Jakarta Sans`):** Ensures clear readability for intricate clinical vignettes, drug interactions, and crossword clues at rapid glance speeds.
- **Telemetry, Timers, and Badges (`JetBrains Mono`):** Delivers authentic clinical telemetry aesthetics. Used for vital signs (BPM, SpO2, MAP), game timers, turn trackers, and diagnostic codes (ICD/CID markers). Numbers remain strictly tabular to eliminate layout shifts during live count-ups or countdowns.

## Layout & Spacing

The layout is built on a responsive 12-column dynamic grid on desktop and tablet (collapsing to 4 columns on mobile handsets). It maintains comfortable thumb clearance zones for game actions during mobile triage shifts.

- **Breakpoints:**
  - **Mobile (<768px):** 4-column layout, bottom-sheet command bars, dock-anchored quick actions, strict 16px edge margins.
  - **Tablet (768px - 1024px):** 8-column layout, split-pane mode (clinical case dossier on left, crossword/interactive triage deck on right).
  - **Desktop (>1024px):** 12-column layout with a maximum container cap of 1280px to preserve arcade density without sparse, empty voids.

Vertical spacing strictly respects an 8px modular baseline (`0.5rem`, `1rem`, `1.5rem`, `2.5rem`). Component clusters—such as telemetry readouts or crossword matrices—use dense `space-xs` (4px) and `space-sm` (8px) micro-spacings to reinforce a rich, mechanical HUD feel.

## Elevation & Depth

Visual hierarchy uses **Glassmorphic Tiers with Chromatic Edge Radiation**:

1. **Floor Level (Level 0 - Substrate):** `#0B0F19` with a subtle vector grid overlay (`#1A2234` at 35% opacity) and an ambient, low-opacity radial cyan/violet glow anchored behind active sectors.
2. **Clinical Tray Level (Level 1 - Structural Cards):** `#111827` mixed with 70% opacity, `backdrop-filter: blur(16px)`, surrounded by a 1px frosted border `rgba(255, 255, 255, 0.08)`.
3. **Interactive Station Level (Level 2 - Focused Nodes, Selectable Diagnostics):** `#1A2234` at 85% opacity, `backdrop-filter: blur(24px)`, paired with a tinted rim light matched to its status (e.g., `0 0 12px rgba(0, 245, 212, 0.2)` for active telemetry).
4. **Emergency / Spotlight Tier (Level 3 - Floating Modals, Red Alert Overlays):** `#1A2234` solid surface with outer directional drop shadows: `0 16px 32px -4px rgba(0, 0, 0, 0.65)`, complemented by dynamic pulsating perimeter glows during critical states (Crimson Pulse for Sala Vermelha).

## Shapes

The design uses a roundedness index of **2 (Rounded)**:
- Standard buttons, input fields, and patient summary panels use `0.5rem` (8px) base radius.
- Cards, crossword tiles, and diagnostic monitors adopt `rounded-lg` (`1rem` / 16px).
- Modal dialogs, triage trays, and specialty card dossiers use `rounded-xl` (`1.5rem` / 24px).
- Pill shapes (`9999px`) are reserved exclusively for status badges (e.g., "STÁVEL", "PARADA", "VIP CASE"), vital pill counters, and gamified streak indicators.

Crossword cells use rounded squares (`6px` border-radius) with inset shadows to emulate physical, tactile arcade keyboard buttons.

## Components

### Buttons & Arcade Action Triggers
- **Primary Arcade Action:** Bold Vital Mint gradient (`linear-gradient(135deg, #00F5D4, #06D6A0)`), high-contrast dark text (`#0B0F19`), font weight 700. Features a 3D tactile bottom bevel (`box-shadow: 0 4px 0 #00B89F, 0 8px 20px rgba(0, 245, 212, 0.35)`). On active press, the button drops by 3px with shadow compression.
- **Critical / Sala Vermelha Action:** Intense Crimson fill (`#FF3366`), white bold text, paired with an oscillating perimeter aura (`0 0 14px rgba(255, 51, 102, 0.5)`).
- **Secondary Glass Ghost:** Background `rgba(26, 34, 52, 0.6)`, frosted border `1px solid rgba(255, 255, 255, 0.12)`, text color `#E2E8F0`.

### Crossword & Medical Grid Tiles
- Standard tile: Dark Slate (`#1A2234`) with a sharp inner surface `1px solid rgba(255, 255, 255, 0.06)`. Lettering in uppercase `Plus Jakarta Sans` Bold.
- Selected tile: Outlined with a 2px Vital Mint border and soft inner backlight.
- Solved state: Glows vibrant mint with dark text for clear instant feedback.
- Critical error state: Quick 300ms red horizontal shake animation with crimson border flare.

### Diagnostic Cards & DDX Decks
- Framed in frosted glass (`backdrop-filter: blur(20px)`).
- Top header carries an integrated telemetry stripe (ECG ticker or case severity gauge).
- Rare/Legendary clinical cases use an animated chromatic border gradient cycling between Neon Purple (`#8B5CF6`) and Radiant Amber (`#F59E0B`).

### Resident Badges & Rank Trackers
- Compact pill indicators with high-contrast JetBrains Mono text.
- Rank tiers: Intern (Slate/Cyan outline), Junior Resident (Mint filled), Chief Resident (Amethyst Violet), Medical Attending (Radiant Amber with particle shimmer).

### Progress & Vitals Bars
- 8px to 12px height with full track rounding.
- Background track uses `#0B0F19` with inset depth. Fill is an illuminated dual-stop gradient with an animated diagonal scanline pattern.
- Patient Health Indicator transitions smoothly along a color scale: Mint (>70%) to Amber (30–69%) to Crimson (<30%).

### Inputs & Medical Search Fields
- Dark glass fields (`#111827` at 80% opacity) with embedded left-side telemetry icons (stethoscope, search lens, pill capsules).
- Focus state activates an illuminated cyan underline and border glow with zero delay.