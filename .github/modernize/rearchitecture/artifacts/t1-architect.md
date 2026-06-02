# t1 - Architecture Audit: Project Structure & API Endpoints

**Audit Date:** 2026-06-02  
**Project:** dslist (Game List Management API)  
**Current Version:** 0.0.1-SNAPSHOT  
**Target Framework:** Spring Boot 3.4.2 + Java 21  

---

## Executive Summary

The **dslist** project is a lean, well-structured Java/Spring Boot REST API for managing games and game lists. It follows a classic 3-layer architecture (Controllers → Services → Repositories) with DTOs for API contracts and JPA entities for data persistence.

**Audit Findings:**
- ✅ **1 REST Controller** (GameController)
- ✅ **5 REST API Endpoints** documented below
- ✅ **3 Core Entities** with a many-to-many relationship pattern
- ✅ **3 DTOs** for API payloads (GameDto, GameMinDto, GameListDto)
- ✅ **2 Repositories** with native query support
- ✅ **1 Service** layer mediating business logic
- ✅ Clean separation of concerns (DTO ↔ Entity ↔ Projection pattern)
- ✅ CORS pre-configured for frontend consumption

---

## 1. Current Project Structure

### Project Tree (Functional View)

```
dslist/
├── src/
│   ├── main/
│   │   ├── java/com/celisapp/dslist/
│   │   │   ├── DslistApplication.java           [Application entry point]
│   │   │   ├── controllers/
│   │   │   │   └── GameController.java          [REST endpoints: /games]
│   │   │   ├── service/
│   │   │   │   └── GameService.java             [Business logic]
│   │   │   ├── repositories/
│   │   │   │   ├── GameRepository.java          [JPA: Game entity CRUD + custom query]
│   │   │   │   └── GameListRepository.java      [JPA: GameList entity CRUD]
│   │   │   ├── entities/
│   │   │   │   ├── Game.java                    [Entity: tb_game]
│   │   │   │   ├── GameList.java                [Entity: tb_game_list]
│   │   │   │   ├── Belonging.java               [Entity: tb_belonging (join table)]
│   │   │   │   └── BelongingPK.java             [Composite PK: (game_id, list_id)]
│   │   │   ├── dto/
│   │   │   │   ├── GameDto.java                 [Full game DTO (all fields)]
│   │   │   │   ├── GameMinDto.java              [Minimal game DTO (5 fields)]
│   │   │   │   └── GameListDto.java             [Game list DTO]
│   │   │   └── projection/
│   │   │       └── GameMinProjection.java       [Interface for native query mapping]
│   │   └── resources/
│   │       ├── application.properties            [Active profile selector]
│   │       ├── application-dev.properties        [Dev config]
│   │       ├── application-prod.properties       [Production config]
│   │       ├── application-test.properties       [Test config]
│   │       └── import.sql                        [H2 schema + seed data]
│   └── test/
│       └── java/com/celisapp/dslist/
│           └── DslistApplicationTests.java       [Smoke test]
├── create.sql                                    [PostgreSQL DDL + seed data]
├── pom.xml                                       [Maven: dependencies & build]
└── docker-compose.yml                            [Dev environment: PostgreSQL + pgAdmin]
```

### Layers Overview

| Layer | Component | Purpose |
|-------|-----------|---------|
| **HTTP** | `GameController` | REST API gateway; routing + HTTP binding |
| **Business** | `GameService` | Use-case orchestration; DTO transformation; repository coordination |
| **Data Access** | `GameRepository`, `GameListRepository` | JPA CRUD + custom queries (native SQL) |
| **Domain** | `Game`, `GameList`, `Belonging` | ORM entities; invariants; schema mapping |
| **API Contract** | `GameDto`, `GameMinDto`, `GameListDto` | JSON response schemas; decoupled from entity model |
| **Query Result** | `GameMinProjection` | Type-safe mapping for native queries |

---

## 2. REST API Endpoints

