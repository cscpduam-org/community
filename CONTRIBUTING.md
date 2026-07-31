# Contributing to CSCPDUAM Community

Thank you for your interest in contributing to **CSCPDUAM Community**! 

This project is the official community platform for the **Department of Computer Science at Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya (PDUAM)**. We welcome contributions from students, faculty, alumni, and open-source developers of all skill levels.

---

## 📜 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [How to Contribute](#-how-to-contribute)
3. [Branch Strategy](#-branch-strategy)
4. [Commit Conventions](#-commit-conventions)
5. [Development Workflow](#-development-workflow)
6. [Coding Standards](#-coding-standards)
7. [Code Review Standards](#-code-review-standards)

---

## 🛡️ Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating to ensure a welcoming, inclusive, and respectful environment for everyone.

---

## 💡 How to Contribute

### 1. Reporting Bugs
- Search existing [GitHub Issues](https://github.com/cscpduam-org/community/issues) to ensure the bug hasn't already been reported.
- If not reported, open a new Issue using the **Bug Report** template.
- Include clear steps to reproduce, expected vs actual behavior, system/browser details, and screenshots if applicable.

### 2. Suggesting Features
- Open an Issue using the **Feature Request** template.
- Explain the problem the feature solves and why it would benefit the community.
- Provide mockup ideas or architecture design notes if available.

### 3. Submitting Code (Pull Requests)
- Fork the repository or create a dedicated feature branch.
- Follow our branch naming and commit rules.
- Test your changes locally before opening a Pull Request (PR).

---

## 🌿 Branch Strategy

The `main` branch is protected and contains production-ready code. All work must take place on topic branches created from `main`.

### Branch Naming Patterns

Use prefixes matching your task scope:

- **Features:** `feature/<short-description>` (e.g., `feature/github-oauth`, `feature/discussion-search`)
- **Bug Fixes:** `fix/<short-description>` (e.g., `fix/navbar-mobile`, `fix/markdown-xss`)
- **Documentation:** `docs/<short-description>` (e.g., `docs/readme-setup`, `docs/architecture`)
- **Refactoring:** `refactor/<short-description>` (e.g., `refactor/graphql-client`)
- **Performance:** `perf/<short-description>` (e.g., `perf/image-loading`)
- **Maintenance:** `chore/<short-description>` (e.g., `chore/update-deps`)

---

## 📝 Commit Conventions

We strictly follow the **[Conventional Commits specification](https://www.conventionalcommits.org/)**.

### Commit Message Structure

```
<type>(<scope>): <short summary in lowercase>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feat` | Adding a new feature | `feat(auth): add github oauth callback handler` |
| `fix` | Fixing a bug | `fix(search): prevent empty search query error` |
| `docs` | Documentation changes | `docs(readme): update environment variable setup` |
| `style` | Code formatting (whitespace, semicolons) | `style(navbar): fix button alignment` |
| `refactor` | Code change that neither fixes a bug nor adds a feature | `refactor(api): modularize graphql query builders` |
| `perf` | Performance improvements | `perf(image): add next/image optimization` |
| `test` | Adding or updating tests | `test(markdown): add unit test for link rendering` |
| `chore` | Build tasks, package updates, config changes | `chore(deps): upgrade next.js to 15.1.7` |

### Rules for Commit Messages

1. Use lowercase for summary line.
2. Keep the summary under 72 characters.
3. Use the imperative voice ("add" instead of "added" or "adds").
4. Reference issue numbers in the footer (e.g., `Closes #42`).

---

## 🔄 Development Workflow

1. **Clone & Setup:**
   ```bash
   git clone https://github.com/cscpduam-org/community.git
   cd community
   pnpm install
   cp .env.example .env.local
   ```
2. **Create Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Develop & Verify:**
   Run verification commands locally before committing:
   ```bash
   pnpm lint        # Run ESLint
   pnpm type-check  # Run TypeScript check (tsc --noEmit)
   pnpm build       # Verify production build succeeds
   ```
4. **Commit & Push:**
   ```bash
   git add .
   git commit -m "feat(module): short description"
   git push origin feature/your-feature-name
   ```
5. **Open Pull Request:**
   Open a PR against the `main` branch filling out the PR template.

---

## 📐 Coding Standards

### TypeScript
- Strict mode is enabled (`strict: true` in `tsconfig.json`).
- Explicitly define interfaces or types for all component props and functions.
- Avoid using `any`; use `unknown` or specific type unions when types are dynamic.

### Component Structure
- **React Components:** Use `PascalCase.tsx` (e.g., `DiscussionCard.tsx`).
- **Utilities & Hooks:** Use `camelCase.ts` (e.g., `formatDate.ts`, `useGithub.ts`).
- **Folders:** Use `kebab-case` (e.g., `discussion-editor`).
- **Server Components:** Prefer Server Components by default. Add `'use client'` only when state, hooks, or event listeners are required.

### Styling & UI
- Use **Tailwind CSS** and **shadcn/ui** primitives exclusively.
- Do not add inline styles or separate CSS modules unless strictly necessary.
- Icons: Use `lucide-react` icons. Do not introduce additional icon libraries.
- Accessibility: Ensure interactive elements are keyboard reachable and have visible focus states (WCAG AA compliant).

---

## ⭐ Code Review Standards

Every Pull Request must pass review by repository maintainers before merging.

### Review Checklist

PRs will be evaluated on the following criteria:

- [ ] **Build & Type Safety:** Code compiles cleanly with zero TypeScript errors or ESLint warnings.
- [ ] **Architecture:** Respects the core philosophy (GitHub Discussions backend, Next.js Server Components frontend).
- [ ] **Security:** No secrets or credentials committed. Input is validated and Markdown output is sanitized.
- [ ] **Responsiveness:** Layout works seamlessly across Mobile, Tablet, and Desktop screens.
- [ ] **Performance:** Avoids unnecessary re-renders or un-cached remote fetches.
- [ ] **Readability & Style:** Code is well-organized, readable, and uses standard project conventions.

---

Thank you for helping build a better platform for the **CSCPDUAM Community**! 🚀
