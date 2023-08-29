FROM node:latest
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 3000
RUN npm install express
RUN npm install request-ip
RUN npm install axios
RUN npm install ejs

CMD node app.js