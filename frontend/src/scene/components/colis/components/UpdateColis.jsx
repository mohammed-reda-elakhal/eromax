// components/ColisUpdateForm.js

import React, { useEffect } from 'react';
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
import { LoadingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

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

  useEffect(() => {
    if (selectedColis) {
      const formValues = {
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

      form.setFieldsValue(formValues);
    }
  }, [selectedColis, form, dispatch, isAdmin]);

  const onFinish = (values) => {
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
    }

    dispatch(updateColisById(selectedColis._id, updatedData));
    navigate('/dashboard/list-colis');
  };

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Row justify="center" style={{ padding: "16px", borderRadius: "8px", width: "100%" }}>
      <Col xs={24} sm={20} md={16} lg={12}>
        {loading && <Spin indicator={loadingIcon} />}
        {error && <Alert message="Error" description={error} type="error" showIcon />}
        {selectedColis && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ padding: "16px", borderRadius: "8px", width: "100%" }}
            className={theme === 'dark' ? 'dark-mode' : ''}
          >
            {/* Store Selection */}
            <Form.Item
              label="Store"
              name="store"
              rules={[{ required: true, message: 'Please select a store' }]}
            >
              <Select disabled>
                <Option value={selectedColis.store._id}>
                  {selectedColis.store.storeName}
                </Option>
              </Select>
            </Form.Item>

            {/* Code Suivi */}
            <Form.Item label="Code Suivi" name="code_suivi">
              <Input disabled />
            </Form.Item>

            {/* Nom */}
            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true, message: 'Please enter the name' }]}
            >
              <Input />
            </Form.Item>

            {/* Téléphone */}
            <Form.Item
              label="Téléphone"
              name="tele"
              rules={[{ required: true, message: 'Please enter the phone number' }]}
            >
              <Input />
            </Form.Item>

           {/* Ville (Admin Only) */}
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
      allowClear
      filterOption={(input, option) =>
        option.children.toLowerCase().includes(input.toLowerCase())
      }
    >
      {villesData.map((ville) => (
        <Option key={ville._id} value={ville._id}>
          {ville.nom}
        </Option>
      ))}
    </Select>
  </Form.Item>
)}


            {/* Adresse */}
            <Form.Item
              label="Adresse"
              name="adresse"
              rules={[{ required: true, message: 'Please enter the address' }]}
            >
              <Input />
            </Form.Item>

            {/* Commentaire */}
            <Form.Item
              label="Commentaire"
              name="commentaire"
            >
              <TextArea rows={4} />
            </Form.Item>

            {/* Nature Produit */}
            <Form.Item
              label="Nature Produit"
              name="nature_produit"
              rules={[{ required: true, message: 'Please enter the nature of the product' }]}
            >
              <Input />
            </Form.Item>

            {/* Boolean Fields */}
            <Form.Item name="ouvrir" valuePropName="checked">
              <Checkbox>Ouvrir</Checkbox>
            </Form.Item>
            <Form.Item name="is_simple" valuePropName="checked">
              <Checkbox>Simple</Checkbox>
            </Form.Item>
            <Form.Item name="is_fragile" valuePropName="checked">
              <Checkbox>Fragile</Checkbox>
            </Form.Item>

            {/* Prix */}
            <Form.Item
              label="Prix"
              name="prix"
              rules={[{ required: true, message: 'Please enter the price' }]}
            >
              <Input
                prefix="DH"
                min={0}
                style={{ width: '100%' }}
                formatter={value => `${value}`}
                parser={value => value.replace(/DH\s?|(,*)/g, '')}
              />
            </Form.Item>

            {/* Tarif Ajouter Section (Admin Only) */}
            {isAdmin && (
              <Form.Item label="Tarif Ajouter">
                <Row gutter={16}>
                  {/* Value Input */}
                  <Col span={12}>
                    <Form.Item
                      name={['tarif_ajouter', 'value']}
                      rules={[
                        { required: false, message: 'Please enter the tarif value' },
                        { type: 'number', min: 0, message: 'Value must be at least 0' },
                      ]}
                    >
                      <InputNumber
                        placeholder="Valeur du tarif"
                        min={0}
                        style={{ width: '100%' }}
                        formatter={value => `${value} DH`}
                        parser={value => value.replace(/ DH$/, '')}
                        prefix={<InfoCircleOutlined />}
                        suffix={
                          <Tooltip title="Entrez la valeur additionnelle du tarif">
                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                          </Tooltip>
                        }
                      />
                    </Form.Item>
                  </Col>

                  {/* Description Input */}
                  <Col span={12}>
                    <Form.Item
                      name={['tarif_ajouter', 'description']}
                      rules={[
                        { required: false, message: 'Please enter the tarif description' },
                        { type: 'string', max: 300, message: 'Description cannot exceed 300 characters' },
                      ]}
                    >
                      <Input
                        placeholder="Description du tarif"
                        style={{ width: '100%' }}
                        prefix={<InfoCircleOutlined />}
                        suffix={
                          <Tooltip title="Entrez une description pour le tarif additionnel">
                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                          </Tooltip>
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            )}

            {/* Replaced Colis Selection */}
            {form.getFieldValue('is_remplace') && (
              <Form.Item
                label="Colis à remplacer"
                name="replacedColis"
                rules={[{ required: true, message: 'Please select a colis to replace' }]}
              >
                <Select
                  placeholder="Sélectionnez le Colis à remplacer"
                  loading={availableColisLoading}
                  allowClear
                >
                  {availableColisData.map((colis) => (
                    <Option key={colis._id} value={colis._id}>
                      {colis.code_suivi} - {colis.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {/* Submit Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isAdmin ? 'Mettre à jour le Colis' : 'Update Colis'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Col>
    </Row>
  );
};

export default UpdateColis;
