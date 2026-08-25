This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## CoinPulse

CoinPulse is a cryptocurrency market dashboard built with Next.js. It provides coin discovery, market summaries, historical charts, and live pool data using CoinGecko's Demo API.

## Project Overview

- Browse market-ranked coins with price, market cap, volume, and 24-hour change.
- Search coins by name, symbol, or CoinGecko ID with the header search or `Ctrl/Cmd + K`.
- View coin details, historical pool OHLCV charts, current pool price, and recent pool trades.
- Change chart ranges from one day to one year.
- Poll live pool data at one-minute or five-minute intervals.
- Use the responsive dark interface across desktop and mobile layouts.

Live pool data uses CoinGecko Demo REST endpoints. The Demo API is cached, so updates are near-real-time rather than tick-by-tick. If a coin does not have a resolved GeckoTerminal pool, the app falls back to coin-level data where available.

## Setup

### Prerequisites

- Node.js 20 or newer
- npm
- A CoinGecko Demo API key

### Install

```bash
npm install
```

Create `.env.local` in the project root:

```env
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_demo_api_key
NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL=wss://stream.coingecko.com/v1

```

The API key is used only by server-side actions and is not exposed to the browser.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is unavailable, Next.js will report the alternate local port in the terminal.

## Available Commands

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Start the production server
```

## Main Routes

- `/` - Dashboard overview
- `/coins` - Market coin list
- `/coins/[id]` - Coin details and pool market data

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
