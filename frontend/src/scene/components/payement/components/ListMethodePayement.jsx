import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteMethPayement, getMeth_payement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { Card, Button, Row, Col } from 'antd';
import Meta from 'antd/es/card/Meta';
import '../payement.css'; // Add a custom CSS file for additional styling
import { MdDelete } from 'react-icons/md';

const ListMethodePayement = () => {
  const dispatch = useDispatch();
  const { meth_payement, isFetching, error } = useSelector((state) => state.meth_payement);

  useEffect(() => {
    dispatch(getMeth_payement());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(DeleteMethPayement(id)); // Dispatch delete action with method ID
  };

  if (isFetching) return <p>Loading...</p>;
  if (error) return <p>Error loading payment methods</p>;

  return (
    <div className="payment-method-container">
      <h2 className="title">Payment Methods</h2>
      <Row gutter={[16, 16]}>
        {meth_payement.map((method) => (
          <Col key={method._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className="payment-card"
              cover={<img alt="bank logo" src={method.image.url} className="payment-card-img" />}
              actions={[
                <Button
                  icon={<MdDelete />}
                  onClick={() => handleDelete(method._id)} // Trigger delete with ID
                >
                  Delete
                </Button>,
              ]}
            >
              <Meta title={method.Bank} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ListMethodePayement;
