#!/bin/bash

# Скрипт для проверки работоспособности образа.
# Запускаем на порту 8080 сборку и если контейнер умирает - пишем ошибку
# Если нет, он существует и исполняется, то все хорошо, просто его останавливаем

dockerRepository=${1:-''}

#appName=$1
#appVersion=$2
appName=$(node -p "require('./package.json').name")
appVersion=$(node -p "require('./package.json').version")
image="$dockerRepository$appName:$appVersion"

echo "Run image: $image"
#использую порт 8085 - чтобы не пересечься с уже запущенным приложением
containerId=$(docker run -d -p 8085:8080 $image)

echo -e "\nRun container: $containerId"

echo -e "\nSleep 5 sec..."
sleep 5

echo -e "\nLOGS:"
docker logs $containerId

echo -e "\n===DOCKER LIVE CONTAINERS==="
docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Ports}}"

RUNNING=$(docker inspect --format="{{.State.Running}}" $containerId 2> /dev/null)
if [ "$RUNNING" == "true" ]
then
    echo -e "\nSUCCESS\n"
    echo -e "Stop container"
    docker stop $containerId
    exit 0
else
    # ошибка контейнер не найден
    echo "ERROR!!! Invalid container!"
    exit 1
fi


