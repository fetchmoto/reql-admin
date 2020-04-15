import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';
import { Table, PageHeader, Button, Menu, Dropdown, Modal, Input, Popconfirm } from 'antd';

import { EllipsisOutlined } from '@ant-design/icons';

// Local Imports
import { Loader } from '../../shared/components';
import './table.scss';

const defaultEditData = {
  field: '',
  value: ''
};

const defaultCreateData = {
  field: '',
  value: ''
};

const DatabaseTable = props => {
  const { database, table } = props;

  // Loading state
  const [ loading, setLoading ] = useState(true);

  // Table data
  const [ data, setData ] = useState([]);

  // Current selected document
  const [ doc, setDoc ] = useState(false);

  // Edit Field Data
  const [ editFieldVisible, setEditFieldVisible ] = useState(false);
  const [ editFieldData, setEditFieldData ] = useState(defaultEditData);

  // Create Field Data
  const [ createFieldVisible, setCreateFieldVisible ] = useState(false);
  const [ createFieldData, setCreateFieldData ] = useState(defaultCreateData);

  /**
   * Selects the current document to be shown.
   */
  const selectDocument = key => {
    setDoc(data[key]);
  }

  /**
   * Edit Field data methods. Handles opening modals,
   * updating data objects, etc.
   */
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
   * Create Field data methods. Handles opening modals,
   * updating data objects, etc.
   */
  const openCreateFieldModal = () => {
    setCreateFieldVisible(true);
  }

  const closeCreateFieldModal = () => {
    setCreateFieldData(defaultCreateData);
    setCreateFieldVisible(false);
  }

  const updateCreateFieldData = (field, value) => {
    setCreateFieldData({
      ...createFieldData,
      [field]: value
    });
  }

  /**
   * Below are the methods for handling specific actions
   * like editing fields, or creating documents as well
   * as deleting something.
   *
   * Naming convention should be that of
   * handle<ActionName> for quick reference.
   */

  /**
   * Handles the editing of a field for the current
   * selected document.
   */
  const handleDeleteDocument = async () => {
    console.log('Deleting document');
  }

  /**
   * Handles the editing of a field for the current
   * selected document.
   */
  const handleCreateDocument = async () => {
    console.log('Creating document');
  }

  /**
   * Handles the editing of a field for the current
   * selected document.
   */
  const handleEditField = async () => {
    console.log('Editing field');
  }

  /**
   * Handles the creation of a field for the current
   * selected document.
   */
  const handleAddField = async () => {
    console.log('Adding field');
  }

  /**
   * Handles the deletion of a field for the current
   * selected document.
   */
  const handleDeleteField = async field => {
    console.log(`Delete field ${field} from ${doc.id}`);
  }

  /**
   * Retrieves data for a table, and sets it
   * to local state.
   */
  const retrieveTableData = async () => {
    try {

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

  /**
   * @TODO: Figure out why the following logic
   * is not returning anything onChange. Seems to be a
   * websocket issue
   */
  const subscribe = () => {
    console.log('subscribed');

    props.rethink.client
      .db(database)
      .table(table)
      .changes({includeInitial: true})
      .run(props.rethink.connection, (error, changes) => {
        console.log('Changes discovered!');
      });
  }

  // Watch connection, current table and database.
  useEffect(() => {

    // If rethink is connected, and databases have not been pulled.
    if (props.rethink.connected === true) {
      retrieveTableData();
      // subscribe();
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

  // Menu for table
  const tableMenu = () => (
    <Menu>
      <Menu.Item onClick={() => console.log('test')}>Delete Table</Menu.Item>
    </Menu>
  );

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
              <Dropdown trigger="click" overlay={tableMenu.bind(this)}>
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
                <li key={i} className={active ? 'selected' : ''} onClick={selectDocument.bind(this, i)}>
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
                <div className="add" onClick={openCreateFieldModal.bind(this)}>
                  <i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Add Field
                </div>
                <ul>
                  {Object.keys(doc).map((field, index) => {
                    return (
                      <li key={index}>
                        <span className="field">
                          {field}
                        </span>: "{doc[field]}"
                        <div className="options">
                          <i onClick={openEditFieldModal.bind(this, field)} className="fas fa-pencil-alt icon"></i>
                          <Popconfirm
                            title="Are you sure delete this document?"
                            onConfirm={handleDeleteField.bind(this, field)}
                            onCancel={() => console.log('canceled')}
                            okText="Yes"
                            cancelText="No"
                          >
                            <i className="fas fa-trash icon"></i>
                          </Popconfirm>
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

      {/** Modal for adding a field. **/}
      <Modal
        title="Add Field"
        visible={createFieldVisible}
        onOk={handleAddField.bind(this)}
        onCancel={closeCreateFieldModal.bind(this)}
      >
        <Input value={createFieldData.field} onChange={e => updateCreateFieldData('field', e.target.value)} placeholder="Field" style={{marginBottom: 15}} />
        <Input value={createFieldData.value} onChange={e => updateCreateFieldData('title', e.target.value)} placeholder="Value" style={{marginBottom: 15}} />
      </Modal>

      {/** Modal for editing a field. **/}
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
