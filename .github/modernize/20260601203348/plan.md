# Upgrade Plan: dslist (20260601233610)

- **Generated**: 2026-06-01 23:36 UTC
- **HEAD Branch**: modernize/java-20260601203348
- **HEAD Commit ID**: N/A

## Available Tools

**JDKs**
- JDK 21.0.11: /usr/lib/jvm/java-21-openjdk-amd64/bin
- JDK 21.0.11: /usr/lib/jvm/java-1.21.0-openjdk-amd64/bin

**Build Tools**
- Maven 3.9.9 (Wrapper): .mvn/wrapper/maven-wrapper.properties → distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9
- Maven: /usr/share/maven/bin (system)

## Guidelines

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred.

- User request: upgrade runtime to Java 21 (latest LTS) and ensure project builds and tests under Java 21.

## Options

- Working branch: appmod/java-upgrade-20260601233610
- Run tests before and after the upgrade: true

## Upgrade Goals

- Java: 21

## Technology Stack

| Technology/Dependency    | Current | Min Compatible | Why Incompatible |
| ------------------------ | ------- | -------------- | ---------------------------------------------- |
| Java                     | 21      | 21             | User requested                                 |
| Spring Boot              | 3.4.2   | 3.4.x (supports Java 21) | Current parent is Spring Boot 3.4.2 — compatible with Java 21 |
| Maven (wrapper)          | 3.9.9   | 3.9.x+         | Wrapper is modern and compatible with Java 21 |

## Derived Upgrades

- Ensure `maven-compiler-plugin` uses `release` 21 (or `source`/`target` 21) to compile to Java 21 deterministically. Recommend plugin `3.11.0` (recommended for newer JDKs).
- No Kotlin present; no Kotlin changes needed.

## Impact Analysis

### Dependency Changes

| File | Dependency | Current | Action | Target | Reason |
|------|------------|---------|--------|--------|--------|
| pom.xml | maven-compiler-plugin (pluginManagement) | none | add/configure | 3.11.0 + `release` 21 | Ensure compiler uses Java 21 release and reproducible behavior across environments |

### Source Code Changes

No source-code package namespace changes required: project already uses `jakarta.persistence` and Java 21 language features (text blocks). No `javax.*` usages detected that need replacement.

### Configuration Changes

| File | Property/Setting | Current | Required Change | Reason |
|------|------------------|---------|-----------------|--------|
| pom.xml | `<properties><java.version>` | 21 | keep as 21 | Project already targets Java 21 |
| system.properties | `java.runtime.version` | 21 | keep as 21 | Correct for deployment platforms that use `system.properties` |

### CI/CD Changes

No CI/CD files detected in repository referencing older JDKs; Docker/Compose not changed by this plan. If CI uses older runners, update external CI to include JDK 21.

### Risks & Warnings

- Some tracked files remained modified after the initial stash attempt (create.sql, GameRepository.java). Branch exists and is active; changes will be committed on this branch per instructions.
- Runtime reflection/internal API access scan found no instances of `sun.*` or other internal APIs. Runtime issues are unlikely but possible for 3rd-party native libs.

## Upgrade Steps

- Step 1: Setup Environment
  - **Rationale**: Verify JDK 21 availability on the machine and ensure Maven wrapper will run with it
  - **Changes to Make**: none (verify environment)
  - **Verification**: `mvn -v` using `./mvnw` or system `mvn`; JDK: /usr/lib/jvm/java-21-openjdk-amd64/bin; Expected: Maven runs and reports Java 21

- Step 2: Baseline Build & Tests
  - **Rationale**: Capture current build/test status before changes
  - **Changes to Make**: none
  - **Verification**: `./mvnw -q clean test-compile && ./mvnw -q test` using Java 21; Expected: baseline compile and tests run (record results)

- Step 3: Configure Compiler Plugin for Java 21
  - **Rationale**: Ensure the project compiles with `release` 21 consistently across environments
  - **Changes to Make**: Update `pom.xml` to add `<plugin>` configuration for `maven-compiler-plugin` 3.11.0 with `<release>21` (and keep `<java.version>` property)
  - **Verification**: `./mvnw -q clean test-compile` using Java 21; Expected: compile success

- Step 4: CVE scan of direct dependencies
  - **Rationale**: Ensure no known CVEs in direct dependencies; fix if found
  - **Changes to Make**: Apply patch upgrades if CVEs are reported
  - **Verification**: Use `mvn dependency:list -DexcludeTransitive=true` and CVE scanner; Expected: none or fixed

- Step 5: Final Validation
  - **Rationale**: Run full test suite and resolve any failures
  - **Changes to Make**: Fix failing tests or code as required
  - **Verification**: `./mvnw -q clean test` using Java 21; Expected: 100% test pass rate


---

If you confirm this plan I will: (1) add the `maven-compiler-plugin` configuration to `pom.xml`, (2) run the baseline build/tests, (3) run the updated compilation and tests under Java 21, (4) scan direct dependencies for CVEs, and (5) iterate until all tests pass. All modified files and the progress will be saved under `.github/modernize/20260601203348/` as requested.
