# Update: Single KYC Endpoint

## Date: November 22, 2025

## Summary of Changes

The **user registration endpoint** (`POST /users/register`) has been **removed** and all functionality has been consolidated into a **single KYC validation endpoint** (`POST /kyc/base/validate`) which now includes the `docPhoto` field.

---

## 🔄 Main Changes

### 1. **Consolidation into a Single Endpoint**

**Before (2 endpoints):**
```
POST /users/register     → Initial registration with docPhoto
POST /kyc/base/validate  → Validation with selfie + docPhoto
```

**Now (1 endpoint):**
```
POST /kyc/base/validate
Content-Type: multipart/form-data

Required fields:
- walletAddress: Wallet address (Ethereum format)
- name: First name
- lastname: Last name
- dni: DNI number (7-10 digits)
- dob: Date of birth (YYYY-MM-DD)
- email: Email address
- country: Country of residence (ISO code)
- selfie: Selfie photo for face verification (file)
- docPhoto: DNI document photo (file) ✨ NEW
```

**Functionality:**
- ✅ Automatically registers the user if they don't exist
- ✅ Validates information with RENAPER
- ✅ Generates ZK proof if validation is successful
- ✅ Everything in a single call

### 2. **Updated DTO with Email and DocPhoto**

```typescript
class ValidateBaseKycDto {
  walletAddress: string;     // Required
  name: string;              // Required
  lastname: string;          // Required
  dni: string;               // Required (7-10 digits)
  dob: string;               // Required (YYYY-MM-DD)
  email: string;             // ✨ Added
  country: string;           // Required (ISO code)
  selfie: File;              // Required (file)
  docPhoto: File;            // ✨ Added (file)
}
```

### 3. **Updated Swagger**

**Documentation changes:**
- ✅ Version updated to 3.0
- ✅ "KYC" tag prioritized with complete all-in-one endpoint description
- ✅ Documentation for multipart/form-data with selfie + docPhoto
- ✅ Examples updated with all required fields

**Previous description (v2.0):**
> "ZAK KYC System API - Supports user registration with complete KYC information..."

**New description (v3.0):**
> "ZAK KYC System API - Single endpoint for KYC validation with complete user information (personal data, selfie, and document photo). Automatically registers users and validates with RENAPER integration..."

---

## 📋 Implemented Validations

The `POST /kyc/base/validate` endpoint now validates:

- ✅ **walletAddress**: Valid Ethereum format (0x + 40 hex characters)
- ✅ **name**: Non-empty string
- ✅ **lastname**: Non-empty string
- ✅ **dni**: 7-10 characters
- ✅ **dob**: ISO date format (YYYY-MM-DD)
- ✅ **email**: Valid email format (new)
- ✅ **country**: ISO code 2-3 characters
- ✅ **selfie**: Required file
- ✅ **docPhoto**: Required file (new)

---

## 🔧 Modified Files

### Code:
1. ✅ `src/users/users.controller.ts` - Removed registration endpoint
2. ✅ `src/kyc/dto/validate-base-kyc.dto.ts` - Added email, selfie, docPhoto fields
3. ✅ `src/kyc/kyc.controller.ts` - Updated endpoint description
4. ✅ `src/kyc/kyc.service.ts` - Added automatic user registration logic
5. ✅ `src/kyc/kyc.module.ts` - Imported UsersModule
6. ✅ `src/renaper/interfaces/renaper.interface.ts` - Added email field to KycPayload
7. ✅ `src/main.ts` - Swagger v3.0, prioritized KYC tag

### Documentation:
8. ✅ `README.md` - Updated with single endpoint
9. ✅ `QUICKSTART.md` - Simplified curl commands
10. ✅ `REGISTER_UPDATE.md` - This document (updated)

---

## 📝 Usage Example

### 1. Get JWT Token
```bash
curl -X POST http://localhost:3000/auth/token \
  -H "x-api-key: anchorKey1"
```

### 2. Validate KYC (Single Endpoint - Registers + Validates)
```bash
curl -X POST http://localhost:3000/kyc/base/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "walletAddress=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" \
  -F "name=John" \
  -F "lastname=Doe" \
  -F "dni=12345678" \
  -F "dob=1990-01-15" \
  -F "email=john.doe@example.com" \
  -F "country=AR" \
  -F "selfie=@selfie.jpg" \
  -F "docPhoto=@document.jpg"
```

### Successful Response:
```json
{
  "success": true,
  "data": {
    "status": "KYC_VALID",
    "proof": "zkp_1732312800_abc123def456"
  },
  "error": null
}
```

**Note**: This single call:
1. Automatically registers the user (if they don't exist)
2. Validates information with RENAPER
3. Generates the ZK proof (if valid)

---

## 🔍 Simplified Architecture

### Before (2 steps):
1. **POST /users/register** → Register user with docPhoto
2. **POST /kyc/base/validate** → Validate with selfie + docPhoto

### Now (1 step):
**POST /kyc/base/validate** → All-in-one:
- ✅ Checks if user exists
- ✅ Automatically registers if not exists
- ✅ Validates with RENAPER
- ✅ Generates ZK proof
- ✅ Requires: walletAddress, personal data, email, selfie, docPhoto

---

## 🎯 Benefits

1. **Maximum Simplicity**: Single endpoint for the entire operation
2. **Less Friction**: Client makes only one call
3. **Automatic Registration**: No need to know if user exists
4. **Complete Validation**: All fields + files validated in one call
5. **Idempotency**: If user already exists, only performs validation
6. **Clear Documentation**: Swagger with a well-documented main endpoint

---

## 🚀 System Status

✅ **Compilation**: No errors  
✅ **Server**: Running on port 3000  
✅ **Swagger**: Updated v3.0 available at `/api/docs`  
✅ **Validations**: All working correctly  
✅ **Documentation**: README and QUICKSTART updated  
✅ **Active Endpoints**: 3 endpoints (auth/token, kyc/base/validate, kyc/status/:wallet)

---

## 📚 Resources

- **Swagger UI**: http://localhost:3000/api/docs
- **Main Endpoint**: `POST /kyc/base/validate`
- **Status Endpoint**: `GET /kyc/status/:walletAddress`
- **Authentication**: Bearer JWT token required
- **Files**: Maximum 5 MB per file (configurable)

---

## 🔄 Migration from v2.0

If you had the previous flow implemented:

**Required change:**
```diff
- // Step 1: Register user
- POST /users/register
-   { walletAddress, name, lastname, dni, dob, email, country, docPhoto }
-
- // Step 2: Validate KYC
- POST /kyc/base/validate
-   { name, lastname, dni, dob, country, walletAddress, selfie, docPhoto }

+ // Single step: Validate KYC (automatically registers)
+ POST /kyc/base/validate
+   { walletAddress, name, lastname, dni, dob, email, country, selfie, docPhoto }
```

---

**API Version**: 3.0  
**Date**: November 22, 2025
