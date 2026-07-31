# Project Setup Guide

Welcome to the **CSCPDUAMA Community** project. Follow this guide to set up the project locally on your machine.

---

## 📋 Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: Version `v18.17.0` or higher (v20+ recommended).
- **pnpm**: Version `v8.0.0` or higher (`npm install -g pnpm`).
- **Git**: Installed and configured.
- **GitHub Account**: Required for local OAuth testing and discussions.

---

## 🛠️ Step-by-Step Setup

### 1. Install Dependencies
Run the following command in the project root:
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure the following variables:
```env
# NextAuth / Auth.js Configuration
AUTH_SECRET="your-generated-auth-secret" # Run: npx auth secret
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth Application Credentials
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# GitHub Discussions Context
GITHUB_OWNER="cscpduam-org"
GITHUB_REPOSITORY="community"

# Personal Access Token (for read-only guest fallback)
GITHUB_TOKEN="your-github-personal-access-token"
```

### 3. Create a GitHub OAuth App
1. Go to your GitHub profile **Settings > Developer Settings > OAuth Apps > New OAuth App**.
2. **Application Name:** `CSCPDUAMA Community`
3. **Homepage URL:** `http://localhost:3000`
4. **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
5. Click **Register Application**, generate a new client secret, and copy the Client ID & Client Secret to `.env.local`.

### 4. Launch Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
