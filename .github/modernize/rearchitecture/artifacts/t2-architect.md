# t2 — Monorepo Structure & Integration Design

**Architect**: t2-architect | **Task ID**: t2 | **Classification**: monorepo-transformation  
**Phase**: Analysis — Project Structure & API Audit

---

## Executive Summary

This document specifies the monorepo transformation from a standalone Spring Boot API to a multi-stack project with:
- **Backend**: Spring Boot 3.4.2 (Java 21) REST API under `/backend`
- **Frontend**: Angular 18+ SPA under `/frontend`  
- **Monorepo root**: Maven parent POM + npm scripts for orchestrated builds
- **Integration**: API-driven communication via HTTP with CORS support and local proxy

**Architecture Decision**: Dual-build monorepo (Maven + npm) with separate build systems, unified at root via `package.json` orchestration scripts and a parent `pom.xml` for Maven multi-module inheritance.

---

## 1. Proposed Monorepo Structure

```
dslist/ (root)
│
├── pom.xml                           # Parent POM (multi-module, MAY NOT BUILD if Node.js missing)
├── package.json                      # Root npm orchestration scripts
├── package-lock.json                 # Lock file for root scripts
│
├── .github/
│   └── modernize/
│       └── rearchitecture/           # Modernization workflow (stays at root)
│
├── backend/                          # Spring Boot backend (existing project relocated)
│   ├── pom.xml                       # Child POM (inherits from parent)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/celisapp/dslist/
│   │   │   │       ├── DslistApplication.java
│   │   │   │       ├── controllers/
│   │   │   │       │   └── GameController.java
│   │   │   │       ├── service/
│   │   │   │       │   └── GameService.java
│   │   │   │       ├── repositories/
│   │   │   │       ├── entities/
│   │   │   │       ├── dto/
│   │   │   │       └── projection/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       ├── application-prod.properties
│   │   │       └── import.sql
│   │   └── test/
│   │       └── java/
│   │           └── com/celisapp/dslist/
│   │               └── DslistApplicationTests.java
│   └── mvnw, mvnw.cmd               # Maven wrapper (unchanged)
│
├── frontend/                         # Angular 18+ frontend (NEW)
│   ├── package.json                  # Angular project dependencies
│   ├── package-lock.json
│   ├── angular.json                  # Angular CLI configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── src/
│   │   ├── main.ts                   # Bootstrap
│   │   ├── app/
│   │   │   ├── app.component.ts      # Root component
│   │   │   ├── app.component.html
│   │   │   ├── app.component.css
│   │   │   ├── services/
│   │   │   │   └── game-api.service.ts    # HTTP client service for backend
│   │   │   ├── components/
│   │   │   │   ├── game-list/
│   │   │   │   ├── game-details/
│   │   │   │   └── game-list-manager/
│   │   │   └── models/
│   │   │       ├── game.ts
│   │   │       └── game-list.ts
│   │   ├── assets/
│   │   └── styles.css
│   ├── proxy.conf.json               # Proxy config for local dev (port forwarding)
│   └── environment.ts, environment.prod.ts
│
├── docker-compose.yml                # Orchestrates backend + frontend in dev
├── .gitignore
├── README.md                         # Monorepo documentation
└── create.sql, system.properties     # Shared config (DB schema, system props)
```

---

## 2. Design Rationale

### 2.1 Dual-Build Architecture

**Decision**: Use separate build systems (Maven for backend, npm for frontend) with orchestration at monorepo root.

**Rationale**:
- **Backend (Maven)**: Existing Spring Boot 3.4.2 + Java 21 project uses Maven exclusively. Forcing Gradle or npm build would break established workflows and tooling.
- **Frontend (npm)**: Angular 18+ mandates Node.js + npm; replicating this in Maven adds complexity without benefit.
- **Orchestration**: Root `package.json` provides unified entry points (`npm run build:all`, `npm run dev`, etc.) while delegating to native build tools.
- **Risk mitigation**: Each subsystem can upgrade independently without forcing coordinated releases.

