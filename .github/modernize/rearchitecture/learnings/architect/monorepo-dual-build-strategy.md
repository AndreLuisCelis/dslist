# monorepo-dual-build-strategy.md

**Category**: Architecture Decision | **Status**: Active | **Date**: 2026-06-02

## Decision

Use a **dual-build monorepo** for Spring Boot backend (Maven) + Angular frontend (npm).

Backend uses Maven exclusively; frontend uses npm. Root `package.json` provides orchestration scripts.

## Rationale

- **Backend (Maven)**: Existing Spring Boot 3.4.2 uses Maven 3.8+. Rewriting to Gradle/npm would break established workflows, introduce risk.
- **Frontend (npm)**: Angular 18+ mandates Node.js + npm. Forcing Maven does not add value (Maven plugins for Node.js are poor).
- **Orchestration**: Root `package.json` provides unified entry points (`npm run dev`, `npm run build:all`) that delegate to native tools.
- **Independence**: Each subsystem upgrades independently; no forced version coordination.

## Implementation (t3 onward)

- Create root `pom.xml` with `<packaging>pom</packaging>` + `<modules><module>backend</module></modules>`
- Create root `package.json` with scripts:
  ```json
  {
    "scripts": {
      "dev": "concurrently \"npm run backend:dev\" \"npm run frontend:dev\"",
      "backend:dev": "cd backend && ./mvnw spring-boot:run",
      "frontend:dev": "cd frontend && npm start",
      "build:all": "npm run backend:build && npm run frontend:build"
    }
  }
  ```
- Developers must have: JDK 21 + Maven 3.8+ AND Node.js 18+ + npm 9+

## Why This Works

- Aligns with ecosystem best practices (Maven for JVM, npm for Node.js)
- No impedance mismatch forcing artificial build system choices
- Clear separation of concerns (Maven handles backend versioning, npm handles frontend)
- Future microservices can add more Maven modules; Node.js services added separately

## When to Override

- If an organization mandates Gradle for all JVM projects: Use Gradle at root instead, but keep npm separate.
- If moving to a polyglot build tool (Bazel, Nx): Coordinate across architecture team first.

