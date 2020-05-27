# ReQL Admin

A beautiful administration GUI for RethinkDB.

<div align="center">
  <img src="./ui.png" alt="ReQL Admin UI" />
</div>

You can do the following as of now:

- Create Database
- Create Table
- Create Document
- Export table to CSV (JSON is available, just not in the UI yet.)
- Delete Table
- Update field in Document
- Create field in Document (Sub-collection support)
- Delete field in Document

----
**Disclaimer - This is an early release of the tool. This could mean that the tool is not yet production ready due to existing bugs.**
----

# Contributions

Want to contribute? Feel free to submit pull requests, create issues, and help with existing issues. The goal here is to create an up to date tool for easy RethinkDB administration.

# Roadmap Features
- [ ] Import JSON / CSV into Tables
- [ ] Handle when websocket-server is not online
- [ ] Create connection screen (Specify websocket address, database information)
- [ ] Figure out why changefeeds are not reporting back once subscribed to.
- [ ] Filtering on DatabaseTable component
- [ ] Renaming a database

# Running Development Environment

`cd dist && yarn && yarn dev`

This will run both the reql websocket server, and the create-react-app start command. It will watch both the client and the server for changes concurrently, so no need to run them seperately.

# Building the client

`cd dist && yarn && yarn build`

This will build the client, then move the build folder into the dist folder.

# Running Production Environment

`cd dist && yarn && yarn start` or `cd dist && node server.js --env=production`

You can also pass a `--port` flag on the latter to run it on the port of your liking, or it will default to what you specify in `.env` or `8888`.
