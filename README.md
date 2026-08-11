# Knockout Zone E-Commerce Project

This project provides a complete static e-commerce implementation with responsive pages, DOM-based cart behavior, and integrated animated fighter background.

## Folder Structure
- Root pages
  - index.html
  - products.html
  - cart.html
  - about.html
  - contact.html
  - community.html
  - rankings.html
  - gallery.html
  - shop.html
- css/
  - style.css
- js/
  - script.js
  - main.js
  - character.js
- pic-vid/
- images/
- media/
- evidence/
- styles/
  - mobile.css
  - desktop.css

## Features Delivered
- Home page with logo/title, nav bar, hero/banner, featured products, footer.
- Product listing page with 12 product cards.
- Product detail view integrated into products page.
- Shopping cart page with add/remove/update quantity and total calculation.
- About and Contact pages.
- Responsive design for mobile, tablet, and desktop.
- JavaScript DOM interactions only (no framework).
- Basic contact form validation.
- Existing Three.js MMA fighter animations preserved and integrated.

## How To Run
Use any static server from the project root.

Example with Python:

```bash
python -m http.server 5500
```

Then open:
- http://localhost:5500/index.html

## Cart Behavior
Cart data is stored in browser localStorage under key `mewz_cart_v1`.

## References & Credits

### Libraries & Frameworks
- Three.js (v0.160.0): JavaScript 3D library used for rendering the interactive MMA fighter centerpiece. Source: https://threejs.org/

### Assets & Media
- 3D Character Model & Animations: MMA Fighter character model (`Mma Idle.fbx`) sourced from Adobe Mixamo. Source: https://www.mixamo.com/
- Product & Fighting Gear Photography: High-resolution combat gear and gaming product photos sourced from royalty-free media platforms (Unsplash & Pexels).
- Font Assets: Standard system fallback fonts and Google Web Fonts.

### Auditing & Tools
- Google Chrome Lighthouse: Used for automated accessibility compliance testing and auditing.

=