# Security Guidelines

## Overview
This document outlines security best practices for deploying and maintaining the Race Board application.

## Environment Variables & Secrets

### DO NOT Commit Secrets
- **NEVER** commit `.env.local` to version control
- **NEVER** commit real API keys, passwords, or credentials to git
- Use `.env.example` as a template for required environment variables

### Environment Files Structure
- `.env.example` - Template file (SAFE to commit)
- `.env.development` - Development configuration (SAFE to commit - no secrets)
- `.env.production` - Production configuration (SAFE to commit - no secrets)
- `.env.local` - Local overrides with secrets (**NEVER commit**)

### For Docker Hub Users
Store Docker credentials securely:
```bash
# Use environment variables or a secrets manager
export DOCKER_LOGIN_USERNAME=your_username
export DOCKER_LOGIN_PASSWORD=your_password
```

## Production Deployment Checklist

### 1. HTTPS Configuration
- [ ] Use HTTPS URLs in `NEXT_PUBLIC_API_URL`
- [ ] Configure SSL/TLS certificates for your domain
- [ ] Enable HSTS headers (already configured in `next.config.ts`)
- [ ] Redirect HTTP to HTTPS

### 2. API Security
- [ ] Implement API key authentication
- [ ] Configure CORS to allow only specific origins
- [ ] Enable rate limiting on API endpoints
- [ ] Validate all API inputs and outputs
- [ ] Use API gateway or reverse proxy (nginx, Cloudflare, etc.)

### 3. Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS API URLs
- [ ] Disable debug logging in production
- [ ] Remove development tools and debugging code

### 4. Docker Security
- [ ] Run containers as non-root user (already configured)
- [ ] Set resource limits (CPU, memory)
- [ ] Use minimal base images (Alpine)
- [ ] Scan images for vulnerabilities
- [ ] Keep base images up to date

### 5. Monitoring & Logging
- [ ] Implement structured logging
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Monitor API response times
- [ ] Track failed authentication attempts
- [ ] Set up alerting for security events

## Security Headers

The application is configured with the following security headers (see `next.config.ts`):

- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **X-XSS-Protection**: Enables XSS filter
- **Content-Security-Policy (CSP)**: Restricts resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## API Authentication (To Implement)

If you need to implement API authentication:

1. **API Key Method** (Simple)
   ```typescript
   // Add to .env.local
   NEXT_PUBLIC_API_KEY=your_secure_api_key

   // Use in API calls
   headers: {
     'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
   }
   ```

2. **JWT Token Method** (Advanced)
   - Implement user authentication
   - Issue JWT tokens for API access
   - Validate tokens on each request

## Network Security

### Firewall Rules
- Allow only necessary ports (443 for HTTPS, 80 for redirect)
- Restrict API access to known IP ranges if possible
- Use VPN for administrative access

### CORS Configuration
Update your API to restrict CORS to specific origins:
```javascript
// Backend CORS configuration example
{
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  methods: ['GET', 'POST'],
  credentials: true
}
```

## Data Protection

### Sensitive Data
- Speed measurements: Not sensitive
- Sensor names: Not sensitive
- API URLs: Visible in client (use HTTPS)

### localStorage
- Settings stored locally are not encrypted
- Do not store sensitive data in localStorage
- Clear localStorage on logout if implementing auth

## Incident Response

If you suspect a security breach:

1. Immediately rotate all API keys and credentials
2. Review access logs for suspicious activity
3. Update all dependencies
4. Rebuild and redeploy containers
5. Notify users if data was compromised

## Dependency Security

### Regular Updates
```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

### Automated Scanning
- Enable Dependabot on GitHub
- Use Snyk or similar tools for vulnerability scanning
- Review security advisories regularly

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for a fix before public disclosure

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [CSP Reference](https://content-security-policy.com/)
