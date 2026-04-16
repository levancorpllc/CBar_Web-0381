# C-Bar Design Direction

## Brand
- Company: Levancorp / C-Bar product
- Style: Industrial precision, high-tech, minimal

## Colors
- Background: `#08091a` (very dark navy)
- Primary Blue: `#404B71` (brand navy, EDR R:0.251 G:0.302 B:0.443)
- Accent Blue: `#5a6a9e` (lighter variant for highlights)
- Bright Accent: `#7eb3ff` (electric blue for annotation dots/lines)
- White: `#ffffff`
- Muted Text: `#8892b0`
- Border/Divider: `rgba(90, 106, 158, 0.3)`

## Typography
- Display: 'Barlow Condensed' — tight, industrial, impactful
- Body/Labels: 'Barlow' — clean, technical
- Mono/Specs: 'JetBrains Mono' — for spec callouts

## Layout
- Full viewport sticky scroll section
- Product image centered, large, shadow-lit against dark bg
- Annotations: dot + horizontal line + label, fading in/out per scroll stage
- Left/right annotations for balance
- No rounded cards, no gradients — geometric, precise

## Motion
- Scroll-driven image swap (7 frames = rotation illusion)
- Annotations fade+slide in with CSS transitions
- Progress bar showing scroll stage
- Subtle parallax on background elements

## Aesthetic
- Like an aerospace/industrial product spec sheet brought to life
- Think: Apple product page meets engineering datasheet
