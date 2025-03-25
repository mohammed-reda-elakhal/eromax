import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import WalletInfo from '../components/WalletInfo';
import CreateWithdrawal from '../components/CreateWithdrawal';
import { Button, Space, Typography, message, Modal } from 'antd';
import { WalletOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title } = Typography;

const walletPageStyle = {
  '.wallet-content': {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: '1fr',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  },
  '.action-button': {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000
  },
  '@media (min-width: 768px)': {
    '.wallet-content': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  }
};

function Wallet() {
    const { theme } = useContext(ThemeContext);
    const [showWithdrawal, setShowWithdrawal] = useState(false);

    const handleWithdrawalSuccess = () => {
        setShowWithdrawal(false);
    };

    return (
        <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div
                    className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
                            <Title level={4} style={{ margin: 0 }}>
                                <Space>
                                    <WalletOutlined />
                                    My Wallet
                                </Space>
                            </Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setShowWithdrawal(true)}
                                size="large"
                            >
                                Nouveau Retrait
                            </Button>
                        </div>
                        <WalletInfo theme={theme} showTransactions={true} />
                    </div>

                    <Modal
                        title={
                            <Space>
                                <WalletOutlined />
                                Créer la demande de retrait
                            </Space>
                        }
                        open={showWithdrawal}
                        onCancel={() => setShowWithdrawal(false)}
                        footer={null}
                        width={800}
                        destroyOnClose
                        maskClosable={false}
                        style={{ top: 20 }}
                    >
                        <CreateWithdrawal 
                            visible={showWithdrawal}
                            onSuccess={() => {
                                setShowWithdrawal(false);
                                message.success('Withdrawal request created successfully');
                            }}
                            theme={theme}
                        />
                    </Modal>
                </div>
            </main>
        </div>
    );
}

export default Wallet;