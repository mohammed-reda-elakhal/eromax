# Profile Management API Documentation

## Overview
The Profile Management API provides comprehensive endpoints for managing client profiles, including personal information, store details, wallet information, and payment methods.

## Base URL
```
/api/profile
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Client Profile Management

#### Get Complete Client Profile
```http
GET /api/profile/client/:id
GET /api/profile/client
```
**Description**: Retrieves complete client profile data including personal info, store, wallet, and payment methods.

**Response**:
```json
{
  "success": true,
  "data": {
    "client": {
      "_id": "client_id",
      "nom": "Client Name",
      "prenom": "Client Surname",
      "email": "client@email.com",
      "tele": "+212XXXXXXXX",
      "ville": "City",
      "adresse": "Address",
      "profile": {
        "url": "profile_image_url",
        "publicId": "cloudinary_id"
      },
      "number_colis": "10",
      "start_date": "2024-01-01"
    },
    "store": {
      "_id": "store_id",
      "storeName": "Store Name",
      "adress": "Store Address",
      "Bio": "Store Description",
      "tele": "+212XXXXXXXX",
      "solde": 1000,
      "default": true,
      "auto_DR": false
    },
    "wallet": {
      "_id": "wallet_id",
      "key": "EROMAX-WALLET-20241217-17-06-ABC12",
      "solde": 1000,
      "active": true
    },
    "paymentMethods": [
      {
        "_id": "payment_id",
        "nom": "Bank Name",
        "rib": "RIB123456789",
        "default": true,
        "idBank": {
          "_id": "bank_id",
          "nom": "Bank Name",
          "description": "Bank Description"
        }
      }
    ],
    "stats": {
      "totalColis": 10,
      "storeCount": 1,
      "walletBalance": 1000,
      "paymentMethodsCount": 1
    }
  }
}
```

#### Update Client Profile
```http
PUT /api/profile/client/:id
PUT /api/profile/client
```
**Description**: Updates client profile information.

**Request Body**:
```json
{
  "nom": "Updated Name",
  "prenom": "Updated Surname",
  "email": "updated@email.com",
  "tele": "+212XXXXXXXX",
  "ville": "Updated City",
  "adresse": "Updated Address"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated client object (password excluded)
  }
}
```

#### Update Client Password
```http
PUT /api/profile/client/:id/password
PUT /api/profile/client/password
```
**Description**: Updates client password with current password verification.

**Request Body**:
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 2. Store Management

#### Update Client Store
```http
PUT /api/profile/client/:id/store
PUT /api/profile/client/store
```
**Description**: Updates or creates client store information.

**Request Body**:
```json
{
  "storeName": "Store Name",
  "adress": "Store Address",
  "Bio": "Store Description",
  "tele": "+212XXXXXXXX",
  "message": "Welcome message",
  "default": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Store updated successfully",
  "data": {
    // Updated store object with populated client reference
  }
}
```

### 3. Wallet Management

#### Get Client Wallet
```http
GET /api/profile/client/:id/wallet
GET /api/profile/client/wallet
```
**Description**: Retrieves client wallet information.

**Response**:
```json
{
  "success": true,
  "data": {
    "wallet": {
      "_id": "wallet_id",
      "key": "EROMAX-WALLET-20241217-17-06-ABC12",
      "solde": 1000,
      "active": true
    },
    "store": {
      "id": "store_id",
      "storeName": "Store Name",
      "solde": 1000
    }
  }
}
```

### 4. Payment Methods Management

#### Get Client Payment Methods
```http
GET /api/profile/client/:id/payments
GET /api/profile/client/payments
```
**Description**: Retrieves all payment methods for a client.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "payment_id",
      "nom": "Bank Name",
      "rib": "RIB123456789",
      "default": true,
      "idBank": {
        "_id": "bank_id",
        "nom": "Bank Name",
        "description": "Bank Description"
      }
    }
  ]
}
```

#### Add Payment Method
```http
POST /api/profile/client/:id/payments
POST /api/profile/client/payments
```
**Description**: Adds a new payment method for the client.

