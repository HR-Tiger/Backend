FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# RUN npm rebuild bcrypt --build-from-source
RUN npm install pm2 -g

COPY . .
EXPOSE 3000

# CMD ["npm", "run", "start"]
CMD ["pm2", "start", "ecosystem.config.js"]

