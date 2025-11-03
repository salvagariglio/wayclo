FROM node:20-bookworm-slim

WORKDIR /app

# Instalar lo mínimo y mejorar estabilidad
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Variables npm para evitar bloqueos
ENV npm_config_audit=false \
    npm_config_fund=false \
    npm_config_update_notifier=false \
    npm_config_progress=false \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_factor=2 \
    npm_config_fetch_retry_maxtimeout=300000 \
    npm_config_fetch_timeout=300000

# Copiamos package.json
COPY package.json ./

# Si no existe lockfile, lo generamos dentro del contenedor
RUN test -f package-lock.json || npm install --package-lock-only

# Instalamos dependencias
RUN npm ci || npm install

# Instalamos @vercel/postgres (o el paquete que quieras probar)
RUN npm install @vercel/postgres

# Movemos node_modules fuera de /app para evitar ser tapado por el bind mount
RUN mv node_modules /opt/node_modules
ENV NODE_PATH=/opt/node_modules
ENV NODE_OPTIONS=--require=module
ENV PATH="/opt/node_modules/.bin:${PATH}"

# Copiamos el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
