// components/ColisTable/modals/AssignLivreurModal.jsx

import React, { useState } from 'react';
import { Modal, Card, Button, Divider, Typography, Input, Tag, Badge } from 'antd';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { FaSearch, FaTruck, FaPhone, FaMapMarkerAlt, FaUser, FaCheck } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Filter livreurs based on search term
  const filterLivreurs = (livreurs) => {
    if (!searchTerm.trim()) return livreurs;
    return livreurs.filter(livreur =>
      livreur.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livreur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livreur.tele.includes(searchTerm) ||
      livreur.villes.some(ville => ville.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredPreferred = filterLivreurs(filteredLivreurs.preferred || []);
  const filteredOther = filterLivreurs(filteredLivreurs.other || []);

  // Render livreur card
  const renderLivreurCard = (person, isPreferred = false) => {
    const isSelected = assignSelectedLivreur && assignSelectedLivreur._id === person._id;

    return (
      <div
        key={person._id}
        onClick={() => selectAssignLivreur(person)}
        style={{
          padding: '16px',
          border: `2px solid ${isSelected ? '#1890ff' : (theme === 'dark' ? '#434343' : '#d9d9d9')}`,
          borderRadius: '8px',
          backgroundColor: isSelected
            ? (theme === 'dark' ? '#1890ff20' : '#1890ff10')
            : (theme === 'dark' ? '#1f1f1f' : '#fafafa'),
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: isSelected
            ? '0 4px 12px rgba(24, 144, 255, 0.3)'
            : (theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'),
          transform: isSelected ? 'translateY(-2px)' : 'none',
          width: '280px',
          margin: '8px'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#1890ff';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1890ff10' : '#1890ff05';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f1f1f' : '#fafafa';
            e.currentTarget.style.transform = 'none';
          }
        }}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px'
          }}>
            <FaCheck />
          </div>
        )}

        {/* Preferred badge */}
        {isPreferred && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px'
          }}>
            <Tag color="gold" style={{ margin: 0, fontSize: '10px' }}>
              Préféré
            </Tag>
          </div>
        )}

        {/* Livreur info */}
        <div style={{ marginTop: isPreferred ? '24px' : '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FaUser style={{
              color: isSelected ? '#1890ff' : (theme === 'dark' ? '#8c8c8c' : '#595959'),
              fontSize: '16px'
            }} />
            <Text strong style={{
              color: isSelected ? '#1890ff' : (theme === 'dark' ? '#fff' : '#262626'),
              fontSize: '14px'
            }}>
              {person.username}
            </Text>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FaPhone style={{
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
              fontSize: '12px'
            }} />
            <Text style={{
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
              fontSize: '12px'
            }}>
              {person.tele}
            </Text>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <FaMapMarkerAlt style={{
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
              fontSize: '12px',
              marginTop: '2px'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {person.villes.slice(0, 3).map((ville, index) => (
                  <Tag
                    key={index}
                    size="small"
                    style={{
                      margin: 0,
                      fontSize: '10px',
                      backgroundColor: theme === 'dark' ? '#434343' : '#f0f0f0',
                      color: theme === 'dark' ? '#fff' : '#262626',
                      border: 'none'
                    }}
                  >
                    {ville}
                  </Tag>
                ))}
                {person.villes.length > 3 && (
                  <Tag
                    size="small"
                    style={{
                      margin: 0,
                      fontSize: '10px',
                      backgroundColor: theme === 'dark' ? '#434343' : '#f0f0f0',
                      color: theme === 'dark' ? '#fff' : '#262626',
                      border: 'none'
                    }}
                  >
                    +{person.villes.length - 3}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdDeliveryDining style={{ fontSize: '20px', color: '#1890ff' }} />
          <span>Affecter un Livreur</span>
        </div>
      }
      open={visible}
      onOk={onAssign}
      onCancel={onCancel}
      okText="Affecter"
      cancelText="Annuler"
      width={"90vw"}
      style={{ maxWidth: '1200px' }}
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
          disabled={!assignSelectedLivreur}
          loading={loadingAssign}
          icon={<FaTruck />}
        >
          Affecter {assignSelectedLivreur ? `à ${assignSelectedLivreur.username}` : ''}
        </Button>,
      ]}
    >
      {/* Colis Information Card */}
      {selectedColis && (
        <div style={{
          padding: '16px',
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f8fafc',
          border: `1px solid ${theme === 'dark' ? '#434343' : '#e2e8f0'}`,
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <FaTruck style={{ color: '#1890ff', fontSize: '16px' }} />
            <Text strong style={{
              color: theme === 'dark' ? '#fff' : '#262626',
              fontSize: '16px'
            }}>
              Informations du Colis
            </Text>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <Text style={{ color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c', fontSize: '12px' }}>Code Suivi</Text>
              <div style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {selectedColis.code_suivi}
              </div>
            </div>

            <div>
              <Text style={{ color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c', fontSize: '12px' }}>Destinataire</Text>
              <div style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {selectedColis.nom}
              </div>
            </div>

            <div>
              <Text style={{ color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c', fontSize: '12px' }}>Téléphone</Text>
              <div style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {selectedColis.tele}
              </div>
            </div>

            <div>
              <Text style={{ color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c', fontSize: '12px' }}>Ville</Text>
              <div style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {selectedColis.ville?.nom || 'N/A'}
              </div>
            </div>

            <div>
              <Text style={{ color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c', fontSize: '12px' }}>Prix</Text>
              <div style={{
                color: '#1890ff',
                fontWeight: '700',
                fontSize: '16px'
              }}>
                {selectedColis.prix || 'N/A'} DH
              </div>
            </div>

            <div>
              <Text style={{ color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c', fontSize: '12px' }}>Statut</Text>
              <div>
                <Tag color="blue" style={{ margin: 0 }}>
                  {selectedColis.statut}
                </Tag>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder="Rechercher un livreur par nom, téléphone ou ville..."
          prefix={<FaSearch style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            borderRadius: '6px',
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
            borderColor: theme === 'dark' ? '#434343' : '#d9d9d9'
          }}
          allowClear
        />
        {searchTerm && (
          <div style={{
            fontSize: '12px',
            color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
            marginTop: '4px'
          }}>
            {filteredPreferred.length + filteredOther.length} livreur(s) trouvé(s)
          </div>
        )}
      </div>

      {/* Livreurs Préférés */}
      {filteredPreferred.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Badge count={filteredPreferred.length} style={{ backgroundColor: '#faad14' }}>
              <Text strong style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontSize: '16px'
              }}>
                Livreurs Préférés
              </Text>
            </Badge>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'flex-start'
          }}>
            {filteredPreferred.map(person => renderLivreurCard(person, true))}
          </div>
        </div>
      )}

      {/* Autres Livreurs */}
      {filteredOther.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Badge count={filteredOther.length} style={{ backgroundColor: '#1890ff' }}>
              <Text strong style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontSize: '16px'
              }}>
                Autres Livreurs
              </Text>
            </Badge>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'flex-start'
          }}>
            {filteredOther.map(person => renderLivreurCard(person, false))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredPreferred.length === 0 && filteredOther.length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c'
        }}>
          <FaSearch style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            Aucun livreur trouvé pour "{searchTerm}"
          </div>
          <div style={{ fontSize: '14px' }}>
            Essayez un autre terme de recherche
          </div>
        </div>
      )}
    </Modal>
  );
});

export default AssignLivreurModal;
