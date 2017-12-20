#!/usr/bin/env bash

# Скрипт, который удаляет неисполняемые контейнеры и удаляет устаревшие образы

docker rm $(docker ps -q -f status=exited)
docker rmi $(docker images -f "dangling=true" -q)
