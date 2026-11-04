FROM node:24-slim AS build

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

FROM nginx:1.29-alpine-slim

COPY --from=build /build/dist/ /var/www
# the archive's configuration (LEGACY.md); docker-compose*.yaml mount their own over it
COPY docker/nginx.legacy.conf /etc/nginx/nginx.conf

USER nginx

CMD ["nginx", "-g", "daemon off;"]