### Base URL
```
http://localhost:8080/games
```

### Endpoint Inventory

#### 1. **GET /games** — Retrieve All Games (Minimal)
- **Method:** `GET`
- **Path:** `/games`
- **Query Params:** None
- **Response:** `List<GameMinDto>` (HTTP 200)
- **Response Body Example:**
  ```json
  [
    {
      "id": 1,
      "title": "Mass Effect Trilogy",
      "year": 2012,
      "imgUrl": "https://...",
      "shortDescription": "Lorem ipsum..."
    },
    ...
  ]
  ```
- **DTO Fields:** `id`, `title`, `year`, `imgUrl`, `shortDescription`
- **Calling Method:** `GameService.getAllGames()`
- **Use Case:** Browse all games in catalog (light payload)
- **Migration Note:** Angular will call this on app init to populate game list view

---

#### 2. **GET /games/{id}** — Retrieve Single Game (Full Details)
- **Method:** `GET`
- **Path:** `/games/{id}`
- **Path Param:** `id: Long` (game primary key)
- **Response:** `GameDto` (HTTP 200) | `null` (HTTP 200, but null body)
- **Response Body Example:**
  ```json
  {
    "id": 1,
    "title": "Mass Effect Trilogy",
    "year": 2012,
    "genre": "Role-playing (RPG), Shooter",
    "platforms": "XBox, Playstation, PC",
    "score": 4.8,
    "imgUrl": "https://...",
    "shortDescription": "Lorem ipsum...",
    "longDescription": "Lorem ipsum dolor sit amet consectetur..."
  }
  ```
- **DTO Fields:** `id`, `title`, `year`, `genre`, `platforms`, `score`, `imgUrl`, `shortDescription`, `longDescription`
- **Calling Method:** `GameService.getGameById(Long id)`
- **Error Handling:** Returns `null` if game not found (consider changing to HTTP 404)
- **Use Case:** View game detail page
- **Migration Note:** Angular will route to `/game-detail/:id`, calling this endpoint to fetch full details

---

#### 3. **GET /games/list** — Retrieve All Game Lists
- **Method:** `GET`
- **Path:** `/games/list`
- **Query Params:** None
- **Response:** `List<GameListDto>` (HTTP 200)
- **Response Body Example:**
  ```json
  [
    {
      "id": 1,
      "name": "Aventura e RPG"
    },
    {
      "id": 2,
      "name": "Jogos de plataforma"
    }
  ]
  ```
- **DTO Fields:** `id`, `name`
- **Calling Method:** `GameService.getAllGameList()`
- **Use Case:** Load sidebar/menu of game list categories
- **Migration Note:** Angular will fetch this to populate category sidebar on app load

---

#### 4. **GET /games/list/{gameListId}** — Retrieve Games in a Specific List
- **Method:** `GET`
- **Path:** `/games/list/{gameListId}`
- **Path Param:** `gameListId: Long` (list primary key)
- **Response:** `List<GameMinDto>` (HTTP 200)
- **Response Body Example:**
  ```json
  [
    {
      "id": 1,
      "title": "Mass Effect Trilogy",
      "year": 2012,
      "imgUrl": "https://...",
      "shortDescription": "Lorem ipsum..."
    },
    ...
  ]
  ```
- **DTO Fields:** `id`, `title`, `year`, `imgUrl`, `shortDescription`
- **Calling Method:** `GameService.getGameListById(Long gameListId)`
- **Query Strategy:** Native SQL with `INNER JOIN` on `tb_belonging` table; ordered by `position`
- **Use Case:** Filter games by category (e.g., show only RPGs)
- **Migration Note:** Angular will call this when user clicks on a game list in sidebar

---

