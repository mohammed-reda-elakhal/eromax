# Relancer Feature - Frontend Integration Examples

## Overview

This document provides examples of how to integrate the Relancer API from the frontend application.

---

## React/JavaScript Integration Examples

### Example 1: Type 1 - Same Data Relancer

```javascript
// Function to relance colis with same data
const relanceSameData = async (colisId) => {
  try {
    const response = await fetch(`/api/colis/relancer/${colisId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        type: "same_data"
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to relancer colis');
    }

    console.log('Relancer successful:', data);
    return data;
  } catch (error) {
    console.error('Error relancer colis:', error);
    throw error;
  }
};

// Usage
relanceSameData('64a1b2c3d4e5f6g7h8i9j0k1')
  .then(result => {
    alert(`Colis relancé avec succès!\nNouveau code: ${result.new_colis.code_suivi}`);
  })
  .catch(error => {
    alert(`Erreur: ${error.message}`);
  });
```

---

### Example 2: Type 2A - New Info, Same Ville

```javascript
// Function to relance with updated client information (same ville)
const relanceNewDataSameVille = async (colisId, newClientInfo) => {
  try {
    const response = await fetch(`/api/colis/relancer/${colisId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        type: "new_data",
        new_client_info: {
          nom: newClientInfo.nom,
          tele: newClientInfo.tele,
          adresse: newClientInfo.adresse,
          commentaire: newClientInfo.commentaire
        },
        same_ville_confirmed: true
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to relancer colis');
    }

    return data;
  } catch (error) {
    console.error('Error relancer colis:', error);
    throw error;
  }
};

// Usage
const handleRelanceUpdateInfo = async () => {
  try {
    const result = await relanceNewDataSameVille(colis.id, {
      nom: "Mohamed Ali Ben Ahmed",
      tele: "0612345678",
      adresse: "123 Rue Hassan II, Apt 5",
      commentaire: "Updated phone number and full address"
    });
    
    setSuccessMessage(`Colis relancé avec success! Code: ${result.new_colis.code_suivi}`);
    // Refresh colis list
    fetchColisList();
  } catch (error) {
    setErrorMessage(error.message);
  }
};
```

---

### Example 3: Type 2B - Different Ville

```javascript
// Function to relance with new ville
const relanceDifferentVille = async (colisId, newClientInfo, newVilleId) => {
  try {
    const response = await fetch(`/api/colis/relancer/${colisId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        type: "new_data",
        new_client_info: {
          nom: newClientInfo.nom,
          tele: newClientInfo.tele,
          adresse: newClientInfo.adresse,
          commentaire: newClientInfo.commentaire
        },
        new_ville_id: newVilleId
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to relancer colis');
    }

    return data;
  } catch (error) {
    console.error('Error relancer colis:', error);
    throw error;
  }
};

// Usage
const handleChangeVille = async (selectedVilleId) => {
  try {
    const result = await relanceDifferentVille(
      colis.id, 
      {
        nom: formData.nom,
        tele: formData.tele,
        adresse: formData.adresse
      },
      selectedVilleId
    );
    
    alert(`Colis créé avec nouveau ville!\nStatut: ${result.new_colis.statut}`);
    // The new colis will need livreur assignment
    navigateToLivreurAssignment(result.new_colis.id);
  } catch (error) {
    alert(`Erreur: ${error.message}`);
  }
};
```

---

## React Component Example

### Complete React Component for Relancer

```javascript
import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';

const RelancerColisModal = ({ colis, visible, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [relanceType, setRelanceType] = useState('same_data');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      let requestBody;
      
      if (relanceType === 'same_data') {
        // Type 1: Same data
        requestBody = {
          type: "same_data"
        };
      } else if (relanceType === 'new_same_ville') {
        // Type 2A: New data, same ville
        requestBody = {
          type: "new_data",
          new_client_info: {
            nom: values.nom,
            tele: values.tele,
            adresse: values.adresse || colis.adresse,
            commentaire: values.commentaire
          },
          same_ville_confirmed: true
        };
      } else {
        // Type 2B: New data, different ville
        requestBody = {
          type: "new_data",
          new_client_info: {
            nom: values.nom,
            tele: values.tele,
            adresse: values.adresse || colis.adresse,
            commentaire: values.commentaire
          },
          new_ville_id: values.ville_id
        };
      }

      const response = await fetch(`/api/colis/relancer/${colis._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec du relancer');
      }

      message.success('Colis relancé avec succès!');
      onSuccess(data);
      onCancel();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Relancer Colis"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          nom: colis.nom,
          tele: colis.tele,
          adresse: colis.adresse,
          commentaire: colis.commentaire
        }}
      >
        <Form.Item
          label="Type de Relancer"
          name="type"
          rules={[{ required: true }]}
        >
          <Select
            value={relanceType}
            onChange={setRelanceType}
            options={[
              { label: 'Même données (Réessayer)', value: 'same_data' },
              { label: 'Nouvelles données (Même ville)', value: 'new_same_ville' },
              { label: 'Nouvelles données (Autre ville)', value: 'new_different_ville' }
            ]}
          />
        </Form.Item>

        {relanceType === 'new_same_ville' && (
          <>
            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true, message: 'Nom est requis' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Téléphone"
              name="tele"
              rules={[{ required: true, message: 'Téléphone est requis' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Adresse"
              name="adresse"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </>
        )}

        {relanceType === 'new_different_ville' && (
          <>
            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Téléphone"
              name="tele"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Adresse"
              name="adresse"
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Nouvelle Ville"
              name="ville_id"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Sélectionner une ville"
                // Populate from villes list
                options={villes.map(v => ({ label: v.nom, value: v._id }))}
              />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Relancer
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RelancerColisModal;
```

---

## Redux Example (If using Redux)

### Redux Action

```javascript
// actions/colisActions.js
export const relancerColis = (colisId, relancerData) => {
  return async (dispatch) => {
    dispatch({ type: 'RELANCER_COLIS_START' });
    
    try {
      const response = await fetch(`/api/colis/relancer/${colisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(relancerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      dispatch({ type: 'RELANCER_COLIS_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'RELANCER_COLIS_ERROR', payload: error.message });
      throw error;
    }
  };
};
```

### Redux Reducer

```javascript
// reducers/colisReducer.js
const initialState = {
  colisList: [],
  loading: false,
  error: null
};

const colisReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'RELANCER_COLIS_START':
      return { ...state, loading: true, error: null };
    
    case 'RELANCER_COLIS_SUCCESS':
      return {
        ...state,
        loading: false,
        colisList: [...state.colisList, action.payload.new_colis],
        error: null
      };
    
    case 'RELANCER_COLIS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
};

export default colisReducer;
```

---

## Error Handling Examples

### Type 1 Error: Colis Already Delivered

```javascript
try {
  await relancerColis(colisId, { type: "same_data" });
} catch (error) {
  if (error.message.includes("Livrée")) {
    // Show user-friendly message
    message.error("Ce colis est déjà livré. Impossible de le relancer.");
  } else {
    message.error(`Erreur: ${error.message}`);
  }
}
```

### Type 2 Error: Missing Required Fields

```javascript
try {
  const result = await relancerColis(colisId, {
    type: "new_data",
    new_client_info: {
      nom: "",  // Missing required field
      tele: "0612345678"
    }
  });
} catch (error) {
  if (error.message.includes("required")) {
    message.error("Veuillez remplir tous les champs obligatoires.");
  }
}
```

### Type 3 Error: Invalid Status

```javascript
try {
  await relancerColis(colisId, { type: "same_data" });
} catch (error) {
  if (error.message.includes("status")) {
    message.warning("Ce statut ne permet pas de relancer le colis.");
  }
}
```

---

## UI/UX Recommendations

### 1. Relancer Button Placement
- Add "Relancer" button in the colis details page
- Show only for eligible statuses (use `canRelancerColis` logic client-side)
- Disable button for "Livrée" statuses

### 2. Modal Flow
```
Step 1: Select relancer type
  ├─ Same data → Auto submit
  ├─ Update info → Show form
  └─ Change ville → Show form + ville selector

Step 2: Confirmation
  ├─ Show original colis info
  ├─ Show new colis details
  └─ Confirm action

Step 3: Success
  ├─ Show success message
  ├─ Display new code_suivi
  └─ Optional: Navigate to new colis
```

### 3. Visual Indicators
- Show badge "Relancé" on relanced colis
- Add tooltip showing original colis info
- Display chain icon or link icon to show relationship

### 4. Permissions
```javascript
const canUserRelancer = (user, colis) => {
  // Admin, Team, and Store can relancer
  if (['admin', 'team', 'store'].includes(user.role)) {
    return true;
  }
  // Client can only relancer their own colis
  if (user.role === 'client' && colis.store === user.store) {
    return true;
  }
  return false;
};
```

---

## Integration Checklist

- [ ] Create `RelancerColisModal` component
- [ ] Add "Relancer" button to colis table
- [ ] Implement form for new data inputs
- [ ] Add ville selector for different ville option
- [ ] Handle loading states
- [ ] Show success/error messages
- [ ] Refresh colis list after relancer
- [ ] Add permissions check
- [ ] Test all three relancer types
- [ ] Add visual indicators for relanced colis

---

## Summary

The Relancer API provides three flexible options:
1. **Quick retry** with same data
2. **Update info** while keeping same city/livreur
3. **Change city** with new client information

The frontend should provide a simple UI that guides users through each option with appropriate forms and validations.

