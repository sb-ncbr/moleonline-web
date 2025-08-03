FROM node:24-slim AS build

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

FROM nginx:1.29-alpine-slim

COPY --from=build /build/dist/ /var/www

USER nginx

CMD ["nginx", "-g", "daemon off;"]