#### 5. **POST /games** — Add a New Game
- **Method:** `POST`
- **Path:** `/games`
- **Request Body:** `Game` entity (raw entity, NOT a DTO)
- **Request Body Example:**
  ```json
  {
    "title": "Starfield",
    "year": 2023,
    "genre": "Role-playing (RPG), Sci-Fi",
    "platforms": "XBox, PC",
    "score": 4.5,
    "imgUrl": "https://...",
    "shortDescription": "...",
    "longDescription": "..."
  }
  ```
- **Response:** `GameDto` (HTTP 200)
- **Calling Method:** `GameService.addGame(Game game)`
- **⚠️ ISSUE IDENTIFIED:** Accepts raw `Game` entity instead of DTO; violates API boundary separation
- **Use Case:** Admin feature to add new games to catalog
- **Migration Note:** Angular form will POST to this endpoint; consider creating `GameCreateDto` to improve API contract clarity

---

### API Contract Summary

| Endpoint | HTTP Method | Input | Output | Status | Notes |
|----------|------------|-------|--------|--------|-------|
| `/games` | GET | — | `List<GameMinDto>` | 200 | List all games (light) |
| `/games/{id}` | GET | `id: Long` | `GameDto` | 200 | Game detail (full) |
| `/games/list` | GET | — | `List<GameListDto>` | 200 | List categories |
| `/games/list/{id}` | GET | `id: Long` | `List<GameMinDto>` | 200 | Games by category |
| `/games` | POST | `Game` entity | `GameDto` | 200 | Add game (⚠️ uses entity) |

---

## 3. Data Models & Relationships

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ┌──────────────┐      ┌──────────────────┐         │
│    │   tb_game    │◄────►│  tb_belonging    │         │
│    ├──────────────┤      ├──────────────────┤         │
│    │ id (PK)      │      │ game_id (FK)     │         │
│    │ title        │      │ list_id (FK)     │         │
│    │ game_year    │      │ position         │         │
│    │ genre        │      └──────────────────┘         │
│    │ platforms    │              ▲                    │
│    │ score        │              │                    │
│    │ img_url      │              │ (composite FK)     │
│    │ short_...    │              │                    │
│    │ long_...     │              ▼                    │
│    └──────────────┘      ┌──────────────────┐         │
│                          │  tb_game_list    │         │
│                          ├──────────────────┤         │
│                          │ id (PK)          │         │
│                          │ name             │         │
│                          └──────────────────┘         │
│                                                         │
│  Relationship Type: Many-to-Many (Game ↔ GameList)   │
│  Join Table: tb_belonging (has position ordering)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Entity Definitions

#### **Game Entity** → `tb_game` table
- **PK:** `id` (bigint, auto-generated)
- **Fields:**
  - `title: String` — game name
  - `year: Integer` — release year (mapped as `game_year` in DB)
  - `genre: String` — comma-separated genres (e.g., "RPG, Shooter")
  - `platforms: String` — comma-separated platforms (e.g., "Xbox, PlayStation, PC")
  - `score: Double` — critic/user rating (0.0–5.0)
  - `imgUrl: String` — cover image URL
  - `shortDescription: String` — 1-line teaser
  - `longDescription: String` — full description (TEXT field, no length limit)
- **ORM Mapping:** JPA entity with explicit column mappings (`@Column`)
- **Serialization:** Implements `Serializable`

#### **GameList Entity** → `tb_game_list` table
- **PK:** `id` (bigint, auto-generated)
- **Fields:**
  - `name: String` — category name (e.g., "Aventura e RPG")
- **Relationships:** One-to-Many with `Game` (via `Belonging`)
- **Serialization:** Implements `Serializable`

#### **Belonging Entity** → `tb_belonging` table (Join/Bridge Table)
- **PK:** `BelongingPK` (composite: `game_id` + `list_id`)
  - Embedded ID pattern (`@EmbeddedId`)
  - Both fields are foreign keys: `@ManyToOne @JoinColumn`
- **Additional Fields:**
  - `position: Integer` — display order within the list (0-indexed)
