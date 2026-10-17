FROM node:24-slim AS build

WORKDIR /build

COPY package*.json ./

RUN npm ci

COPY . ./

# Path of the MOLE API baked into the site, served by this site's nginx (/api by default, see
# docker-compose.yaml); the API sends no CORS headers, so it cannot be another site's URL
ARG VITE_API_URL

RUN npm run build

FROM nginx:1.29-alpine-slim

COPY --from=build /build/dist/ /var/www

USER nginx

CMD ["nginx", "-g", "daemon off;"]
