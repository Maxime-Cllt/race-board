# Backend Security Configuration Guide

This document provides security configuration recommendations for the RaceTrack Analytics backend API.

## CORS Configuration

### Current Status (Insecure)
According to `ENDPOINTS.md`, CORS is currently enabled for all origins (permissive mode), which is **NOT** secure for production.

### Recommended Production Configuration

#### For Rust/Actix-Web Backend
```rust
use actix_cors::Cors;
use actix_web::http;

// Production CORS configuration
let cors = Cors::default()
    .allowed_origin("https://yourdomain.com")
    .allowed_origin("https://www.yourdomain.com")
    .allowed_methods(vec!["GET", "POST"])
    .allowed_headers(vec![
        http::header::AUTHORIZATION,
        http::header::ACCEPT,
        http::header::CONTENT_TYPE,
        http::header::HeaderName::from_static("x-api-key"),
    ])
    .max_age(3600);

App::new()
    .wrap(cors)
    // ... other middleware
```

#### For Node.js/Express Backend
```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: true,
  maxAge: 3600
};

app.use(cors(corsOptions));
```

### Development vs Production

For development, you can allow local network access:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yourdomain.com']
  : ['http://localhost:3000', 'http://192.168.1.75:3000'];
```

## API Key Authentication

### Backend Implementation

#### Middleware Example (Node.js/Express)
```javascript
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Validate against stored API keys (use environment variables)
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
};

// Apply to all /api routes
app.use('/api', apiKeyAuth);
```

#### Middleware Example (Rust/Actix-Web)
```rust
use actix_web::{dev::ServiceRequest, Error, HttpMessage};
use actix_web_httpauth::extractors::bearer::BearerAuth;

async fn api_key_validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, Error> {
    let api_key = credentials.token();
    let valid_api_keys = std::env::var("VALID_API_KEYS")
        .unwrap_or_default()
        .split(',')
        .collect::<Vec<_>>();

    if valid_api_keys.contains(&api_key) {
        Ok(req)
    } else {
        Err(actix_web::error::ErrorUnauthorized("Invalid API key"))
    }
}
```

## Rate Limiting

### Recommended Implementation

#### Using Express Rate Limit (Node.js)
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

// Apply to API routes
app.use('/api/', apiLimiter);

// Stricter limit for POST endpoints
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Limit POST requests
});

app.use('/api/speeds', createLimiter);
```

#### Using Redis for Distributed Rate Limiting
```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const limiter = rateLimit({
  store: new RedisStore({
    client,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

## Input Validation

### Recommended Validation

#### Using Zod (Node.js/TypeScript)
```typescript
import { z } from 'zod';

const SpeedMeasurementSchema = z.object({
  sensor_name: z.string().min(1).max(255).optional(),
  speed: z.number().min(0).max(500),
  lane: z.union([z.literal(0), z.literal(1)]),
});

app.post('/api/speeds', async (req, res) => {
  try {
    const validated = SpeedMeasurementSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input', details: error.errors });
  }
});
```

#### Query Parameter Validation
```javascript
const { query, validationResult } = require('express-validator');

app.get('/api/speeds',
  query('limit').isInt({ min: 1, max: 1000 }).optional(),
  query('offset').isInt({ min: 0 }).optional(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

## Security Headers (Backend)

Add security headers on the backend as well:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## HTTPS/TLS Configuration

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSE endpoint configuration
    location /api/speeds/stream {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Logging & Monitoring

### Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Log all API requests
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});
```

### Security Event Logging
```javascript
// Log authentication failures
app.use('/api', (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn({
        event: 'auth_failure',
        ip: req.ip,
        url: req.url,
        method: req.method,
      });
    }
    return originalJson.call(this, data);
  };
  next();
});
```

## Environment Variables (Backend)

Create a `.env` file for backend configuration:

```bash
# Server Configuration
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# Security
VALID_API_KEYS=key1,key2,key3
JWT_SECRET=your-secret-key-here

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost/raceboard

# Redis (for rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379

# SSL/TLS
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## Testing Security

### API Key Testing
```bash
# Should fail without API key
curl -X GET https://api.yourdomain.com/api/speeds

# Should succeed with valid API key
curl -X GET https://api.yourdomain.com/api/speeds \
  -H "X-API-Key: your-api-key"
```

### CORS Testing
```bash
# Test CORS from allowed origin
curl -X OPTIONS https://api.yourdomain.com/api/speeds \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Test CORS from disallowed origin (should fail)
curl -X OPTIONS https://api.yourdomain.com/api/speeds \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### Rate Limiting Testing
```bash
# Send multiple requests to test rate limiting
for i in {1..150}; do
  curl -X GET https://api.yourdomain.com/api/speeds \
    -H "X-API-Key: your-api-key"
done
```

## Security Checklist for Backend

- [ ] CORS restricted to specific origins
- [ ] API key authentication implemented
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS/TLS configured
- [ ] Security headers enabled
- [ ] Structured logging implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection (for cookie-based auth)
- [ ] Regular security updates
- [ ] Secrets stored in environment variables
- [ ] Database credentials secured
- [ ] Error messages don't expose sensitive info

## Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Actix-Web Security](https://actix.rs/docs/middleware/)
