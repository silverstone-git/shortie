FROM node:23-alpine3.20
# ARG MAXMIND_LICENSE_KEY
# ENV MAXMIND_LICENSE_KEY=${MAXMIND_LICENSE_KEY?-}
WORKDIR /app
COPY ./package.json ./
COPY ./swagger.yaml ./
COPY package-lock.json ./
RUN NODE_ENV=production npm install
COPY dist ./dist
# WORKDIR /app/node_modules/geoip-lite
# RUN npm run-script updatedb license_key=$MAXMIND_LICENSE_KEY
# WORKDIR /app
EXPOSE 7871
CMD ["node", "./dist/index.js"]