**Request Body**:
```json
{
  "nom": "Bank Name",
  "rib": "RIB123456789",
  "default": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment method added successfully",
  "data": {
    // New payment method object
  }
}
```

#### Update Payment Method
```http
PUT /api/profile/client/:id/payments/:paymentId
PUT /api/profile/client/payments/:paymentId
```
**Description**: Updates an existing payment method.

**Request Body**:
```json
{
  "nom": "Updated Bank Name",
  "rib": "Updated RIB",
  "default": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment method updated successfully",
  "data": {
    // Updated payment method object
  }
}
```

#### Delete Payment Method
```http
DELETE /api/profile/client/:id/payments/:paymentId
DELETE /api/profile/client/payments/:paymentId
```
**Description**: Deletes a payment method.

**Response**:
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

### 5. Statistics and Analytics

#### Get Client Statistics
```http
GET /api/profile/client/:id/stats
GET /api/profile/client/stats
```
**Description**: Retrieves client statistics and summary information.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalColis": 10,
    "memberSince": "2024-01-01",
    "storeCount": 1,
    "walletBalance": 1000,
    "paymentMethodsCount": 1,
    "isStoreActive": true,
    "autoDR": false
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Email already exists",
    "Password must be at least 5 characters long"
  ]
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Client not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Data Models

### Client Schema
```javascript
{
  nom: String (required, 2-100 chars),
  prenom: String (required, min 2 chars),
  username: String (optional, min 2 chars),
  ville: String,
  adresse: String,
  tele: String,
  cin: String,
  email: String (required, unique, email format),
  profile: {
    url: String,
    publicId: String
  },
  active: Boolean (default: true),
  verify: Boolean (default: false),
  role: String (default: 'client'),
  start_date: String,
  number_colis: String,
  files: [ObjectId]
}
```

### Store Schema
```javascript
{
  id_client: ObjectId (ref: Client, required),
  image: {
    url: String,
    publicId: String
  },
  storeName: String (required, 2-100 chars),
  adress: String,
  Bio: String,
  tele: String,
  message: String (max 200 chars),
  default: Boolean (default: false),
  solde: Number (default: 0),
  auto_DR: Boolean (default: false)
}
```

### Wallet Schema
```javascript
{
  key: String (unique, required),
  store: ObjectId (ref: Store, required),
  solde: Number (default: 0, required),
  active: Boolean (default: true, required)
}
```

### Payment Schema
```javascript
{
  clientId: ObjectId (ref: Client),
  idBank: ObjectId (ref: Meth_Payement),
  nom: String (required),
  rib: String (required),
  default: Boolean (default: false)
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **Input Validation**: Joi validation for all input data
3. **Email Uniqueness**: Prevents duplicate email addresses
4. **Password Confirmation**: Requires password confirmation for updates
5. **Default Payment Method**: Only one payment method can be default per client

## Usage Examples

### Frontend Integration

```javascript
// Get client profile
const getProfile = async () => {
  const response = await fetch('/api/profile/client', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data;
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await fetch('/api/profile/client', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  return data;
};

// Add payment method
const addPayment = async (paymentData) => {
  const response = await fetch('/api/profile/client/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });
  const data = await response.json();
  return data;
};
```

## Notes

1. **Authentication Required**: All endpoints require valid JWT token
2. **Client Authorization**: Endpoints are designed for client access
3. **Data Population**: Related data is automatically populated where applicable
4. **Error Handling**: Comprehensive error handling with meaningful messages
5. **Validation**: Input validation using Joi schemas
6. **Password Security**: Secure password update with current password verification
7. **Default Handling**: Automatic management of default payment methods
8. **Statistics**: Real-time statistics calculation for dashboard display

## Future Enhancements

1. **File Upload**: Profile image upload functionality
2. **Notification Preferences**: Client notification settings
3. **Activity Log**: Profile change history tracking
4. **Two-Factor Authentication**: Enhanced security features
5. **Social Login**: Integration with social media platforms
6. **Audit Trail**: Complete profile modification history
