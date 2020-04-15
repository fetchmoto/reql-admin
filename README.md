# ReQL Admin

A future Administration GUI for RethinkDB.

----
**VERY EARLY STAGES OF DEVELOPMENT, CHECK BACK FOR UPDATES**

----

# Contributions

Want to contribute? Feel free to submit pull requests, create issues, and help with existing issues. The goal here is to create an up to date tool for easy RethinkDB administration.

# Todo

Below holds information on what was recently done, and what is in the near future.

- [X] Initialize Rethink Client in App State
- [X] List databases and their tables.
- [X] Start screen for table
- [X] Retrieve data for table
- [X] Minimal view for table data
- [ ] Add ability to add new document
- [ ] Add options for each table document
- [ ] Ability to delete table
- [ ] Ability to create new database
- [ ] Ability to create new tables
- [ ] Create connection screen (Specify websocket address, database information)

# Requirements

You must be running a rethinkdb websocket server so that the client can run queries. Please either refer to `rethinkdb-websocket-server`, or run the one that comes with this application in `/reql-ws`.

# Running ReQL-WS

- `cd reql-ws && yarn`
- `yarn start`

# Running in Browser

- `cd client && yarn`
- `yarn start`
