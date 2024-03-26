FROM node:20.11.1 as build

COPY . /app
WORKDIR /app
RUN npm ci
RUN npm run build

ENV NODE_ENV=production
RUN npm ci

FROM gcr.io/distroless/nodejs20-debian12:latest

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules

WORKDIR /app
EXPOSE 3000
CMD ["./node_modules/.bin/remix-serve", "./build/server/index.js"]