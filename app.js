// SERVER A - User Data & Proof Generator
// This server holds user information and generates ZK proofs
// Port: 3001

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { UltraHonkBackend } = require('@aztec/bb.js');


const app = express();
const port = 3001;

app.use(bodyParser.json());

// User database with private information
let users = [
    {
        id: 1,
        name: "Juan",
        lastname: "Perez",
        age: 23,
        birthYear: 2001,
        phone: "223322322",
        email: "juan.perez@email.com",
        country: "Argentina",
        creditScore: 750,
        accountBalance: 5000,
        kycVerified: true
    },
    {
        id: 2,
        name: "Alice",
        lastname: "Saenz",
        age: 20,
        birthYear: 2004,
        phone: "223442322",
        email: "alice.saenz@email.com",
        country: "Argentina",
        creditScore: 680,
        accountBalance: 3200,
        kycVerified: true
    },
    {
        id: 3,
        name: "Bob",
        lastname: "Smith",
        age: 17,
        birthYear: 2007,
        phone: "445566778",
        email: "bob.smith@email.com",
        country: "USA",
        creditScore: 620,
        accountBalance: 1500,
        kycVerified: false
    }
];

// Helper function to generate a commitment (hash) for verification
function generateCommitment(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Helper function to simulate Noir proof generation
// In production, this would call actual Noir proof generation
function generateZKProof(circuitType, privateData, publicInputs) {
    // Simulate proof generation with a structured proof object
    const proof = {
        type: circuitType,
        timestamp: Date.now(),
        publicInputs: publicInputs,
        proofData: crypto.randomBytes(32).toString('hex'), // Simulated proof
        commitment: generateCommitment(privateData)
    };
    
    return proof;
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: "Server A - User Data & Proof Generator",
        port: port,
        endpoints: [
            "POST /generate-proof/age-compliance",
            "POST /generate-proof/credit-check",
            "POST /generate-proof/balance-verification"
        ]
    });
});

// CASE 1: Age Compliance Proof Generation
// Generates a proof that user is over a certain age without revealing exact age
app.post('/generate-proof/age-compliance', (req, res) => {
    const { userId, minimumAge } = req.body;
    
    if (!userId || !minimumAge) {
        return res.status(400).json({ error: "userId and minimumAge are required" });
    }
    
    const user = users.find(u => u.id === parseInt(userId));
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    // Calculate age
    const currentYear = new Date().getFullYear();
    const age = currentYear - user.birthYear;
    const isCompliant = age >= minimumAge;
    
    // Private data (never sent to verifier)
    const privateData = {
        birthYear: user.birthYear,
        actualAge: age
    };
    
    // Public inputs (what the verifier will check)
    const publicInputs = {
        currentYear: currentYear,
        minimumAge: minimumAge,
        isCompliant: isCompliant,
        userId: userId
    };
    
    // Generate the ZK proof
    const proof = generateZKProof('age_compliance', privateData, publicInputs);
    
    console.log(`[Server A] Generated age compliance proof for user ${userId}`);
    console.log(`[Server A] User is ${age} years old, minimum required: ${minimumAge}`);
    console.log(`[Server A] Result: ${isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}`);
    
    res.json({
        success: true,
        proof: proof,
        message: `Proof generated: User ${isCompliant ? 'meets' : 'does not meet'} age requirement`
    });
});

// CASE 2: Credit Score Check Proof Generation
// Generates a proof that user's credit score is above threshold
app.post('/generate-proof/credit-check', (req, res) => {
    const { userId, minimumCreditScore } = req.body;
    
    if (!userId || !minimumCreditScore) {
        return res.status(400).json({ error: "userId and minimumCreditScore are required" });
    }
    
    const user = users.find(u => u.id === parseInt(userId));
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    const meetsRequirement = user.creditScore >= minimumCreditScore;
    
    // Private data
    const privateData = {
        actualCreditScore: user.creditScore
    };
    
    // Public inputs
    const publicInputs = {
        minimumCreditScore: minimumCreditScore,
        meetsRequirement: meetsRequirement,
        userId: userId
    };
    
    // Generate the ZK proof
    const proof = generateZKProof('credit_check', privateData, publicInputs);
    
    console.log(`[Server A] Generated credit check proof for user ${userId}`);
    console.log(`[Server A] User credit score: ${user.creditScore}, minimum required: ${minimumCreditScore}`);
    console.log(`[Server A] Result: ${meetsRequirement ? 'APPROVED' : 'DENIED'}`);
    
    res.json({
        success: true,
        proof: proof,
        message: `Proof generated: User ${meetsRequirement ? 'meets' : 'does not meet'} credit requirement`
    });
});

// CASE 3: Balance Verification Proof Generation
// Generates a proof that user has sufficient account balance
app.post('/generate-proof/balance-verification', (req, res) => {
    const { userId, minimumBalance } = req.body;
    
    if (!userId || !minimumBalance) {
        return res.status(400).json({ error: "userId and minimumBalance are required" });
    }
    
    const user = users.find(u => u.id === parseInt(userId));
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    const hasSufficientFunds = user.accountBalance >= minimumBalance;
    
    // Private data
    const privateData = {
        actualBalance: user.accountBalance
    };
    
    // Public inputs
    const publicInputs = {
        minimumBalance: minimumBalance,
        hasSufficientFunds: hasSufficientFunds,
        userId: userId
    };
    
    // Generate the ZK proof
    const proof = generateZKProof('balance_verification', privateData, publicInputs);
    
    console.log(`[Server A] Generated balance verification proof for user ${userId}`);
    console.log(`[Server A] User balance: $${user.accountBalance}, minimum required: $${minimumBalance}`);
    console.log(`[Server A] Result: ${hasSufficientFunds ? 'SUFFICIENT' : 'INSUFFICIENT'}`);
    
    res.json({
        success: true,
        proof: proof,
        message: `Proof generated: User ${hasSufficientFunds ? 'has' : 'does not have'} sufficient funds`
    });
});

// Admin endpoint to view users (for testing only - would not exist in production)
app.get('/admin/users', (req, res) => {
    res.json({
        warning: "This endpoint exposes private data and should not exist in production",
        users: users
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', server: 'A' });
});

app.listen(port, () => {
    console.log(`====================================`);
    console.log(`SERVER A - User Data & Proof Generator`);
    console.log(`Running on port ${port}`);
    console.log(`====================================`);
    console.log(`Available endpoints:`);
    console.log(`- POST http://localhost:${port}/generate-proof/age-compliance`);
    console.log(`- POST http://localhost:${port}/generate-proof/credit-check`);
    console.log(`- POST http://localhost:${port}/generate-proof/balance-verification`);
    console.log(`====================================`);
});