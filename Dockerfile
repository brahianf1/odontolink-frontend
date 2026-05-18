# syntax=docker/dockerfile:1.7
#
# OdontoLink frontend — production image
# -------------------------------------------------------------------------
# Stage 1 (builder): Node 22 LTS builds the Vite/React bundle.
# Stage 2 (runtime): nginx-unprivileged 1.27 serves the static SPA on :8080
#                    behind Dokploy/Traefik. Runs as non-root user `nginx`.
# -------------------------------------------------------------------------

# =========================================================================
# Stage 1 — Build the SPA
# =========================================================================
FROM node:22.13-alpine AS builder

ENV NODE_ENV=production \
    CI=true \
    npm_config_audit=false \
    npm_config_fund=false \
    npm_config_update_notifier=false

WORKDIR /app

# Install deps first to maximise layer cache reuse.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev --prefer-offline --no-audit --no-fund

# Vite bakes VITE_* vars at build time. Expose them as ARGs so Dokploy can
# inject them via the "Build Time Arguments" section of the Application.
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT=10000
ARG VITE_APP_NAME=OdontoLink
ARG VITE_APP_VERSION=1.0.0

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_API_TIMEOUT=${VITE_API_TIMEOUT} \
    VITE_APP_NAME=${VITE_APP_NAME} \
    VITE_APP_VERSION=${VITE_APP_VERSION}

# Fail loudly if the API URL is not provided — production builds must point
# at a real backend, never at the dev fallback.
RUN test -n "${VITE_API_BASE_URL}" \
    || (echo "ERROR: VITE_API_BASE_URL build arg is required" >&2 && exit 1)

COPY . .

RUN npm run build \
 && find dist -name "*.map" -type f -delete

# =========================================================================
# Stage 2 — Runtime
# =========================================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Runtime build args. Defaults match production; override per environment.
ARG VITE_API_BASE_URL
ARG VITE_APP_VERSION=1.0.0
ARG APP_HOSTNAME=odontolink.utnpf.site

LABEL org.opencontainers.image.title="OdontoLink Frontend" \
      org.opencontainers.image.description="Production SPA bundle served by Nginx" \
      org.opencontainers.image.version="${VITE_APP_VERSION}" \
      org.opencontainers.image.source="https://github.com/brahianf1/odontolink-front" \
      org.opencontainers.image.licenses="UNLICENSED"

# nginx-unprivileged starts as USER nginx (uid 101). Brief root window only
# to wipe the default-image artefacts that ship owned by root.
USER root
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/* \
 && mkdir -p /etc/nginx/snippets \
 && chown -R nginx:nginx /etc/nginx/snippets /usr/share/nginx/html

# Switch to the runtime user BEFORE any step that may leave side-effect
# files (notably `nginx -t`, which opens the pid file for write during
# validation in nginx >=1.27.5). If `nginx -t` runs as root, it leaves a
# root-owned /tmp/nginx.pid that the runtime master — running as `nginx` —
# cannot overwrite, producing `(13: Permission denied)` on container start.
USER nginx

# Copy hardened nginx configuration (still contains build-time placeholders).
COPY --chown=nginx:nginx docker/nginx/nginx.conf            /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker/nginx/conf.d/               /etc/nginx/conf.d/
COPY --chown=nginx:nginx docker/nginx/snippets/             /etc/nginx/snippets/

# Resolve the placeholders that depend on build args so CSP and server_name
# always track VITE_API_BASE_URL / APP_HOSTNAME without manual edits.
#  - __API_ORIGIN__   ← scheme://host extracted from VITE_API_BASE_URL
#  - __APP_HOSTNAME__ ← APP_HOSTNAME verbatim
# nginx -t below catches any leftover placeholder (config syntax fails).
RUN set -eu \
 && test -n "${VITE_API_BASE_URL}" \
    || (echo "ERROR: VITE_API_BASE_URL build arg is required" >&2 && exit 1) \
 && API_ORIGIN=$(printf '%s' "${VITE_API_BASE_URL}" \
        | sed -E 's|^([a-zA-Z][a-zA-Z0-9+.-]*://[^/]+).*|\1|') \
 && case "${API_ORIGIN}" in https://*|http://*) ;; \
        *) echo "ERROR: VITE_API_BASE_URL must be an absolute URL" >&2; exit 1 ;; \
    esac \
 && sed -i "s|__API_ORIGIN__|${API_ORIGIN}|g"     /etc/nginx/snippets/security-headers.conf \
 && sed -i "s|__APP_HOSTNAME__|${APP_HOSTNAME}|g" /etc/nginx/conf.d/default.conf \
 && ! grep -RnE '__API_ORIGIN__|__APP_HOSTNAME__' /etc/nginx \
        || (echo "ERROR: unresolved nginx placeholder" >&2 && exit 1)

# Copy the built SPA.
COPY --from=builder --chown=nginx:nginx /app/dist           /usr/share/nginx/html

# Make the document root read-only for the nginx user (defence in depth — a
# compromised worker cannot rewrite served files).
RUN chmod -R a-w /usr/share/nginx/html \
 && find /usr/share/nginx/html -type d -exec chmod a+rx {} + \
 && find /usr/share/nginx/html -type f -exec chmod a+r  {} +

# Validate the config in the same UID context as the runtime master — any
# pid file created here is owned by `nginx`, so the runtime can overwrite.
RUN nginx -t

EXPOSE 8080

# Docker/Swarm healthcheck (Dokploy reads HEALTHCHECK from the Dockerfile).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
