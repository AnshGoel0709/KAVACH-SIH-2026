FROM mcr.microsoft.com/playwright:v1.63.0-jammy

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages packages

RUN npm install

COPY apps apps

RUN npm run build

ENV NODE_ENV=production

EXPOSE 10000

CMD ["npm", "run", "start", "-w", "apps/api"]