# Election Integrity Dashboard - Specification

## 1. Project Overview

**Project Name:** Election Integrity Dashboard  
**Type:** Single-page Web Application (Civic Tech Dashboard)  
**Core Functionality:** Real-time election monitoring dashboard that displays voting metrics, live SMS incident reports, and critical alerts for election observers in Africa.  
**Target Users:** Election commission staff, civic tech organizations, international observers

---

## 2. UI/UX Specification

### Layout Structure

**Overall Layout:**
- Fixed sidebar navigation (280px width) on the left
- Main content area with header bar and dashboard grid
- Full viewport height (100vh)

**Page Sections:**
1. **Sidebar** - Navigation menu with logo and nav items
2. **Header Bar** - Dashboard title, time display, status indicators
3. **Metrics Row** - Three key metric cards in a horizontal row
4. **Main Content Grid** - Two-column layout:
   - Left (65%): Live Feed with incoming SMS reports
   - Right (35%): Quick stats / Recent alerts summary

**Responsive Breakpoints:**
- Desktop: 1200px+ (full layout)
- Tablet: 768px-1199px (collapsible sidebar)
- Mobile: <768px (hamburger menu, stacked layout)

### Visual Design

**Color Palette:**
- Primary Background: `#0A1628` (Deep Navy - trust, authority)
- Secondary Background: `#111D32` (Card backgrounds)
- Accent Green: `#10B981` (Emerald - positive metrics, success)
- Accent Red: `#EF4444` (Alert Red - critical incidents)
- Accent Gold: `#F59E0B` (Warning state)
- Text Primary: `#F8FAFC` (White)
- Text Secondary: `#94A3B8` (Muted gray)
- Border/Divider: `#1E3A5F` (Subtle blue-gray)
- Highlight: `#3B82F6` (Interactive elements)

**Typography:**
- Primary Font: 'Montserrat', sans-serif (headings, nav)
- Secondary Font: 'Inter', sans-serif (body, data)
- Font Sizes:
  - Logo: 24px, weight 700
  - Section Headers: 18px, weight 600
  - Card Titles: 14px, weight 500
  - Metric Values: 36px, weight 700
  - Body Text: 14px, weight 400
  - Small/Labels: 12px, weight 500

**Spacing System:**
- Base unit: 8px
- Card padding: 24px
- Section gaps: 24px
- Element spacing: 16px
- Tight spacing: 8px

**Visual Effects:**
- Card shadows: `0 4px 24px rgba(0, 0, 0, 0.3)`
- Subtle glow on active elements: `0 0 20px rgba(16, 185, 129, 0.2)`
- Border radius: 12px (cards), 8px (buttons), 6px (inputs)
- Glassmorphism on sidebar: `backdrop-filter: blur(10px)`

### Components

**1. Sidebar Navigation**
- Logo area with shield icon and "ElectionGuard" text
- Navigation items with icons:
  - Overview (grid icon) - active state
  - Map (map-pin icon)
  - Incident Reports (alert-triangle icon)
  - Observer Management (users icon)
- Each nav item: icon + label, hover state with left border accent
- Active state: emerald left border, subtle background highlight

**2. Header Bar**
- Dashboard title: "Election Integrity Dashboard"
- Real-time clock display (updates every second)
- Connection status indicator (green dot + "Live")
- User avatar placeholder

**3. Metric Cards (3 cards)**
- **Total Votes Tally:**
  - Icon: ballot box
  - Value: "2,847,392"
  - Label: "Total Votes Tally"
  - Trend indicator: "+12.4% vs yesterday" (green)
  
- **Active Polling Units:**
  - Icon: map-pin
  - Value: "18,429"
  - Label: "Active Polling Units"
  - Trend: "98.2% operational" (green)
  
- **Critical Incidents:**
  - Icon: alert-triangle
  - Value: "7"
  - Label: "Critical Incidents"
  - Trend: "3 new in last hour" (red pulse)
  - Critical state: red border glow when count > 0

**4. Live Feed Panel**
- Section header with "Live Feed" title and "Live" badge (pulsing red dot)
- Filter tabs: All | Critical | Warning | Info
- Scrollable list of SMS report entries
- Each entry shows:
  - Timestamp (relative: "2 min ago")
  - Region/Location
  - Message preview
  - Severity indicator (color-coded left border)
  - SMS code badge

**5. SMS Report Entry**
- Animated entrance: slide in from right + fade
- Pulsing animation for new entries (first 10 seconds)
- Color-coded by severity:
  - Critical: red left border, red badge
  - Warning: gold left border, amber badge
  - Info: blue left border, blue badge

**6. Critical Alert State**
- Full dashboard subtle red pulse overlay
- Critical incidents card pulses with red glow
- Sound notification option (visual indicator)
- Alert banner appears at top
- Specific incident highlighted with prominent animation

### Animations

- **Page Load:** Staggered fade-in for cards (100ms delay each)
- **New Entry:** Slide in from right (300ms), then pulse glow (2s)
- **Pulse Animation:** Keyframes for critical items - scale 1.02, box-shadow pulse
- **Sidebar hover:** Smooth background transition (200ms)
- **Metric numbers:** Count-up animation on load

---

## 3. Functionality Specification

### Core Features

1. **Real-time Clock**
   - Displays current date/time in user's timezone
   - Updates every second

2. **Metric Display**
   - Static values with count-up animation on load
   - Visual trend indicators

3. **Live Feed Simulation**
   - Auto-generates new SMS reports every 5-8 seconds
   - Each report has: timestamp, location, message, severity, code
   - Maximum 50 entries displayed (older ones removed)

4. **Severity Filtering**
   - Filter tabs to show All/Critical/Warning/Info
   - Instant filtering with smooth transition

5. **Critical Alert Mode**
   - Triggered when critical incident received
   - Visual pulse effect on entire dashboard
   - Special animation on the critical card

### SMS Report Data Structure

```javascript
{
  id: string,
  timestamp: Date,
  location: string,      // e.g., "Lagos State, Ward 12"
  message: string,       // SMS content
  severity: "critical" | "warning" | "info",
  code: string,          // e.g., "INC-001", "VOT-042"
  region: string
}
```

### Sample SMS Messages

**Critical:**
- "Multiple voters turned away at Station 234 - ballot papers exhausted"
- "Violence reported at polling unit - observers harassed"
- "Resultsheet altered before transmission at Ward 45"

**Warning:**
- "Voting delayed by 45 minutes due to late equipment delivery"
- "Queue length exceeding 3 hours at Station 189"
- "Some voters without PVC being allowed to vote"

**Info:**
- "Heavy rain affecting voter turnout in Zone 7"
- "Observer team arrived safely at Station 156"
- "Voting proceeding smoothly in most locations"

---

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Deep navy background creates professional, trustworthy feel
- [ ] Emerald green used consistently for positive/success states
- [ ] Alert red clearly distinguishes critical incidents
- [ ] Montserrat font renders correctly for headings
- [ ] Inter font renders correctly for body text
- [ ] Sidebar is fixed and scrollable independently
- [ ] All three metric cards display with correct styling
- [ ] Live feed shows scrollable list of entries
- [ ] New entries animate in with pulse effect

### Functional Checkpoints
- [ ] Clock updates in real-time
- [ ] New SMS reports appear automatically
- [ ] Filter tabs work correctly
- [ ] Critical alerts trigger visual alert state
- [ ] Responsive layout works on tablet/mobile
- [ ] No console errors on load

### Performance
- [ ] Page loads in under 2 seconds
- [ ] Animations run at 60fps
- [ ] No memory leaks from interval timers