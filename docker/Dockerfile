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

# nginx runs as the user nginx: the entrypoint writes conf.d/api.conf, nginx keeps its temp files
# in /var/cache/nginx; the stock server on port 80 is not used
RUN rm /etc/nginx/conf.d/default.conf && chown nginx /etc/nginx/conf.d /var/cache/nginx

USER nginx

CMD ["nginx", "-g", "daemon off;"]
