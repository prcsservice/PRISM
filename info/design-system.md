# PRISM Design System
Version 1.0 — Complete Visual Language & Page Specifications

---

# 1. Design Philosophy

The PRISM interface follows a **high-contrast editorial** aesthetic inspired by premium product sites and modern SaaS dashboards. The design language is built on:

- **Black + White + Gold (#FECC2D)** — a restrained 3-color palette
- **Subtly rounded corners** — consistent 8px border radius on cards and containers, 6px on smaller elements
- **Bento grid layouts** — asymmetric, dense, information-rich card grids
- **Geometric animated elements** — custom SVG shapes, rotating prisms, pulsing grids
- **Reveal-on-scroll animations** — staggered fade-up, clip-path reveals, counter animations
- **No emoji anywhere** — use custom geometric icons or Lucide icons only
- **Dense, intentional white space** — generous padding inside cards, tight gaps between them

---

# 2. Color System

## Core Palette

| Token               | Value       | Usage                                                |
|----------------------|-------------|------------------------------------------------------|
| `--bg-primary`       | `#000000`   | Page backgrounds, navbar, footer, sidebar            |
| `--bg-secondary`     | `#0A0A0A`   | Cards on dark backgrounds, elevated surfaces         |
| `--bg-tertiary`      | `#141414`   | Subtle card differentiation, hover states on dark    |
| `--bg-light`         | `#FFFFFF`   | Light mode backgrounds, cards on light-bg sections   |
| `--bg-off-white`     | `#F5F5F0`   | Alternate section backgrounds (landing page)         |
| `--accent`           | `#FECC2D`   | Primary accent — CTAs, active states, highlights     |
| `--accent-hover`     | `#E5B828`   | Accent hover state                                   |
| `--accent-muted`     | `#FECC2D1A` | Accent at 10% opacity — subtle backgrounds           |
| `--text-primary`     | `#FFFFFF`   | Primary text on dark backgrounds                     |
| `--text-secondary`   | `#A0A0A0`   | Secondary/muted text on dark backgrounds             |
| `--text-dark`        | `#0A0A0A`   | Primary text on light backgrounds                    |
| `--text-dark-muted`  | `#6B6B6B`   | Muted text on light backgrounds                      |
| `--border`           | `#1F1F1F`   | Default borders on dark backgrounds                  |
| `--border-light`     | `#E5E5E5`   | Borders on light backgrounds                         |

## Semantic Colors (Dashboard Only)

| Token             | Value       | Usage                              |
|--------------------|-------------|-------------------------------------|
| `--risk-low`       | `#22C55E`   | Low risk badges, positive trends    |
| `--risk-moderate`  | `#FECC2D`   | Moderate risk (uses accent)         |
| `--risk-high`      | `#EF4444`   | High risk badges, critical alerts   |
| `--trend-up`       | `#22C55E`   | Positive trend indicators           |
| `--trend-down`     | `#EF4444`   | Negative trend indicators           |

---

# 3. Typography

## Font Stack

| Role      | Font         | Source       |
|-----------|--------------|--------------|
| Headings  | **Inter**    | Google Fonts |
| Body      | **Inter**    | Google Fonts |
| Mono/Data | **JetBrains Mono** | Google Fonts |

## Type Scale

| Token    | Size    | Weight | Line Height | Letter Spacing | Usage                              |
|----------|---------|--------|-------------|----------------|------------------------------------|
| `h1`     | 72px    | 800    | 1.0         | -0.03em        | Landing hero headline              |
| `h2`     | 48px    | 700    | 1.1         | -0.02em        | Section headlines                  |
| `h3`     | 32px    | 700    | 1.2         | -0.01em        | Card titles, subsection heads      |
| `h4`     | 24px    | 600    | 1.3         | 0              | Dashboard section titles           |
| `h5`     | 18px    | 600    | 1.4         | 0              | Card headers                       |
| `body`   | 16px    | 400    | 1.6         | 0              | Body text                          |
| `small`  | 14px    | 400    | 1.5         | 0              | Secondary info, table cells        |
| `xs`     | 12px    | 500    | 1.4         | 0.05em         | Labels, badges, metadata           |
| `mono`   | 36px    | 700    | 1.0         | -0.02em        | Large data numbers (metric cards)  |
| `mono-sm`| 14px    | 500    | 1.4         | 0              | Small data, code snippets          |

## Text Styling Rules

- **Uppercase tracking** — Section labels use `text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; font-weight: 500`
- **No emoji** — Replace with geometric Lucide icons or custom SVG icons
- **Mono for numbers** — All numerical data (scores, percentages, counts) use JetBrains Mono

---

# 4. Spacing & Layout

## Spacing Scale (8px base)

| Token   | Value |
|---------|-------|
| `xs`    | 4px   |
| `sm`    | 8px   |
| `md`    | 16px  |
| `lg`    | 24px  |
| `xl`    | 32px  |
| `2xl`   | 48px  |
| `3xl`   | 64px  |
| `4xl`   | 96px  |
| `5xl`   | 128px |

## Grid System

| Context        | Columns | Gap   | Max Width | Padding (horizontal) |
|----------------|---------|-------|-----------|----------------------|
| Landing page   | 12      | 8px   | 1440px    | 64px                 |
| Dashboard      | 12      | 16px  | 100%      | 24px                 |
| Bento grids    | Varied  | 8px   | 100%      | 0                    |
| Mobile         | 4       | 8px   | 100%      | 16px                 |

## Card Specifications

| Property       | Value                              |
|----------------|------------------------------------|
| Border radius  | **10px** on large cards, **8px** on standard cards |
| Border         | 1px solid `var(--border)`          |
| Padding        | 24px–32px                          |
| Background     | `var(--bg-secondary)` on dark, `var(--bg-light)` on light |
| Hover          | Border transitions to `var(--accent)`, slight translate-y -2px |

---

# 5. Component Specifications

## 5.1 Buttons

### Primary Button
```
background: var(--accent)
color: #000000
padding: 14px 32px
border: none
border-radius: 8px
font-weight: 600
font-size: 14px
letter-spacing: 0.02em
text-transform: uppercase
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
hover: background darkens to var(--accent-hover), translate-y -1px
```

### Secondary Button (Outline)
```
background: transparent
color: var(--text-primary)
padding: 14px 32px
border: 1px solid var(--border)
border-radius: 8px
hover: border-color transitions to var(--accent), color to var(--accent)
```

### Ghost Button
```
background: transparent
color: var(--text-secondary)
padding: 8px 16px
border: none
hover: color transitions to var(--text-primary)
```

## 5.2 Input Fields
```
background: var(--bg-tertiary)
border: 1px solid var(--border)
border-radius: 6px
padding: 14px 16px
color: var(--text-primary)
font-size: 14px
focus: border-color var(--accent), box-shadow 0 0 0 1px var(--accent)
```

## 5.3 Risk Badges (Sharp Pill)
```
padding: 4px 12px
border-radius: 6px
font-size: 12px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.05em

Low:      bg: #22C55E1A  color: #22C55E  border: 1px solid #22C55E33
Moderate: bg: #FECC2D1A  color: #FECC2D  border: 1px solid #FECC2D33
High:     bg: #EF44441A  color: #EF4444  border: 1px solid #EF444433
```

## 5.4 Metric Cards (Dashboard)
Inspired by images 2, 3, 4 — large mono numbers with trend indicators.
```
layout: vertical stack
  [uppercase-label]    — 12px, 500, tracking 0.1em, var(--text-secondary)
  [large-number]       — 36px, JetBrains Mono, 700, var(--text-primary)
  [trend-row]          — inline: arrow-icon + percentage + "vs last week"
  [mini-chart]         — optional sparkline or bar visualization

border: 1px solid var(--border)
padding: 24px
background: var(--bg-secondary)
min-height: 120px
```

## 5.5 Data Tables
```
header:   bg var(--bg-tertiary), uppercase 12px labels, font-weight 500
rows:     border-bottom 1px solid var(--border), padding 16px vertical
hover:    row background var(--bg-tertiary)
text:     14px, var(--text-primary) for main, var(--text-secondary) for secondary
no zebra striping — use border only
```

## 5.6 Charts
```
Recharts with custom theme:
  - Area/line charts: stroke var(--accent), fill var(--accent) at 10% opacity
  - Bar charts: fill #FFFFFF (white bars on dark bg), active bar var(--accent)
  - Grid lines: var(--border) at 0.3 opacity, dashed
  - Axis text: var(--text-secondary), 12px, JetBrains Mono
  - Tooltip: bg var(--bg-secondary), border var(--border), sharp corners
```

## 5.7 Navigation Tabs
```
inactive: color var(--text-secondary), border-bottom 2px transparent
active:   color var(--text-primary), border-bottom 2px var(--accent)
hover:    color var(--text-primary)
font:     14px, 500
transition: 0.2s ease
```

## 5.8 Sidebar (Dashboard)
```
width: 260px (expanded), 72px (collapsed)
background: var(--bg-primary)
border-right: 1px solid var(--border)
padding: 24px 16px

nav-item:
  padding: 12px 16px
  color: var(--text-secondary)
  font-size: 14px, weight 500
  icon: 20px Lucide, margin-right 12px
  hover: color var(--text-primary), bg var(--bg-tertiary)
  active: color var(--accent), bg var(--accent-muted), border-left 2px solid var(--accent)

collapse-toggle: bottom of sidebar, icon-only button
transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

## 5.9 Top Navbar (Dashboard)
```
height: 64px
background: var(--bg-primary)
border-bottom: 1px solid var(--border)
padding: 0 24px

left:   breadcrumb (Dashboard > Overview) — 14px, var(--text-secondary)
center: search input (optional)
right:  theme toggle icon + notification bell (with dot) + user avatar + name
```

---

# 6. Animation System

## 6.1 Scroll Reveal Animations (Landing Page)

All sections animate on scroll using Framer Motion `whileInView`:

| Animation          | Config                                                     | Usage                         |
|--------------------|-------------------------------------------------------------|-------------------------------|
| Fade Up            | `opacity: 0→1, y: 40→0, duration: 0.7, ease: easeOut`     | Default for all text blocks   |
| Stagger Children   | `staggerChildren: 0.1, delayChildren: 0.2`                 | Card grids, feature lists     |
| Clip Reveal        | `clipPath: inset(100% 0 0 0) → inset(0)` over 0.8s        | Hero images, section images   |
| Counter            | Animate numbers from 0 to target over 1.5s                 | Statistics section            |
| Scale In           | `scale: 0.9→1, opacity: 0→1, duration: 0.5`               | Icons, badges                 |
| Slide From Left    | `x: -60→0, opacity: 0→1, duration: 0.6`                   | Alternating content sections  |
| Slide From Right   | `x: 60→0, opacity: 0→1, duration: 0.6`                    | Alternating content sections  |

## 6.2 Hover Animations

| Element            | Animation                                                    |
|--------------------|--------------------------------------------------------------|
| Cards              | `translateY(-2px)`, border-color to `var(--accent)`, 0.3s    |
| Buttons (Primary)  | `translateY(-1px)`, background darken, 0.2s                  |
| Buttons (Outline)  | Border + text color to `var(--accent)`, 0.2s                 |
| Nav items          | Background fade in, text color brighten, 0.15s               |
| Table rows         | Background to `var(--bg-tertiary)`, 0.15s                    |
| Links              | Underline slide-in from left via `scaleX(0→1)`, 0.3s         |

## 6.3 Custom Geometric Components (Landing Page)

These are animated SVG/Canvas elements that give the landing page a distinctive identity:

1. **Rotating Prism** — A 3D wireframe triangular prism (SVG) that slowly rotates. Uses CSS transforms or Three.js. Placed in the hero section. Stroke: `var(--accent)`, thin lines.

2. **Pulsing Grid** — A dot grid (8x8) where dots pulse outward from center in a wave pattern. Dots: white at 30% opacity, pulse to `var(--accent)` at 100%. Background decoration.

3. **Orbiting Nodes** — Small circles orbiting around a center point, connected by thin lines. Represents "data flowing into AI." SVG animated with Framer Motion.

4. **Scanning Line** — A horizontal line that sweeps top-to-bottom across a card, revealing content beneath. CSS animation with gradient mask.

5. **Morphing Hexagons** — Hexagonal shapes that subtly morph and shift. Used as background art in the hero and CTA sections.

6. **Data Flow Particles** — Small dots traveling along curved paths (bezier curves), representing data flow from student to AI to teacher. Canvas or SVG.

---

# 7. Landing Page — Full Layout Specification

Background: alternating between `#000000` and `#F5F5F0` sections.
Max content width: 1440px, centered.

---

## 7.1 Navigation Bar (Fixed)
```
position: fixed, top 0, full width
height: 64px
background: rgba(0,0,0,0.9) + backdrop-blur(12px)
border-bottom: 1px solid var(--border)
z-index: 100

left:   PRISM logo (wordmark, Inter 800, 20px, white) + small geometric icon
center: nav links — Home, Features, How It Works, Security, FAQ
right:  "Login" outline button + "Get Started" accent button

scroll behavior: bg opacity increases, slight shadow appears
```

## 7.2 Hero Section
```
background: #000000
padding: 128px 64px 96px
min-height: 100vh
display: grid, 2 columns (55% text, 45% visual)

LEFT COLUMN:
  [tag]         — "PREDICTIVE RISK IDENTIFICATION" uppercase, 12px, var(--accent), tracking 0.15em
  [headline]    — "Detect Academic Risk Before It Becomes Failure" — 72px, 800, white, line-height 1.0
  [subtext]     — "AI-powered early warning system..." — 18px, 400, var(--text-secondary), max-width 520px
  [cta-row]     — "Login as Student" (accent btn) + "Login as Teacher" (outline btn), gap 16px
  [scroll-hint] — "Scroll to explore" + animated chevron, bottom of section

RIGHT COLUMN:
  Animated geometric composition:
  - Rotating wireframe prism (centered)
  - Orbiting data nodes around it
  - Subtle pulsing grid in background
  All in var(--accent) strokes on black bg

Animations:
  - Headline: fade up, 0.8s, delay 0.2s
  - Subtext: fade up, 0.6s, delay 0.5s
  - CTAs: fade up, 0.6s, delay 0.7s
  - Geometric elements: continuous loop
```

## 7.3 Problem Section
```
background: #F5F5F0
padding: 96px 64px
color: var(--text-dark)

layout: 2-column grid

LEFT:
  [label]    — "THE PROBLEM" uppercase, var(--accent), 12px, tracking
  [headline] — "Students Struggle in Silence" — 48px, 700, var(--text-dark)
  [body]     — Description paragraph — 16px, var(--text-dark-muted)

RIGHT:
  Bento grid (2x2, gap 8px) with stat cards:
  | "65%" — "of at-risk students go unnoticed"    |  "3x" — "more likely to drop out"  |
  | "40%" — "show warning signs weeks before"      |  "82%" — "could be helped earlier"  |

  Cards: white bg, 10px radius, border var(--border-light), padding 32px
  Numbers: JetBrains Mono, 48px, var(--text-dark)
  Labels: 14px, var(--text-dark-muted)
  Numbers animate (counter) on scroll into view
```

## 7.4 Solution Section
```
background: #000000
padding: 96px 64px

[label]    — "THE SOLUTION" uppercase, var(--accent)
[headline] — "AI That Watches, So Teachers Can Act" — 48px, white

Bento grid — 3 columns, unequal heights, gap 8px:

Card 1 (spans 2 cols, tall):
  "Predictive Analytics"
  Description + animated line chart mockup (accent stroke)
  bg: var(--bg-secondary)

Card 2 (1 col):
  "Real-Time Monitoring"
  Animated scanning line effect
  bg: var(--bg-secondary)

Card 3 (1 col):
  "Smart Alerts"
  Animated bell icon with pulse ring
  bg: var(--bg-secondary)

Card 4 (spans 2 cols):
  "Faculty Intervention Tools"
  Description + mini dashboard preview
  bg: var(--bg-secondary)

All cards: 10px radius, 1px border, 32px padding
Hover: border → var(--accent), translateY(-2px)
Scroll: staggered fade-up entry
```

## 7.5 How It Works Section
```
background: #F5F5F0
padding: 96px 64px

[label]    — "HOW IT WORKS" uppercase, var(--accent)
[headline] — "From Data to Action in Four Steps" — 48px, var(--text-dark)

4 steps in horizontal row (responsive → vertical on mobile):

Each step:
  [number]  — "01" / "02" / "03" / "04" — JetBrains Mono, 64px, var(--accent)
  [title]   — "Data Collection" — 24px, 700
  [desc]    — Short paragraph — 14px, var(--text-dark-muted)
  [icon]    — Custom geometric SVG representing the step

Steps connected by animated dashed line with traveling dot (var(--accent))
Stagger animation on scroll
```

## 7.6 Security & Privacy Section
```
background: #000000
padding: 96px 64px

[label]    — "TRUST & SECURITY" uppercase, var(--accent)
[headline] — "Built on Privacy, Powered by Consent" — 48px, white

3 feature cards in row (gap 8px):

Card 1: "Consent-First" — icon: shield-check
Card 2: "Encrypted Data" — icon: lock
Card 3: "No Medical Claims" — icon: file-warning

Cards: bg var(--bg-secondary), 1px border, 32px padding
Icon: 48px, var(--accent) stroke, animated draw-on-scroll (SVG path animation)
```

## 7.7 FAQ Section
```
background: #F5F5F0
padding: 96px 64px

[label]    — "FAQ" uppercase, var(--accent)
[headline] — "Common Questions" — 48px, var(--text-dark)

Accordion items:
  border-bottom: 1px solid var(--border-light)
  padding: 24px 0
  question: 18px, 600, var(--text-dark)
  answer: 14px, 400, var(--text-dark-muted), animated height expand
  toggle icon: plus/minus, rotates on open, var(--accent)
```

## 7.8 CTA Section
```
background: #000000
padding: 96px 64px
text-align: center

[headline] — "Ready to Protect Your Students?" — 48px, white
[subtext]  — "Join institutions already using AI..." — 18px, var(--text-secondary)
[buttons]  — "Login as Student" (accent) + "Login as Teacher" (outline), centered

Background: morphing hexagons animation (very subtle, low opacity)
```

## 7.9 Footer
```
background: #000000
border-top: 1px solid var(--border)
padding: 48px 64px

4-column grid:
  Col 1: PRISM logo + tagline
  Col 2: Quick Links — Home, Features, How It Works, FAQ
  Col 3: Legal — Privacy Policy, Terms, Disclaimer
  Col 4: Contact — Email, Institution info

Bottom bar: "PRISM v3.0 — Not a medical diagnostic tool" — 12px, var(--text-secondary)
```

---

# 8. Authentication Pages

## 8.1 Student Login (`/auth/student`)
```
Full viewport, 2-column split:

LEFT (55%):
  background: #000000
  centered content:
    PRISM logo
    "Welcome, Student"  — 48px, white
    "Sign in to access your dashboard" — 16px, var(--text-secondary)
    [Google Sign-In button] — white bg, sharp corners, Google icon
    "Not a student? Login as Teacher" — text link, var(--text-secondary)
  Bottom: animated geometric background (pulsing grid, low opacity)

RIGHT (45%):
  background: var(--accent)
  centered content:
    Large geometric prism illustration (white wireframe on gold)
    "Predictive Risk Identification System for Mentoring" — wordmark
```

## 8.2 Teacher Login (`/auth/teacher`)
```
Same layout as student, but:
  LEFT: "Welcome, Faculty" headline
  RIGHT: background var(--bg-off-white), dark geometric illustration
```

## 8.3 Access Denied (`/access-denied`)
```
Full viewport, centered:
  background: #000000
  [icon]     — shield-x, 64px, var(--risk-high)
  [headline] — "Access Denied" — 48px, white
  [subtext]  — "Your email is not in the approved teachers list..." — 16px, var(--text-secondary)
  [button]   — "Return to Home" — outline button
```

---

# 9. Onboarding Flow

```
Full viewport, centered card on dark background.
Card: bg var(--bg-secondary), border var(--border), max-width 560px, padding 48px, border-radius 10px

Multi-step form with progress indicator at top:
  Progress bar: thin line, var(--border) background, var(--accent) fill, border-radius 4px
  Step labels: "1 / 3" — JetBrains Mono, 14px

Each step slides in from right (Framer Motion, x: 40 → 0)

Student steps:
  Step 1: Name, Roll Number
  Step 2: Department, Section, Year/Semester
  Step 3: Consent checkbox + "Get Started" accent button

Teacher steps:
  Step 1: Name, Department
  Step 2: Institution, Subjects
  Step 3: "Enter Dashboard" accent button

Input styling: per section 5.2
Buttons: "Next" (accent), "Back" (ghost)
```

---

# 10. Student Dashboard

## Layout
```
Sidebar (260px, collapsible to 72px) + Main content area
Background: #000000
```

## Sidebar Navigation Items
```
- Dashboard (home icon)
- Daily Log (edit icon)
- Trends (trending-up icon)
- Suggestions (lightbulb icon)
- Academic (book-open icon)
- History (clock icon)
- Settings (settings icon)
```

## 10.1 Dashboard Home (`/dashboard/student`)
```
Top bar: "Good evening, [Name]" — 32px, 700 + date/time — 14px, var(--text-secondary)

METRIC CARDS ROW (4 cards, equal width, gap 16px):
  | Stress Score: 0.42   | Risk Level: Low      | Failure Prob: 0.18    | Attendance: 0.85     |
  | trend: -5% (green)   | badge: green          | trend: -2% (green)    | trend: +1% (green)   |
  Each card: mini sparkline chart at bottom

7-DAY STRESS TREND (full width card):
  Area chart, accent stroke, accent fill 10%
  X: days of week | Y: 0-1 score
  Tooltip: date + exact score

BENTO GRID (2 columns):
  LEFT — "AI Suggestions" card:
    List of 3-4 suggestion strings from latest prediction
    Each with a small arrow icon
  RIGHT — "Explainability" card:
    Text block explaining top contributing factors
    Highlighted keywords in var(--accent)

BOTTOM — "Academic Overview" card (full width):
  Read-only display: CIA Marks, Attendance %, Faculty Feedback
  Styled as horizontal stat row
```

## 10.2 Daily Log Page (`/dashboard/student/log`)
```
Centered form card (max-width 480px)
Title: "How was your day?" — 32px

Fields (styled sliders or number inputs):
  Sleep Hours: slider 0-12
  Screen Time: slider 0-16 (hours)
  Mood: 5-point scale (custom geometric faces, not emoji)
  Study Hours: slider 0-12
  Social Interaction: 5-point scale

Submit button: "Log Today" accent button
Already submitted today: show summary card instead, grayed-out form

Animation: each field fades in staggered
```

## 10.3 Trends Page
```
Full-width charts:
  7-day stress trend (area)
  7-day mood trend (line)
  Sleep vs Screen Time (dual bar chart)
  
All charts: accent color, dark bg, sharp corner tooltips
Period selector: "7 Days" / "14 Days" / "30 Days" — tab buttons
```

## 10.4 Settings Page
```
Card sections:
  Profile: Name, Roll No, Dept, Section (editable)
  Theme: Dark/Light toggle switch
  Data: "Request Data Deletion" button (outline, red tint)
```

---

# 11. Teacher Dashboard

## Layout
```
Same sidebar + main area structure as student
Background: #000000
```

## Sidebar Navigation Items
```
- Dashboard (home icon)
- Students (users icon)
- Alerts (bell icon)
- Analytics (bar-chart icon)
- Settings (settings icon)
```

## 11.1 Dashboard Home (`/dashboard/teacher`)
```
Top bar: "Welcome back, [Name]" — 32px + department badge

METRIC CARDS ROW (4 cards):
  | Total Students: 142  | At Risk: 12          | Active Alerts: 5      | Avg Stress: 0.38    |
  | -                     | badge: red count     | badge: red count      | trend: +3% (red)    |

STUDENTS AT RISK (full width card):
  Table with columns:
    Name | Roll No | Department | Risk Level | Stress Score | Failure Prob | Action
  Rows sorted by risk (High first)
  Risk column: colored badges (sharp corners)
  Action: "View" ghost button
  Search bar + filter by Risk Level (dropdown)
  Hover: row highlights

RECENT ALERTS (side card):
  List of recent alerts:
    Student name + risk level + time ago
    Priority indicator (yellow line = warning, red line = critical)
    Unresolved: bold, Resolved: muted
```

## 11.2 Student Detail View (`/dashboard/teacher/student/[id]`)
```
Back button: "< All Students" ghost button

STUDENT HEADER:
  Name — 32px + Roll No + Dept + Section + Year
  Current risk badge (large)

BENTO GRID (2 cols):
  LEFT TOP — Stress Trend (7-day area chart)
  RIGHT TOP — Academic Data card (editable):
    CIA Marks (number input)
    Attendance (number input)
    Faculty Feedback (1-5 selector)
    "Update" accent button

  LEFT BOTTOM — Latest Prediction card:
    All scores displayed
    Suggestions list
    Explainability text

  RIGHT BOTTOM — Intervention Notes:
    List of past notes (teacher name + date + text)
    "Add Note" textarea + submit button
    Chronological, newest first
```

## 11.3 Alerts Page (`/dashboard/teacher/alerts`)
```
Tab bar: "All" / "Warning" / "Critical" / "Resolved"

Alert cards (full width, stacked):
  Left:  student name + department
  Center: stress score + failure probability (mono numbers)
  Right: priority badge + timestamp + "Resolve" button

Resolved alerts: muted styling, strikethrough-like dimming
Empty state: geometric illustration + "No alerts" text
```

## 11.4 Analytics Page (`/dashboard/teacher/analytics`)
```
DEPARTMENT OVERVIEW:
  Risk distribution pie/donut chart (Low/Moderate/High segments)
  Average scores by department (horizontal bar chart)

TRENDS:
  Aggregate stress trend over time (area chart)
  Alert frequency by week (bar chart)

EXPORT:
  "Export as CSV" accent button — top right
```

---

# 12. Responsive Breakpoints

| Breakpoint | Width      | Behavior                                           |
|------------|------------|-----------------------------------------------------|
| Desktop    | > 1024px   | Full layout, sidebar expanded                       |
| Tablet     | 768-1024px | Sidebar collapsed (icons only), 2-col grids → 1-col |
| Mobile     | < 768px    | No sidebar (hamburger menu), single column, stacked  |

## Mobile-Specific Adaptations
```
- Hero: single column, headline 40px, CTA buttons stack vertically
- Bento grids: collapse to single column
- Dashboard metric cards: 2x2 grid
- Tables: horizontal scroll with sticky first column
- Sidebar: becomes slide-out drawer from left, overlay
- Charts: full width, reduced height
```

---

# 13. Dark / Light Theme

The primary theme is **dark**. Light mode inverts the surface colors:

| Token             | Dark Mode Value | Light Mode Value |
|--------------------|-----------------|------------------|
| `--bg-primary`     | `#000000`       | `#FFFFFF`        |
| `--bg-secondary`   | `#0A0A0A`       | `#F5F5F0`        |
| `--bg-tertiary`    | `#141414`       | `#EBEBEB`        |
| `--text-primary`   | `#FFFFFF`       | `#0A0A0A`        |
| `--text-secondary` | `#A0A0A0`       | `#6B6B6B`        |
| `--border`         | `#1F1F1F`       | `#E5E5E5`        |
| `--accent`         | `#FECC2D`       | `#FECC2D`        |

Accent color remains **unchanged** across themes.
Toggle stored in `localStorage` + system preference detection via `prefers-color-scheme`.

---

# 14. Icon System

Use **Lucide React** icons throughout. No emoji.

| Context              | Preferred Icons                                    |
|----------------------|----------------------------------------------------|
| Navigation           | Home, Users, Bell, BarChart3, Settings, BookOpen    |
| Risk / Status        | ShieldCheck, ShieldAlert, ShieldX, AlertTriangle    |
| Actions              | ArrowRight, ArrowUpRight, Plus, X, Search, Filter   |
| Data                 | TrendingUp, TrendingDown, Activity, Zap             |
| Daily Log            | Moon (sleep), Smartphone (screen), Brain (mood)     |
| Geometric decoration | Custom SVG only — no icon library for decorations   |

Icon size: 20px in nav, 16px inline, 48px for feature highlights.
Stroke width: 1.5px consistently.

---

END OF DESIGN SYSTEM