- **Purpose:** Maintains M2M relationship with ordering; a game can appear in multiple lists at different positions
- **Example Data:**
  - List 1 (Aventura e RPG) contains Game 1 at position 0, Game 2 at position 1, ...
  - List 2 (Plataforma) contains Game 6 at position 0, Game 7 at position 1, ...

### DTO Definitions (API Contracts)

#### **GameDto** — Full Game Representation
- **Fields:** All 9 game fields (`id`, `title`, `year`, `genre`, `platforms`, `score`, `imgUrl`, `shortDescription`, `longDescription`)
- **Constructors:**
  - `GameDto(Game entity)` — uses `BeanUtils.copyProperties()` for automatic field mapping
  - `GameDto(Long id, String title, ...)` — explicit field assignment
- **Use:** Endpoint `/games/{id}` response

#### **GameMinDto** — Minimal Game Representation
- **Fields:** 5 fields (`id`, `title`, `year`, `imgUrl`, `shortDescription`)
- **Constructors:**
  - `GameMinDto(Game entity)` — maps select fields from entity
  - `GameMinDto(GameMinProjection projection)` — maps from native query result
- **Use:** Endpoints `/games` and `/games/list/{id}` responses (light-weight payloads)

#### **GameListDto** — Game List/Category Representation
- **Fields:** 2 fields (`id`, `name`)
- **Constructors:**
  - `GameListDto(GameList entity)` — direct mapping
  - `GameListDto(Long id, String name)` — explicit assignment
- **Use:** Endpoint `/games/list` response

### Projection Interface

#### **GameMinProjection** — Type-Safe Native Query Result Mapping
- **Purpose:** Interface for mapping native SQL query result rows to typed objects
- **Fields (read-only):** `id`, `title`, `year`, `imgUrl`, `shortDescription`, `position`
- **Used By:** `GameRepository.searchByList()` custom native query
- **Benefit:** Avoids Map-based result sets; type-safe and IDE-refactorable

---

## 4. Technology Stack & Dependencies

### Core Framework Versions

| Component | Version | Status |
|-----------|---------|--------|
| **Spring Boot** | 3.4.2 | Stable (latest 3.x) |
| **Java** | 21 (LTS) | Current LTS release |
| **Spring Data JPA** | 3.4.2 (via parent) | Stable |
| **Servlet/Tomcat** | Embedded (via starter-web) | Stable |

### Maven Dependencies

| Group | Artifact | Version | Scope | Purpose |
|-------|----------|---------|-------|---------|
| `org.springframework.boot` | `spring-boot-starter-data-jpa` | 3.4.2 | compile | JPA + Hibernate ORM |
| `org.springframework.boot` | `spring-boot-starter-web` | 3.4.2 | compile | REST, Servlet, Tomcat |
| `com.h2database` | `h2` | Latest (from BOM) | runtime | In-memory DB (dev/test) |
| `org.postgresql` | `postgresql` | 42.7.6 | runtime | PostgreSQL JDBC driver |
| `org.springframework.boot` | `spring-boot-devtools` | 3.4.2 | runtime | Hot reload (dev) |
| `org.springframework.boot` | `spring-boot-starter-test` | 3.4.2 | test | JUnit, Mockito, AssertJ |

### Plugins

| Group | Artifact | Version |
|-------|----------|---------|
| `org.apache.maven.plugins` | `maven-compiler-plugin` | 3.13.0 |
| `org.springframework.boot` | `spring-boot-maven-plugin` | 3.4.2 (via parent) |

### Key Architecture Decisions

- **ORM:** Hibernate (via Spring Data JPA) — no custom JDBC
- **Database:** Polyglot support
  - **Dev:** H2 (in-memory, file-based)
  - **Prod:** PostgreSQL
- **Build:** Maven (standard Java toolchain)
- **DTO Pattern:** Manual DTO classes (not MapStruct/ModelMapper) — clear, explicit transformations
- **Transactions:** Auto-managed by Spring Data (per-method)

---

## 5. Configuration Files & Profiles

### Application Properties

