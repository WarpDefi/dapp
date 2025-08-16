FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN pnpm install
RUN pnpm run build

FROM base
COPY --from=build /app/node_modules /app/node_modules
RUN pnpm install
RUN pnpm run build

EXPOSE 3000
CMD [ "pnpm", "start" ]