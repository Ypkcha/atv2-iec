FROM node:24-alpine AS base
WORKDIR /app
RUN npm install --global pnpm@11.21.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS development
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM development AS build
RUN pnpm run build

FROM base AS production-dependencies
RUN pnpm install --prod --frozen-lockfile

FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node .sequelizerc ./
COPY --chown=node:node src/config/config.cjs ./src/config/config.cjs
COPY --chown=node:node src/migrations ./src/migrations

USER node
EXPOSE 3000
CMD ["sh", "-c", "node ./node_modules/sequelize-cli/lib/sequelize db:migrate --env production && exec node dist/server.js"]
