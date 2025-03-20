---
sidebar_position: 1
---

# Configuration

Before using the CLI, configure your environment variables. You can set them in a `.env` file in your project root.

```.env
RPC_URL_17000=
RPC_URL_1=

# Contract addresses
DEPLOYED=deployed-holesky-vaults-devnet-0.json
CONFIG=./config.json

# Wallet
PRIVATE_KEY_1=0x...
PRIVATE_KEY_17000=0x...

```

Application supported a few ways to adding or combine different settings

- #### 1st step
  You can pass link to json file with address of deployed contacts into **DEPLOYED** variable. If you want use
  devnet the all needed addresses of the contracts like VaultHub, VaultFactory etc already passed as example in configs/deployed-holesky-vaults-devnet-1.json.
  Also at near future this feature will be changed to resolving contracts addresses by LIDO locator and link to json
  file will no longer be necessary
- #### 2nd step
  You need to pass link to json config file into **CONFIG** variable. The structure of a config file has to be like
  ```javascript
  {
    "rpcLink": "https://link_to_rpc",
    "privateKey": "some_key",
    "chainId": 1, // or another number of chain id
    "lidoLocator": "LIDO locator address", // take LIDO locator address in paticular chainId
    "accounting": "LIDO accountind address" // take LIDO accounting address in paticular chainId
    "clLink": "url" // CL url
  }
  ```
  If you plan to manage contracts the **privateKey** is required property for this type of operations.
  For using rpcLink in a right way be attentive to match rpc resolver link and its chain ID.
  Also, You can pass rpc link as env variable into RPC*URL*(chainID)
  where chainID is current chain ID, chainId basically takes from config file, but also you can
  pass it to deployed file and process env CHAIN_ID variable.
