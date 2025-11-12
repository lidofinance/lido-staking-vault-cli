# 🧪 Lido Staking Vault CLI – Playwright Test Suite

This project provides **Playwright-based tests** for the `lido-staking-vault-cli`.
It spins up a **forked Ethereum test network**, bootstraps **smart contracts via CLI**, and runs tests.

---

## ⚙️ Prerequisites

- **Node.js ≥ 18**
- **Yarn** (recommended)

---

## 📦 Installation

From the **root project directory**:

```bash
yarn && yarn build
```

Then navigate to the test suite directory:

```bash
cd tests/base/
yarn
```

> ⚠️ Both installation steps are required — one for the root project and one for the test package.

---

## 🧩 Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required parameters in `.env`:

   ```bash
   CHAIN_ID=`560048` or `1` (available after stVaults to be released)
   RPC_URL=<optional override>
   ```

> Tests are run using the default public RPC endpoint, but you may provide a custom one if the free RPC is slow or unstable.

---

## 🚀 Running Tests

Run the full Playwright test suite:

```bash
yarn test-widget
```

This command expands to:

```bash
yarn playwright test --project=lsv_cli_tests
```

Playwright automatically runs the setup project before executing the main test suite.

---

## 🧱 Test Workflow Overview

- **`playwright.config.ts`** defines two Playwright projects:

  - `setup lsv_cli before all` — runs the global setup and initializes the environment.
  - `lsv_cli_tests` — contains the actual test specifications.

- **`tests/base/tests/globalSetup.ts`**:

  - Creates a vault through the CLI.
  - Grants required roles.
  - Persists the fork state to `state.json`.

- **`tests/base/tests/test.fixture.ts`**:

  - Reuses the saved fork state.
  - Starts/stops the forked node.
  - Exposes vault metadata and role accounts to the test cases.

---

## 🔁 Fork and Global Setup

The suite uses `EthereumNodeService` from `@lidofinance/wallets-testing-nodes` to launch an **Anvil-based fork** of the Ethereum network.

During the **`setup lsv_cli before all`** project:

1. `globalSetup.ts` starts the fork with `--dump-state` enabled.
2. The CLI creates a fresh vault and grants node-operator-related roles.
3. The resulting chain snapshot is written to `state.json`.
4. `VAULT_ADDRESS` and `DASHBOARD_ADDRESS` are written to the environment for later test use.

Since Playwright runs global setup and test workers in separate processes, those environment variables are dynamically assigned during the global setup stage.
Subsequent workers load the snapshot via `--load-state=./state.json`, ensuring **deterministic test state** and **fast startup times** for all runs.

---

## 🧑‍🔧 Debugging Tip

For long debugging sessions or active test development, you can temporarily disable global setup to speed up iteration.

1. Comment out the following lines in `globalSetup.ts`:

   ```ts
   // console.log(`Vault address ${vaultData.vaultAddress}`);
   // console.log(`Dashboard address ${vaultData.dashboardAddress}`);
   ```

2. Run the tests once to trigger `globalSetup.ts` — this will generate and log the required addresses.
3. Copy the printed `VAULT_ADDRESS` and `DASHBOARD_ADDRESS` values into your `.env` file.
4. Comment out the entire content of `globalSetup.ts`.
5. Run tests again — they will now reuse the existing fork state and skip the global precondition setup.

> **Note:** You may need to occasionally refresh `VAULT_ADDRESS` and `DASHBOARD_ADDRESS`. Since vault and dashboard contracts are created sequentially, their addresses change predictably. If someone creates a new vault on the testnet after your snapshot, the stored addresses may become invalid. In that case, rerun the global setup to regenerate and update your `.env` values.

---

✅ **Summary:**
This test suite automates end-to-end validation of `lido-staking-vault-cli` flows within a reproducible, isolated environment.
It provides deterministic results, faster execution, and confidence in vault creation and role management logic.
