export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove on* event attributes (e.g. onclick, onerror)
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/g, '');
  sanitized = sanitized.replace(/on\w+=\w+/g, '');

  // Remove javascript: links
  sanitized = sanitized.replace(/href="javascript:[^"]*"/gi, 'href="#"');
  sanitized = sanitized.replace(/href='javascript:[^']*'/gi, 'href="#"');

  return sanitized;
}
