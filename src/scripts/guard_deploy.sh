#!/bin/bash

set -e

ignore="$1"

if [ "$ignore" = "ignore-guard" ]; then
  exit
fi

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ -n "$(git diff HEAD)" ]; then
  echo "Cannot deploy when there are uncommitted changes"
  exit 1
fi

if [ "$branch" != "prod" ]; then
  if [ -z "$(git diff prod)" ]; then
    git checkout prod
    exit
  fi

  read -p "Merge current branch into prod? [Y/n]: " result

  echo "read $result"
  result="$(echo "$result" | tr '[:upper:]' '[:lower:]')"
  if [ "$result" != "y" ] && [ -n "$result" ]; then
    echo "You can only deploy from the prod branch, on $branch"
    exit 1
  fi
  git checkout prod
  git merge "$branch"
  git push
fi

# TODO: run unit tests.