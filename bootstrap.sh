#!/usr/bin/env bash

if [ -e "/etc/vagrant-provisioned" ];
then
    echo "Vagrant provisioning already completed. Skipping..."
    exit 0
else
    echo "Starting Vagrant provisioning process..."
fi

# update / upgrade
sudo apt-get update
sudo apt-get -y upgrade

# NodeJS / npm
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs
sudo apt-get install -y npm 
sudo npm install npm -g

# install git
sudo apt-get -y install git

#flag provisioned 
touch /etc/vagrant-provisioned

#install bower
sudo npm install bower -g

#install grunt
sudo npm install grunt-cli -g

#Install g++ compiler
sudo apt-get -y install g++
