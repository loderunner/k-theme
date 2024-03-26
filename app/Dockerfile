FROM node:20.11.1 as build

WORKDIR /app

COPY . /app
RUN npm ci
RUN npm run build

ENV NODE_ENV=production
RUN npm ci


FROM gcr.io/distroless/nodejs20-debian12:latest

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules

EXPOSE 3000
CMD ["./node_modules/.bin/remix-serve", "./build/server/index.js"]