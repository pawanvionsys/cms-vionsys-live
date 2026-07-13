# Vionsys CMS: Architecture Overview

This document describes the architectural layout of the standalone Vionsys Content Management System (CMS) hosted at `cms.vionsys.com` publishing content to `vionsys.com`.

## System Architecture

```mermaid
graph TD
    subgraph CMS Workspace ("cms.vionsys.com")
        EditorCanvas["Editor Writing Canvas"]
        MediaLib["Media Library Explorer"]
        PrismaORM["Prisma Client ORM"]
        Postgres["PostgreSQL Database"]
        AdminAPI["Private CMS API Middleware"]
        PublicAPI["Public API v1 /api/v1/public/"]
    end

    subgraph Public Website ("vionsys.com")
        NextFrontend["Next.js Frontend"]
        CachePurge["Cache Revalidation Endpoint"]
    end

    EditorCanvas --> AdminAPI
    MediaLib --> AdminAPI
    AdminAPI --> PrismaORM
    PrismaORM --> Postgres
    
    NextFrontend -- "Fetch Content" --> PublicAPI
    AdminAPI -- "POST Revalidation Webhook" --> CachePurge
```

---

## Technical Stack

1. **Backend & Frontend framework**: Next.js App Router (Next.js 16.2.10, React 19.2.4).
2. **Database Persistence**: PostgreSQL mapped through Prisma ORM (v5).
3. **Rich Editor Canvas**: Tiptap editor engine with inline block selectors (FAQ, Stats, CTAs).
4. **Authentication**: Cookie-based custom secure JWT session validation middleware.
5. **Aesthetics & Styling**: Vanilla CSS alongside Tailwind CSS (v4) with high-caliber enterprise Blue accents.

---

## Role-Based Access Control (RBAC)

The central RBAC configuration is mapped inside [permissions.ts](file:///c:/Users/admin/OneDrive - Vionsys IT Solutions India Pvt. Ltd/Desktop/Vionsys/cms-vionsys-website/cms/src/config/permissions.ts):

*   **SUPER_ADMIN**: Full system settings, database management, user settings, API keys, delete/publish commands.
*   **CONTENT_MANAGER**: Edit content, publish/unpublish, media management, folder organisation, redirects settings, schema settings.
*   **EDITOR**: Write and edit drafts, upload media, request approval.
*   **VIEWER**: Read-only access for proofreading.
