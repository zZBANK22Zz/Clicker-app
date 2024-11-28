#!/bin/bash
TAG=v1
DOCKER_HUB=<username>/<project_name>:$TAG
docker login
docker build -t $DOCKER_HUB .
docker push $DOCKER_HUB