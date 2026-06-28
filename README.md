# Resumify

Resumify is a real-time, stateless client-side resume builder. It features multiple polished, professional resume formats (OnCampus, Modern Creative, and Corporate Minimal) that users can edit, customize, crop photos/logos for, and download as pixel-perfect PDFs.

This repository represents a structured migration to a modern frontend build system using React, Vite, and Tailwind CSS.

---

## Features

- **Stateless & Private**: All data resides strictly in the browser.
- **Multiple Templates**:
  - **OnCampus Resume**: Clean academic layout optimized for engineering/research.
  - **Modern Creative**: Vibrant layout with sidebar accents and color customizers.
  - **Corporate Minimal**: Business-first format focusing strictly on skills and experience.
- **Interactive Editor**: Side-by-side editing panel and real-time print preview.
- **PDF Export**: Renders layouts using native browser print engines.

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### Installation

Install local packages and configurations:
```bash
npm install
```

### Local Development

Run the Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Compile and optimize the code for static hosting:
```bash
npm run build
```
Static assets will be output to the `dist/` folder and can be deployed directly to Netlify, Vercel, or GitHub Pages.

---

## Disclaimer

> [!WARNING]
> **Reverse Engineering Disclaimer**:
> This codebase has been reverse-engineered from compiled/deployed client-side code. The reverse engineering was done without explicit prior permission from the original creators. The original license and terms of the source project are unknown.
