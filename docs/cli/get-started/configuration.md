---
sidebar_position: 1
---

# Configuration

Before using the CLI, configure your environment variables. You can set them in a `.env` file in your project root.

```.env
CHAIN_ID=11155111 // required
CL_URL=url
EL_URL=url

# Contract addresses
DEPLOYED=deployed-hoodi-vaults-testnet.json // required

# Wallet
PRIVATE_KEY=0x

# or encrypted file
# ACCOUNT_FILE=wallets/account.json
# ACCOUNT_FILE_PASSWORD=1234
```

If you plan to manage contracts the **PRIVATE_KEY** is required property for this type of operations.
For using **EL_URL** in a right way be attentive to match rpc resolver link and its chain ID.
