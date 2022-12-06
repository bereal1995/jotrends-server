#!/bin/bash
cd jotrends-server
git checkout main
git featch -all
git reset --hard origin/main
yarn