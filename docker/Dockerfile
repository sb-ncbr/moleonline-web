FROM node:20-slim AS build

WORKDIR /build

COPY . /build

RUN npm install

RUN npm run build

FROM nginx:1.26-alpine-slim

COPY --from=build /build/dist/ /var/www

USER nginx

CMD ["nginx", "-g", "daemon off;"]
