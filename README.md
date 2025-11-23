# ZAK KYC Backend

A Nest.js TypeScript backend API for ZAK (Stellar Anchor KYC) that provides a single KYC validation endpoint with RENAPER integration and ZK proof generation.

## Features

- 🔐 **Dual Authentication**: API Key + JWT Bearer token
- 📝 **Single KYC Endpoint**: All-in-one validation with automatic user registration
- � **Multi-file Upload**: Selfie + Document photo (docPhoto) in one request
- 🔒 **ZK Proof Generation**: Privacy-preserving proof generation (HMAC-based simulation)
- 🏦 **RENAPER Integration**: Mock adapter ready for real RENAPER API integration
- 📚 **OpenAPI/Swagger**: Complete API documentation
- 🛡️ **Security**: Helmet, CORS, rate limiting, validation pipes
- 💾 **In-Memory Storage**: Easy-to-replace data layer for rapid prototyping
- 🎯 **Simplified Architecture**: Direct KYC validation without separate registration step

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Sample Usage](#sample-usage)
- [Project Structure](#project-structure)
- [Development](#development)

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- PowerShell (Windows) or Bash (Linux/Mac)

## Installation

1. **Clone the repository**:
   ```powershell
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Create environment file**:
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Edit `.env` file** with your configuration (see [Configuration](#configuration))

## Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# API Keys (comma-separated)
API_KEYS=anchorKey1,anchorKey2,anchorKey3

# JWT Configuration
JWT_SECRET=supersecretjwtkey123456789
JWT_TTL=1800

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# RENAPER Integration (Mock - replace with real endpoint)
RENAPER_API_URL=https://api.renaper.gob.ar/v1
RENAPER_API_KEY=your_renaper_api_key_here

# ZK Proof Secret
ZK_PROOF_SECRET=supersecretZKproofkey987654321

# File Upload Configuration
FILE_MAX_SIZE=5000000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Configuration Details

- **API_KEYS**: Comma-separated list of valid API keys for anchors
- **JWT_SECRET**: Secret key for JWT token signing
- **JWT_TTL**: Token expiration time in seconds (default: 1800 = 30 minutes)
- **RATE_LIMIT_REQUESTS**: Max requests per window
- **RATE_LIMIT_WINDOW_MS**: Time window for rate limiting in milliseconds
- **ZK_PROOF_SECRET**: Secret for HMAC-based proof generation
- **FILE_MAX_SIZE**: Maximum file upload size in bytes (default: 5MB)

## Running the Application

### Development Mode

```powershell
npm run start:dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

### Production Mode

```powershell
npm run build
npm run start:prod
```

### Debug Mode

```powershell
npm run start:debug
```

## API Documentation

Once the server is running, access the interactive Swagger documentation at:

**http://localhost:3000/api/docs**

The Swagger UI provides:
- Complete API reference
- Request/response schemas
- Interactive endpoint testing
- Authentication examples

## API Endpoints

### Authentication

#### Generate JWT Token
```
POST /auth/token
```
**Headers**: `x-api-key: <your-api-key>`

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 1800
  },
  "error": null
}
```

### KYC

#### Validate BASE KYC (All-in-One Endpoint)
```
POST /kyc/base/validate
```
**Headers**: 
- `Authorization: Bearer <jwt-token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `walletAddress`: string (Ethereum format wallet address)
- `name`: string (First name)
- `lastname`: string (Last name)
- `dni`: string (DNI number, 7-10 digits)
- `dob`: string (Date of birth, YYYY-MM-DD format)
- `email`: string (Email address)
- `country`: string (ISO country code, e.g., "AR")
- `selfie`: file (Selfie photo for face verification)
- `docPhoto`: file (DNI document photo)

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "KYC_VALID",
    "proof": "zkp_1700000000_abc123..."
  },
  "error": null
}
```

**Note**: This endpoint automatically registers the user if they don't exist, then validates their KYC information with RENAPER.

#### Get KYC Status
```
GET /kyc/status/:walletAddress
```
**Headers**: `Authorization: Bearer <jwt-token>`

## Sample Usage

### Complete Flow Example

#### 1. Generate JWT Token

```powershell
curl -X POST http://localhost:3000/auth/token `
  -H "x-api-key: anchorKey1"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbmNob3JJZCI6ImExYjJjM2Q0ZTVmNmc3aDgiLCJzY29wZXMiOltdLCJpYXQiOjE3MDA2NTgwMDAsImV4cCI6MTcwMDY1OTgwMH0.xyz",
    "tokenType": "Bearer",
    "expiresIn": 1800
  },
  "error": null
}
```

Save the `accessToken` for subsequent requests.

#### 2. Validate KYC (All-in-One: Registration + Validation)

```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/kyc/base/validate `
  -H "Authorization: Bearer $token" `
  -F "walletAddress=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" `
  -F "name=John" `
  -F "lastname=Doe" `
  -F "dni=12345678" `
  -F "dob=1990-01-15" `
  -F "email=john.doe@example.com" `
  -F "country=AR" `
  -F "selfie=@selfie.jpg" `
  -F "docPhoto=@document.jpg"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "KYC_VALID",
    "proof": "zkp_1700658123_a1b2c3d4e5f6..."
  },
  "error": null
}
```

**Note**: This endpoint automatically registers the user if they don't exist yet, then proceeds with KYC validation.

#### 3. Query KYC Status

```powershell
curl -X GET http://localhost:3000/kyc/status/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb `
  -H "Authorization: Bearer $token"
