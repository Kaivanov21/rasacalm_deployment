
FROM ubuntu:20.04

RUN apt-get update && apt-get -y install curl gnupg && curl -sL https://deb.nodesource.com/setup_20.x  | bash - && apt-get -y install nodejs


WORKDIR /app/frontend
COPY . /app/frontend

RUN npm install 

VOLUME /app/frontend

CMD npm start