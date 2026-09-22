# BidVelocity frontend

Next.js App Router floor. Clerk sign-in, live lots, wallet in **INR (₹)**.

Repo: https://github.com/Tharak23/soa-bidding  
Backend must be running at `http://localhost:8080` (see https://github.com/Tharak23/soa-bidding-backend).

---

## What you need

- **Node.js 20+** and **npm**
- Backend API gateway on **http://localhost:8080**
- A filled **`.env.local`** (copy from `.env.example`)
- Free port **3000**

---

## Env file

```bash
cp .env.example .env.local
```

Required:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/marketplace
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/marketplace
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/marketplace
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/marketplace
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use the **same Clerk application** as the backend issuer. Do not commit `.env.local`.

---

## Run

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

After sign-in you land on `/marketplace`.

### Stale UI / cache

```bash
npm run clean
npm run dev
```

Hard-reload the browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R`.

---

## What works once both sides are up

- Sign in / sign up (Clerk)
- Marketplace lots and live prices (INR)
- Bid with wallet holds
- Sell a lot
- Wallet top-up (needs Dodo keys on the backend)
