export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiKeyData {
  id: string;
  name: string;
  role: string;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RedirectData {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
}

export interface SitemapItem {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}
