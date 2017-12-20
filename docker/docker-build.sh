#!/bin/bash

# Скрпит для создания docker образа проекта
# Есть серьезная проблема, что образ докера со большим кол-вом шагов много весит.
# Поэтому мы сначала создадим чистай temp образ, внутри него все сбилдим, а потом результат за минимум шагов скопируем в final образ
# Также обсвобождаемся от ненужных на продакшен инструментов для unit тестирования
#
# Сборка образа использует временную отдельную папку ./.build-docker


__START_TIME=$(date +%s)

#===============================================
#================== INIT ======================
#===============================================
#environment=${1:-'production'}

# sh docker-build.sh "your.docker.repository.net/"
dockerRepository=${1:-''}

appName=$(node -p "require('./package.json').name")
appVersion=$(node -p "require('./package.json').version")

tempBuildImage="$dockerRepository$appName-build:latest"
image="$dockerRepository$appName:$appVersion"

# так как мы запускаем через npm run docker-build - то рут - это рут репы проекта
projectRootFolder=.
dockerFolder=$projectRootFolder/docker
dockerBuildFolder=$projectRootFolder/.build-docker

tmpBuildImageRootFolderName="dockerBuildImageRoot"
tmpBuildImageRootFolder="/$tmpBuildImageRootFolderName"

echo "
== INIT ==
    dockerRepository: $dockerRepository
    appName: $appName
    appVersion: $appVersion
    image: $image
    projectRootFolder: $projectRootFolder
    dockerFolder: $dockerFolder
    dockerBuildFolder: $dockerBuildFolder
"

#===============================================
#================== CLEAR ======================
#===============================================
echo "Clean up"
rm -rf $dockerBuildFolder
mkdir $dockerBuildFolder
__CLEAR_TIME=$(date +%s)

echo "Start build for $image..."

#===============================================
#============== PREBUILD =======================
#===============================================
# создаем tmp-package.json
node ./docker/prepare-build-package.js

#===============================================
#================ COPY =========================
#===============================================
echo "Copy other to $dockerBuildFolder"
# копируем все остальные папки и файлы кроме тех, что указаны в .dockerignore
# не подходит rsycn, так как нет в чистом bash:
# rsycn -av --exclude-from ./.dockerignore . $dockerBuildFolder

for dir in $(cd $projectRootFolder && ls -a)
do
    # egrep - тоже самое что и grep -E - regexp поиск (для черты последней, так как могут писать ".git" и могут писать ".git/")
    egrep -o "^\.?$dir/?$" $dockerFolder/.dockerignore &> /dev/null
    # $? — Код с которым была завершена предыдущая команда. Если удачно, то 0, если же неудачно то не 0.
    # если не нашли в исключениях, значит копируем
    if [ $? -ne 0 ] \
        && [ $dir != "." ] \
        && [ $dir != ".." ]
	then
#		echo "OK: $dir"
		cp -R $projectRootFolder/$dir $dockerBuildFolder
    else
        echo "not copy: $dir"
	fi
done

# копируем обрезанный от тестовых зависимостей tmp-package.json (который создался в pre стадии)
cp $dockerFolder/tmp-package.json $dockerBuildFolder

# докер файлы должны лежать внутри сборки - https://github.com/docker/docker/issues/11289
cp $dockerFolder/Dockerfile $dockerBuildFolder
cp $dockerFolder/Dockerfile-build-image $dockerBuildFolder
__COPY_TIME=$(date +%s)


#===============================================
#=========== BUILD TMP IMAGE ===================
#===============================================
# Проблема в том, что чистый образ для сборки весит очень много (порядка 1.2 гигабайта, так как каждая команда в файле
# сборки создает свой слой \ срез и кэшируется, поэтому чем больше слоев - то есть команд, тем больше образ получается),
# поэтому делаем фул образ tempBuildImage, который все собирает, а потом копируем нужные части в наш финальный образ
# (вес будет порядка 230 мегов)
echo "Building build-image $tempBuildImage..."

# todo @ANKU @BUT_OUT @docker - (возможно бага только винды) если подать в качестве значения аргумента, что-нибудь со cлэшом , пусть даже стрингу, ("/abs" => "C:/Accrd-ui/abs")
# она будет интерпритирутируема как путь относительно сборочного скрипта и подставиться вместо нее полный абсолютный путь
# поэтому приходится подавать название отдельно и потом склеивать со слешом внутри
#docker build --file ./Dockerfile-build-image --tag $tempBuildImage --build-arg rootFolderName=$tmpBuildImageRootFolder .
docker build --file $dockerBuildFolder/Dockerfile-build-image --tag $tempBuildImage --build-arg rootFolderName=$tmpBuildImageRootFolderName $dockerBuildFolder
if [ $? -ne 0 ]
then
    exit 1
fi

__BUILD_TIME=$(date +%s)

echo "Running build container..."
# так как внутри контейнера нет никаких действий, он тут же завершится (в docker ps его не будет, но из него можно
# будет копировать файлы)
# tail -f $tmpBuildImageRootFolder/package.json - без любой доп команды докер почему-то не выдает id контейнера
buildContainerId=$(docker run -d $tempBuildImage tail -f $tmpBuildImageRootFolder/package.json)
echo "Container executed: $buildContainerId"
if [ -z "$buildContainerId" ]
then
    echo "Not found container: $buildContainerId"
    exit 1
fi


#===============================================
#============== EXPORT =========================
#===============================================
# копируем получившиеся файлы, так как при компиляции основного image нужны будет что-то прямо из node_modules
echo "Export build from build container..."
echo "$buildContainerId:$tmpBuildImageRootFolder/.build"
docker cp $buildContainerId:$tmpBuildImageRootFolder/.build $dockerBuildFolder/.build
echo "$buildContainerId:$tmpBuildImageRootFolder/node_modules"
docker cp $buildContainerId:$tmpBuildImageRootFolder/node_modules $dockerBuildFolder/node_modules
__EXPORT_TIME=$(date +%s)



#===============================================
#============ DOCKER IMAGE BUILD ===============
#===============================================
echo "Docker image build..."
# Dockerfile - мы заранее на стадии копирования уже скопировали в ./.build-docker
docker build --file $dockerBuildFolder/Dockerfile --tag $image $dockerBuildFolder
__IMAGE_TIME=$(date +%s)



#===============================================
#=============== OTHER =========================
#===============================================
echo "Removing buildContainer $buildContainerId"
docker rm -f $buildContainerId

#docker push $image
#__PUSH_TIME=$(date +%s)
echo -e \
    "\nIf you want, you can run script to push image:\n"\
    " npm run docker-push\n"\
    "for windows:\n"\
    " npm run docker-push-win\n\n"

__END_TIME=$(date +%s)



#===============================================
#=============== STATS =========================
#===============================================
echo "Clear time: $(( $__CLEAR_TIME - $__START_TIME ))s"
echo "Copy time: $(( $__COPY_TIME - $__CLEAR_TIME ))s"
echo "Build time: $(( $__BUILD_TIME - $__COPY_TIME ))s"
echo "Export time: $(( $__EXPORT_TIME - $__BUILD_TIME ))s"
echo "Image build time: $(( $__IMAGE_TIME - $__EXPORT_TIME ))s"
#echo "Push time: $(( $__PUSH_TIME - $__IMPORT_TIME ))s"
echo "Total time: $(( $__END_TIME - $__START_TIME ))s"
