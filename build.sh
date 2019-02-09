#!/bin/bash

docker build -t nibalizer/watson-twitch-tone-analysis .
docker push nibalizer/watson-twitch-tone-analysis:latest
