# PBSTYLE — Atelier für industrielle Eleganz

> Rebuilt full-stack luxury e-commerce platform combining **Next.js 14 App Router** (Frontend with SEO, AIO, GIO), **FastAPI** (Python async backend), and **PostgreSQL** (Relational Database).

---

## Architecture Overview

```
PBstyle Full-Stack Architecture
├── Frontend (Next.js 14, React 18, TypeScript, TailwindCSS)
│   ├── App Router (`/`, `/catalog`, `/products/[slug]`, `/brand-story`, `/checkout`, `/dashboard`, `/account`)
│   ├── SEO: OpenGraph, Twitter Cards, Canonical URLs, Semantic HTML5, Dynamic Sitemap (`/sitemap.xml`)
│   ├── AIO (AI Optimization): llms.txt standard (`/llms.txt`), Schema.org Product, Organization, FAQ, Breadcrumb JSON-LD
│   ├── GIO (Generative Engine Optimization): Entity Knowledge Graph, Swiss Geo-targeting tags, Rich Snippets
│   └── Aesthetics: Warm metals palette, Bodoni Moda serif, Hanken Grotesk sans, Dark/Light mode persistence
├── Backend (FastAPI, Python 3.12/3.14, SQLAlchemy 2 Async, Pydantic v2)
│   ├── Products API: Filtering (materials, categories, price range), Search, Reviews
│   ├── Cart API: Session-based cart with real-time calculations
│   ├── Orders API: Discount codes (`PBSTYLE20` for 20% off), Swiss shipping logic, checkout
│   ├── User API: Customer membership profile (Titanium Elite tier), loyalty points, order history
│   └── SEO/AIO API: Knowledge Graph Manifest (`/api/v1/seo/ai-manifest`), dynamic sitemap data
└── Database (PostgreSQL 16)
    └── Tables: categories, products, product_images, product_variants, cart_items, orders, order_items, reviews, customers, discount_codes
```

---

## Live Local Ports

| Service | Port | Local URL | Description |
|---|---|---|---|
| **Next.js Frontend** | `3001` | [http://localhost:3001](http://localhost:3001) | Full luxury e-commerce storefront |
| **FastAPI Backend** | `8000` | [http://localhost:8000](http://localhost:8000) | REST API & Documentation ([/docs](http://localhost:8000/docs)) |
| **PostgreSQL DB** | `5432` | `localhost:5432` | Docker container `pbstyle-postgres` |
| **AIO Crawlers Manifest** | `3001` | [http://localhost:3001/llms.txt](http://localhost:3001/llms.txt) | LLM context manifest |
| **Sitemap XML** | `3001` | [http://localhost:3001/sitemap.xml](http://localhost:3001/sitemap.xml) | Dynamic Search Engine Sitemap |

---

## Key Features & Endpoints

### 1. Frontend Pages
- **Storefront Home (`/`)**: Hero typography, featured collection carousel, philosophy teaser, newsletter subscription.
- **Catalog (`/catalog`)**: Material filters (950 Platin, Chirurgenstahl 316L, Titan Grade 5), price slider (CHF 50 - 5'000), sorting, responsive filter drawer.
- **Product Detail (`/products/[slug]`)**: High-res multi-angle gallery, variant selector, specs accordion, live add-to-cart toast, customer reviews with submission form.
- **Checkout (`/checkout`)**: Shipping address form, promo code validator (Try `PBSTYLE20`), payment selector, instant order placement.
- **Brand Story (`/brand-story`)**: Manifesto, Swiss craftsmanship metrics, and Schema.org FAQPage knowledge graph.
- **Dashboard (`/dashboard`)**: Members Club tier (Titanium Elite), eco-compliance status, orders tracking.

### 2. SEO, AIO & GIO Implementations
- **AIO (`/llms.txt`)**: Machine-readable context file formatted for GPTBot, ClaudeBot, and PerplexityBot.
- **GIO (Generative Engine Optimization)**: Structured FAQPage schemas and entity relationships targeting AI Search Overviews.
- **Geo-Targeting**: Meta tags for Zurich, Switzerland (`geo.region: CH-ZH`, `geo.placename: Zürich`).
- **Robots Directives (`/robots.txt`)**: Explicit permissions for major AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Applebot`).
