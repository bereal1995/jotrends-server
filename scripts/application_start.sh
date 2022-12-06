#!/bin/bash
yarn build
pm2 start ./jotrends-server/dist/main.js
pm2 reload ./jotrends-server/dist/main.js