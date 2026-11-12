# syntax=docker/dockerfile:1
# Keep Node identical across application and browser tooling containers.
FROM node:24-bookworm-slim AS node-runtime
# workerd uses the system CA store even when the local backend hop is plain HTTP.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install locked development tools once; the backend contract is a build input.
FROM node-runtime AS development
ENV CI=true \
    WRANGLER_SEND_METRICS=false
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
COPY frontend/packages/api-client/package.json ./packages/api-client/package.json
RUN npm ci
COPY backend/openapi.json /app/backend/openapi.json
COPY frontend/ ./
RUN npm run api:generate && npm run api:build \
    && chown -R node:node /app
USER node
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Produce the same static bundle that is uploaded to Cloudflare Pages.
FROM development AS build
RUN npm run build && npm run pages:build

# Wrangler runs the actual Pages routing/proxy locally, including in Docker E2E.
FROM development AS web
COPY --from=build /app/frontend/dist ./dist
EXPOSE 8788
CMD ["npm", "run", "pages:dev", "--", "--binding", "BACKEND_ORIGIN=http://backend:8000", "--binding", "ALLOW_INSECURE_BACKEND=true"]

# Match browser binaries to @playwright/test; no host browser installation is used.
FROM mcr.microsoft.com/playwright:v1.65.0-noble AS e2e
# Use the exact Node24 runtime from the tooling stage rather than the image default.
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
ENV CI=true \
    WRANGLER_SEND_METRICS=false
WORKDIR /app/frontend
COPY --from=development /app/frontend/ ./
COPY --from=development /app/backend/openapi.json /app/backend/openapi.json
RUN chown -R pwuser:pwuser /app
USER pwuser
CMD ["npm", "run", "test:e2e"]