#### **Base Configuration** (`application.properties`)
```properties
spring.application.name=dslist
spring.profiles.active=${APP_PROFILE:dev}
spring.jpa.open-in-view=false
cors.origins=${CORS_ORIGINS:http://localhost:5173,http://localhost:3000}
```

**Key Settings:**
- **Profile Activation:** Defaults to `dev` if `APP_PROFILE` env var not set
- **JPA:** `open-in-view=false` (best practice; prevents lazy-loading pitfalls)
- **CORS:** Whitelist configured via environment; defaults to localhost:5173 (Vite dev server) and localhost:3000 (alternative dev port)

#### **Development Profile** (`application-dev.properties`)
- Configures H2 in-memory or file-based database
- SQL logging enabled
- Hot reload enabled (devtools)
- *(details not visible in provided content; assumed standard)*

#### **Production Profile** (`application-prod.properties`)
- PostgreSQL connection details
- Connection pooling configured
- SQL logging disabled
- *(details not visible in provided content; assumed standard)*

#### **Test Profile** (`application-test.properties`)
- H2 in-memory database
- Test-specific configuration
- *(details not visible in provided content; assumed standard)*

### Database Schema

**Schema Location:** `create.sql` (PostgreSQL DDL)  
**Seed Location:** `create.sql` (INSERT statements)

**Tables:**
1. `tb_game` — 9 columns, IDENTITY PK
2. `tb_game_list` — 2 columns, IDENTITY PK
3. `tb_belonging` — 3 columns, composite PK (game_id + list_id), 2 FKs, 1 position column

**Seed Data:** 10 games + 2 lists + 10 join records (demonstrates M2M with position ordering)

### Docker Environment

**File:** `docker-compose.yml`

**Services:**
- PostgreSQL (port 5432)
- pgAdmin (port 5050, admin UI for PostgreSQL)

**Purpose:** Local development environment; stand up with `docker-compose up`

---

## 6. Monorepo Transformation Requirements

### Current State (Backend-Only)
- Project root contains only backend code
- No frontend application
- No root-level coordination files

### Target State (Monorepo: Backend + Frontend)

**Directory Structure:**
```
dslist/ (monorepo root)
├── backend/                        (current backend, relocated)
│   ├── src/
│   ├── pom.xml
│   ├── docker-compose.yml
│   ├── create.sql
│   └── ...
├── frontend/                       (new Angular 18+ app)
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── styles/
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── ...
├── .gitignore                      (monorepo-level)
├── .editorconfig                   (shared)
├── README.md                       (monorepo overview)
├── docker-compose.yml              (orchestrates backend + frontend, optional)
└── .github/
    └── workflows/                  (CI/CD for both services)
```

### Integration Points

| Layer | Backend API | Frontend Client |
|-------|-------------|-----------------|
| **HTTP Base URL** | `http://localhost:8080` | Configurable via `environment.ts` |
| **CORS Origin** | `http://localhost:5173` (Vite) | Vite dev server default |
| **Data Models** | GameDto, GameMinDto, GameListDto | TypeScript interfaces (auto-generated from OpenAPI spec) |
| **Authentication** | *(Currently: None; consider for future)* | *(Currently: None)* |

### API Endpoint Consumption by Frontend

| Angular Route | Backend Endpoint | Method | Purpose |
|---------------|-----------------|--------|---------|
| `/` (home) | `GET /games` | GET | Load all games |
| `/game/:id` | `GET /games/{id}` | GET | View game details |
| `/list` (sidebar) | `GET /games/list` | GET | Load game categories |
| `/list/:id` | `GET /games/list/{id}` | GET | Filter by category |
| *(admin)* | `POST /games` | POST | Add new game |

---

## 7. Key Architecture Decisions

### ✅ Decisions to Preserve

1. **3-Layer Architecture (Controller → Service → Repository)**
   - Clean, testable, maintainable
   - Recommended for both backend isolation and frontend consumption

