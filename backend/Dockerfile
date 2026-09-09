FROM node:22-alpine

WORKDIR /app

# Enable pnpm and ignore scripts to prevent build errors
RUN corepack enable pnpm
RUN pnpm config set ignore-scripts true
RUN apk add --no-cache openssl

COPY package.json ./
RUN pnpm install
RUN pnpm add prisma@5 @prisma/client@5

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]
