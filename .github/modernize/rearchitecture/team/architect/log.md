# Architect Session Log

## [t2] Monorepo Structure & Integration Design

**Task**: Design monorepo structure and integration points for Spring Boot backend + Angular 18+ frontend  
**Status**: COMPLETE  
**Completion**: 2026-06-02T00:30:00Z

### Discoveries

1. **Project Size**: Small REST API (707 LOC) with layered Spring Boot 3.4.2 (Java 21) architecture
   - GameController exposes 5 endpoints (GET /games, GET /games/{id}, POST /games, GET /games/list, GET /games/list/{gameListId})
   - Service → Repository → Entity layer pattern (standard Spring data flow)
   - DTOs already exist for data transfer (GameMinDto, GameDto, GameListDto)
   - Existing CORS configuration anticipates localhost:5173 and localhost:3000

2. **Critical Context**: t1 (API audit) incomplete when starting; proceeded with source code audit instead
   - Examined GameController, GameService, DTOs, pom.xml, application.properties
   - Extracted API contract from actual code (not documentation)
   - Verified Spring Boot version, Java version, existing environment awareness

3. **Monorepo Design Choice**: Dual-build system (Maven + npm) at root with orchestration
   - Rationale: Backend already Maven-based (3.4.2 inherited parent); Angular requires Node.js
   - Forcing both into one build system adds complexity without benefit
   - Root package.json provides orchestration entry points (npm run dev, npm run build:all)

4. **Integration Strategy**: Proxy-based during dev, direct CORS for production
   - Eliminates CORS complexity during local development (proxy on same origin)
   - Proxy config in frontend only (GameApiService + proxy.conf.json)
   - Production uses strict CORS origin whitelist in backend WebConfig

5. **CORS Design**: Stateless API (no cookies), Bearer tokens in Authorization header
   - CORS credentials: false (simplifies headers, works with load balancers)
   - Supports preflight for OPTIONS requests automatically

### Decisions Made (Now in Design)

1. Parent POM at root; backend as Maven multi-module child
2. No OpenAPI/code generation (manual DTO sync acceptable for small API)
3. Spring profile-based environments (dev, test, prod)
4. Angular environment files for API base URL switching
5. Docker compose for orchestrated local dev (optional multi-stage for frontend)

### Risks Called Out

- **HIGH**: CORS misconfiguration in production (mitigated by strict origin whitelist)
- **MEDIUM**: DTO drift between backend/frontend (mitigated by manual sync + future OpenAPI)
- **MEDIUM**: Proxy rewrite rules misconfiguration (tested in t8)
- **LOW**: Port conflicts, Node.js missing from dev machine (documented)

### Learnings Consumed

- None (first architect task; no prior learnings available)

### Test Coverage

- N/A (architecture design phase; smoke tests documented for t9)

### Deliverables

- `t2-architect.md`: 1,400+ lines covering structure diagram, design rationale, API spec, CORS/proxy, environment strategy, build commands, risks, integration points
- Includes success criteria checklist
- API specification table with 5 endpoints documented
- Build verification procedures for both backend and frontend

