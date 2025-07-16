# Multi-stage Docker build for Pterodactyl Panel Serverless Migration
# Optimized for production deployment with legacy API compatibility

# Stage 1: Base Node.js environment
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN apk update

# Stage 2: Dependencies installation
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 3: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build frontend assets
RUN yarn build:production

# Build TypeScript migration scripts
RUN npx tsc migration/scripts/*.ts --outDir dist/migration/scripts --target es2020 --module commonjs

# Stage 4: PHP environment for legacy API compatibility
FROM php:8.2-fpm-alpine AS php-base

# Install PHP extensions required for Pterodactyl
RUN apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    icu-dev \
    jpeg-dev \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    bcmath \
    gd \
    intl \
    mbstring \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    pcntl \
    posix \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Stage 5: Production runtime
FROM php-base AS runtime

# Install nginx for serving static assets and routing
RUN apk add --no-cache nginx supervisor

# Copy application files
WORKDIR /var/www/pterodactyl
COPY --chown=www-data:www-data . .

# Copy built assets from builder stage
COPY --from=builder --chown=www-data:www-data /app/public/assets ./public/assets
COPY --from=builder --chown=www-data:www-data /app/dist ./dist

# Copy Node.js runtime for migration scripts
COPY --from=deps /app/node_modules ./node_modules

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy configuration files
COPY deployment/docker/nginx.conf /etc/nginx/nginx.conf
COPY deployment/docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY deployment/docker/supervisord.conf /etc/supervisord.conf
COPY deployment/docker/entrypoint.sh /entrypoint.sh

# Create required directories
RUN mkdir -p \
    /var/log/nginx \
    /var/log/pterodactyl \
    /var/lib/pterodactyl/storage/app \
    /var/lib/pterodactyl/storage/logs \
    /var/lib/pterodactyl/storage/cache \
    && chown -R www-data:www-data /var/lib/pterodactyl \
    && chmod -R 755 /var/lib/pterodactyl

# Set up cron for scheduled tasks
COPY deployment/docker/crontab /etc/crontabs/www-data

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Expose ports
EXPOSE 8080 9000

# Set user
USER www-data

# Start supervisor
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]