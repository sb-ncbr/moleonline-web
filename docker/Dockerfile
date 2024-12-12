FROM node:20-slim as moleonline

WORKDIR /build

COPY ./package.json ./package-lock.json /build/

RUN npm install

COPY ./ /build

RUN npm run build-dev

FROM nginx:1.26-alpine-slim

COPY --from=moleonline /build/dist/MoleOnline /home/ubuntu/web/

CMD ["nginx", "-g", "daemon off;"]
