FROM node:current-bookworm
ARG MAXMIND_LICENSE_KEY
ENV MAXMIND_LICENSE_KEY=${MAXMIND_LICENSE_KEY?-}
WORKDIR /app
COPY package.json ./
RUN npm install
# WORKDIR /app/node_modules/geoip-lite
# RUN npm run-script updatedb license_key=$MAXMIND_LICENSE_KEY
# WORKDIR /app
COPY . .
EXPOSE 7871
CMD ["npm", "start"]

