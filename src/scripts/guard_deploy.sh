#!/bin/bash

set -e

ignore="$1"

if [ "$ignore" = "ignore-guard" ]; then
  exit
fi

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" != "prod" ]; then
  echo "You can only deploy from the prod branch, on $branch"
  exit 1
fi

if [ -n "$(git diff HEAD)" ]; then
  echo "Cannot deploy when there are uncommitted changes"
  exit 1
fi

# TODO: run unit tests.