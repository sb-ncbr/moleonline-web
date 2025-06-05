#!/bin/bash

docker compose -f /home/ubuntu/moleonline-web/docker/docker-compose.yaml -f /home/ubuntu/moleonline-web/docker/docker-compose.production.yaml stop

certbot renew

docker compose -f /home/ubuntu/moleonline-web/docker/docker-compose.yaml -f /home/ubuntu/moleonline-web/docker/docker-compose.production.yaml start