2. **DTO Pattern (Explicit Transformation)**
   - Decouples API contracts from ORM models
   - Allows API versioning without schema migration
   - Clear for frontend developers to understand JSON shapes

3. **Native SQL Queries (GameRepository.searchByList)**
   - More efficient than ORM for complex joins with ordering
   - Type-safe via Projection interface
   - Keep as-is for performance

4. **CORS Configuration**
   - Already whitelists frontend dev servers
   - Simple to extend to production frontend domain

5. **Multi-Profile Configuration**
   - Separates dev/prod concerns cleanly
   - Supports environment-based deployment

### ⚠️ Issues & Recommendations

| Issue | Current Behavior | Recommendation | Severity |
|-------|------------------|-----------------|----------|
| **POST /games accepts raw entity** | Input: `Game` entity (not DTO) | Create `GameCreateDto` or `GameCreateRequest` | MEDIUM |
| **getGameById returns null on 404** | No HTTP 404 status | Return `ResponseEntity<GameDto>` with proper HTTP codes | MEDIUM |
| **No input validation** | No `@Valid` on `@RequestBody` | Add `@Valid` + `@NotBlank`, `@NotNull`, `@Min`, `@Max` | LOW |
| **No error handling** | No `@ControllerAdvice`, no GlobalExceptionHandler | Add `GlobalExceptionHandler` for consistent error responses | MEDIUM |
| **No API versioning** | Currently `/games`, no `/v1/games` prefix | Consider API versioning if future-proofing needed | LOW |
| **No pagination** | All lists return all records | Add `Pageable` parameter to GET /games and GET /games/list/{id} | LOW |
| **Hard-coded CORS origins** | In properties file | Consider dynamic CORS based on environment (prod domain TBD) | LOW |

---

## 8. Data Flow & Sequence

### Request Flow: Retrieve All Games

```
Client (Angular)
    │
    ├─ HTTP GET http://localhost:8080/games
    │
    ▼
GameController.getAllGames()
    │
    ├─ Calls: GameService.getAllGames()
    │
    ▼
GameService.getAllGames()
    │
    ├─ Calls: GameRepository.findAll()      [JPA CRUD]
    │
    ▼
GameRepository.findAll()
    │
    ├─ Generates SQL: SELECT * FROM tb_game
    ├─ Executes against H2 (dev) or PostgreSQL (prod)
    │
    ▼
List<Game> entities returned to service
    │
    ├─ Service transforms to: games.stream()
    │                         .map(game -> new GameMinDto(game))
    │                         .toList()
    │
    ▼
List<GameMinDto> returned to controller
    │
    ├─ Spring serializes to JSON
    │
    ▼
HTTP 200 + JSON array
    │
    ├─ Angular receives, stores in component state
    │ (could use NgRx or signals for state management)
    │
    ▼
View rendered with game list
```

### Request Flow: Filter Games by List (Complex Query)

```
Client (Angular)
    │
    ├─ HTTP GET http://localhost:8080/games/list/1
    │
    ▼
GameController.getGamesListById(1)
    │
    ├─ Calls: GameService.getGameListById(1)
    │
    ▼
GameService.getGameListById(1)
    │
    ├─ Calls: GameRepository.searchByList(1)   [Native SQL]
    │
    ▼
GameRepository.searchByList(1)
    │
    ├─ Generates native SQL:
    │   SELECT tb_game.id, tb_game.title, ...
    │   FROM tb_game
    │   INNER JOIN tb_belonging ON tb_game.id = tb_belonging.game_id
    │   WHERE tb_belonging.list_id = 1
    │   ORDER BY tb_belonging.position
    │
    ├─ Executes query
    │
    ▼
List<GameMinProjection> (query result rows)
    │
    ├─ Service transforms to: list.stream()
    │                         .map(proj -> new GameMinDto(proj))
    │                         .toList()
    │
    ▼
List<GameMinDto> returned to controller
    │
    ├─ Spring serializes to JSON
    │
    ▼
HTTP 200 + JSON array (ordered by position)
    │
    ├─ Angular receives, renders filtered game list
    │
    ▼
UI updates with category-filtered games
```

