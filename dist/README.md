# Installing Packages

`yarn`

# Setting up `.env`

```
NODE_ENV="dev"
PORT=8888
RETHINK_WEBSOCKET_PATH="/rethink"
RETHINK_DB_HOST="localhost"
RETHINK_DB_PORT="28015"
```

# Running as Development

`yarn dev`

# Running as Production

`yarn start`

Make sure to update `NODE_ENV` in `.env` to `production`.

# Running using PM2

You can use pm2 (process manager) to keep reql admin running when not in shell. You can do this by installing pm2 `npm i -g pm2` then doing the following:

`pm2 start server.js --name="ReQL Admin" -- --env="production"`
