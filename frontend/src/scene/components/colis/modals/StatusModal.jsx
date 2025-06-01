// components/ColisTable/modals/StatusModal.jsx

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, Tag, Badge, DatePicker } from 'antd';
import { FaCheck, FaSearch } from 'react-icons/fa';
import PropTypes from 'prop-types';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

/**
 * StatusModal component handles changing the status of a colis.
 *
 * Props:
 * - visible: boolean to control modal visibility
 * - onOk: function to handle status change confirmation
 * - onCancel: function to handle modal cancel
 * - form: Ant Design form instance
 * - selectedColis: object containing the selected colis data
 * - allowedStatuses: array of allowed status strings
 * - statusBadgeConfig: object mapping statut to color and icon
 * - statusComments: object mapping statut to array of comments
 * - statusType: currently selected status type
 * - setStatusType: function to set the status type
 * - theme: 'dark' or 'light'
 */
const StatusModal = React.memo(({
  visible,
  onOk,
  onCancel,
  form,
  selectedColis,
  allowedStatuses,
  statusBadgeConfig,
  statusComments,
  statusType,
  setStatusType,
  theme,
}) => {
  const [isProgramméeOrReporté, setIsProgramméeOrReporté] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStatuses, setFilteredStatuses] = useState(allowedStatuses);

  // Function to get status description
  const getStatusDescription = (status) => {
    const descriptions = {
      'Ramassé': 'Colis collecté et en transit',
      'Expédié': 'Colis en cours de livraison',
      'Livrée': 'Colis livré avec succès',
      'Refusée': 'Livraison refusée par le client',
      'Reporté': 'Livraison reportée à une date ultérieure',
      'Programmée': 'Livraison programmée pour une date',
      'Annule': 'Commande annulée',
      'Mise en distribution': 'En cours de distribution',
      'Retour': 'Colis en retour vers l\'expéditeur',
      'Retouré': 'Colis retourné à l\'expéditeur'
    };
    return descriptions[status] || 'Changer le statut du colis';
  };

  useEffect(() => {
    // Reset form when modal is opened
    if (visible) {
      form.resetFields();
      setIsProgramméeOrReporté(false);
      setSearchTerm('');
      setFilteredStatuses(allowedStatuses);
    }
  }, [visible, form, allowedStatuses]);

  // Filter statuses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStatuses(allowedStatuses);
    } else {
      const filtered = allowedStatuses.filter(status => {
        const statusLower = status.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const description = getStatusDescription(status).toLowerCase();
        return statusLower.includes(searchLower) || description.includes(searchLower);
      });
      setFilteredStatuses(filtered);
    }
  }, [searchTerm, allowedStatuses]);

  const handleStatusChange = (value) => {
    if (value === "Programmée" || value === "Reporté") {
      setIsProgramméeOrReporté(true);
    } else {
      setIsProgramméeOrReporté(false);
    }
    setStatusType(value);
  };

  return (
    <Modal
      title={`Changer le Statut de ${selectedColis ? selectedColis.code_suivi : ''}`}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Confirmer"
      cancelText="Annuler"
      className={theme === 'dark' ? 'dark-mode' : ''}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="form_status">
        {/* Quick Search Input */}
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Rechercher un statut rapidement..."
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
              {filteredStatuses.length} statut(s) trouvé(s)
            </div>
          )}
        </div>

        <Form.Item
          name="status"
          label="Nouveau Statut"
          rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '8px'
          }}>
            {filteredStatuses.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 20px',
                color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                fontSize: '14px'
              }}>
                <FaSearch style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }} />
                <div>Aucun statut trouvé pour "{searchTerm}"</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Essayez un autre terme de recherche</div>
              </div>
            ) : (
              filteredStatuses.map((status, index) => {
              const config = statusBadgeConfig[status] || { color: '#1677ff', icon: null };
              const isSelected = statusType === status;

              return (
                <div
                  key={index}
                  onClick={() => {
                    form.setFieldsValue({ status, comment: undefined, date: undefined, note: undefined });
                    handleStatusChange(status);
                  }}
                  style={{
                    padding: '16px',
                    border: `2px solid ${isSelected ? config.color : (theme === 'dark' ? '#434343' : '#d9d9d9')}`,
                    borderRadius: '8px',
                    backgroundColor: isSelected
                      ? (theme === 'dark' ? `${config.color}20` : `${config.color}10`)
                      : (theme === 'dark' ? '#1f1f1f' : '#fafafa'),
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                    minHeight: '80px',
                    justifyContent: 'center',
                    boxShadow: isSelected
                      ? `0 4px 12px ${config.color}30`
                      : (theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'),
                    transform: isSelected ? 'translateY(-2px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = config.color;
                      e.target.style.backgroundColor = theme === 'dark' ? `${config.color}10` : `${config.color}05`;
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                      e.target.style.backgroundColor = theme === 'dark' ? '#1f1f1f' : '#fafafa';
                      e.target.style.transform = 'none';
                    }
                  }}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '12px'
                    }}>
                      <FaCheck />
                    </div>
                  )}

                  {/* Status icon */}
                  <div style={{
                    fontSize: '24px',
                    color: isSelected ? config.color : (theme === 'dark' ? '#8c8c8c' : '#595959'),
                    marginBottom: '4px'
                  }}>
                    {config.icon}
                  </div>

                  {/* Status name */}
                  <div style={{
                    fontSize: '14px',
                    fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? config.color : (theme === 'dark' ? '#fff' : '#262626'),
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>
                    {status}
                  </div>

                  {/* Status description */}
                  <div style={{
                    fontSize: '11px',
                    color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    marginTop: '2px'
                  }}>
                    {getStatusDescription(status)}
                  </div>
                </div>
              );
            })
            )}
          </div>
        </Form.Item>

        {statusType && (statusComments[statusType] ? (
          <Form.Item
            name="comment"
            label="Commentaire"
            rules={[{ required: true, message: 'Veuillez sélectionner un commentaire!' }]}
          >
            <Select placeholder="Sélectionner un commentaire">
              {statusComments[statusType].map((comment, idx) => (
                <Option key={idx} value={comment}>
                  {comment}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            name="comment"
            label="Commentaire"
          >
            <Input.TextArea placeholder="Ajouter un commentaire (facultatif)" rows={3} />
          </Form.Item>
        ))}

        {isProgramméeOrReporté && (
          <>
            <Form.Item
              name="date"
              label={statusType === "Programmée" ? "Date Programmée" : "Date Reportée"}
              rules={[{ required: true, message: `Veuillez sélectionner une date pour ${statusType.toLowerCase()}.` }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')} // Disable past dates
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              name="note"
              label="Note (Optionnel)"
            >
              <TextArea rows={3} placeholder="Ajouter une note ou remarque" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
});

// Define prop types for better type checking
StatusModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  selectedColis: PropTypes.object,
  allowedStatuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  statusBadgeConfig: PropTypes.object.isRequired,
  statusComments: PropTypes.object.isRequired,
  statusType: PropTypes.string.isRequired,
  setStatusType: PropTypes.func.isRequired,
  theme: PropTypes.string,
};

StatusModal.defaultProps = {
  selectedColis: null,
  theme: 'light',
};

export default StatusModal;
