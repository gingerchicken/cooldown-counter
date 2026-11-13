# syntax=docker/dockerfile:1
# Keep Node identical across application and browser tooling containers.
FROM node:24-bookworm-slim AS node-runtime
# workerd uses the system CA store even when the local backend hop is plain HTTP.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Keep dependency installation separate from source so browser image edits reuse the same large layer.
FROM node-runtime AS dependencies
ENV CI=true \
    WRANGLER_SEND_METRICS=false
WORKDIR /app/frontend
# Install as the final tooling user so source edits never require chown of every dependency again.
RUN chown node:node /app/frontend
USER node
COPY --chown=node:node frontend/package.json frontend/package-lock.json ./
COPY --chown=node:node frontend/packages/api-client/package.json ./packages/api-client/package.json
RUN npm ci

# Generate the backend-owned interface before development or production builds consume it.
FROM dependencies AS development
COPY --chown=node:node backend/openapi.json /app/backend/openapi.json
COPY --chown=node:node frontend/ ./
RUN npm run api:generate && npm run api:build
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Produce the same static bundle that is uploaded to Cloudflare Pages.
FROM development AS build
RUN npm run build && npm run pages:build

# Wrangler runs the actual Pages routing/proxy locally, including in Docker E2E.
FROM development AS web
COPY --from=build --chown=node:node /app/frontend/dist ./dist
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
# COPY ownership does not change an existing WORKDIR; the default browser user must create its own caches.
RUN chown pwuser:pwuser /app/frontend
# Source edits must not copy and store another entire node_modules layer in the browser image.
COPY --from=dependencies --chown=pwuser:pwuser /app/frontend/node_modules/ ./node_modules/
COPY --chown=pwuser:pwuser frontend/ ./
COPY --from=development --chown=pwuser:pwuser /app/frontend/packages/api-client/dist/ ./packages/api-client/dist/
# The evidence validator resolves named backend assertions as well as the generated contract.
COPY --chown=pwuser:pwuser backend/ /app/backend/
# Acceptance drift checks compare against the frozen story index, never a mutable runtime mount.
COPY --chown=pwuser:pwuser 2-user-stories/README.md /app/2-user-stories/README.md
# Atomic acceptance statements are frozen inputs alongside the outcome index.
COPY --chown=pwuser:pwuser 3-requirements/requirements.md /app/3-requirements/requirements.md
USER pwuser
CMD ["npm", "run", "test:e2e"]
