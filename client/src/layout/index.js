import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';
import { navigate } from 'hookrouter';
import { Layout, Menu, Breadcrumb } from 'antd';

// Local imports
import 'antd/dist/antd.css';
import './layout.scss';
import { Loader } from '../shared/components';

// Sub components
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const ApplicationLayout = props => {

  // Local component state
  const [ loading, setLoading ] = useState(true);
  const [ databases, setDatabases ] = useState([]);

  /**
   * Testing a query to RethinkDB from here.
   */
  const retrieveDatabases = async () => {
    try {

      // Get the database list
      const res = await props.rethink
        .client
        .dbList()
        .run(props.rethink.connection);

      // Convert to an array.
      const dbs = await res.toArray();
      const response = [];

      /**
       * Iterate through each database, then grab the tables
       * for each one. After, push a new object to the response
       * array with the database name, and it's tables.
       */
      for (let i = 0; i < dbs.length; i++) {
        // Get the table list response
        const tablesRes = await props.rethink.client.db(dbs[i]).tableList().run(props.rethink.connection);

        // Convert the data to an array.
        const tables = await tablesRes.toArray();

        // Push the data to the array.
        response.push({
          name: dbs[i],
          tables
        })
      }

      // Update the state.
      return setDatabases(response);
    } catch (error) {
      console.log(error);
    }

    setDatabases([]);
  }

  // Watch connection status of Rethink
  useEffect(() => {

    // If rethink is connected, and databases have not been pulled.
    if (props.rethink.connected === true) {
      retrieveDatabases();
      setLoading(false);
    }

  }, [props.rethink.connected]);

  // If loading, return a loader component.
  if (loading) return (<Loader />);

  // Build the navigation items to be rendered
  const navigationItems = databases.map((database, index) => {
    return (
      <SubMenu key={index} title={database.name}>
        {database.tables.map((table, index) => {
          return (<Menu.Item onClick={() => navigate(`/database/${database.name}/table/${table}`)} key={index}>{table}</Menu.Item>)
        })}
      </SubMenu>
    );
  });

  return (
    <div className="root">
      <Layout className="layout__root">
        <Sider className="site-layout-background">
          <Menu mode="inline" theme="dark" className="layout__navigation">
            {navigationItems}
          </Menu>
        </Sider>
        <Layout className="layout__content">
          {props.children}
        </Layout>
      </Layout>
    </div>
  );
}

export default subscribe()(ApplicationLayout);
