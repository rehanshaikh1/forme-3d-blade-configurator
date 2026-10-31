# FORME Atelier — Advanced 3D Blade Configurator Concept

A more detailed portfolio demonstration built with React, Three.js and React Three Fiber.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploy to Vercel with build command `npm run build` and output directory `dist`.

## Demonstrated features

- Interactive 3D orbit and zoom
- Seven-ply layered blade concept
- Exploded layer visualization
- Independent face veneer, core, handle, edge trim and finish selectors
- Dynamic illustrative price and estimated weight
- Wood grain overlay toggle and branding toggle
- Material selection summary and save-state interaction
- Responsive configurator UI

## Honest scope / limitations

This is an independently developed portfolio concept. Its geometry is procedurally generated in Three.js, not imported from a client's Fusion 360 CAD file. The material appearance is a stylized real-time preview, not calibrated photorealistic product visualization. Prices and weights are illustrative. The save action is session-only; no WooCommerce cart, checkout, persistent admin system, or production render farm is connected.

For a production implementation, replace the procedural mesh with the client's optimized GLB/GLTF CAD export, verify component/mesh naming, use measured PBR texture maps and validated material data, implement server-side price/weight rules, and connect the configuration to WooCommerce cart/order metadata.
