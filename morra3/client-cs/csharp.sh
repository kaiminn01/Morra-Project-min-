#!/usr/bin/env sh

# https://github.com/reach-sh/reach-lang/blob/d194f03815554331a3c9b7de28d6854bbf9acb97/examples/rps-7-rpc/sbin/run-with.sh#L23-L32
docker run --rm \
  -e         "REACH_RPC_SERVER=host.docker.internal" \
  -e         "REACH_RPC_PORT" \
  -e         "REACH_RPC_TLS_REJECT_UNVERIFIED" \
  -e         "REACH_RPC_KEY" \
  -e         "REACH_DEBUG" \
  --add-host "host.docker.internal:172.17.0.1" \
  --name     "reach-app-morra-cs" \
  --network  reach-devnet \
  "reachsh/reach-app-morra-cs:latest"
