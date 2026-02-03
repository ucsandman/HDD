# HDD Quote Calculator

A customer-facing deck quote calculator for Hickory Dickory Decks Cincinnati.

## Features

- **Dimension Input**: Length x width with live square footage calculation
- **Material Selection**: Trex Select, Enhance, Transcend + TimberTech PRO, AZEK
- **Features/Add-ons**: Railing, stairs, lighting, pergola, built-in seating, skirting
- **Height Adjustment**: Ground level to second story pricing
- **Instant Estimates**: Low-high range with detailed breakdown
- **Mobile Responsive**: Works great on phones

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main calculator page |
| `styles.css` | All styling |
| `config.js` | Pricing configuration |
| `calculator.js` | Calculation logic |

## Setup

1. Open `config.js` and adjust:
   - `franchise.phone` - Your phone number
   - `franchise.website` - Your website URL
   - `basePricePerSqFt` - Base pricing (adjust for your market)
   - Material multipliers - Adjust based on current costs
   - Feature pricing - Adjust based on your rates

2. Open `index.html` in a browser - no build step required!

## Pricing Configuration

The calculator uses a layered pricing model:

```
Total = (SqFt × BasePrice × MaterialMultiplier) + HeightAdjustment + Features
```

### Base Price
Default: $45-55/sqft for ground-level deck with entry composite

### Material Multipliers
- Trex Select: 1.0x (baseline)
- Trex Enhance: 1.15x
- Trex Transcend: 1.35x
- TimberTech PRO: 1.25x
- TimberTech AZEK: 1.55x

### Height Adjustments (flat fees)
- Ground (0-2 ft): $0
- Low (2-4 ft): $800-1,200
- Medium (4-8 ft): $2,000-3,500
- High (8+ ft): $4,500-7,000

### Features
All features have low-high ranges. Perimeter-based features (railing, skirting) scale with deck size.

## Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
  --primary: #8B4513;      /* Main brand color */
  --accent: #228B22;       /* Buttons, highlights */
  --bg: #FAF8F5;          /* Page background */
}
```

### Add Materials
In `config.js`, add to `materials` object:
```javascript
"new-material": {
  name: "Display Name",
  multiplier: 1.2,
  description: "Description text"
}
```

Then add matching radio button in `index.html`.

### Add Features
In `config.js`, add to `features` object:
```javascript
"new-feature": {
  name: "Display Name",
  low: 1000,
  high: 2000,
  perLinearFoot: false,
  description: "Short description"
}
```

Then add matching checkbox in `index.html`.

## Disclaimer

This provides rough estimates only. Always emphasize that actual quotes require on-site consultation. The disclaimer is built into the results display.

## Integration

### Google Analytics
The calculator fires a `quote_calculated` event with:
- `sqft` - Square footage
- `material` - Selected material
- `estimate_low` - Low estimate
- `estimate_high` - High estimate

Add your GA4 snippet to `index.html` to track.

### Lead Capture
Consider adding a "Save Quote & Get Follow-up" form that captures:
- Name
- Email/Phone
- Quote details
- Preferred contact method

This could submit to your CRM or lead management system.
