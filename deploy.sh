#!/usr/bin/env bash

npm run build

git checkout -b gh-pages

mv public/images ./build

find . -maxdepth 1 ! -name '.git' ! -name 'build' ! -name '.gitignore' ! -name 'node_modules' -exec rm -rf {} \;

mv build/* .

rmdir build

git add .

git commit -m "Deploy to Github Pages"

git push origin gh-pages

git checkout -
git branch -D gh-pages