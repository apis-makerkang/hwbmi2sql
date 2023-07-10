Dockerfile

FROM node:18-alpine3.16
MAINTAINER paul

WORKDIR /home/node
COPY package.json /home/node
COPY api2mssql.js /home/node

RUN npm i
CMD ["node", "api2mssql.js", "--default"]
