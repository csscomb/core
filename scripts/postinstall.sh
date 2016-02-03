#!/bin/bash

if [[ ! -d 'lib' ]]; then
  npm i babel@5 --save
  ./scripts/build.sh
fi
