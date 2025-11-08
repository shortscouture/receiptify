FROM node:lts

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y \
        python3 \
        make \
        g++ \
        sqlite3 \
        libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p data

EXPOSE 3000

CMD [ "npm", "start" ]