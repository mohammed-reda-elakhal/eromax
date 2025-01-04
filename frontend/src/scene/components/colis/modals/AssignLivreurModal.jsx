// components/ColisTable/modals/AssignLivreurModal.jsx

import React from 'react';
import { Modal, Card, Button, Divider, Typography } from 'antd';
import { BsFillInfoCircleFill } from "react-icons/bs";

const { Text } = Typography;

/**
 * AssignLivreurModal component handles assigning a livreur to selected colis.
 *
 * Props:
 * - visible: boolean to control modal visibility
 * - onAssign: function to handle assignment confirmation
 * - onCancel: function to handle modal cancel
 * - filteredLivreurs: object containing { preferred: [], other: [] }
 * - assignSelectedLivreur: currently selected livreur object
 * - selectAssignLivreur: function to select a livreur
 * - loadingAssign: boolean indicating assignment loading state
 * - theme: 'dark' or 'light'
 * - toast: function to show toast notifications
 * - selectedColis: object representing the selected colis
 */
const AssignLivreurModal = React.memo(({
  visible,
  onAssign,
  onCancel,
  filteredLivreurs,
  assignSelectedLivreur,
  selectAssignLivreur,
  loadingAssign,
  theme,
  toast,
  selectedColis,
}) => {
  return (
    <Modal
      title={`Affecter un Livreur au Colis Sélectionné`}
      visible={visible}
      onOk={onAssign}
      onCancel={onCancel}
      okText="Affecter"
      cancelText="Annuler"
      width={"80vw"}
      confirmLoading={loadingAssign}
      className={theme === 'dark' ? 'dark-mode' : ''}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button 
          key="assign" 
          type="primary" 
          onClick={onAssign} 
          disabled={!assignSelectedLivreur} // Disable if no livreur is selected
          loading={loadingAssign}
        >
          Affecter
        </Button>,
      ]}
    >
      {/* Display Selected Colis Details */}
      {selectedColis && (
        <div style={{ marginBottom: '20px' }}>
          <Text strong>Code Suivi:</Text> {selectedColis.code_suivi}
          <br />
          <Text strong>Destinataire:</Text> {selectedColis.nom}
          <br />
          <Text strong>Téléphone:</Text> {selectedColis.tele}
          <br />
          <Text strong>Ville:</Text> {selectedColis.ville?.nom || 'N/A'}
          <br />
          <Text strong>Adresse:</Text> {selectedColis.adresse || 'N/A'}
          {/* Add more colis details as needed */}
        </div>
      )}

      <Divider />

      {/* Livreurs Préférés */}
      <div className='livreur_list_modal'>
        <h3>Livreurs Préférés</h3>
        <div className="livreur_list_modal_card" style={{ display: 'flex', flexWrap: 'wrap' }}>
          {filteredLivreurs.preferred.length ? filteredLivreurs.preferred.map(person => (
            <Card
              key={person._id}
              hoverable
              style={{
                width: 240,
                margin: '10px',
                border:
                  assignSelectedLivreur && assignSelectedLivreur._id === person._id
                    ? '2px solid #1890ff'
                    : '1px solid #f0f0f0',
              }}
              onClick={() => selectAssignLivreur(person)}
            >
              <Card.Meta
                title={<div>{person.username}</div>}
                description={
                  <>
                    {person.tele}
                    <Button
                      icon={<BsFillInfoCircleFill />}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the card's onClick
                        toast.info(`Villes: ${person.villes.join(', ')}`);
                      }}
                      type='primary'
                      style={{ float: 'right' }}
                    />
                  </>
                }
              />
            </Card>
          )) : <p>Aucun livreur préféré disponible</p>}
        </div>
      </div>

      <Divider />

      {/* Autres Livreurs */}
      <div className='livreur_list_modal'>
        <h3>Autres Livreurs</h3>
        <div className="livreur_list_modal_card" style={{ display: 'flex', flexWrap: 'wrap' }}>
          {filteredLivreurs.other.length ? filteredLivreurs.other.map(person => (
            <Card
              key={person._id}
              hoverable
              style={{
                width: 240,
                margin: '10px',
                border:
                  assignSelectedLivreur && assignSelectedLivreur._id === person._id
                    ? '2px solid #1890ff'
                    : '1px solid #f0f0f0',
              }}
              onClick={() => selectAssignLivreur(person)}
            >
              <Card.Meta
                title={<div>{person.username}</div>}
                description={
                  <>
                    {person.tele}
                    <Button
                      icon={<BsFillInfoCircleFill />}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the card's onClick
                        toast.info(`Villes: ${person.villes.join(', ')}`);
                      }}
                      type='primary'
                      style={{ float: 'right' }}
                    />
                  </>
                }
              />
            </Card>
          )) : <p>Aucun autre livreur disponible</p>}
        </div>
      </div>
    </Modal>
  );
});

export default AssignLivreurModal;
