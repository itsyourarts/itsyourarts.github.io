# ─────────────────────────────────────────────────────────────────────────────
#  GODXSHADOW ⚡ Sarkari Result LIVE  (+ 📸 Instagram Downloader)
#  Node 20 Alpine · zero dependencies · non-root · healthcheck ke saath
#
#  Build :  docker build -t godxshadow .
#  Run   :  docker run -p 3000:3000 godxshadow
#  Bina snapshot ke (fast build):
#           docker build --build-arg SKIP_SNAPSHOT=1 -t godxshadow .
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine

# non-root user (security)
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# 1) pehle sirf package.json — layer cache ke liye
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund 2>/dev/null || true

# 2) source
COPY server.js ./
COPY scripts ./scripts
COPY public ./public
COPY insta-app ./insta-app

# 3) build time par ek data snapshot (static fallback ke liye).
#    Source site down ho to build fail na ho — isliye `|| echo`.
ARG SKIP_SNAPSHOT=0
RUN if [ "$SKIP_SNAPSHOT" != "1" ]; then \
      node scripts/snapshot.js || echo "[docker] snapshot skipped (source unreachable)"; \
    else \
      echo "[docker] snapshot skipped (SKIP_SNAPSHOT=1)"; \
    fi

ENV NODE_ENV=production \
    PORT=3000 \
    SNAPSHOT_POSTS=1500 \
    SNAPSHOT_CONC=6 \
    SOON_DAYS=7

EXPOSE 3000

USER app

HEALTHCHECK --interval=60s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/status',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
