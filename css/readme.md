
# CSS File Structure

This website uses separate CSS files for each page to improve organization and maintainability:

## Core Files
- `common.css` - Contains shared styles used across all pages (navbar, footer, typography, etc.)
- `index.css` - Home page specific styles

## Page-Specific Files
- `mental-wellbeing.css` - Styles for mental health content
- `physical-wellbeing.css` - Styles for physical health content
- `student-forum.css` - Styles for the forum/discussion section
- `study-life-balance.css` - Styles for study tips and balance content
- `resources.css` - Styles for resources and help pages

Each page-specific CSS file imports the common styles via `@import url('common.css');` and then adds styles specific to that page's layout and components.

## Theme Colors
The primary theme is a dark theme with a soft blue color palette, defined in common.css:
- Primary Blue: #2196f3
- Secondary Blue: #1976d2
- Accent Blue: #64b5f6
- Dark Background: #0a1929
- Card Background: #132f4c
- Text Primary: #ffffff
- Text Secondary: #b2bac2

Each page has a specific accent color for its header to differentiate content areas.
