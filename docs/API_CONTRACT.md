# Vionsys CMS: Public API Contract

This document outlines the API specifications for consuming published content from `cms.vionsys.com` on `vionsys.com`.

## Security & Authentication

All endpoints require the API authentication key supplied in the request headers:
- Header Key: `x-vionsys-cms-key`
- Dev Value: `vionsys-cms-public-key-dev-2026`

---

## Endpoints

### 1. Get Published Blog Posts
- **Path**: `/api/v1/public/blogs`
- **Method**: `GET`
- **Response**: List of published articles with full SEO, AEO, and Schema.

```json
{
  "success": true,
  "data": [
    {
      "id": "blog-id-string",
      "title": "B2B Cloud Migration Strategies",
      "slug": "b2b-cloud-migration-strategies",
      "contentHtml": "<p>Content body...</p>",
      "excerpt": "Brief meta outline...",
      "featuredImage": "/uploads/image_123.png",
      "featuredImageAlt": "Cloud infrastructure diagram",
      "publishedAt": "2026-07-08T10:00:00.000Z",
      "guestAuthor": null,
      "category": {
        "name": "Technology",
        "slug": "technology"
      },
      "tags": [
        { "name": "Next.js", "slug": "nextjs" }
      ],
      "seo": {
        "title": "B2B Cloud Migration Strategies",
        "description": "Brief meta outline...",
        "focusKeyword": "migration",
        "canonicalUrl": null
      }
    }
  ]
}
```

### 2. Get Single Blog Post by Slug
- **Path**: `/api/v1/public/blogs/[slug]`
- **Method**: `GET`
- **Response**: Mapped blog object. If post is a draft or not found, yields a `404 NOT_FOUND` error.

---

### 3. Get Published Case Studies
- **Path**: `/api/v1/public/case-studies`
- **Method**: `GET`
- **Response**: Mapped project outcome documents.
- **Anonymization Logic**: If client anonymization is toggled on, actual branding names/logos are scrubbed and replaced with safe descriptions (e.g., "A leading Healthcare Provider").

---

### 4. Get Dynamic Metadata & Redirection Maps
- **Sitemap URLs**: `GET /api/v1/public/sitemap`
- **Robots.txt Rules**: `GET /api/v1/public/robots`
- **301 Redirections list**: `GET /api/v1/public/redirects`
- **LLM context catalog**: `GET /api/v1/public/llms`

---

## Errors Definition

All failed requests yield standard error maps:
- **Code**: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `INTERNAL_SERVER_ERROR` (500).

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid API Key."
  }
}
```
