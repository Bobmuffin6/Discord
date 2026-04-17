# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (Google login)
- **Real-time**: WebSockets (ws library)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### Discord Clone (`artifacts/discord-clone`)
- React + Vite frontend at `/`
- Discord-like dark UI
- Clerk Google auth at `/sign-in`, `/sign-up`
- Real-time chat via WebSockets
- Channels: list, browse, create new channels
- Messages: send, receive in real-time, grouped by date

### API Server (`artifacts/api-server`)
- Express 5 backend
- Routes: `/api/channels`, `/api/channels/:id/messages`, `/api/users/me`, `/api/users/me/sync`
- WebSocket server at `/ws` for real-time message broadcast
- Clerk auth middleware
- Paths served: `/api`, `/ws`, `/__clerk`

## DB Schema

- `channels` — id, name, description, createdAt
- `messages` — id, channelId, content, userId, userName, userAvatar, createdAt
- `users` — id (=clerkId), clerkId, name, email, avatar, createdAt

## IMPORTANT: After codegen, always overwrite `lib/api-zod/src/index.ts` to only export from `./generated/api` (not `./generated/types`), to avoid duplicate export errors.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
