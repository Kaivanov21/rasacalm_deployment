#!/bin/bash

# Start the Rasa server
#run
rasa run -m /app/models --enable-api --cors * --debug