# Project Neon Sentinel - UI Specification Configuration

These specifications override the default dashboard UI layout and components to conform to the high-fidelity SF/cyberpunk command center style.

## 1. Glassmorphism Design Tokens

```css
:root {
  --neon-bg: rgba(10, 10, 15, 0.7);
  --neon-blur: blur(20px);
  --neon-border: 1px solid rgba(255, 255, 255, 0.08);
  --neon-glow: box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}
```

## 2. Tactical HUD Configuration

- **Corner Brackets**:
  - Border thickness: `2px`
  - Dimensions: `20px x 20px`
  - Color: `var(--secondary)` (#06b6d4)
  - Glow: `drop-shadow(0 0 4px var(--secondary))`
- **Scanlines**:
  - Repeating height: `4px`
  - Faint black overlay overlaying background views.
- **Grid Points**:
  - Radial point grid: `30px x 30px`
  - Point color: `rgba(255, 255, 255, 0.03)`

## 3. Emissive 2D Map Cylinders (Pillars)

- **Gradient Scale**:
  - `stop-opacity (0%)`: `0.2`
  - `stop-opacity (100%)`: `0.85`
- **LED Top Cap**:
  - Outer neon ellipse: `rx = r`, `ry = r / 3.5`, `color = genreColor`
  - Inner white core: `rx = r * 0.5`, `ry = (r * 0.5) / 3.5`, `color = #ffffff`, `opacity = 0.9`
- **Dynamic Glow Radius**:
  - formula: `glowRadius = Math.max(3, Math.min(20, (score / 100) * 15 + 2)) px`

## 4. Left Panel Structured Asset Table

- **Table Columns**:
  - `ASSET_ID` (Monospace, white text, uppercase)
  - `CURRENT_VALUE` (Monospace, light gray text, custom currency symbols)
  - `CHANGE_24H` (Monospace, color coded: green for positive, red for negative, cyan for zero)
  - `RISK_LEVEL` (Sleek status badge with dynamic neon glow)

- **Risk Levels Mapping Table**:
  | Risk Premium Value | Level Class | Theme Color |
  | ------------------ | ----------- | ----------- |
  | Absolute > 4.0     | `CRITICAL`  | #f43f5e     |
  | Absolute > 2.0     | `HIGH`      | #fb923c     |
  | Absolute > 0.5     | `MEDIUM`    | #f59e0b     |
  | Absolute > 0.0     | `LOW`       | #06b6d4     |
  | Otherwise          | `STABLE`    | #10b981     |

## 5. Glitch Transition & Text Animation

- **News Console Glitch duration**: `400ms` (temporary skew and clip-path inset slice).
- **Price Counter Flicker duration**: `400ms` (flickering opacity and temporary color change).
- **Trigger**: Fired on state updates.
