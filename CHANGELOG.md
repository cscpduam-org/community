# Changelog

All notable changes to the **CSCPDUAM Community** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-31

### Added
- **Initial Release** of CSCPDUAM Community web portal.
- **Frontend Architecture:** Next.js 15 App Router setup with React 19, TypeScript strict mode, and Server Components for optimal data fetching performance.
- **Backend Integration:** Direct GraphQL integration with GitHub Discussions via `@octokit/graphql` as the single source of truth.
- **Authentication:** Integrated Auth.js (NextAuth.js v5) supporting GitHub OAuth authentication.
- **Design System & Styling:** Styled with Tailwind CSS, shadcn/ui component primitives, Radix UI primitives, Lucide React icons, and Framer Motion animations.
- **Theme Support:** Dark mode, light mode, and system preference detection via `next-themes`.
- **Markdown Rendering:** GitHub Flavored Markdown (GFM) renderer using `react-markdown` and `remark-gfm` with HTML sanitization.
- **Repository Documentation:** Complete suite of standard documentation files (`README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`, `CHANGELOG.md`, `.env.example`, and `.github` templates).

### Security
- Exclusively server-side execution of GitHub GraphQL queries requiring API credentials.
- Strict isolation of OAuth client secret handling using environment variables (`.env.local`).
