# api-integration-proxy-vs-cors.md

**Category**: Architecture Decision | **Status**: Active | **Date**: 2026-06-02

## Decision

Use **proxy-based routing for local development** (eliminates CORS complexity) and **strict CORS allowlisting for production**.

Development: Angular proxy forwards `/api/*` → backend:8080  
Production: Backend serves CORS headers with explicit origin whitelist

## Rationale

### Development (Proxy)
- **Single origin**: Proxy runs on localhost:4200 (same as Angular app); no preflight
- **Simplicity**: Developers don't debug CORS headers during dev
- **Transparency**: All backend requests visible in Network tab
- **Config**: Lives in `proxy.conf.json` (frontend ownership, single source of truth)

### Production (CORS Headers)
- **Security**: Only whitelisted origins (e.g., `https://app.domain`) can make requests
- **Compliance**: Follows REST security best practices
- **Load balancer friendly**: Stateless API works with scaling

## Implementation (t4, t5)

### Backend (`t4`)
```java
// WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/games/**")
            .allowedOrigins(
                // Dev origins
                "http://localhost:4200",
                "http://localhost:5173",
                "http://localhost:3000",
                // Prod origins (from env var)
                System.getenv("CORS_ORIGINS") != null ?
                    System.getenv("CORS_ORIGINS").split(",") :
                    new String[0]
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("Content-Type", "Authorization")
            .allowCredentials(false)
            .maxAge(3600);
    }
}
```

### Frontend (`t5`)
```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8080",
    "pathRewrite": { "^/api": "/games" },
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## API Service Pattern

```typescript
// game-api.service.ts
@Injectable({ providedIn: 'root' })
export class GameApiService {
  // Dev: http://localhost:4200/api/games (proxy to :8080)
  // Prod: https://app.domain/api/games (CORS, no proxy)
  private apiBase = environment.apiBase + '/games';

  constructor(private http: HttpClient) {}

  getAllGames(): Observable<GameMinDto[]> {
    return this.http.get<GameMinDto[]>(this.apiBase);
  }
  // ... other methods
}
```

## Why This Works

- **Dev**: No CORS overhead; focus on feature development
- **Prod**: Secure; explicit origin control prevents CSRF, cross-site attacks
- **Scalability**: Proxy offloads CORS negotiation from backend in dev
- **Maintainability**: CORS logic centralized in WebConfig + environment files

## When to Override

- If using websockets: Proxy may not work; use CORS only with explicit `Upgrade` handling
- If backend needs to serve multiple frontends simultaneously: Keep backend CORS, remove proxy

## Credentials Strategy

- **Set to `false`** (current choice): Stateless API, no cookies needed
- **Why**: Bearer tokens go in `Authorization` header (safer than cookies, cookie-theft-proof)
- **When to change**: If using session-based auth or httpOnly cookies; consult security team

