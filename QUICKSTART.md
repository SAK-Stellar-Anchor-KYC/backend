# Quick Start Guide - ZAK KYC Backend

## Setup (3 steps)

1. **Install dependencies**:
   ```powershell
   npm install
   ```

2. **Environment is ready**:
   The `.env` file is already configured with default values

3. **Start the server**:
   ```powershell
   npm run start:dev
   ```

✅ Server running at: http://localhost:3000  
📚 API Docs at: http://localhost:3000/api/docs

## Test the API (Copy & Paste)

### 1. Get JWT Token
```powershell
curl -X POST http://localhost:3000/auth/token -H "x-api-key: anchorKey1"
```

### 2. Save token and test the KYC endpoint
Replace `YOUR_TOKEN` with the token from step 1:

```powershell
# Validate KYC (includes automatic user registration + validation)
curl -X POST http://localhost:3000/kyc/base/validate `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "walletAddress=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" `
  -F "name=John" `
  -F "lastname=Doe" `
  -F "dni=12345678" `
  -F "dob=1990-01-15" `
  -F "email=john.doe@example.com" `
  -F "country=AR" `
  -F "selfie=@selfie.jpg" `
  -F "docPhoto=@document.jpg"

# Check KYC status
curl -X GET http://localhost:3000/kyc/status/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Mock RENAPER Rules

- Even DNI (e.g., 12345678) → ✅ KYC_VALID
- DNI ending in 5 (e.g., 12345675) → ⏳ KYC_PENDING  
- Other DNI (e.g., 12345677) → ❌ KYC_REJECTED

## Available API Keys

- `anchorKey1`
- `anchorKey2`
- `anchorKey3`

## Simplified Architecture ✨

Core features implemented:
- ✅ Nest.js with TypeScript
- ✅ In-memory storage (Maps)
- ✅ Swagger documentation
- ✅ CORS & Helmet
- ✅ Global validation pipes
- ✅ Multer file uploads
- ✅ Rate limiting
- ✅ API Key + JWT auth
- ✅ Wallet registration (simplified, no anchors)
- ✅ BASE KYC validation
- ✅ RENAPER mock adapter
- ✅ ZK Proof service
- ✅ Standard API response format

For full documentation, see README.md
