FROM node:12

# Create Nest Js App Directory
WORKDIR /usr/src/app

# Install Nest Js App Dependencies
COPY package*.json ./

RUN npm install

# Bundle App Source

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["node", "dist/main.js"]
