# ChatApp Setup Guide

## Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn
3. Clerk account
4. Convex account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set up Convex

1. Sign up at [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` to set up your deployment
4. Copy your deployment URL

### 3. Set up Clerk

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Go to **JWT Templates** in your Clerk dashboard
4. Create a new template with the name `convex`
5. Use this configuration for the JWT template:

```json
{
  "aud": "convex",
  "exp": "{{time.now + 3600}}",
  "iat": "{{time.now}}",
  "iss": "https://your-app-name.clerk.accounts.dev",
  "nbf": "{{time.now}}",
  "sub": "{{user.id}}"
}
```

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_JWT_ISSUER_DOMAIN=https://your-app-name.clerk.accounts.dev
```

### 5. Configure Convex Environment Variables

1. Go to your Convex dashboard
2. Navigate to Settings > Environment Variables
3. Add `CLERK_JWT_ISSUER_DOMAIN` with your Clerk domain

### 6. Deploy and Run

```bash
# Deploy Convex functions
npx convex deploy

# Start the development server
npm run dev
```

## Troubleshooting

### Clock Skew Issues
If you see clock skew warnings from Clerk:
1. Sync your system clock
2. On Windows: Settings > Time & Language > Date & time > Sync now
3. On Mac: System Preferences > Date & Time > Set date and time automatically

### JWT Template Not Found
1. Ensure you created a JWT template named exactly `convex` in Clerk
2. Verify the template is active
3. Check that `CLERK_JWT_ISSUER_DOMAIN` matches your Clerk domain exactly

### Environment Variables
1. Restart your development server after changing environment variables
2. Ensure `.env.local` is in your project root
3. Double-check all variable names match exactly

## Features

- Real-time messaging with Convex
- User authentication with Clerk
- Chat invitations system
- Responsive UI with Tailwind CSS
- TypeScript support 