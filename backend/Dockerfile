# ---- Base ----
FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


# ---- Builder ----
FROM base AS builder
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# ---- Runner ----
FROM base As runner
ENV NODE_ENV production
EXPOSE 3001
ENV PORT 3001

CMD ["pnpm", "start"]
