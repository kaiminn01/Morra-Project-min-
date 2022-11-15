#!/usr/bin/env sh

# https://github.com/reach-sh/reach-lang/blob/34d443c79b4fdf2adac6bc08514986e02a2df3e9/DEPS#L20-L22
DOTNET_SDK_VERSION=6.0-alpine3.14
DOTNET_SDK_IMAGE=mcr.microsoft.com/dotnet/sdk:${DOTNET_SDK_VERSION}
DOTNET_RUNTIME_IMAGE=mcr.microsoft.com/dotnet/runtime:${DOTNET_SDK_VERSION}

# https://github.com/reach-sh/reach-lang/blob/34d443c79b4fdf2adac6bc08514986e02a2df3e9/examples/rps-7-rpc/Makefile#L68-L73
docker build \
  --build-arg DOTNET_RUNTIME_IMAGE="$DOTNET_RUNTIME_IMAGE" \
  --build-arg DOTNET_SDK_IMAGE="$DOTNET_SDK_IMAGE" \
  --tag=reachsh/reach-app-morra-cs:latest .