**Implication**: Developers must have both JDK 21 + Maven AND Node.js 18+ + npm installed. This is explicit and documented in the project `README.md`.

### 2.2 Parent POM at Root

**Decision**: Create a root `pom.xml` with `<packaging>pom</packaging>` and `<modules>` section pointing to `/backend`.

**Rationale**:
- Centralizes version management (Spring Boot, common libraries) for `backend/` subsystem.
- Enables `mvn clean package` from root to build backend only (frontend ignored, Node.js not required for Maven).
- Follows Maven multi-module conventions; familiar to backend developers.
- Optional: future shared Java libraries can be added as modules.

**Implication**: Frontend is NOT a Maven module; build remains npm-based. This is correct and intentional.

### 2.3 API Specification

**Current Endpoints** (audited from `GameController`):

| Method | Endpoint | Query/Body | Response | Notes |
|--------|----------|-----------|----------|-------|
| GET    | `/games` | — | `List<GameMinDto>` | All games (abbreviated) |
| GET    | `/games/{id}` | `id` (path param) | `GameDto` | Full game details |
| POST   | `/games` | `Game` (JSON body) | `GameDto` | Create new game |
| GET    | `/games/list` | — | `List<GameListDto>` | All game lists |
| GET    | `/games/list/{gameListId}` | `gameListId` (path param) | `List<GameMinDto>` | Games in a specific list |

**Data Models**:
- `GameMinDto`: `{ id, title, imgUrl }` (lightweight card view)
- `GameDto`: `{ id, title, year, genre, platforms, score, imgUrl, shortDescription, longDescription }` (detail view)
- `GameListDto`: `{ id, name }` (game collection metadata)

**Request/Response Format**: JSON, `Content-Type: application/json`

---

## 3. Build & Run Strategy

### 3.1 Development Mode

#### Backend Only
```bash
# From root
cd backend
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8080"
# Runs on http://localhost:8080
```

#### Frontend Only
```bash
# From root
cd frontend
npm install
npm start
# Angular dev server runs on http://localhost:4200 (default)
# Proxies /api/* to http://localhost:8080 (see proxy.conf.json)
```

#### Full Stack (Orchestrated via root `package.json`)
```bash
# From root
npm run dev
# Runs: concurrently "npm run backend:dev" "npm run frontend:dev"
# Backend: http://localhost:8080
# Frontend: http://localhost:4200
```

### 3.2 Production Build

```bash
# Build backend WAR
cd backend
./mvnw clean package -DskipTests
# Output: backend/target/dslist-0.0.1-SNAPSHOT.jar

# Build frontend dist
cd ../frontend
npm install
npm run build
# Output: frontend/dist/

# Serve frontend assets from backend (Spring Boot staticLocation)
# OR deploy to CDN (env-dependent)
```

### 3.3 Docker Deployment

**Decision**: Use `docker-compose.yml` to orchestrate backend + frontend containers for dev/test.

**Backend Container**:
- Base: `openjdk:21-jdk-slim`
- Build: Copies JAR from `backend/target/`
- Port: `8080` (internal), mapped to `8080:8080` (host)
- Env: Spring profile, CORS origin

**Frontend Container** (optional for production):
- Base: `node:18-alpine` (build stage) → `nginx:alpine` (runtime)
- Build: Multi-stage; builds dist, then serves via nginx
- Port: `3000` (internal), mapped to `3000:3000` (host) OR `80` for production
- Proxy: nginx rules forward `/api/` to backend container (`http://backend:8080`)

---

## 4. CORS & Frontend-Backend Communication

### 4.1 CORS Configuration

**Current State** (in `application.properties`):
```properties
cors.origins=${CORS_ORIGINS:http://localhost:5173,http://localhost:3000}
```

**Interpretation**: CORS is already anticipated for localhost dev ports (5173 = Vite, 3000 = standard).

