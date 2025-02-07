FROM node:current-bookworm
WORKDIR /app
COPY package.json ./
COPY .env.production .env
RUN npm install
COPY . .
EXPOSE 7871
CMD ["npm", "start"]

