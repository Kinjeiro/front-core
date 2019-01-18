#!/usr/bin/env bash

# Останавливает все контейнеры и удаляем все образы на компьютере

docker rm `docker ps -a -q`
docker rmi `docker images -a -q`