**Future Implementation** (in backend, likely `t4` — Configure CORS):

```java
// WebConfig.java (to be created in t4)
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/games/**")
            .allowedOrigins(
                "http://localhost:4200",      // Angular dev (ng serve default)
                "http://localhost:5173",       // Vite alt
                "http://localhost:3000"        // Docker frontend container
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("Content-Type", "Authorization")
            .allowCredentials(false)           // No cookies needed for stateless API
            .maxAge(3600);
    }
}
```

**Credentials**: Set to `false` since the API is stateless (Bearer tokens in `Authorization` header, not cookies).

**Headers**: 
- `Content-Type`: For JSON serialization
- `Authorization`: For future auth (JWT, Bearer tokens)

---

### 4.2 Frontend API Communication

**Strategy**: Centralized HTTP client service (`GameApiService`) wrapping Angular `HttpClient`.

#### Service: `frontend/src/app/services/game-api.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game, GameList } from '../models';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private apiBase: string = '/api/games';  // Proxied to backend

  constructor(private http: HttpClient) {}

  // GET /games
  getAllGames(): Observable<GameMinDto[]> {
    return this.http.get<GameMinDto[]>(`${this.apiBase}`);
  }

  // GET /games/{id}
  getGameById(id: number): Observable<GameDto> {
    return this.http.get<GameDto>(`${this.apiBase}/${id}`);
  }

  // POST /games
  createGame(game: Game): Observable<GameDto> {
    return this.http.post<GameDto>(`${this.apiBase}`, game);
  }

  // GET /games/list
  getGameLists(): Observable<GameListDto[]> {
    return this.http.get<GameListDto[]>(`${this.apiBase}/list`);
  }

  // GET /games/list/{gameListId}
  getGamesByList(listId: number): Observable<GameMinDto[]> {
    return this.http.get<GameMinDto[]>(`${this.apiBase}/list/${listId}`);
  }
}
```

---

### 4.3 Proxy Configuration for Local Development

**File**: `frontend/proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "pathRewrite": {
      "^/api": "/games"
    },
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Behavior**:
- Request to `http://localhost:4200/api/games` → forwarded to `http://localhost:8080/games`
- Request to `http://localhost:4200/api/games/1` → forwarded to `http://localhost:8080/games/1`
- Eliminates CORS preflight during dev (proxy runs on same origin as Angular app)

**Configuration in `angular.json`**:
```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "configurations": {
    "development": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

---

## 5. Environment Configuration Strategy

### 5.1 Backend Environments

| Profile | File | Use Case | Key Vars |
|---------|------|----------|----------|
| `dev` | `application-dev.properties` | Local development | DB: localhost:5432, CORS: localhost:* |
| `test` | `application-test.properties` | Automated tests | DB: H2 in-memory, isolated |
| `prod` | `application-prod.properties` | Production | DB: AWS RDS, CORS: app.domain only |

**Activation**: `spring.profiles.active=${APP_PROFILE:dev}` (env var or default)

**For monorepo**:
```bash
# Dev
APP_PROFILE=dev ./mvnw spring-boot:run

# Prod
APP_PROFILE=prod ./mvnw spring-boot:run
```

### 5.2 Frontend Environments

| Environment | File | Use Case | API Base | Build Command |
|-------------|------|----------|----------|----------------|
| Development | `src/environments/environment.ts` | Local dev | `http://localhost:4200/api` (proxy) | `ng serve` |
| Production | `src/environments/environment.prod.ts` | Release build | `https://app.domain/api` (CDN origin) | `ng build --configuration production` |

#### `src/environments/environment.ts` (dev)
```typescript
export const environment = {
  production: false,
  apiBase: 'http://localhost:4200/api'  // Proxied to backend:8080
};
```

#### `src/environments/environment.prod.ts` (prod)
```typescript
export const environment = {
  production: true,
  apiBase: 'https://app.domain/api'  // Backend at production domain
};
```

