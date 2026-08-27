import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PreviewTokenService } from '@/features/publishing/preview-token.service';
import { siteConfig } from '@/config/site';

function isRscRequest(request: NextRequest) {
  return (
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.nextUrl.searchParams.has('_rsc')
  );
}

export async function GET(request: NextRequest) {
  try {
    // Next.js Link prefetch follows this redirect as a fetch, which CORS-blocks on vionsys.com.
    if (isRscRequest(request)) {
      return new NextResponse(null, { status: 204 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Determine frontend URL base
    let frontendUrl = siteConfig.frontendUrl;

    // Smart localhost detection for development purposes:
    // If accessing CMS locally, and frontendUrl points to production, default redirect to localhost frontend.
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('[::1]');
    
    if (isLocalhost && frontendUrl === 'https://vionsys.com') {
      // Guess port based on CMS port (default Next.js: 3000 -> frontend: 3001; otherwise frontend: 3000)
      const currentPort = host.split(':')[1] || '3000';
      const targetPort = currentPort === '3000' ? '3001' : '3000';
      frontendUrl = `http://localhost:${targetPort}`;
    }

    // Determine content type
    const blog = await prisma.blogPost.findUnique({ where: { id } });
    if (blog) {
      const token = PreviewTokenService.generateToken(id);
      const redirectUrl = `${frontendUrl}/blog/preview?id=${id}&token=${token}`;
      console.log(`[Preview API] Redirecting blog to: ${redirectUrl} (configured frontendUrl: ${siteConfig.frontendUrl}, detected isLocalhost: ${isLocalhost})`);
      return NextResponse.redirect(redirectUrl);
    }

    const cs = await prisma.caseStudy.findUnique({ where: { id } });
    if (cs) {
      const token = PreviewTokenService.generateToken(id);
      const redirectUrl = `${frontendUrl}/case-studies/preview?id=${id}&token=${token}`;
      console.log(`[Preview API] Redirecting case study to: ${redirectUrl} (configured frontendUrl: ${siteConfig.frontendUrl}, detected isLocalhost: ${isLocalhost})`);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  } catch (err: any) {
    console.error('Preview redirect error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
