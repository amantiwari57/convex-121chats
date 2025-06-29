# NextAuth Environment Setup

## Required Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Convex (existing)
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
CONVEX_DEPLOYMENT=your_convex_deployment_here
```

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## For Production

Set `NEXTAUTH_URL` to your production domain:
```env
NEXTAUTH_URL=https://your-domain.com
``` 