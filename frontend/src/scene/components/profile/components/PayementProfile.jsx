import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { Link, useParams } from 'react-router-dom';
import { getPaymentsByClientId } from '../../../../redux/apiCalls/payementApiCalls';
import { Card, Avatar, Row, Col, Modal } from 'antd'; // Import necessary Ant Design components
import Cookies from 'js-cookie';
import { PlusCircleFilled } from '@ant-design/icons';


const { Meta } = Card;

function PayementProfile() {
  const user = JSON.parse(Cookies.get('user'));
  const dispatch = useDispatch();
  const { id } = useParams();
  const { payements } = useSelector((state) => state.payement);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const userId = id || user._id;
    dispatch(getPaymentsByClientId(userId));
    window.scrollTo(0, 0); // Scroll to the top when the component loads
  }, [dispatch]);


  const OpenModal = () =>{
    setIsModalOpen(true);
  }

  const handleAjouter = () =>{

  }

 const handleCancel = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
        <Link className='btn-dashboard' onClick={()=>OpenModal()}>
            <PlusCircleFilled style={{marginRight:"8px"}} />
            Ajouter Colis
        </Link>
        <div style={{ padding: '20px' }}>
            <Row gutter={[16, 16]}>
                {payements.map((payement) => (
                <Col xs={24} sm={12} md={8} lg={6} key={payement?._id}>
                    <Card
                    hoverable
                    style={{ width: '100%' }}
                    cover={<Avatar src={payement?.idBank?.image?.url} size={64} style={{ margin: '10px auto' }} />}
                    >
                    <Meta
                        title={payement.nom} // Client's Name
                        description={payement?.rib} // RIB
                    />
                    <p style={{ marginTop: '10px' }}>Bank: <strong>{payement?.idBank?.Bank}</strong></p>
                    </Card>
                </Col>
                ))}
            </Row>
        </div>

        <Modal title="Basic Modal" open={isModalOpen} onOk={handleAjouter} onCancel={handleCancel}>
            
        </Modal>
    </>
  );
}

export default PayementProfile;
