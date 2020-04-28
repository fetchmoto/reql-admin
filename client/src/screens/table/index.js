import React, { useState, useEffect } from 'react';
import { navigate } from 'hookrouter';
import { subscribe } from 'react-contextual';
import _ from 'lodash';
import filer from '../../shared/libs/filer';

// Ant Design Components
import {
  Modal,
  Input,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Select,
  message
} from 'antd';

// Local Imports
import { Loader } from '../../shared/components';
import './table.scss';

// Default data objects
const defaultEditData = { field: '', value: '' };

const defaultCreateData = {
  type: 'field', // or collection
  collection: '',
  path: false,
  fields: [
    {
      field: '',
      value: ''
    }
  ]
};

const defaultCreateDocumentData = {
  id: '',
  fields: [
    {
      field: '',
      value: ''
    }
  ]
};

const { Option } = Select;

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
      value: (key.includes('.') ? _.get(doc, key) : doc[key])
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
  const openCreateFieldModal = (field = false) => {
    setCreateFieldData({
      ...createFieldData,
      path: (typeof field === 'string' ? field : false)
    });

    setCreateFieldVisible(true);
  }

  const closeCreateFieldModal = () => {
    setCreateFieldData(defaultCreateData);
    setCreateFieldVisible(false);
  }

  const removeCreateFieldDataField = key => {
    let fields = createFieldData.fields;
    fields.splice(key, 1);

    setCreateFieldData({
      ...createFieldData,
      fields: [ ...fields ]
    });
  }

  const addCreateFieldDataField = () => {
    let fields = createFieldData.fields;

    fields.push({
      field: '',
      value: ''
    });

    setCreateFieldData({
      ...createFieldData,
      fields: [ ...fields ]
    });
  }

  const updateCreateFieldFieldName = (i, value) => {
    let fields = createFieldData.fields;
    fields[i].field = value;

    setCreateFieldData({
      ...createFieldData,
      fields: [ ...fields ]
    });
  }

  const updateCreateFieldData = (field, value) => {
    if (field === 'type') {
      if (value === 'field') {
        setCreateFieldData({
          ...createFieldData,
          type: value,
          fields: [
            {
              field: '',
              value: ''
            }
          ]
        });
      } else {
        setCreateFieldData({
          ...createFieldData,
          type: value
        });
      }
    } else if (field === 'collection') {
      setCreateFieldData({
        ...createFieldData,
        collection: value
      });
    } else {
      let fields = createFieldData.fields;
      fields[field].value = value;

      setCreateFieldData({
        ...createFieldData,
        fields: [ ...fields ]
      });
    }
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
  const handleDeleteTable = async t => {
    try {
      const res = await props.rethink.client
        .db(database)
        .tableDrop(t)
        .run(props.rethink.connection);

      if (res.tables_dropped === 0) return message.error('Error removing table');

      props.forceReload();
      navigate('/');
      message.success('Table was removed');
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
    let field = editFieldData.field;
    let d = doc;

    if (field.includes('.')) d = _.set(d, field, editFieldData.value);
    else d[field] = editFieldData.value;

    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .filter({ id: doc.id })
        .update(d)
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
    let d = doc;

    /**
     * If it's a collection, set the collection
     * key, then add all fields to it.
     */
    if (createFieldData.type === 'collection') {
      let path = (createFieldData.path ? createFieldData.path + '.' : '') + createFieldData.collection;
      for (let i = 0; i < createFieldData.fields.length; i++) {
        d = _.set(d, `${path}.${createFieldData.fields[i].field}`, createFieldData.fields[i].value);
      }
    } else {
      let path = (createFieldData.path ? createFieldData.path + '.' : '');

      if (createFieldData.fields.length)
        d = _.set(d, `${path}${createFieldData.fields[0].field}`, createFieldData.fields[0].value);
    }

    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .filter({ id: doc.id })
        .update(d)
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

    // Get document and unset
    let d = doc;
    _.unset(d, field);

    try {
      const res = await props.rethink.client
        .db(database)
        .table(table)
        .filter({ id: doc.id })
        .replace({ ...d })
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
   * Infinite iteration for documents that have sub-collections.
   */
  const iterate = (obj, parent = '') => {
    return Object.keys(obj).map((key, index) => {
      let field = [];
      let subs = [];

      // If it's an object, build the subs.
      if (typeof obj[key] === 'object') {
        subs = iterate(obj[key], (parent ? `${parent}.${key}` : key));

        field = buildDocumentFieldDisplay(
          obj,
          (parent ? `${parent}.${key}` : key),
          '',
          index,
          subs
        );
      } else {
        field = buildDocumentFieldDisplay(
          obj,
          (parent ? `${parent}.${key}` : key),
          obj[key],
          index
        );
      }

      return (<>{field}</>);
    })
  }

  /**
   * Builds the field display for a document.
   */
  const buildDocumentFieldDisplay = (d, field, value, index, subs = []) => {

    // Get the value of the field.
    const val = _.get(doc, field);

    return (
      <li key={index}>
        <span className="field">
          {field}
        </span>: {(val instanceof Array || val instanceof Object ? '' : `"${val}"`)}
        <div className="options">
          {
            subs.length ?
            (
              <Tooltip title="Add Field" placement="bottom">
                <i
                  onClick={openCreateFieldModal.bind(this, field)}
                  className="fas fa-plus icon"
                />
              </Tooltip>
            ) :
            (
              <Tooltip title="Edit" placement="bottom">
                <i
                  onClick={openEditFieldModal.bind(this, field)}
                  className="fas fa-pencil-alt icon"
                />
              </Tooltip>
            )
          }
          <Popconfirm
            title="Are you sure delete this field?"
            onConfirm={handleDeleteField.bind(this, field)}
            onCancel={() => console.log('canceled')}
            okText="Yes"
            cancelText="No"
            placement="bottomRight"
          >
            <Tooltip title="Delete" placement="bottomRight">
              <i className="fas fa-trash icon"></i>
            </Tooltip>
          </Popconfirm>
        </div>


        {subs.length ? (
          <ul className="child">
            {subs}
          </ul>
        ) : ''}
      </li>
    )
  }

  // Watch connection, current table and database.
  useEffect(() => {

    // If rethink is connected, and databases have not been pulled.
    if (props.rethink.connected === true) {
      retrieveTableData();
      setDoc(false);
    }

  // eslint-disable-next-line
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

  const headers = data.length ? Object.keys(data[0]).map(d => d) : {};

  return (
    <>
      <div className="database-table__container">
        <div className="items">
          <div className="title">
            <i className="fas fa-table"></i>&nbsp;&nbsp;{table}
            <div className="options">
              <Tooltip title="Import File">
                <i className="fas fa-file-import icon"></i>
              </Tooltip>

              <Tooltip title="Export Table">
                <i onClick={() => filer.export('json', headers, data, table)} className="fas fa-file-export icon"></i>
              </Tooltip>

              <Popconfirm
                title="Are you sure delete this table?"
                onConfirm={handleDeleteTable.bind(this, table)}
                onCancel={() => console.log('canceled')}
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
              >
                <Tooltip title="Delete Table">
                  <i className="fas fa-trash icon"></i>
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
          <div className="add" onClick={openCreateDocumentModal.bind(this)}>
            <i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Add Document
          </div>
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
                      <Tooltip title="Delete Document" placement="bottomRight">
                        <i className="fas fa-trash icon"></i>
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>
                <div className="add" onClick={openCreateFieldModal.bind(this)}>
                  <i className="fas fa-plus-circle"></i>&nbsp;&nbsp; Add Field
                </div>
                <ul>
                  {/** Outputting the document fields and values **/}

                  {iterate(doc)}
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
          <Col span={24} className="modal-row">
            <Input
              addonBefore="ID"
              value={createDocumentData.id}
              onChange={e => updateCreateDocumentData('id', e.target.value)}
              placeholder="Document ID (Leave blank to generate)"
              style={{marginBottom: 15}}
            />
          </Col>
        </Row>

        {
          createDocumentData.fields.map((field, i) => {
            return (
              <Row>
                <Col span={11} className="modal-row">
                  <Input
                    addonBefore="Field"
                    value={field.field}
                    onChange={e => updateCreateDocumentFieldName(i, e.target.value)}
                    placeholder="Field"
                    style={{marginBottom: 15}}
                  />
                </Col>
                <Col span={11} className="modal-row">
                  <Input
                    addonBefore="Value"
                    value={field.value}
                    onChange={e => updateCreateDocumentData(i, e.target.value)}
                    placeholder="Value"
                    style={{marginBottom: 15}}
                  />
                </Col>
                <Col span={2} style={{padding: 5, textAlign: 'right'}}>
                  <i
                    style={{cursor: 'pointer'}}
                    onClick={removeCreateDocumentDataField.bind(this, i)}
                    className="fas fa-trash icon"
                  />
                </Col>
              </Row>
            )
          })
        }
        <Row>
          <Col span={24} className="modal-row">
            <span className="add-row" onClick={addCreateDocumentDataField.bind(this)}>Add Field</span>
          </Col>
        </Row>
      </Modal>

      {/** Modal for adding a field. **/}
      <Modal
        title="Add Field"
        visible={createFieldVisible}
        onOk={handleAddField.bind(this)}
        onCancel={closeCreateFieldModal.bind(this)}
      >
        <Row>
          <Col span={24} className="modal-row">
          <Select style={{width: '100%'}} defaultValue={createFieldData.type} onChange={val => updateCreateFieldData('type', val)}>
            <Option value="field">Field</Option>
            <Option value="collection">Collection</Option>
          </Select>
          </Col>
          <hr />
        </Row>
        {
          createFieldData.type === 'collection' ?
          (
            <Row>
              <Col span={24} className="modal-row">
                <Input
                  addonBefore="Collection Name"
                  value={createFieldData.collection}
                  onChange={e => updateCreateFieldData('collection', e.target.value)}
                  placeholder="Collection"
                  style={{marginBottom: 15}}
                />
              </Col>
            </Row>
          ) : null
        }
        {
          createFieldData.fields.map((field, i) => {
            return (
              <Row>
                <Col span={(createFieldData.type === 'collection' ? 11 : 12)} className="modal-row">
                  <Input
                    addonBefore={(createFieldData.path ? (<span>{createFieldData.path}.{(createFieldData.collection ? `${createFieldData.collection}.` : '')}`</span>) : 'Field')}
                    value={field.field}
                    onChange={e => updateCreateFieldFieldName(i, e.target.value)}
                    placeholder="Field"
                    style={{marginBottom: 15}}
                  />
                </Col>
                <Col span={(createFieldData.type === 'collection' ? 11 : 12)} className="modal-row">
                  <Input
                    addonBefore="Value"
                    value={field.value}
                    onChange={e => updateCreateFieldData(i, e.target.value)}
                    placeholder="Value"
                    style={{marginBottom: 15}}
                  />
                </Col>
                {
                  createFieldData.type === 'collection' ?
                  (
                    <Col span={2} style={{padding: 5, textAlign: 'right'}}>
                      <i
                        style={{cursor: 'pointer'}}
                        onClick={removeCreateFieldDataField.bind(this, i)}
                        className="fas fa-trash icon"
                      />
                    </Col>
                  ) : null
                }
              </Row>
            )
          })
        }
        {
          createFieldData.type === 'collection' ?
          (
            <Row>
              <Col span={24} className="modal-row">
                <span className="add-row" onClick={addCreateFieldDataField.bind(this)}>Add Field</span>
              </Col>
            </Row>
          ) : null
        }
      </Modal>

      {/** Modal for editing a field. **/}
      <Modal
        title="Edit Field"
        visible={editFieldVisible}
        onOk={handleEditField.bind(this)}
        onCancel={closeEditFieldModal.bind(this)}
      >
        <Row>
          <Col span={12} className="modal-row">
            <Input
              addonBefore="Field"
              value={editFieldData.field}
              onChange={e => updateEditFieldData('field', e.target.value)}
              placeholder="Field"
              style={{marginBottom: 15}}
            />
          </Col>
          <Col span={12} className="modal-row">
            <Input
              addonBefore="Value"
              value={editFieldData.value}
              onChange={e => updateEditFieldData('value', e.target.value)}
              placeholder="Value"
              style={{marginBottom: 15}}
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
}

export default subscribe()(DatabaseTable);
