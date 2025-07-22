FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

RUN yarn install --production --ignore-scripts --prefer-offline

# ✅ Update to port 3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
