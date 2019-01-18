#!/usr/bin/env bash

# Скрипт, использующийся для сборки проекта, его проверки, отсылки на удаленный докер хаб и вызов мезосов для обновление дев стэнда.
# Это скрипт лишь замена JENKINS, пока он не будет настроен (часто на старте проектов)
# Пример вызова скрпита:
# sh docker/build-test-push-to-devops.sh --ansibleRepoDir "../test-scripts" --ansibleUser rum0tw6

# ======================================================
# ARGS
# ======================================================
# Путь до локальной папки с репозиторием для ансибл скриптов, обновления две стенда
# Пример: ../test-scripts
ansibleRepoDir=
# Имя пользоваля, которое будет использовано для запуска ансибл скрпитов.
# Используется ssh, поэтому необходимо добавить свой паблик ключ в репозиторий http://git/projects/DOPS/repos/ops-keys (без BOM-ов) как pull request
# Пример: rum0tw6
ansibleUser=
# Название ансибл скрпита, который отвечает за обновление заданных в нем сервер машин
ansibleInventory="development"
# Название области обновления
ansibleTag="front"

while true; do
  case "$1" in
    -d | --ansibleRepoDir ) ansibleRepoDir="$2"; shift 2;;
    -u | --ansibleUser ) ansibleUser="$2"; shift 2;;
    -t | --ansibleTag ) ansibleTag="$2"; shift 2;;
    -i | --ansibleInventory ) ansibleInventory="$2"; shift 2;;

    -- ) shift; break ;;
    * ) break ;;
  esac
done

# так подача package.json в npm скрипты для юниксов ($npm_package_name) и для винды (%npm_package_name%) разная, чтобы не создавать кучи npm скрпитов под платформу сделаем явное получение из файла
appName=$(node -p "require('./package.json').name")
ansibleInventoryFile=$ansibleRepoDir/$ansibleInventory

# ======================================================
# WORK
# ======================================================
echo "
== INIT ==
    appName: $appName
    ansibleRepoDir: $ansibleRepoDir
    ansibleUser: $ansibleUser
    ansibleTag: $ansibleTag
    ansibleInventory: $ansibleInventory
    ansibleInventoryFile: $ansibleInventoryFile
"

# выпускаем новую патч версию релиза, чтобы образы на стэнде отличались
npm run release-patch
# если остались незакоменченные файлы, то будет ошибка
if [ $? -eq 0 ]
then
    # так как версия изменилась, получаем новую из обновленного файла package.json
    appVersion=$(node -p "require('./package.json').version")
    echo "New app version: $appVersion"

    # создаем докер образ
    npm run docker-build

    # запускаем тест с использованием последнего созданного докер образа
    npm run docker-test-run

    # если прошлая команда выполнилась успешно, то есть контейнер с образом, запустился и стабильно работает
    if [ $? -eq 0 ];
    then
        # коммитим release-patch
        echo "Push release patch commit"
        git push

        # если все отлично пушим образ в удаленный докер хаб

        npm run docker-push

        # Если указаны переменные папки с репозиторием сборок и пользователь от чьего имени запускать
        if [ -n "$ansibleRepoDir" ] && [ -n "$ansibleUser" ]
        then
            # обновляем версию и запускаем ансибл, а потом все комитим
    #        // todo @ANKU @LOW - можно вынести в отдельный файл
    #        echo "Run ansible update ui script: $updateUiAnsibleScriptDir$updateUiAnsibleScriptFile"
    #        # заменяем версию в ансибл скриптах
    #        cd $updateUiAnsibleScriptDir && sh $updateUiAnsibleScriptFile \
    #                --appUiName $appName \
    #                --appUiVersion $appVersion \
    #                --ansibleUser $ansibleUser \
    #                --ansibleTag $ansibleTag \
    #                --ansibleInventory $ansibleInventory

            # заменяем версию в ансибл скриптах
            # для тестирования regexp без файла: printf "%s\n" abode 201.0.12 | sed 's/[0-9]\+\.[0-9]\+\.[0-9]\+/opa/'
            # // todo @ANKU @CRIT @MAIN - заменить пробелы табуляции на regexp
            sed -i -e "s/front_app_version               = [0-9]\+\.[0-9]\+\.[0-9]\+/front_app_version               = $appVersion/" $ansibleInventoryFile

            # коммитим в нашем ansible repository (test-scripts) изменный файл с обновленной версией фронта
            echo "Commit ansible repository"
            cd $ansibleRepoDir \
                && git add . \
                && git commit -m "chore(ui): update ui app version to $appVersion" \
                && git pull \
                && git push

    #        case "$OSTYPE" in
    #          linux*)   echo "LINUX" ;;
    #          darwin*)  echo "OSX" ;;
    #          win*)     echo "Windows" ;;
    #          cygwin*)  echo "Cygwin" ;;
    #          bsd*)     echo "BSD" ;;
    #          solaris*) echo "SOLARIS" ;;
    #          msys)     echo "Windows git sh" ;;
    #          *)        echo "unknown: $OSTYPE" ;;
    #        esac
            if [ "$OSTYPE" == "win"* ] || [ "$OSTYPE" == "cygwin"* ] || [ "$OSTYPE" == "msys" ]
            then
                # так как мы запускаемся из-под git sh (чтобы было виндовое окружение с доступным докером), то bash будет запускать из-под гита. А нам нужно из-под полноценной ubuntu, где заинсталин ansible
                echo "(for windows) For update DEV SERVER run from ubuntu:
                    cd \"$ansibleRepoDir\" && bash -c \"ansible-playbook --tags $ansibleTag -i $ansibleInventory play-mesos.yml -u $ansibleUser\"
                "
            else
                echo "Update DEV SERVER with ansible"
                cd $ansibleRepoDir \
                    && bash -c "ansible-playbook --tags $ansibleTag -i $ansibleInventory play-mesos.yml -u $ansibleUser"
            fi
        else
            echo "No \"ansibleRepoDir\" and \"ansibleUser\" options.
            Development booth hasn't will updated."
        fi
    fi
fi