```

### Mock RENAPER Validation Rules

The mock RENAPER adapter uses these rules for testing:

- **Even DNI** → `KYC_VALID`
- **DNI ending in 5** → `KYC_PENDING`
- **Other DNI** → `KYC_REJECTED`

Examples:
- DNI `12345678` → Valid
- DNI `12345675` → Pending
- DNI `12345677` → Rejected

## Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── strategies/       # Passport strategies (API Key, JWT)
│   │   ├── guards/           # Auth guards
│   │   ├── decorators/       # Custom decorators
│   │   ├── dto/              # Data transfer objects
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                # Users module (simplified)
│   │   ├── interfaces/
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── kyc/                  # KYC module
│   │   ├── interfaces/
│   │   ├── dto/
│   │   ├── kyc.controller.ts
│   │   ├── kyc.service.ts
│   │   └── kyc.module.ts
│   ├── renaper/              # RENAPER adapter (mock)
│   │   ├── interfaces/
│   │   ├── renaper.service.ts
│   │   └── renaper.module.ts
│   ├── zk-proof/             # ZK Proof service
│   │   ├── zk-proof.service.ts
│   │   └── zk-proof.module.ts
│   ├── common/               # Shared components
│   │   ├── filters/          # Exception filters
│   │   ├── interceptors/     # Response interceptors
│   │   └── interfaces/       # Shared interfaces
│   ├── config/               # Configuration
│   │   └── app.config.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Code Generation

Generate a new module:
```powershell
npm run nest generate module <module-name>
```

Generate a new controller:
```powershell
npm run nest generate controller <controller-name>
```

Generate a new service:
```powershell
npm run nest generate service <service-name>
```

### Linting

```powershell
npm run lint
```

### Formatting

```powershell
npm run format
```

### Testing

```powershell
npm run test
```

## Architecture Notes

### In-Memory Storage

All data is currently stored in-memory using `Map` objects:

- **Users**: `Map<walletAddress, User>`
- **KYC Records**: `Map<walletAddress, KycRecord>`

**To replace with a real database**:

1. Install your database driver (e.g., `@nestjs/typeorm`, `@nestjs/mongoose`)
2. Create entity/schema definitions
3. Replace `Map` operations with repository/model methods
4. Update service methods to be async/await compatible

### RENAPER Integration

The current implementation uses a mock RENAPER adapter (`src/renaper/renaper.service.ts`). To integrate with the real RENAPER API:

1. Update `RENAPER_API_URL` and `RENAPER_API_KEY` in `.env`
2. Implement actual HTTP calls in `RenaperService.validateBaseKyc()`
3. Map RENAPER response format to `RenaperValidationResponse`
4. Handle RENAPER-specific errors and retry logic

See comments in `src/renaper/renaper.service.ts` for detailed integration guidance.

### ZK Proof Service

The current ZK proof is a simulated HMAC-SHA256 hash. Replace with actual ZK proof generation:

1. Integrate your ZK proof library (e.g., snarkjs, circom)
2. Update `ZkProofService.generateProof()` method
3. Implement `validateProof()` for verification
4. Store proof artifacts appropriately

## Security Considerations

- Change `JWT_SECRET` and `ZK_PROOF_SECRET` to strong random values in production
- Configure CORS `origin` to specific domains in production
- Use HTTPS in production
- Store API keys securely (use secrets management)
- Implement proper rate limiting per anchor
- Add request logging and monitoring
- Validate file types and scan for malware
- Implement proper error handling without exposing internal details

## License

UNLICENSED

## Support

For questions or issues, please contact the development team.

---

**Generated**: November 22, 2025  
**Version**: 1.0.0  
**Framework**: Nest.js 10.3.0 with TypeScript
