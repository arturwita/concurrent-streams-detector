FROM node:14.15.0

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8001

CMD ["npm","run","start"]