**In service** (`GameApiService`):
```typescript
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private apiBase: string = `${environment.apiBase}/games`;

  // ... rest of service
}
```

---

## 6. Build Verification & Smoke Tests

### 6.1 Backend Verification

**Full build** (from `/backend`):
```bash
./mvnw clean package -DskipTests
# Exit code 0 = success; any non-zero = CRITICAL blocker
```

**Startup verification**:
```bash
java -jar target/dslist-0.0.1-SNAPSHOT.jar --server.port=8080
# Wait for: "Started DslistApplication in X.XXs"
# Check: curl http://localhost:8080/games → JSON response ✓
```

**Smoke test** (architect runs):
```bash
# 1. Build backend
cd backend && ./mvnw clean package -DskipTests

# 2. Start app
java -jar target/dslist-0.0.1-SNAPSHOT.jar &
sleep 5

# 3. HTTP health check
curl -s http://localhost:8080/games | jq '.' | grep -q '\['
echo "Backend smoke test: PASS" or "FAIL"
```

### 6.2 Frontend Verification

**Build verification** (from `/frontend`):
```bash
npm install
npm run build
# Exit code 0 = success; dist/ directory created
```

**Serve & HTTP check** (architect runs):
```bash
npm start &  # ng serve in dev mode
sleep 10

# Check proxy works
curl -s http://localhost:4200/api/games | jq '.' | grep -q '\['
echo "Frontend proxy smoke test: PASS" or "FAIL"
```

---

## 7. Ownership & Responsibility Matrix

| Area | Owner | Deliverables |
|------|-------|--------------|
| **Backend JAR build** | Backend role (t3, t4) | `backend/pom.xml`, parent `pom.xml`, CORS config |
| **Frontend dist build** | Frontend role (t5, t6) | `frontend/package.json`, `angular.json`, dist/ |
| **Monorepo orchestration** | Backend role (t3) | Root `package.json`, root `pom.xml`, docker-compose.yml |
| **API integration** | Frontend role (t5) | `GameApiService`, `proxy.conf.json`, environment files |
| **CORS verification** | Backend role (t4) | WebConfig bean, preflight response headers |
| **Smoke tests** | Tester role (t9) | End-to-end test scripts, CI/CD integration |

---

## 8. Architecture Decisions & Risks

### 8.1 Key Decisions

1. **Dual-build monorepo** (Maven + npm)
   - ✅ Preserves existing backend tooling
   - ✅ Aligns with framework best practices
   - ⚠️ Requires developers to have both JDK + Node.js
   - ✅ Mitigated by clear documentation

2. **Proxy for local dev, direct API for production**
   - ✅ Eliminates CORS complexity during development
   - ✅ Clean separation of concerns
   - ✅ Proxy config lives in frontend only (single ownership)

3. **No shared Java/TypeScript code generation**
   - ✅ Simpler initial implementation
   - ⚠️ DTOs must be manually synchronized
   - 📌 Future: Consider OpenAPI/Swagger generation if DTO drift becomes an issue

4. **Stateless API (no cookies, JWT preferred)**
   - ✅ Aligns with REST best practices
   - ✅ Simplifies CORS (no `credentials: true`)
   - ✅ Works with distributed backends (load balancer friendly)

### 8.2 Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **DTO drift** (backend changes not reflected in frontend models) | MEDIUM | Manual sync during API changes; future: OpenAPI generation |
| **CORS misconfiguration** (production CORS too permissive) | HIGH | Strict origin whitelist in prod profile; audit in t4 |
| **Node.js missing on developer machine** | LOW | Documented in README; CI/CD enforces both toolchains |
| **Port conflicts** (localhost:8080 or 4200 in use) | LOW | Documented; developers can override with env vars |
| **Proxy misconfiguration** (rewrite rules wrong) | MEDIUM | Tested in t8 integration task; clear error messages in console |

---

## 9. Integration Points

