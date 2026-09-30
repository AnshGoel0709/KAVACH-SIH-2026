FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages packages

RUN npm install

COPY apps apps

RUN npm run build

ENV NODE_ENV=production

EXPOSE 10000

CMD ["npm", "run", "start", "-w", "apps/api"]