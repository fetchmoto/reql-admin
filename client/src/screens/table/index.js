import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';
import { Table, PageHeader, Button } from 'antd';

// Local Imports
import { Loader } from '../../shared/components';

const DatabaseTable = props => {
  const { database, table } = props;

  // Local function state
  const [ loading, setLoading ] = useState(true);
  const [ data, setData ] = useState([]);
  const [ fields, setFields ] = useState([]);

  /**
   * Retrieves all unique fields across a table
   * so we can define them in the component table.
   */
  const retrieveTableFields = async () => {
    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .map(doc => doc.keys())
        .reduce((uniq, doc) => uniq.setUnion(doc))
        .distinct()
        .run(props.rethink.connection);

      return setFields(res);
    } catch (error) {
      console.log(error);
    }

    setFields([]);
  }

  /**
   * Retrieves data for a table, and sets it
   * to local state.
   */
  const retrieveTableData = async () => {
    try {
      await retrieveTableFields();

      // Get the database list
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .run(props.rethink.connection);

      // Convert to an array.
      const data = await res.toArray();
      setData(data);
      return setLoading(false);
    } catch (error) {
      console.log(error);
    }

    setData([]);
  }

  // Watch connection, current table and database.
  useEffect(() => {

    // If rethink is connected, and databases have not been pulled.
    if (props.rethink.connected === true) {
      retrieveTableData();
    }

  }, [props.rethink.connected, table]);

  // If loading, return a loader component.
  if (loading) return (<Loader />);

  /**
   * Build the dataSource array, right now the only difference
   * between this array, and the data array is this will
   * add a key for each document (Needed for table)
   */
  const dataSource = data.map((d, i) => {
    return {
      ...d,
      key: i
    }
  })

  /**
   * Setup the columns array for the table.
   */
  const columns = fields.map((field, index) => {
    return { title: field, dataIndex: field, key: index };
  });

  return (
    <>
      <PageHeader
        ghost={false}
        title={`${database} / ${table}`}
        extra={[
          <Button key="2">Operation</Button>,
          <Button key="1" type="primary">
            Create Document
          </Button>,
        ]}
      />
      <div className="content">
        <Table dataSource={dataSource} columns={columns} />
      </div>
    </>
  );
}

export default subscribe()(DatabaseTable);