### 9.1 Build Order (Critical Path)

1. **t1 [architect]**: Audit API (upstream — BLOCKS t2) ← **You are here, proceeding without t1 output**
2. **t2 [architect]**: Design monorepo ← **Current task**
3. **t3 [backend]**: Restructure to `/backend` + create parent POM (depends on t2)
4. **t4 [backend]**: CORS configuration (depends on t3)
5. **t5 [frontend]**: Create Angular project + GameApiService (depends on t4)
6. **t6 [frontend]**: Build components (depends on t5)
7. **t8 [frontend]**: Proxy configuration & local dev test (depends on t6)
8. **t9 [tester]**: E2E integration tests (depends on t8)

### 9.2 File Handoff Protocol

- **t2 → t3**: Monorepo structure diagram (this document) + parent POM template
- **t3 → t4**: New `/backend` directory + `pom.xml` inheritance
- **t4 → t5**: CORS-configured backend JAR + API endpoint documentation
- **t5 → t6**: Angular project scaffold + GameApiService implementation
- **t8**: Proxy config + environment setup instructions

---

## 10. Deployment Architecture

### Development (docker-compose)
```
┌─────────────┐         ┌─────────────┐
│   Frontend  │◄───────►│   Backend   │
│   ng:4200   │(proxy)  │ spring:8080 │
└─────────────┘         └─────────────┘
       ▲                       ▲
       │                       │
    nginx                   Tomcat
  (alpine)               (Spring Boot)
   8000→                  5432→
 node:18               postgres:15
```

### Production (Kubernetes/Cloud)
```
┌──────────────────────────────────────────┐
│          CDN / Load Balancer             │
└──────────────────────────────────────────┘
         │ HTTPS                │ HTTPS
    ┌────▼────┐           ┌─────▼──────┐
    │ Frontend│           │  Backend   │
    │   Dist  │           │  Spring    │
    │ (S3/GCS)│           │   Boot     │
    └────┬────┘           └─────┬──────┘
         │ GET /index.html      │ GET /games (w/ CORS)
         │                      │
         └──────────────────────┘
              App Domain
```

---

## 11. Success Criteria for t2

- [x] Monorepo structure documented with ASCII tree
- [x] Dual-build strategy rationale explained
- [x] API specification audited and documented
- [x] CORS requirements specified
- [x] Proxy configuration designed
- [x] Environment configuration strategy defined
- [x] Build commands documented
- [x] Smoke test procedures documented
- [x] Integration points identified
- [x] Architecture decisions logged with risks

---

## 12. Next Steps (for downstream tasks)

- **t3 [backend]**: Use this design to restructure project into `/backend` with parent POM inheritance
- **t4 [backend]**: Implement WebConfig bean for CORS using origins list from this design
- **t5 [frontend]**: Create Angular project at `/frontend` with GameApiService matching API spec (§3)
- **t6 [frontend]**: Build game list, details, and game-list-manager components using data from GameApiService
- **t8 [frontend]**: Configure proxy.conf.json using template from §4.3; test with `npm start`

---

## Appendix A: Dependency Audit

### Backend Dependencies (from `pom.xml`)
- Spring Boot 3.4.2
- Spring Data JPA
- Spring Web
- PostgreSQL JDBC driver
- H2 Database (test)
- Java 21

### Frontend Dependencies (to be installed via `npm install`)
- Angular 18+
- RxJS (Observables for HTTP)
- TypeScript 5.x+
- Angular DevKit (CLI)

### Common Tooling
- Docker & docker-compose
- Git
- Maven 3.8+ (or use mvnw)
- Node.js 18+ + npm 9+

---

**Document Status**: ✅ Ready for Implementation  
**Artifact Path**: `/home/andre/Área de trabalho/Desenvolvimento/dslist/.github/modernize/rearchitecture/artifacts/t2-architect.md`  
**Task Completion**: t2 design COMPLETE; awaiting t1 parallel work; t3 can now begin.
