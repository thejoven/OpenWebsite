FROM node:23-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
ENV DATABASE_URL=file:../data/openwebsite.db
RUN npm run prisma:generate
RUN npm run build

FROM node:23-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:../data/openwebsite.db

COPY package.json package-lock.json* ./
COPY prisma.config.ts ./prisma.config.ts
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force && npx prisma generate

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

VOLUME ["/app/data"]
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
