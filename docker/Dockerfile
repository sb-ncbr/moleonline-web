FROM node:24-slim AS build

WORKDIR /build

COPY package*.json ./

RUN npm ci

COPY . ./

# MOLE API URL baked into the site, e.g. --build-arg VITE_API_URL=https://...
ARG VITE_API_URL

RUN npm run build

FROM nginx:1.29-alpine-slim

COPY --from=build /build/dist/ /var/www

USER nginx

CMD ["nginx", "-g", "daemon off;"]
