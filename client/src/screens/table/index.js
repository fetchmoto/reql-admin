import React, { useState, useEffect } from 'react';
import { subscribe } from 'react-contextual';
import {
  Table,
  PageHeader,
  Button,
  Menu,
  Dropdown,
  Modal,
  Input,
  Popconfirm,
  Row,
  Col,
  message
} from 'antd';

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

const defaultCreateDocumentData = {
  id: '',
  fields: [
    {
      field: '',
      value: ''
    }
  ]
}

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

  // Create Document Data
  const [ createDocumentVisible, setCreateDocumentVisible ] = useState(false);
  const [ createDocumentData, setCreateDocumentData ] = useState(defaultCreateDocumentData);

  const updateDocumentInData = (key, doc) => {
    let documents = data;
    documents[key] = doc;
    setData([...documents]);
    setDoc(documents[key]);
  }

  const removeDocumentFromData = key => {
    let documents = data;
    documents.splice(key, 1);
    setData([...documents]);
    setDoc(false);
  }

  /**
   * Selects the current document to be shown.
   */
  const selectDocument = key => {
    setDoc(data[key]);
  }

  /**
   * Create document data methods. Handles opening modals,
   * updating data objects, etc.
   */
  const openCreateDocumentModal = () => {
    setCreateDocumentVisible(true);
  }

  const closeCreateDocumentModal = () => {
    setCreateDocumentData(defaultCreateDocumentData);
    setCreateDocumentVisible(false);
  }

  const removeCreateDocumentDataField = key => {
    let fields = createDocumentData.fields;
    fields.splice(key, 1);
    setCreateDocumentData({
      ...editFieldData,
      fields: [ ...fields ]
    });
  }

  const addCreateDocumentDataField = () => {
    let fields = createDocumentData.fields;

    fields.push({
      field: '',
      value: ''
    });

    setCreateDocumentData({
      ...createDocumentData,
      fields: [ ...fields ]
    });
  }

  const updateCreateDocumentFieldName = (i, value) => {
    let fields = createDocumentData.fields;
    fields[i].field = value;

    setCreateDocumentData({
      ...createDocumentData,
      fields: [ ...fields ]
    });
  }

  const updateCreateDocumentData = (field, value) => {
    if (field === 'id') {
      setCreateDocumentData({
        ...createDocumentData,
        id: value
      });
    } else {
      let fields = createDocumentData.fields;
      fields[field].value = value;

      setCreateDocumentData({
        ...createDocumentData,
        fields: [ ...fields ]
      });
    }
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
    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .get(doc.id)
        .delete()
        .run(props.rethink.connection);

      if (res.deleted === 0) return message.error('Unable to remove document.');

      const index = data.findIndex(d => d.id === doc.id);
      if (index === undefined || index === null || index === false) {
        console.log('Could not determine index.');
        return false;
      }

      removeDocumentFromData(index);

      message.success('Document was removed');
      return true;
    } catch (error) {
      console.log(error);
    }

    message.error('There was an error');
    return false;
  }

  /**
   * Handles the editing of a field for the current
   * selected document.
   */
  const handleCreateDocument = async () => {
    // Set data to an easier variable name
    let data = createDocumentData;

    // Set record object
    let record = {};

    // Validation
    for (let i = 0; i < data.fields.length; i++) {
      if (!data.fields[i].field) return message.error('Field name must have a value.');
      record[data.fields[i].field] = data.fields[i].value;
    }

    // If there is an id, set it.
    if (data.id) record.id = data.id;

    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .insert(record)
        .run(props.rethink.connection);

      // If nothing was inserted, return an error.
      if (res.inserted === 0) return message.error('Unable to create document.');

      // Retrieve table data again.
      await retrieveTableData();

      // Close the modal.
      closeCreateDocumentModal();
      message.success('Document was created');
      return true;
    } catch (error) {
      console.log(error);
    }

    message.error('There was an error');
    return false;
  }

  /**
   * Handles the editing of a field for the current
   * selected document.
   */
  const handleEditField = async () => {
    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .filter({ id: doc.id })
        .update({
          [editFieldData.field]: editFieldData.value
        })
        .run(props.rethink.connection);

      if (res.replaced === 0) return message.error('Unable to update field.');

      const index = data.findIndex(d => d.id === doc.id);
      if (index === undefined || index === null || index === false) {
        console.log('Could not determine index.');
        return false;
      }

      const document = await retrieveRecord(doc.id);
      updateDocumentInData(index, document);

      closeEditFieldModal();
      message.success('Field was updated');
      return true;
    } catch (error) {
      console.log(error);
    }

    message.error('There was an error');
    return false;
  }

  /**
   * Handles the creation of a field for the current
   * selected document.
   */
  const handleAddField = async () => {
    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .filter({ id: doc.id })
        .update({
          [createFieldData.field]: createFieldData.value
        })
        .run(props.rethink.connection);

      if (res.replaced === 0) return message.error('Unable to add field.');

      const index = data.findIndex(d => d.id === doc.id);
      if (index === undefined || index === null || index === false) {
        console.log('Could not determine index.');
        return false;
      }

      const document = await retrieveRecord(doc.id);
      updateDocumentInData(index, document);

      closeCreateFieldModal();
      message.success('Field was added');
      return true;
    } catch (error) {
      console.log(error);
    }

    message.error('There was an error');
    return false;
  }

  /**
   * Handles the deletion of a field for the current
   * selected document.
   */
  const handleDeleteField = async field => {
    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .filter({ id: doc.id })
        .replace(props.rethink.client.row.without(field))
        .run(props.rethink.connection);

      if (res.replaced === 0) return message.error('Unable to remove field.');

      const index = data.findIndex(d => d.id === doc.id);
      if (index === undefined || index === null || index === false) {
        console.log('Could not determine index.');
        return false;
      }

      const document = await retrieveRecord(doc.id);
      updateDocumentInData(index, document);

      message.success('Field was removed');
      return true;
    } catch (error) {
      console.log(error);
    }

    message.error('There was an error');
    return false;
  }

  /**
   * Retrieves data for a specific record.
   */
  const retrieveRecord = async uuid => {
    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .get(uuid)
        .run(props.rethink.connection);

      console.log(res);
      if (res === null) return false;
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
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
            <i className="fas fa-table"></i>&nbsp;&nbsp;{table}
            <div className="options">
              <Dropdown trigger="click" overlay={tableMenu.bind(this)}>
                <Button shape="circle"><EllipsisOutlined /></Button>
              </Dropdown>
            </div>
          </div>
          <div className="add" onClick={openCreateDocumentModal.bind(this)}><i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Add Document</div>
          <ul>
            {items.map((item, i) => {
              let active = false;
              if (doc !== false)
                if (doc.id === item.id) active = true;

              return (
                <li key={i} className={active ? 'selected' : ''} onClick={selectDocument.bind(this, i)}>
                  {item.id}
                  <i className="fas fa-angle-right icon"></i>
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
                  <i className="fas fa-align-justify"></i>&nbsp;&nbsp; {doc.id}
                  <div className="options">
                    <Popconfirm
                      title="Are you sure delete this document?"
                      onConfirm={handleDeleteDocument.bind(this)}
                      onCancel={() => console.log('canceled')}
                      okText="Yes"
                      cancelText="No"
                      placement="bottomRight"
                    >
                      <i className="fas fa-trash icon"></i>
                    </Popconfirm>
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

      {/** Modal for creating a document. **/}
      <Modal
        title="Create Document"
        visible={createDocumentVisible}
        onOk={handleCreateDocument.bind(this)}
        onCancel={closeCreateDocumentModal.bind(this)}
      >
        <Row>
          <Col span={24} style={{padding: 5}}>
            <Input value={createDocumentData.id} onChange={e => updateCreateDocumentData('id', e.target.value)} placeholder="Document ID (Leave blank to generate)" style={{marginBottom: 15}} />
          </Col>
        </Row>

        {
          createDocumentData.fields.map((field, i) => {
            return (
              <Row>
                <Col span={11} style={{padding: 5}}>
                  <Input value={field.field} onChange={e => updateCreateDocumentFieldName(i, e.target.value)} placeholder="Field" style={{marginBottom: 15}} />
                </Col>
                <Col span={11} style={{padding: 5}}>
                  <Input value={field.value} onChange={e => updateCreateDocumentData(i, e.target.value)} placeholder="Value" style={{marginBottom: 15}} />
                </Col>
                <Col span={2} style={{padding: 5, textAlign: 'right'}}>
                  <i style={{cursor: 'pointer'}} onClick={removeCreateDocumentDataField.bind(this, i)} className="fas fa-trash icon"></i>
                </Col>
              </Row>
            )
          })
        }
        <a onClick={addCreateDocumentDataField.bind(this)}>Add Field</a>
      </Modal>

      {/** Modal for adding a field. **/}
      <Modal
        title="Add Field"
        visible={createFieldVisible}
        onOk={handleAddField.bind(this)}
        onCancel={closeCreateFieldModal.bind(this)}
      >
        <Input value={createFieldData.field} onChange={e => updateCreateFieldData('field', e.target.value)} placeholder="Field" style={{marginBottom: 15}} />
        <Input value={createFieldData.value} onChange={e => updateCreateFieldData('value', e.target.value)} placeholder="Value" style={{marginBottom: 15}} />
      </Modal>

      {/** Modal for editing a field. **/}
      <Modal
        title="Edit Field"
        visible={editFieldVisible}
        onOk={handleEditField.bind(this)}
        onCancel={closeEditFieldModal.bind(this)}
      >
        <Input value={editFieldData.field} onChange={e => updateEditFieldData('field', e.target.value)} placeholder="Field" style={{marginBottom: 15}} />
        <Input value={editFieldData.value} onChange={e => updateEditFieldData('value', e.target.value)} placeholder="Value" style={{marginBottom: 15}} />
      </Modal>
    </>
  );
}

export default subscribe()(DatabaseTable);
