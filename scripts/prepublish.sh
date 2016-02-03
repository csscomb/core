#!/bin/bash

set -e

print_npmignore() {
  cat << EOIGNORE
*
!lib/
EOIGNORE
}

print_npmignore > .npmignore
