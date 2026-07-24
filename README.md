# Summit Technologies — Modern Government Contractor Web Application

A modern, highly responsive, and fully compliant corporate website for **Summit Technologies, Inc.** (summittech.us), a Service-Disabled Veteran-Owned Small Business (SDVOSB).

## Compliance & Standards

This web application has been designed and built specifically to satisfy federal and state compliance mandates for government contractors:

- **Section 508 of the Rehabilitation Act**
- **WCAG 2.1 Level AA Accessibility**
- **ADA Title II Standard**
- **CMMC Level 2 & ISO 9001:2015 Information Showcase**

### Accessibility Implementation Highlights

- **Skip Navigation:** Keyboard users can bypass header navigation (`.skip-link`).
- **Semantic HTML5:** Built with standard landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`).
- **High Contrast Ratios:** All text and background pairs meet or exceed the 4.5:1 minimum contrast requirement.
- **Keyboard & Screen Reader Support:** ARIA attributes (`aria-expanded`, `aria-controls`, `aria-current`, `role="region"`) and complete focus ring visibility.
- **Reduced Motion Support:** Respects user operating system settings for `prefers-reduced-motion`.
- **Dedicated Accessibility Statement:** Detailed conformance breakdown and compliance contact links.

## Key Sections & Features

- **Government Contractor Identifiers:** Prominently features UEI (`ZK99LMX429N1`), CAGE Code (`1V8Z3`), Primary NAICS (`541512`), and SDVOSB status.
- **Core Capabilities:** Interactive cards detailing Capabilities Development, Training Support Services, and Information Technology.
- **Track Record & Past Performance:** Case study highlights and operational metrics.
- **Contract Vehicles:** Detailed summary of GSA MAS, OASIS SB Pool 1, ITES-SW2, and SeaPort-NxG.
- **Employee Portal & Careers:** Clear pathways for candidates and current employees.

## Development & Usage

Zero external frameworks or build tooling required. Standard HTML5, CSS3 Custom Properties, and Vanilla JS.

```bash
# Serve locally
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## License

MIT
