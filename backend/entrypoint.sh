#!/bin/bash

rasa run -m /app/models --enable-api --cors * --debug
