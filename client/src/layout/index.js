import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';
import { navigate } from 'hookrouter';
import { Layout, Menu, Breadcrumb, Modal, Input, Button, message } from 'antd';

// Local imports
import 'antd/dist/antd.css';
import './layout.scss';
import { Loader } from '../shared/components';

// Sub components
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const defaultCreateTableData = {
  name: ''
};

const ApplicationLayout = props => {

  // Local component state
  const [ loading, setLoading ] = useState(true);
  const [ databases, setDatabases ] = useState([]);
  const [ currentDatabase, setCurrentDatabase ] = useState(false);
  const [ createTableModalVisible, setCreateTableModalVisible] = useState(false);
  const [ createTableData, setCreateTableData ] = useState(defaultCreateTableData);

  const openCreateTableModal = database => {
    setCurrentDatabase(database);
    setCreateTableModalVisible(true);
  }

  const closeCreateTableModal = () => {
    setCreateTableModalVisible(false);
    setCurrentDatabase(false);
    setCreateTableData(defaultCreateTableData);
  }

  const updateCreateTableData = (field, value) => {
    setCreateTableData({
      ...createTableData,
      [field]: value
    });
  }

  const handleCreateTable = async () => {
    try {
      // Get the database list
      const res = await props.rethink.client
        .tableCreate(createTableData.name)
        .run(props.rethink.connection);

      console.log(res);

      if (res.tables_created === 0) return message.error('Table could not be created.');

      await retrieveDatabases();
      message.success('Table was created.');

      setCreateTableModalVisible(false);
      setCurrentDatabase(false);
      setCreateTableData(defaultCreateTableData);
      return true;
    } catch (error) {
      console.log(error);
    }

    message.error('Table could not be created.');
    return false;
  }

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

  // Watch for changes in forceReloadKey
  useEffect(() => {
    console.log('Reloading');
    retrieveDatabases();
  }, [props.forceReloadKey]);

  // If loading, return a loader component.
  if (loading) return (<Loader />);

  // Build the navigation items to be rendered
  const navigationItems = databases.map((database, index) => {
    if (database.name !== 'rethinkdb') {
      return (
        <SubMenu key={index} title={database.name}>
          <Menu.Item onClick={openCreateTableModal.bind(this, database.name)} key={database.name + '-add'}>
            <i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Create Table
          </Menu.Item>
          {database.tables.map((table, index) => {
            return (<Menu.Item onClick={() => navigate(`/database/${database.name}/table/${table}`)} key={index}><i className="fas fa-table"></i>&nbsp;&nbsp;{table}</Menu.Item>)
          })}
        </SubMenu>
      );
    }
  });

  return (
    <div className="root">
      <Layout className="layout__root">
        <Sider className="site-layout-background">
          <div className="logo">ReQL Admin</div>
          <Menu mode="inline" theme="dark" className="layout__navigation" selectable={false}>
            {navigationItems}
          </Menu>
        </Sider>
        <Layout className="layout__content">
          {props.children}
        </Layout>
      </Layout>

      {/** Modal for creating a table. **/}
      <Modal
        title={`${currentDatabase} / Create Table`}
        visible={createTableModalVisible}
        onOk={handleCreateTable.bind(this)}
        onCancel={closeCreateTableModal.bind(this)}
      >
        <Input value={createTableData.name} onChange={e => updateCreateTableData('name', e.target.value)} placeholder="Table Name" style={{marginBottom: 15}} />
      </Modal>
    </div>
  );
}

export default subscribe()(ApplicationLayout);
