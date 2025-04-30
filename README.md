# Neurologically Optimized PDF Reader

A next-generation PDF reader built on neurological research principles to enhance reading performance for different cognitive profiles.

## Features

### Core Display Features

- **Dynamic Line Window** (3-7 adjustable lines)
  - Matches perceptual span (14-15 characters rightward fixation)
- **Peripheral Darkness Gradient**
  - Default: 20 cd/m² (80% brightness reduction)
  - Optional: 40-60% dimming toggle
- **Smart Magnification**
  - 1.25-1.5× default (1.3× recommended)
  - Auto-adjusts based on font characteristics, content density, and user calibration

### Text Presentation

- **Adaptive Spacing System**
  - Letter spacing: 25-35% of character width
  - Line spacing: 1.5-2× font height
- **Contrast Preservation Mode**
  - Minimum 80% Michelson contrast
  - Dark mode: #121212 bg / #E6E6E6 text

### Interaction Design

- **Smooth Scrolling Transitions**
  - 300ms animation duration
  - Horizontal stabilizer bar (15% width)
- **Haptic Navigation**
  - Page turns: Short vibration (100ms)
  - Chapter breaks: Long pulse (300ms)

### Advanced Features

- **Neural Adaptation Mode**
  - Progressive text expansion (2-4 weeks)
  - Weekly performance analytics
- **Self-Calibration Toolkit**
  - Fixation stability test
  - Crowding threshold assessment
  - Preferred saccade amplitude selector

### Accessibility Presets

- **Low Vision Profile**
  - 70% magnification boost
  - Enhanced edge detection
- **Academic Reading Mode**
  - Semantic chunk highlighting
  - Auto-generated concept maps

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Technical Implementation

This application is built with:

- Next.js (App Router)
- React PDF for document rendering
- Framer Motion for smooth transitions
- TailwindCSS for styling

## Research Background

Each feature is grounded in specific visual processing research, such as:

- Peripheral darkness gradient based on superior colliculus activation studies
- Adaptive spacing derived from crowding radius research (0.5× eccentricity rule)
- Neural adaptation based on dorsal-ventral stream connectivity research
