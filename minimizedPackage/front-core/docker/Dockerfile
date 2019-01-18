FROM mhart/alpine-node:6.9.4
MAINTAINER front-core

#Нужно задать какую-нибудь папку - пусть будет dockerImageRoot
ADD . /dockerImageRoot

WORKDIR /dockerImageRoot

EXPOSE 8080

# так как существуют разные версии запуска сервера, помимо production (к примеру, development, intergration, prelive)
# необходимо позволять выбирать и настраивать в мезосе, к примеру
# ../test-scripts/development
# [all:vars]
# NODE_ENV                    = development
#CMD npm run start-production
CMD npm run start-build

