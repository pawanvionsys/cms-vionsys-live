# Vionsys CMS: Frontend Integration Guide

This document describes how to integrate the CMS data into the public Vionsys website (`vionsys.com`).

## 1. Purging Caches / Revalidation Webhook

When content changes (published, slug updated, deleted), the CMS dispatches a POST request to:
`https://vionsys.com/api/revalidate`

### Payload dispatched:
```json
{
  "paths": [
    "/blog",
    "/blog/dynamic-article-slug",
    "/sitemap.xml"
  ]
}
```

### Handler implementation in `vionsys.com` (`app/api/revalidate/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  const secret = process.env.FRONTEND_REVALIDATE_SECRET;

  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { paths } = await request.json();
  if (Array.isArray(paths)) {
    for (const path of paths) {
      revalidatePath(path);
    }
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

---

## 2. Dynamic 301 Redirection handling

To prevent broken SEO backlinks when writers change slugs, the main site should query `/api/v1/public/redirects` on start/build or run middleware checks:

```typescript
// middleware.ts in vionsys.com
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Fetch redirects index (cache this fetch in production!)
  const res = await fetch('https://cms.vionsys.com/api/v1/public/redirects', {
    headers: { 'x-vionsys-cms-key': process.env.CMS_API_KEY! }
  });
  const data = await res.json();

  if (data.success) {
    const matched = data.data.find((r: any) => r.fromPath === path);
    if (matched) {
      return NextResponse.redirect(new URL(matched.toPath, request.url), matched.statusCode);
    }
  }

  return NextResponse.next();
}
```
