# Document Anchoring on Hedera Blockchain

## 📌 Overview
This project provides a blockchain-based solution for ensuring the authenticity and integrity of digital documents. By leveraging **Hedera Hashgraph**, we offer a secure, decentralized, and transparent way to **anchor**, **verify**, and **revoke** digital documents, mitigating risks associated with tampering, centralization, and trust issues.

## 📜 Features
- **Document Anchoring**: Generates a cryptographic hash of a document and records it on Hedera's Consensus Service.
- **Document Verification**: Checks if a document's hash exists on the blockchain to ensure its authenticity.
- **Document Revocation** (Bonus Feature): Allows document publishers to revoke documents if they become invalid.

## 🏗 System Architecture
The project is designed with a modular approach, consisting of the following components:
1. **Frontend (React.js)**: A user-friendly web interface to interact with the system.
2. **Backend**: Handles document hashing, interaction with Hedera, and database management.
3. **MongoDB**: Stores document metadata, enabling fast lookups before blockchain queries.
4. **Hedera Blockchain**: Provides immutability and security for document verification.

## 📊 Workflow
### 1️⃣ Document Anchoring
- Users upload a document.
- The system generates a **SHA-256 hash** of the document.
- The hash is stored in MongoDB and **published on a Hedera Consensus Service (HCS) topic**.
- Timestamped proof is recorded on the blockchain.

### 2️⃣ Document Verification
- Users upload a document to verify its authenticity.
- The system recomputes the hash and checks its existence in the **HCS topic**.
- If the hash exists, the document is confirmed authentic.

### 3️⃣ Document Revocation (Bonus)
- A separate **revocation topic** is created on Hedera.
- Users who originally anchored a document can revoke it.
- During verification, the system checks the revocation topic to ensure validity.

## 🔧 Technologies Used
- **Blockchain**: Hedera Hashgraph
- **Frontend**: React.js
- **Backend**: Node.js
- **Database**: MongoDB
- **Version Control**: Git & GitHub
- **Blockchain SDK**: Hedera SDK

## 🚀 Getting Started
### 1. Clone the Repository
```bash
   git clone https://github.com/your-username/document-anchoring.git
```
### 2. Set Up Environment Variables
Create a .env file and add your Hedera credentials.

### 3. Run the Application
```bash
   npm start
```
📝 Future Improvements
Implement multi-signature verification for enhanced security.
Improve UI/UX for a smoother experience.
Expand support for additional blockchain networks.

👥 Contributors
Houda BELABBES
Lamiae BOUKHAM
Salma EL BEKKARI
Chaimae SALLEM

### Contribute :

Contributions are welcome! If you want to suggest a modification, here are the steps to follow:
Fork the project on GitHub by clicking on the "Fork" button at the top right of this page.
1. Clone your fork locally :
```bash
   npm start
```
2. Create a new branch :
```bash
   git checkout -b feature/my-feature
```
3. Add Modifications :
```bash
   git add .
   git commit -m "Add a feature XYZ"
```

4. Push your branch to your remote repository :
```bash
   git push origin feature/my-feature
```

Thank you for contributing to this project! 🚀
^_^

