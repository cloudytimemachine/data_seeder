FROM node:4.5

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.1.2/dumb-init_1.1.2_amd64
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

RUN groupadd -r nodejs && useradd -m -r -g nodejs nodejs
USER nodejs

RUN mkdir -p /home/nodejs/app
WORKDIR /home/nodejs/app

COPY package.json /home/nodejs/app/package.json
RUN npm install --production
COPY . /home/nodejs/app

EXPOSE 3000

ENV PORT 3000

CMD ["node", "index.js"]
