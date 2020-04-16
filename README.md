# ReQL Admin

A future Administration GUI for RethinkDB.

----
**VERY EARLY STAGES OF DEVELOPMENT, CHECK BACK FOR UPDATES**
----

# Contributions

Want to contribute? Feel free to submit pull requests, create issues, and help with existing issues. The goal here is to create an up to date tool for easy RethinkDB administration.

# Todo

Below holds information on what was recently done, and what is in the near future.

- [ ] Come up with a home page idea that has nice features
- [ ] Handle when websocket-server is not online
- [X] Initialize Rethink Client in App State
- [X] List databases and their tables.
- [X] Start screen for table
- [X] Retrieve data for table
- [X] Minimal view for table data
- [X] Add ability to add new document
- [X] Add options for each table document
- [X] Ability to delete table
- [ ] Ability to create new database
- [X] Ability to create new tables
- [ ] Create connection screen (Specify websocket address, database information)
- [ ] Refactor rethink client (Possibly create a react hook)
- [ ] Figure out why changefeeds are not reporting back once subscribed to.
- [ ] Filtering on DatabaseTable component

# Roadmap Features
- [ ] Import JSON / CSV into Tables
- [ ] Export table as JSON / CSV

# Requirements

You must be running a rethinkdb websocket server so that the client can run queries. Please either refer to `rethinkdb-websocket-server`, or run the one that comes with this application in `/reql-ws`.

# Running ReQL-WS

- `cd reql-ws && yarn`
- `yarn start`

# Running in Browser

- `cd client && yarn`
- `yarn start`

**NOTE: REQL ADMIN ASSUMES YOU HAVE A WEBSOCKET-SERVER RUNNING ON PORT 8000 AT THE MOMENT. THIS WILL BE UPDATED AT A LATER DATE ONCE THE APPLICATION IS MORE DEVELOPED**
