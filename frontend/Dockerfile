# ---- Base Image ----
FROM node:18-slim as base
ENV NODE_ENV production

# install node
# set working directory
WORKDIR /app
# copy project file
COPY package.json pnpm-lock.yaml ./

# ---- Dependencies ----
FROM base AS dependencies
# install pnpm
RUN npm i -g pnpm@7
# install dependencies for production
RUN pnpm install --frozen-lockfile --silent --production
RUN cp -R node_modules prod_node_modules
# install dependencies for development
RUN pnpm install --frozen-lockfile --silent

# ---- Build ----
FROM base AS build
RUN npm i -g pnpm@7
# COPY dependencies for build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# build
RUN pnpm run build

# ---- Run ----
FROM base AS runner
RUN npm i -g pnpm@7
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=build /app/.next ./.next
# expose port and define CMD
EXPOSE 3000
CMD pnpm start
