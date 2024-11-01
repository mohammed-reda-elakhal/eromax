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
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import moment from 'moment';

const { Option } = Select;

const UpdateColis = () => {
  const dispatch = useDispatch();
  const { selectedColis, loading, error, villes, stores, livreurs, produits } = useSelector((state) => state.colis);
  const { data: villesData, loading: villesLoading } = villes;
  const { data: storesData, loading: storesLoading } = stores;
  const { data: livreursData, loading: livreursLoading } = livreurs;
  const { data: produitsData, loading: produitsLoading } = produits;
  const [form] = Form.useForm();
  const { codeSuivi } = useParams();

  // Define validStatuses
const validStatuses = [
  "Nouveau Colis",
  "attente de ramassage",
  "Ramassée",
  "Expediée",
  "Reçu",
  "Mise en Distribution",
  "Livrée",
  "Annulée",
  "Programmée",
  "Refusée",
];

  useEffect(() => {
    dispatch(getColisByCodeSuivi(codeSuivi));
    dispatch(fetchOptions());
  }, [dispatch, codeSuivi]);

  useEffect(() => {
    if (selectedColis) {
      form.setFieldsValue({
        ...selectedColis,
        ville: selectedColis.ville?._id,
        store: selectedColis.store?._id,
        livreur: selectedColis.livreur?._id,
        date_programme: selectedColis.date_programme ? moment(selectedColis.date_programme) : null,
        date_livraisant: selectedColis.date_livraisant ? moment(selectedColis.date_livraisant) : null,
        produits: selectedColis.produits.map(p => p.produit),
      });
    }
  }, [selectedColis, form]);

  const onFinish = (values) => {
    const updatedData = {
      ...values,
      ville: values.ville,
      /*
      store: values.store,
      livreur: values.livreur,
      date_programme: values.date_programme ? values.date_programme.toDate() : null,
      date_livraisant: values.date_livraisant ? values.date_livraisant.toDate() : null,
      produits: values.produits.map(produitId => ({
        produit: produitId,
        variants: [], // Adjust based on your requirements
      })),
      */
    };
    console.log();
    
  dispatch(updateColisById( selectedColis._id , updatedData));
  };

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Row justify="center" style={{ marginTop: '20px' }}>
      <Col xs={24} sm={20} md={16} lg={12}>
        {loading && <Spin indicator={loadingIcon} />}
        {error && <Alert message="Error" description={error} type="error" showIcon />}
        {selectedColis && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              ...selectedColis,
              ouvrir: selectedColis.ouvrir,
              is_simple: selectedColis.is_simple,
              is_remplace: selectedColis.is_remplace,
              is_fragile: selectedColis.is_fragile,
            }}
          >
            <Form.Item
              label="Store"
              name="store"
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

            {/* Ville */}
            <Form.Item
              label="Ville"
              name="ville"
              rules={[{ required: true, message: 'Please select a city' }]}
            >
              <Select
                placeholder="Select a city"
                loading={villesLoading}
                allowClear
              >
                {villesData.map((ville) => (
                  <Option key={ville._id} value={ville._id}>
                    {ville.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>

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
              <Input.TextArea rows={4} />
            </Form.Item>

            {/* Prix */}
            <Form.Item
              label="Prix"
              name="prix"
              rules={[{ required: true, message: 'Please enter the price' }]}
            >
              <InputNumber
                prefix="DH"
                min={0}
                style={{ width: '100%' }}
                formatter={value => `${value}`}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            {/* Prix Payer */}
            <Form.Item
              label="Prix Payer"
              name="prix_payer"
              rules={[{ required: true, message: 'Please enter the paid price' }]}
            >
              <InputNumber
                prefix="DH"
                min={0}
                style={{ width: '100%' }}
                formatter={value => `${value}`}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            {/* Nature Produit */}
            <Form.Item
              label="Nature Produit"
              name="nature_produit"
              rules={[{ required: true, message: 'Please enter the nature of the product' }]}
            >
              <Input />
            </Form.Item>

            {/* Statut */}
            <Form.Item
              label="Statut"
              name="statut"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select placeholder="Select status">
                {validStatuses.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Boolean Fields */}
            <Form.Item name="ouvrir" valuePropName="checked">
              <Checkbox>Ouvrir</Checkbox>
            </Form.Item>
            <Form.Item name="is_simple" valuePropName="checked">
              <Checkbox>Simple</Checkbox>
            </Form.Item>
            <Form.Item name="is_remplace" valuePropName="checked">
              <Checkbox>Remplace</Checkbox>
            </Form.Item>
            <Form.Item name="is_fragile" valuePropName="checked">
              <Checkbox>Fragile</Checkbox>
            </Form.Item>

           

           
           

            {/* Submit Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Colis
              </Button>
            </Form.Item>
          </Form>
        )}
      </Col>
    </Row>
  );
};

export default UpdateColis;
