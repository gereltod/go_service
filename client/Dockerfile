FROM node:alpine

WORKDIR /usr/src/app

# Versions

COPY package*.json /usr/src/app/
RUN rm -rf node_modules/
RUN npm install

#COPY . /usr/src/app

#RUN npm install

COPY . .

EXPOSE 3000
#ENV REDIS_URL=redis://rediscache:6379
#ENV NODE_ENV=production

CMD ["npm","start"]