---

## 9. Build & Deployment

### Build Command
```bash
./mvnw clean package
```

**Output:** `target/dslist-0.0.1-SNAPSHOT.jar`

### Run Command (Dev)
```bash
./mvnw spring-boot:run
```

**Binds to:** `http://localhost:8080`

### Run Command (Docker)
```bash
docker-compose up
```

**Services:** PostgreSQL + pgAdmin (backend still runs locally)

### Test Execution
```bash
./mvnw clean test
```

**Test Class:** `DslistApplicationTests.java`

---

## 10. Audit Findings Summary

### Strengths
- ✅ Clean 3-layer architecture
- ✅ Well-separated concerns (entities ↔ DTOs ↔ API)
- ✅ Efficient query patterns (native SQL with projection mapping)
- ✅ Profile-based configuration (dev/prod separation)
- ✅ CORS pre-configured for frontend integration
- ✅ Small, maintainable codebase

### Areas for Enhancement
- ⚠️ POST endpoint accepts raw entity (should use DTO)
- ⚠️ Missing HTTP error status codes (404, 400, 500)
- ⚠️ No input validation decorators (`@Valid`, `@NotBlank`)
- ⚠️ No global exception handler for consistent error responses
- ⚠️ No pagination support (could be needed at scale)

### Migration Readiness
- ✅ **Frontend Integration:** Fully ready; CORS configured, API contracts clear
- ✅ **Monorepo Structure:** Ready for `/backend` relocation + `/frontend` creation
- ✅ **Angular 18+ Consumer:** All endpoints map to standard Angular patterns (HttpClient, Services, Components)

---

## 11. Appendix: Quick Reference

### REST Endpoint Matrix
```
┌─────────────────────────────────────────────────────────────────┐
│ Method │ Endpoint           │ Input        │ Output            │
├─────────────────────────────────────────────────────────────────┤
│ GET    │ /games             │ —            │ List<GameMinDto>  │
│ GET    │ /games/{id}        │ id: Long     │ GameDto           │
│ GET    │ /games/list        │ —            │ List<GameListDto> │
│ GET    │ /games/list/{id}   │ id: Long     │ List<GameMinDto>  │
│ POST   │ /games             │ Game entity  │ GameDto           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Inventory

| Component | Type | Count | LOC |
|-----------|------|-------|-----|
| Controllers | REST | 1 | ~50 |
| Services | Business | 1 | ~60 |
| Repositories | Data | 2 | ~30 |
| Entities | Domain | 3 | ~150 |
| DTOs | API Contract | 3 | ~100 |
| Projections | Query Result | 1 | ~10 |
| **Total** | — | **11** | **~400** |

### Test Coverage
- 1 integration test class: `DslistApplicationTests.java`
- Smoke test (app context load)

---

## Next Steps

1. **Frontend Setup (Angular 18+)**
   - Create `/frontend` directory with Angular CLI
   - Configure HttpClient to consume `http://localhost:8080/games`
   - Build Angular services mirroring backend layers (GameService, GameListService)

2. **Monorepo Reorganization**
   - Move current backend to `/backend`
   - Update relative paths in POM and Docker Compose
   - Create monorepo-level `.gitignore`, `README.md`

3. **API Enhancement (Optional)**
   - Fix POST endpoint to accept `GameCreateDto`
   - Add error handling with proper HTTP status codes
   - Add input validation decorators

4. **CI/CD Integration**
   - Create GitHub Actions workflows for backend build + test
   - Create frontend build workflow (Angular)
   - Test both services in monorepo CI pipeline

---

**Audit Completed By:** architect role  
**Audit Date:** 2026-06-02  
**Status:** ✅ Ready for Frontend Integration & Monorepo Conversion
