#!/bin/bash

set -e

$(dirname "$0")/guard_deploy.sh

$(dirname "$0")/deploy_server.sh "ignore-guard"
$(dirname "$0")/deploy_client.sh "ignore-guard"

git checkout main