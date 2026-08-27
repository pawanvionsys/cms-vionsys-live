export const siteConfig = {
  name: 'Vionsys CMS',
  description: 'Premium no-code publishing platform for Vionsys blogs and case studies.',
  cmsUrl: process.env.CMS_BASE_URL || 'https://cms.vionsys.com',
  frontendUrl: process.env.VIONSYS_FRONTEND_BASE_URL || 'https://vionsys.com',
  revalidateUrl: process.env.FRONTEND_REVALIDATE_URL || 'https://www.vionsys.com/api/revalidate/cms',
  revalidateSecret: process.env.FRONTEND_REVALIDATE_SECRET || 'vionsys-cms-revalidate-secret-2026',
  
  // Storage Configurations
  storage: {
    uploadDir: 'public/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // pptx
    ]
  },

  // Author and Content defaults
  defaults: {
    seoTitleTemplate: '%s | Vionsys',
    orgName: 'Vionsys IT Solutions India Pvt. Ltd.',
    orgLogoUrl: 'https://vionsys.com/assets/images/logo.png',
    orgUrl: 'https://vionsys.com'
  }
};
