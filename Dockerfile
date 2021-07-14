FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# RUN npm rebuild bcrypt --build-from-source
RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY orhscbskgvi6az4
ENV PM2_SECRET_KEY yhzbc1aksehmf7d

COPY . .
EXPOSE 3000

# CMD ["npm", "run", "start"]
CMD ["pm2-runtime", "ecosystem.config.js"]
# CMD ["pm2-runtime", "app.js"]


