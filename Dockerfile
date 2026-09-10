# syntax=docker/dockerfile:1
# Stage 1: build the site and the PDF. The Playwright image ships Chromium and its libs;
# the tag MUST match the playwright version in package.json.
FROM mcr.microsoft.com/playwright:v1.63.0-jammy AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node src/build.mjs && node --test && node scripts/pdf.mjs

# Stage 2: serve static files.
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
ENV PORT=8080
EXPOSE 8080
