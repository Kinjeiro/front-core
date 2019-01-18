#!/bin/bash

# Скрипт, отправляющий локальный образ в удаленный приватный docker hub

__START_TIME=$(date +%s)

dockerRepository=${1:-''}
#appName=$1
#appVersion=$2
appName=$(node -p "require('./package.json').name")
appVersion=$(node -p "require('./package.json').version")
image="$dockerRepository$appName:$appVersion"

echo "Pushing image: $image"
docker push $image
__END_TIME=$(date +%s)

echo "Total time: $(( $__END_TIME - $__START_TIME ))s"
