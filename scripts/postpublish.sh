#!/bin/bash

set -e

print_npmignore() {
  cat << EOIGNORE
test/
EOIGNORE
}

print_npmignore > .npmignore
