FROM node:23-alpine3.19

WORKDIR /app/

COPY package*.json /app/
RUN npm install

COPY . /app/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
