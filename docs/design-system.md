# VKS Autoservices Design System Specification

This document details the complete design system extracted from the Stitch project **Remix of VKS Autoservices** (ID: `11348065213552937568`).

---

## 🎨 1. Color Palette & Tokens

### Core Brand Colors
| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `primary` | `#00355F` | Main brand color for dark headers, main CTAs, and primary titles. |
| `primary-container` | `#0F4C81` | Accent brand container color for primary buttons, active tabs, and highlights. |
| `on-primary` | `#FFFFFF` | Text color on primary backgrounds. |
| `on-primary-container` | `#8EBDF9` | Light accent text/icon color on dark primary containers. |
| `secondary` | `#005FAF` | Secondary interactive links and supporting brand elements. |
| `secondary-container` | `#54A0FE` | Light blue container fills for badges, pill tags, and secondary action highlights. |
| `on-secondary-container` | `#003567` | Contrast text on secondary containers. |

### Status & Accent Colors
| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `tertiary` | `#532800` | Deep accent brown/orange for urgent indicators. |
| `tertiary-container` | `#743B00` | Warm orange/amber fill for live countdown timers and auction status badges. |
| `on-tertiary-container` | `#F9A767` | Bright orange highlight text on dark amber tags. |
| `error` | `#BA1A1A` | Error messages, Higher Offer alerts, and destructive actions. |
| `error-container` | `#FFDAD6` | Error banner/badge backgrounds. |

### Surface & Background Tokens
| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `background` | `#F7F9FC` | Global page background color. |
| `surface` | `#F7F9FC` | Card and modal surface base color. |
| `surface-container-lowest` | `#FFFFFF` | Pure white card surfaces for high contrast. |
| `surface-container-low` | `#F2F4F7` | Light grey container fills for section blocks. |
| `surface-container` | `#ECEEF1` | Standard container background for inputs and inactive states. |
| `surface-container-high` | `#E6E8EB` | Elevated surface backgrounds. |
| `surface-container-highest` | `#E0E3E6` | High-contrast borders and container dividers. |
| `on-surface` | `#191C1E` | Primary body text color. |
| `on-surface-variant` | `#42474F` | Secondary body text and label color. |
| `outline` | `#727780` | Primary border color for inputs and cards. |
| `outline-variant` | `#C2C7D1` | Subtle divider and border line color. |

---

## 🔤 2. Typography System

**Font Family**: `Inter`, sans-serif.

| Token Name | Font Size | Line Height | Font Weight | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | `48px` (`3rem`) | `56px` | 700 (Bold) | `-0.02em` | Main hero headlines |
| `display-md` | `36px` (`2.25rem`)| `44px` | 700 (Bold) | `-0.02em` | Section titles, major stat numbers |
| `headline-lg` | `30px` (`1.875rem`)| `38px` | 600 (SemiBold)| Normal | Page headers (Desktop) |
| `headline-lg-mobile`| `24px` (`1.5rem`) | `32px` | 600 (SemiBold)| Normal | Page headers (Mobile) |
| `headline-md` | `24px` (`1.5rem`) | `32px` | 600 (SemiBold)| Normal | Card titles, section headers |
| `body-lg` | `18px` (`1.125rem`)| `28px` | 400 (Regular) | Normal | Hero subtitles, lead paragraphs |
| `body-md` | `16px` (`1rem`) | `24px` | 400 (Regular) | Normal | Standard body copy, form inputs |
| `label-md` | `14px` (`0.875rem`)| `20px` | 500 (Medium) | `0.01em` | Nav links, button text, table headers |
| `label-sm` | `12px` (`0.75rem`) | `16px` | 600 (SemiBold)| `0.05em` | Badges, tags, micro labels |

---

## 📐 3. Layout Grid & Spacing Tokens

- **Max Container Width**: `1280px` (`max-w-container-max`)
- **Desktop Side Margin**: `48px` (`px-margin-desktop`)
- **Mobile Side Margin**: `16px` (`px-margin-mobile`)
- **Gutter Width**: `24px` (`gap-gutter`)
- **Spacing Units**:
  - `unit-xs`: `4px`
  - `unit-sm`: `8px`
  - `unit-md`: `16px`
  - `unit-lg`: `24px`
  - `unit-xl`: `48px`

---

## 🔲 4. Border Radius & Shadows

### Border Radiuses
- `rounded-DEFAULT`: `4px` (`0.25rem`)
- `rounded-lg`: `8px` (`0.5rem`)
- `rounded-xl`: `12px` (`0.75rem`)
- `rounded-2xl`: `16px` (`1rem`)
- `rounded-full`: `9999px`

### Shadows & Visual Effects
- **Card Ambient Shadow**: `box-shadow: 0 4px 15px rgba(15, 76, 129, 0.04)`
- **Card Hover Shadow**: `box-shadow: 0 10px 25px rgba(15, 76, 129, 0.08)`
- **Glassmorphism Navigation**: `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(247, 249, 252, 0.8)`
- **Live Pulse Effect**: Scaling between `1` and `1.05` with opacity fading between `1` and `0.7`.

---

## 🎨 5. Iconography & Assets

- **Icon Set**: Google Material Symbols Outlined (`material-symbols-outlined`).
- **Key Icons Used**: `gavel`, `search`, `tune`, `notifications`, `person`, `directions_car`, `verified`, `history`, `dashboard`, `add_circle`, `timer`, `visibility`, `download`, `share`, `filter_list`, `arrow_forward`, `check_circle`, `shield`.
