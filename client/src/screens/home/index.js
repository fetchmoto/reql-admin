import React, { useEffect, useState } from 'react';
import { subscribe } from 'react-contextual';
import { Row, Col, Statistic, Button } from 'antd';

const Home = props => {

  /**
   * Setup default state for stats.
   */
  const [ stats, setStats ] = useState({
    client_connections: 0,
    clients_active: 0,
    queries_per_sec: 0,
    read_docs_per_sec: 0,
    written_docs_per_sec: 0
  });

  const getRethinkStats = async () => {

    /**
     * Setup a changefeed that watches for changes
     * on the rethinkdb stats table.
     */
    const res = await props.rethink.client
      .db('rethinkdb')
      .table('stats')
      .get(["cluster"])
      .changes({ includeInitial: true, includeTypes: true })
      .run(props.rethink.connection, (error, cursor) => {
        cursor.each((err, doc) => {
          setStats({
            ...doc.new_val.query_engine
          });
        });
      });
  };

  useEffect(() => {
    getRethinkStats();
  }, []);

  return (
    <div style={{width: '100%', padding: 25}}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic style={{textAlign: 'center'}} title="Client Connections" value={stats.client_connections} />
        </Col>
        <Col span={6}>
          <Statistic style={{textAlign: 'center'}} title="Clients Active" value={stats.clients_active} />
        </Col>
        <Col span={6}>
          <Statistic style={{textAlign: 'center'}} title="Queries Per Second" value={stats.queries_per_sec} precision={2} />
        </Col>
        <Col span={6}>
          <Statistic style={{textAlign: 'center'}} title="Written Docs Per Second" value={stats.written_docs_per_sec} precision={2} />
        </Col>
      </Row>
    </div>
  );
}

export default subscribe()(Home);
