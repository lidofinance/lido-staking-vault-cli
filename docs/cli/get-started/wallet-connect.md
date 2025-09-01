---
title: WalletConnect (WC)
description: Use WalletConnect with the CLI to sign and send transactions from your mobile/desktop wallet
---

### What is WalletConnect?

WalletConnect is an open protocol to connect dApps with wallets. In this CLI, WalletConnect lets you sign and send write transactions from your wallet without exposing a private key to the CLI. The CLI shows a connection URI and QR code; you approve the session in your wallet, and the CLI uses that session to submit transactions.

### Prerequisites

- Wallet that supports WalletConnect v2; for batched calls, support for EIP‑5792 (`wallet_sendCalls`) is recommended
- WalletConnect Cloud project ID
- Configured CLI environment (.env):

```env
# Required for chain/config
CHAIN_ID=...
EL_URL=https://...
DEPLOYED=configs/deployed-....json

# Optional contract overrides
# TOKEN_MANAGER=0x...
# VOTING=0x...

# WalletConnect
WALLET_CONNECT_PROJECT_ID=ee928c025792b10a6daa97d85328c433
```

Notes:

- When using WalletConnect, you do not need to provide `PRIVATE_KEY` or `ACCOUNT_FILE`.
- Ensure your wallet network matches `CHAIN_ID` used by the CLI.

### How it works (overview)

- The CLI initializes a WalletConnect session using your `WALLET_CONNECT_PROJECT_ID`.
- It prints a WalletConnect URI and displays a QR code in the terminal.
- You approve the session:
  - scan the QR code with your mobile phone, and a wallet app that supports WalletConnect should be opened automatically,
  - or copy and paste the WalletConnect URI into a wallet application (e.g., multisig) that supports URI input.
- The CLI simulates the transaction first, then requests your wallet to execute it.
- You sign the trancation in the wallet.
- For batches, the CLI uses `wallet_sendCalls` and waits for `wallet_getCallsStatus` when supported; otherwise it falls back to legacy sendTransaction per call.

Default connection behavior:

- Up to 3 connection attempts
- Per-attempt timeout: 180 seconds

### Enable WalletConnect mode

Add the `--wallet-connect` flag to any command that performs write operations. Example patterns below; exact commands depend on the module and method you call.

```bash
# Generic write example
yarn start <command> <subcommand> w <method> --wallet-connect

# Generic batch example
yarn start <command> <subcommand> w <batch-method> --wallet-connect
```

After you run a command with `--wallet-connect`:

- The CLI shows the URI and QR code.
- Approve the session in your wallet (via scanning QR code or copy-pasting URI).
- CLI may ask for additional actions (e.g., select a vault, confirm amount or address, etc.).
- Confirm the transaction in the wallet when prompted.
- The CLI will print the tx hash and wait for confirmations.

### Example (illustrative)

```bash
# Example: sending a write call using WalletConnect
yarn start report w submit --wallet-connect
```

### Security

- Your private key stays in the wallet; the CLI never sees or stores it
- The CLI only sends JSON‑RPC requests over the WalletConnect session

### Troubleshooting

- No URI shown or connection fails quickly:
  - Retry the command; ensure `WALLET_CONNECT_PROJECT_ID` is set and valid
  - Check WalletConnect Cloud status and your network
- Connection timeout (after ~180s):
  - Re‑run the command; make sure the wallet is reachable and the app isn’t rate‑limited
- No accounts found:
  - Unlock your wallet and ensure the correct network/account is selected
- “No wallet connect client found” during send:
  - Re‑scan and approve the session; the CLI clears sessions after some errors
- Batch fails with unsupported method:
  - Your wallet may not support `wallet_sendCalls`; the CLI will try a legacy fallback, but behavior depends on the wallet

### Limitations

- Session persistence is not guaranteed between runs; you usually approve per run
- Batch calls depend on wallet support for EIP‑5792; otherwise a fallback path is used
