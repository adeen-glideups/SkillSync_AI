# Business Partner Auth API - Complete Documentation

## 🎯 New Registration Flow

The new flow supports **multiple restaurants and stores per user**:

1. **Signup** - Email + Password only
2. **Request OTP** - Send OTP to email
3. **Verify OTP** - Verify the OTP
4. **Owner Registration** - Complete profile with owner details + tokens
5. **Setup Restaurant** - Create first/additional restaurant (authenticated)
6. **Setup Store** - Create first/additional store (authenticated)

---

## 📋 API Endpoints

### ✅ Step 1: Signup
**POST** `/api/auth/signup`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request:
```json
{
  "email": "business@example.com",
  "password": "SecurePass123"
}
```

#### Response (201):
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "id": 1,
    "email": "business@example.com",
    "message": "Signup successful. Please verify your email with OTP."
  }
}
```

#### Validations:
- Email must be valid and unique
- Password minimum 8 characters
- Creates user with temporary name (updated in step 4)

---

### ✅ Step 2: Request OTP
**POST** `/api/auth/request-otp`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request:
```json
{
  "email": "business@example.com"
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent successfully"
  }
}
```

#### Features:
- Generates 6-digit OTP
- Expires in 60 seconds
- Deletes previous OTPs
- Sends via email

---

### ✅ Step 3: Verify OTP
**POST** `/api/auth/verify-otp`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request:
```json
{
  "email": "business@example.com",
  "otp": "123456"
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "message": "OTP verified successfully"
  }
}
```

#### Validations:
- OTP must be exactly 6 digits
- Must not be expired (60 seconds)
- Deletes OTP after verification

---

### ✅ Step 4: Owner Registration
**POST** `/api/auth/owner-registration`  
**Auth Required:** No  
**Content-Type:** `multipart/form-data`

#### Request (Form Data):
```javascript
email: "business@example.com"
name: "John Doe"
nic: "123456789012"
phoneNumber: "+94771234567"
country: "Sri Lanka"
profileImage: [File] // Optional
ownerLicenseFront: [File] // Optional
ownerLicenseBack: [File] // Optional
```

#### Response (200):
```json
{
  "success": true,
  "message": "Owner registration successful",
  "data": {
    "id": 1,
    "email": "business@example.com",
    "name": "John Doe",
    "username": "ueatsUser_1",
    "nic": "123456789012",
    "phoneNumber": "+94771234567",
    "profileImage": "/uploads/profile/profileImage-123.jpg",
    "OwnerLicenseImg": "{\"front\":\"/uploads/nic/ownerLicenseFront-123.png\",\"back\":\"/uploads/nic/ownerLicenseBack-124.jpg\"}",
    "userType": "buissness",
    "createdAt": "2025-01-20T10:00:00.000Z",
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

#### Features:
- Updates user with owner details
- Generates unique username
- Returns access and refresh tokens
- Phone number uniqueness check
- License images stored as JSON

---

### ✅ Step 5A: Setup Restaurant
**POST** `/api/auth/setup-restaurant`  
**Auth Required:** Yes (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request (Form Data):
```javascript
// Required fields
name: "Pizza Palace"
email: "pizza@example.com"
phone: "+94771234568"

// Optional fields
description: "Best pizza in town"
taxId: "TAX-123456"
buissnessLicenceId: "BL-998877"
restaurantLocation: "Colombo"
deliveryType: "FREE"
deliveryTime: "FIFTEEN_TO_TWENTY_MIN"

// Address fields
address: "No 45, Galle Road"
city: "Colombo"
state: "Western"
country: "Sri Lanka"
latitude: "6.9271"
longitude: "79.8612"
label: "Main Branch"

// Categories
categoryIds: [1, 2, 3]

// Operating Hours Option 1: Same timing for all days
useSameTiming: true
openTime: "09:00 AM"
closeTime: "11:00 PM"

// Operating Hours Option 2: Individual timings
useSameTiming: false
operatingHours: [
  {"day":"MONDAY","isOpen":true,"openTime":"09:00","closeTime":"22:00"},
  {"day":"TUESDAY","isOpen":true,"openTime":"09:00","closeTime":"22:00"},
  {"day":"WEDNESDAY","isOpen":true,"openTime":"09:00","closeTime":"22:00"},
  {"day":"THURSDAY","isOpen":true,"openTime":"09:00","closeTime":"22:00"},
  {"day":"FRIDAY","isOpen":true,"openTime":"09:00","closeTime":"23:00"},
  {"day":"SATURDAY","isOpen":true,"openTime":"10:00","closeTime":"23:00"},
  {"day":"SUNDAY","isOpen":false}
]

// Files
logo: [File] // Optional
buissnessLicenseImg: [File] // Optional
images: [File, File, File] // Optional, max 10
```

#### Response (201):
```json
{
  "success": true,
  "message": "Restaurant setup successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "business@example.com",
    "username": "ueatsUser_1",
    "userType": "buissness",
    "restaurant": {
      "id": 1,
      "userId": 1,
      "name": "Pizza Palace",
      "email": "pizza@example.com",
      "phone": "+94771234568",
      "description": "Best pizza in town",
      "taxId": "TAX-123456",
      "buissnessLicenceId": "BL-998877",
      "restaurantLocation": "Colombo",
      "deliveryType": "FREE",
      "deliveryTime": "FIFTEEN_TO_TWENTY_MIN",
      "logo": "/uploads/logo/logo-123.jpg",
      "images": "/uploads/restaurant/img-1.jpg,/uploads/restaurant/img-2.jpg",
      "buissnessLicenseImg": "/uploads/license/license-123.png",
      "useSameTiming": true,
      "status": "PENDING",
      "categories": [
        {
          "id": 1,
          "category": {
            "id": 1,
            "name": "Fast Food"
          }
        }
      ],
      "operatingHours": [
        {
          "day": "MONDAY",
          "isOpen": true,
          "openTime": "09:00 AM",
          "closeTime": "11:00 PM"
        }
        // ... all 7 days
      ]
    },
    "address": "No 45, Galle Road",
    "city": "Colombo",
    "state": "Western",
    "country": "Sri Lanka",
    "latitude": "6.9271",
    "longitude": "79.8612",
    "label": "Main Branch"
  }
}
```

#### Uniqueness Checks (Global):
- ✅ Restaurant email
- ✅ Restaurant phone
- ✅ Tax ID
- ✅ Business License ID

---

### ✅ Step 5B: Setup Store
**POST** `/api/auth/setup-store`  
**Auth Required:** Yes (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request (Form Data):
```javascript
// Same as setup-restaurant but with store-specific fields
name: "Electronics Store"
email: "store@example.com"
phone: "+94771234569"
storeLocation: "Kandy" // Instead of restaurantLocation

// All other fields same as restaurant
// Uses StoreCategoryList instead of Category
categoryIds: [1, 2] // Store category IDs
```

#### Response (201):
```json
{
  "success": true,
  "message": "Store setup successful",
  "data": {
    // Same structure as restaurant response
    "store": {
      "id": 1,
      "name": "Electronics Store",
      "storeCategories": [
        {
          "category": {
            "id": 1,
            "name": "Electronics"
          }
        }
      ]
      // ... rest of store data
    }
  }
}
```

---

### 🔐 Login
**POST** `/api/auth/login-email-business`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request:
```json
{
  "email": "business@example.com",
  "password": "SecurePass123",
  "deviceType": "web",
  "fcmToken": "firebase_token_here"
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "business@example.com",
    "name": "John Doe",
    "username": "ueatsUser_1",
    "userType": "buissness",
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1...",
    "restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "status": "APPROVED"
      },
      {
        "id": 2,
        "name": "Burger House",
        "status": "PENDING"
      }
    ],
    "stores": [
      {
        "id": 1,
        "name": "Electronics Store",
        "status": "APPROVED"
      }
    ]
  }
}
```

---

### 🔄 Refresh Token
**POST** `/api/auth/refresh-token`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "Tokens refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

---

### 🔒 Update Password
**POST** `/api/auth/update-password`  
**Auth Required:** Yes  
**Content-Type:** `application/json`

#### Request:
```json
{
  "password": "NewSecurePass123"
}
```

#### Response (200):
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "message": "Password updated successfully"
  }
}
```

**Note:** Logs out from all devices after password change.

---

### 🚪 Logout
**POST** `/api/auth/logout`  
**Auth Required:** No  
**Content-Type:** `application/json`

#### Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

---

### 🚪 Logout All
**POST** `/api/auth/logout-all`  
**Auth Required:** Yes  
**Content-Type:** `application/json`

Logs out from all devices.

---

### 📂 Get Restaurant Categories
**GET** `/api/auth/getAllCategories`  
**Auth Required:** No

#### Response (200):
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Fast Food"
    },
    {
      "id": 2,
      "name": "Fine Dining"
    }
  ]
}
```

---

### 📂 Get Store Categories
**GET** `/api/auth/getAllStoreCategories`  
**Auth Required:** No

#### Response (200):
```json
{
  "success": true,
  "message": "Store categories fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Electronics"
    },
    {
      "id": 2,
      "name": "Groceries"
    }
  ]
}
```

---

## 🔑 Key Features

### ✅ Multiple Restaurants/Stores per User
- One user can create unlimited restaurants and stores
- Each restaurant/store has unique email, phone, taxId, businessLicenseId

### ✅ Global Uniqueness Checks
All uniqueness checks are **global** (across all restaurants/stores):
- Restaurant/Store email
- Restaurant/Store phone
- Tax ID
- Business License ID

### ✅ Operating Hours Flexibility
**Option 1:** Same timing for all days
```javascript
useSameTiming: true
openTime: "09:00 AM"
closeTime: "11:00 PM"
```

**Option 2:** Individual day timings
```javascript
useSameTiming: false
operatingHours: [
  {"day":"MONDAY","isOpen":true,"openTime":"09:00","closeTime":"22:00"},
  {"day":"SUNDAY","isOpen":false}
  // Must provide all 7 days
]
```

### ✅ Owner License Storage
Owner license front and back images are stored as JSON:
```json
{
  "front": "/uploads/nic/front-123.jpg",
  "back": "/uploads/nic/back-124.jpg"
}
```

---

## ⚠️ Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `PHONE_ALREADY_EXISTS` | 409 | Phone already in use |
| `RESTAURANT_EMAIL_EXISTS` | 409 | Restaurant email exists |
| `RESTAURANT_PHONE_EXISTS` | 409 | Restaurant phone exists |
| `STORE_EMAIL_EXISTS` | 409 | Store email exists |
| `STORE_PHONE_EXISTS` | 409 | Store phone exists |
| `TAX_ID_EXISTS` | 409 | Tax ID already exists |
| `BUSINESS_LICENSE_EXISTS` | 409 | Business License ID exists |
| `OTP_EXPIRED` | 400 | OTP has expired |
| `OTP_INVALID` | 400 | Invalid OTP |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `ACCOUNT_DEACTIVATED` | 403 | Account is deactivated |
| `USER_NOT_FOUND` | 404 | User not found |

---

## 🧪 Complete Flow Example

### 1. Signup
```bash
POST /api/auth/signup
{
  "email": "john@business.com",
  "password": "SecurePass123"
}
```

### 2. Request OTP
```bash
POST /api/auth/request-otp
{
  "email": "john@business.com"
}
```

### 3. Verify OTP
```bash
POST /api/auth/verify-otp
{
  "email": "john@business.com",
  "otp": "123456"
}
```

### 4. Owner Registration
```bash
POST /api/auth/owner-registration
Form Data:
  email: john@business.com
  name: John Doe
  phoneNumber: +94771234567
  profileImage: [File]
  ownerLicenseFront: [File]
  ownerLicenseBack: [File]

Response: { accessToken, refreshToken }
```

### 5. Setup First Restaurant
```bash
POST /api/auth/setup-restaurant
Authorization: Bearer {accessToken}
Form Data:
  name: Pizza Palace
  email: pizza@example.com
  phone: +94771234568
  useSameTiming: true
  openTime: 09:00 AM
  closeTime: 11:00 PM
  categoryIds: [1,2]
  logo: [File]
```

### 6. Setup Second Restaurant (Optional)
```bash
POST /api/auth/setup-restaurant
Authorization: Bearer {accessToken}
// Different email, phone, etc.
```

### 7. Setup Store (Optional)
```bash
POST /api/auth/setup-store
Authorization: Bearer {accessToken}
// Store details
```

---

## 🚀 Production Ready Features

✅ Comprehensive validation  
✅ Global uniqueness checks  
✅ Proper error handling  
✅ Token management  
✅ OTP with expiry  
✅ Multiple businesses per user  
✅ Operating hours flexibility  
✅ Address management  
✅ File upload support  
✅ Cascading deletes  

All APIs are fully optimized and production-ready! 🎉