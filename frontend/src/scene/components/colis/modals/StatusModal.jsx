// components/ColisTable/modals/StatusModal.jsx

import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, Tag, Badge, DatePicker } from 'antd';
import { FaCheck } from 'react-icons/fa';
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

  useEffect(() => {
    // Reset form when modal is opened
    if (visible) {
      form.resetFields();
      setIsProgramméeOrReporté(false);
    }
  }, [visible, form]);

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
        <Form.Item
          name="status"
          label="Nouveau Statut"
          rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allowedStatuses.map((status, index) => (
              <Badge
                key={index}
                dot
                color={statusBadgeConfig[status]?.color || 'default'}
              >
                <Tag.CheckableTag
                  checked={statusType === status}
                  onChange={() => {
                    form.setFieldsValue({ status, comment: undefined, date: undefined, note: undefined });
                    handleStatusChange(status);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {statusBadgeConfig[status]?.icon} {status}
                </Tag.CheckableTag>
              </Badge>
            ))}
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
