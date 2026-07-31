# Security Policy

The **CSCPDUAM Community** project takes security seriously. As a community platform for the Department of Computer Science at Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya (PDUAM), protecting student, faculty, and maintainer data is a top priority.

---

## 🛡️ Supported Versions

Only the latest active version of the application receives security updates and vulnerability patches.

| Version | Supported |
| :--- | :--- |
| `1.0.x` | Yes |
| `< 1.0.0` | No |

---

## 📩 Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub Issues or GitHub Discussions.**

If you discover a security vulnerability or potential threat in CSCPDUAM Community, please report it privately:

1. **Email:** Send details of the vulnerability to `cscpduam.community@gmail.com` (or contact departmental security maintainers).
2. **Details to Include:**
   - Type of issue (e.g., XSS, OAuth secret leakage, CSRF, SSRF).
   - Step-by-step instructions or proof-of-concept to reproduce the issue.
   - Impact assessment (who or what is affected).
3. **Response Timeline:**
   - We will acknowledge receipt of your vulnerability report within **48 hours**.
   - We will provide a status update or fix plan within **7 days**.
   - A public release containing the fix will be published as soon as possible.

---

## 🔒 Security Guidelines & OAuth Handling Rules

### 1. OAuth Secrets & Environment Variables

- **Never Commit Secrets:** OAuth Client Secrets (`GITHUB_CLIENT_SECRET`), Auth Secrets (`AUTH_SECRET`), and API Access Tokens must **NEVER** be committed to Git or pushed to any repository.
- **Local Development:** Store secrets in `.env.local`. Ensure `.env.local` is listed in `.gitignore`.
- **Production Environment:** Manage secrets strictly through Vercel Environment Variables configuration.

### 2. Client vs Server API Isolation

- **Server-Only API Calls:** All interactions with the GitHub GraphQL API that require authentication tokens or client secrets **MUST** originate from Next.js Server Components, Server Actions, or API Route Handlers (`app/api/`).
- **No Client Exposure:** Never expose internal API keys or secret environment variables to client-side components (`'use client'`). Only pass sanitized data necessary for UI rendering.

### 3. Cross-Site Scripting (XSS) & Markdown Sanitization

- **HTML Sanitization:** Since CSCPDUAM Community renders user-generated Markdown (discussions, comments), all Markdown output must be sanitized to strip dangerous HTML tags (e.g., `<script>`, `<iframe>`, inline `onload` handlers).
- **Safe Markdown Rendering:** Use trusted libraries such as `react-markdown` with strict sanitization plugins.

### 4. Authentication & CSRF Protection

- **OAuth Only:** Authentication is restricted exclusively to GitHub OAuth managed by Auth.js / NextAuth.js. No password storage or email authentication mechanisms exist within the application database.
- **State & Token Security:** OAuth state tokens and session cookies must be set with `SameSite=Lax` or `Strict`, `HttpOnly`, and `Secure` flags in production.

---

Thank you for keeping **CSCPDUAM Community** safe and secure for our students and department! 🛡️
