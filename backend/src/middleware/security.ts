import helmet from 'helmet';

// Basic security headers, configured specifically for ClarifyX backend
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Prevents breaking if external assets are needed
  crossOriginResourcePolicy: { policy: "cross-origin" }, // If we ever serve images cross-origin
});
