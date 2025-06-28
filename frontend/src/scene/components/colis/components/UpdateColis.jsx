// components/ColisUpdateForm.js

import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getColisByCodeSuivi, updateColisById, fetchOptions } from '../../../../redux/apiCalls/colisApiCalls';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Spin,
  Alert,
  Row,
  Col,
  DatePicker,
  Tooltip,
  message,
} from 'antd';
import { LoadingOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import styles from '../styles/UpdateColis.module.css';

const { Option } = Select;
const { TextArea } = Input;

const UpdateColis = ({ theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedColis, loading, error, villes, stores, livreurs, produits, availableColisForReplacement } = useSelector((state) => state.colis);
  const { data: villesData, loading: villesLoading } = villes;
  const { data: storesData, loading: storesLoading } = stores;
  const { data: livreursData, loading: livreursLoading } = livreurs;
  const { data: produitsData, loading: produitsLoading } = produits;
  const { data: availableColisData, loading: availableColisLoading } = { data: availableColisForReplacement, loading: false }; // Adjust as per your state
  const [form] = Form.useForm();
  const { codeSuivi } = useParams();

  const { user } = useSelector(state => state.auth);
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    dispatch(getColisByCodeSuivi(codeSuivi));
    dispatch(fetchOptions());
  }, [dispatch, codeSuivi]);

  const initialValues = useMemo(() => {
    if (!selectedColis) return {};
    return {
      ...selectedColis,
      ville: isAdmin ? selectedColis.ville?._id : undefined,
      store: selectedColis.store?._id,
      livreur: selectedColis.livreur?._id,
      date_programme: selectedColis.date_programme ? moment(selectedColis.date_programme) : null,
      date_livraisant: selectedColis.date_livraisant ? moment(selectedColis.date_livraisant) : null,
      produits: selectedColis.produits.map(p => p.produit),
      tarif_ajouter: isAdmin ? {
        value: selectedColis.tarif_ajouter?.value || 0,
        description: selectedColis.tarif_ajouter?.description || '',
      } : undefined,
      is_remplace: selectedColis.is_remplace || false,
      replacedColis: selectedColis.replacedColis ? selectedColis.replacedColis._id : null,
    };
  }, [selectedColis, isAdmin]);

  useEffect(() => {
    if (selectedColis) form.setFieldsValue(initialValues);
  }, [selectedColis, initialValues, form]);

  const onFinish = useCallback((values) => {
    if (values.is_remplace && !values.replacedColis) {
      message.error('Veuillez sélectionner un colis à remplacer.');
      return;
    }

    const updatedData = {
      ...values,
      date_programme: values.date_programme ? values.date_programme.toISOString() : null,
      date_livraisant: values.date_livraisant ? values.date_livraisant.toISOString() : null,
      produits: values.produits, // Ensure produits are correctly formatted
    };

    if (isAdmin) {
      updatedData.tarif_ajouter = {
        value: values.tarif_ajouter?.value || 0,
        description: values.tarif_ajouter?.description || '',
      };
      updatedData.ville = values.ville;
      updatedData.livreur = values.livreur;
    }

    dispatch(updateColisById(selectedColis._id, updatedData));
    navigate('/dashboard/list-colis');
  }, [dispatch, isAdmin, navigate, selectedColis]);

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className={`${styles.updateFormContainer} ${theme === 'dark' ? 'dark-mode' : ''}`}>
      {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {selectedColis && (
        <Form
          form={form}
          initialValues={initialValues}
          layout="vertical"
          onFinish={onFinish}
        >
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.formGrid}>
              <Form.Item label="Store" name="store">
                <Select disabled>
                  <Option value={selectedColis.store._id}>{selectedColis.store.storeName}</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Code Suivi" name="code_suivi">
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Nom"
                name="nom"
                rules={[{ required: true, message: 'Please enter the name' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Téléphone"
                name="tele"
                rules={[{ required: true, message: 'Please enter the phone number' }]}
              >
                <Input />
              </Form.Item>
            </div>
          </div>

          {/* Current Livreur Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              Current Livreur Information
              {isAdmin && (
                <Tooltip title="You can change the livreur assignment in the Location Details section below">
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff', fontSize: '14px' }} />
                </Tooltip>
              )}
            </h3>
            <div className={styles.formGrid}>
              <Form.Item label="Current Livreur">
                <Input 
                  disabled 
                  value={selectedColis.livreur ? `${selectedColis.livreur.nom} - ${selectedColis.livreur.tele}` : 'No livreur assigned'}
                  style={{ 
                    color: selectedColis.livreur ? '#52c41a' : '#ff4d4f',
                    fontWeight: selectedColis.livreur ? '500' : 'normal'
                  }}
                />
              </Form.Item>
              <Form.Item label="Livreur Status">
                <Input 
                  disabled 
                  value={selectedColis.livreur ? 'Assigned' : 'Not Assigned'}
                  style={{ 
                    color: selectedColis.livreur ? '#52c41a' : '#ff4d4f',
                    fontWeight: '500'
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Location Details */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Location Details</h3>
            <div className={styles.formGrid}>
              {isAdmin && (
                <Form.Item
                label="Ville"
                name="ville"
                rules={[{ required: true, message: 'Please select a city' }]}
              >
                <Select
                  showSearch
                  placeholder="Select a city"
                  loading={villesLoading}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {villesData?.map(ville => (
                    <Option key={ville._id} value={ville._id}>
                      {ville.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              )}
              {isAdmin && (
                <Form.Item
                  label={
                    <Tooltip title="Assign or change the livreur responsible for this colis">
                      <span>
                        <UserOutlined style={{ marginRight: 8 }} />
                        Livreur
                      </span>
                    </Tooltip>
                  }
                  name="livreur"
                  rules={[{ required: false, message: 'Please select a livreur' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a livreur (optional)"
                    allowClear
                    loading={livreursLoading}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {livreursData?.map(livreur => (
                      <Option key={livreur._id} value={livreur._id}>
                        {livreur.nom} - {livreur.tele}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item
                label="Adresse"
                name="adresse"
                rules={[{ required: true, message: 'Please enter the address' }]}
              >
                <Input />
              </Form.Item>
            </div>
          </div>

          {/* Product Details */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Product Details</h3>
            <div className={styles.formGrid}>
              <Form.Item
                label="Nature Produit"
                name="nature_produit"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Prix"
                name="prix"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value} DH`}
                  parser={value => value.replace(/DH\s?|(,*)/g, '')}
                />
              </Form.Item>
            </div>

            <div className={styles.checkboxGroup}>
              <Form.Item name="ouvrir" valuePropName="checked">
                <Checkbox>Ouvrir</Checkbox>
              </Form.Item>
              <Form.Item name="is_simple" valuePropName="checked">
                <Checkbox>Simple</Checkbox>
              </Form.Item>
              <Form.Item name="is_fragile" valuePropName="checked">
                <Checkbox>Fragile</Checkbox>
              </Form.Item>
            </div>
          </div>

      

          {/* Submit Button */}
          <Form.Item style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {isAdmin ? 'Mettre à jour le Colis' : 'Update Colis'}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default UpdateColis;
