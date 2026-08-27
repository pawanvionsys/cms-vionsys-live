export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/vionsys_cms',
  JWT_SECRET: process.env.JWT_SECRET || 'vionsys-cms-jwt-super-secret-key-2026',
  VIONSYS_FRONTEND_BASE_URL: process.env.VIONSYS_FRONTEND_BASE_URL || 'https://vionsys.com',
  FRONTEND_REVALIDATE_URL: process.env.FRONTEND_REVALIDATE_URL || 'https://www.vionsys.com/api/revalidate/cms',
  FRONTEND_REVALIDATE_SECRET: process.env.FRONTEND_REVALIDATE_SECRET || 'vionsys-cms-revalidate-secret-2026',
  CMS_BASE_URL: process.env.CMS_BASE_URL || 'https://cms.vionsys.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Simple sanity check
if (!process.env.DATABASE_URL && env.NODE_ENV === 'production') {
  console.warn('WARNING: DATABASE_URL is not set in environment variables! Using default fallback.');
}
if (!process.env.JWT_SECRET && env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET is not set in environment variables! Using default fallback.');
}
