# Developer Guide - Auction Platform

Welcome to the Auction Platform monorepo! This guide explains the technology stack, the strict linting rules we've put in place, and how to set up your environment for the best experience.

## 1. Technology Stack

### Core

- **Monorepo**: Managed with [Bun](https://bun.sh) workspaces.
- **Package Manager**: `bun` (v1.1.45+).
- **Language**: TypeScript (in strict mode).

### Apps

- **`apps/api`**:
  - Framework: **Fastify** (High performance Node.js framework).
  - Database ORM: **Prisma** (Type-safe database client).
  - Validation: **Zod**.
  - Environment: Node.js (via Bun runtime).
- **`apps/web`**:
  - Framework: **React** (v18) + **Vite**.
  - State/Data Fetching: **TanStack Query** (React Query).
  - Styling: **Tailwind CSS**.
  - Routing: **React Router**.

### Packages

- **`packages/ui`**: Shared UI component library (React + Tailwind).
- **`packages/config`**: Shared configurations (ESLint, TypeScript, Tailwind).
- **`packages/shared-types`**: Shared TypeScript interfaces/DTOs.

---

## 2. ESLint Strictness & Plugins

This report analyzes the current ESLint setup across the `auction-platform` monorepo.

### 🛡️ Enforced Rules (Strict)

These rules are explicitly set to **ERROR** or enabled via recommended sets, requiring immediate fixes or explicit suppression.

#### 🧱 General & TypeScript (Base)

| Rule                                             | Severity | Description                                                     |
| :----------------------------------------------- | :------- | :-------------------------------------------------------------- |
| **`no-console`**                                 | 🔴 Error | `console.log` is forbidden. Use a logger.                       |
| **`eqeqeq`**                                     | 🔴 Error | Strict equality (`===`) is required.                            |
| **`simple-import-sort/*`**                       | 🔴 Error | Imports and exports must be sorted.                             |
| **`@typescript-eslint/no-explicit-any`**         | 🔴 Error | Usage of `any` is strictly prohibited.                          |
| **`@typescript-eslint/no-unused-vars`**          | 🔴 Error | Unused variables are not allowed.                               |
| **`@typescript-eslint/consistent-type-imports`** | 🔴 Error | Enforces `import type` for type-only imports.                   |
| **`@typescript-eslint/no-floating-promises`**    | 🔴 Error | Promises must be awaited or handled.                            |
| **`@typescript-eslint/await-thenable`**          | 🔴 Error | Only Promises should be awaited.                                |
| **`@typescript-eslint/no-misused-promises`**     | 🔴 Error | Checks for Promises used in places expecting void/sync returns. |
| **`plugin:promise/recommended`**                 | 🔴/🟡    | Best practices for Promises (nested, callbacks, etc.).          |
| **`plugin:sonarjs/recommended`**                 | 🔴/🟡    | Code smell detection (complexity, bugs).                        |

#### 🟢 Node.js Services (`apps/api`, scripts)

| Rule                       | Severity | Description                                               |
| :------------------------- | :------- | :-------------------------------------------------------- |
| **`plugin:n/recommended`** | 🔴/🟡    | Node.js specific best practices (engines, process usage). |

#### ⚛️ React & UI (`apps/web`, `packages/ui`)

| Rule                                     | Severity | Description                                              |
| :--------------------------------------- | :------- | :------------------------------------------------------- |
| **`react-hooks/rules-of-hooks`**         | 🔴 Error | Enforces Hook rules (top-level only, etc.).              |
| **`react-hooks/exhaustive-deps`**        | 🔴 Error | Checks dependency arrays in `useEffect`, `useMemo`, etc. |
| **`plugin:jsx-a11y/recommended`**        | 🔴/🟡    | Accessibility rules (aria-labels, alt text).             |
| **`plugin:tailwindcss/recommended`**     | 🔴/🟡    | Class validation, ordering, and conflict detection.      |
| **`plugin:@tanstack/query/recommended`** | 🔴/🟡    | React Query best practices.                              |

### 🔓 Disabled or Relaxed Rules

These rules have been explicitly turned **OFF** to reduce noise or because they conflict with other tools.

#### 🎭 General

| Rule                 | Reason                                                                         |
| :------------------- | :----------------------------------------------------------------------------- |
| **`no-unused-vars`** | **Replaced** by `@typescript-eslint/no-unused-vars` to handle types correctly. |

#### 🟢 Node.js

| Rule                          | Reason                                                            |
| :---------------------------- | :---------------------------------------------------------------- |
| **`n/no-missing-import`**     | **Handled by TypeScript**. The compiler already checks this.      |
| **`n/no-unpublished-import`** | **Relaxed** to allow importing devDependencies in standard files. |
| **`n/no-extraneous-import`**  | **Relaxed** to reduce false positives in monorepo structure.      |

#### ⚛️ React

| Rule                                 | Reason                                                                        |
| :----------------------------------- | :---------------------------------------------------------------------------- |
| **`react/react-in-jsx-scope`**       | **Obsolete**. React 17+ (and Vite) doesn't require `import React`.            |
| **`sonarjs/prefer-read-only-props`** | **Too Strict**. Often conflicts with standard React pattern of passing props. |

### 💡 Summary of Policy

The configuration prioritizes **type safety** and **code consistency**.

- **Async/Await safety** is heavily enforced (`no-floating-promises`, `await-thenable`).
- **Code Style** is automated (`simple-import-sort`, `prettier`).
- **React Hooks** are treated as critical correctness issues, not just suggestions.
- **Node/TypeScript** overlap is managed by disabling redundant ESLint rules in favor of TS compiler checks.

---

## 3. IDE Setup (VSCode / Antigravity)

To get the best experience (and avoid CI failures), use the recommended VSCode setup. We have included configuration files in `.vscode/`.

### Recommended Extensions

When you open the project, VSCode should prompt you to install recommended extensions. If not, install these:

- **ESLint** (`dbaeumer.vscode-eslint`) -> **Critical** for real-time feedback.
- **Prettier** (`esbenp.prettier-vscode`) -> For code formatting.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) -> For class autocompletion.
- **Pretty TypeScript Errors** (`yoavbls.pretty-ts-errors`) -> Makes TS errors readable.

### Configuration

The project is configured (`.vscode/settings.json`) to:

- **Auto-fix on Save**: ESLint will automatically sort imports and fix fixable errors when you save.
- **Validate**: TypeScript and React files are validated by ESLint.

---

## 4. Commit Etiquette

We follow **Conventional Commits** standards. This is enforced by `commitlint` and `husky`.

### Format

```text
<type>(<scope>): <subject>
```

### Common Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

- `feat(auth): add login page`
- `fix(api): resolve prisma connection timeout`
- `chore(eslint): enforce strict hook rules`

> **Note**: Your commit will be rejected if it does not follow this format.

---

## 5. Development Commands

- **Start Dev Server**: `bun run dev` (starts both API and Web)
- **Lint**: `bun run lint` (checks all packages)
- **Typecheck**: `bun run typecheck`
- **Format**: `bun run format`
