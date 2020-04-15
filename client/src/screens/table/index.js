import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';
import { Table, PageHeader, Button, Menu, Dropdown, Modal, Input } from 'antd';

import { EllipsisOutlined } from '@ant-design/icons';

// Local Imports
import { Loader } from '../../shared/components';
import './table.scss';

const defaultEditData = {
  field: '',
  value: ''
};

const DatabaseTable = props => {
  const { database, table } = props;

  // Local function state
  const [ loading, setLoading ] = useState(true);
  const [ data, setData ] = useState([]);
  const [ fields, setFields ] = useState([]);
  const [ indexes, setIndexes ] = useState([]);
  const [ doc, setDoc ] = useState(false);

  // Edit Field Data
  const [ editFieldVisible, setEditFieldVisible ] = useState(false);
  const [ editFieldData, setEditFieldData ] = useState(defaultEditData);

  const selectDocument = key => {
    setDoc(data[key]);
  }

  const openEditFieldModal = key => {
    setEditFieldData({
      field: key,
      value: doc[key]
    });
    setEditFieldVisible(true);
  }

  const closeEditFieldModal = () => {
    setEditFieldData(defaultEditData);
    setEditFieldVisible(false);
  }

  const updateEditFieldData = (field, value) => {
    setEditFieldData({
      ...editFieldData,
      [field]: value
    });
  }

  /**
   * Retrieves all unique fields across a table
   * so we can define them in the component table.
   */
  const retrieveTableIndexes = async () => {
    // try {
    //   const res = await props.rethink.client
    //     .db(database)
    //     .table(table)
    //     .indexList()
    //     .run(props.rethink.connection);
    //
    //   return setIndexes(res);
    // } catch (error) {
    //   console.log(error);
    // }
    //
    // setIndexes([]);
  }

  /**
   * Retrieves data for a table, and sets it
   * to local state.
   */
  const retrieveTableData = async () => {
    try {
      await retrieveTableIndexes();

      // Get the database list
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .limit(1000)
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
      setDoc(false);
    }

  }, [props.rethink.connected, table]);

  // If loading, return a loader component.
  if (loading) return (<Loader />);

  /**
   * Build the dataSource array, right now the only difference
   * between this array, and the data array is this will
   * add a key for each document (Needed for table)
   */
  const items = data.map((d, i) => {
    return {
      id: d.id,
      key: i
    }
  });

  // Menu for document
  const documentMenu = () => (
    <Menu>
      <Menu.Item onClick={() => console.log('test')}>Delete Document</Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="database-table__container">
        <div className="items">
          <div className="title">
            {table}
            <div className="options">
              <Dropdown trigger="click" overlay={documentMenu.bind(this)}>
                <Button shape="circle"><EllipsisOutlined /></Button>
              </Dropdown>
            </div>
          </div>
          <div className="add"><i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Add Document</div>
          <ul>
            {items.map((item, i) => {
              let active = false;
              if (doc !== false)
                if (doc.id === item.id) active = true;

              return (
                <li className={active ? 'selected' : ''} onClick={selectDocument.bind(this, i)}>
                  {item.id}
                  <i className="fas fa-caret-right icon"></i>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="information">
          {
            doc && (
              <>
                <div className="title">
                  {doc.id}
                  <div className="options">
                    <Dropdown trigger="click" overlay={documentMenu.bind(this)}>
                      <Button shape="circle"><EllipsisOutlined /></Button>
                    </Dropdown>
                  </div>
                </div>
                <div className="add"><i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Add Field</div>
                <ul>
                  {Object.keys(doc).map((field, index) => {
                    return (
                      <li key={index}>
                        <span className="field">
                          {field}
                        </span>: "{doc[field]}"
                        <div className="options">
                          <i onClick={openEditFieldModal.bind(this, field)} className="fas fa-pencil-alt icon"></i>
                          <i className="fas fa-trash icon"></i>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )
          }
        </div>
      </div>

      <Modal
        title="Edit Field"
        visible={editFieldVisible}
        onOk={closeEditFieldModal.bind(this)}
        onCancel={closeEditFieldModal.bind(this)}
      >
        <Input value={editFieldData.field} onChange={e => updateEditFieldData('field', e.target.value)} placeholder="Field" style={{marginBottom: 15}} />
        <Input value={editFieldData.value} onChange={e => updateEditFieldData('title', e.target.value)} placeholder="Value" style={{marginBottom: 15}} />
      </Modal>
    </>
  );
}

export default subscribe()(DatabaseTable);
