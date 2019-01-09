---
authors:
- Tyler John Haden
tags:
- ethereum
- blockchain
- ether
date: 
title: Creating Your First Truffle Project
image: 
---

An introduction on how to get started with a Truffle-based Solidity project. 

# Dependencies
- git
- node
- truffle
  - `npm install -g truffle`
    - [documentation](https://truffleframework.com/docs/truffle/getting-started/installation)
    - [npm package](https://www.npmjs.com/package/truffle)

Ensure you have the correct dependency versions:
![asdf](resources/truffle_project_dependencies.png)

# Initializations
- `truffle init`
  - [documentation](https://truffleframework.com/docs/truffle/reference/truffle-commands#init)

Create a new directory for your project, and cd into it.
Run `truffle init` inside your project's directory to generate some needed paths, and a config file.
![asdf](resources/truffle_init.png)

Ensure your project directory looks like this:
![asdf](resources/truffle_init_directory.png)

We'll be using npm for packaging:
run `touch package.json` and then add your package information:

We'll be using git for versioning:
run `git init && git add . && git commit -m "Initial commit"`




everything
docker run -it ubuntu:latest
apt-get update
apt-get install -y curl
apt-get install -y gnupg2
curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt-get install -y nodejs
apt-get install -y git-core
cd /home
mkdir MyFirstTruffleProject

