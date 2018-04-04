#!/bin/bash
export ENVIRONMENT="local"

gulp

sudo rm -rf /var/www/html/online
sudo rm -rf /var/www/html/assets

sudo mkdir /var/www/html/assets
sudo cp -r ./build/online/js /var/www/html/assets
sudo cp -r ./build/online/css /var/www/html/assets
sudo cp -r ./build/online/images /var/www/html/assets
sudo cp -r ./build/online/images/front /var/www/html/assets
sudo cp -r ./build/online/fonts /var/www/html/assets
sudo cp -r ./build/online/templates /var/www/html/assets
sudo cp -r ./build/online/MoleOnlineWebUI-Core-Init.js /var/www/html/assets
sudo cp -r ./build/online/MoleOnlineWebUI-Core-View.js /var/www/html/assets

sudo mkdir /var/www/html/online
sudo cp ./build/online/index.html /var/www/html/online
sudo cp ./build/online/detail.html /var/www/html/online
sudo cp ./build/online/documentation.html /var/www/html
sudo cp ./build/online/about.html /var/www/html
sudo cp ./build/online/home.html /var/www/html
sudo cp ./build/online/faq.html /var/www/html
sudo cp ./build/online/tour.html /var/www/html
sudo cp ./build/online/examples.html /var/www/html
sudo cp ./build/online/method.html /var/www/html
sudo cp ./build/online/updates.html /var/www/html

sudo mkdir /var/www/html/assets/old-web
sudo cp -r ./static/old-web/* /var/www/html/assets/old-web

#temporary workaround(CORS problem)
sudo cp ./cofactors.json /var/www/html/online
