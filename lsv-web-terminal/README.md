# �� Lido Staking Vault Web Terminal

A modern web-based terminal interface for the Lido Staking Vault CLI with wallet integration and transaction support.

## ✨ Features

- **🖥️ Web Terminal**: Full XTerm.js terminal experience in the browser
- **🔗 Wallet Integration**: Connect your wallet for automatic address injection and transaction signing
- **📝 Address Shortcuts**: Use `d`, `v`, `a` for dashboard, vault, and account addresses
- **💰 Transaction Support**: Generate calldata with `--populate-tx` and send through connected wallet
- **🎨 Smart Formatting**: Automatic table formatting and color coding for CLI output
- **📚 Command History**: Arrow key navigation through command history
- **⚡ Real-time Execution**: Execute CLI commands directly through the web interface

## 🚀 Deployment Options

### Option 1: Vercel (Demo/UI Only)

The deployed version on Vercel shows the UI and wallet integration but cannot execute CLI commands due to serverless limitations.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/lido-staking-vault-web-terminal)

### Option 2: Full Deployment (Railway/Render/VPS)

For full CLI execution capabilities, deploy on platforms that support Node.js processes:

- **Railway**: `railway login && railway new && railway deploy`
- **Render**: Connect GitHub repo and deploy as Web Service
- **VPS/Server**: `npm install && npm run build && npm start`

## 🛠️ Local Development

1. **Clone and install**:

```bash
git clone ${}
cd ${}
npm install
```

2. **Run development server**:

```bash
npm run dev
```

3. **Open browser**: http://localhost:3000

## 📋 Usage

### Address Shortcuts

Set addresses in the fields above the terminal, then use shortcuts:

- `d` - Dashboard address (from input field)
- `v` - Vault address (from input field)
- `a` - Connected account address

### Example Commands

```bash
# Account information
account r info a

# Dashboard operations
dashboard r roles d
dashboard r info d

# Vault operations
vault r info v

# Transaction commands (auto-generate calldata)
dashboard w mint d
vault w deposit v 1.0
```

### Transaction Flow

1. Write commands automatically add `--populate-tx` flag
2. CLI generates transaction calldata
3. Web interface displays transaction data
4. Connected wallet prompts for signature
5. Transaction is sent on-chain

## 🏗️ Architecture

- **Frontend**: Next.js 14 + XTerm.js + Wagmi + AppKit
- **Backend**: Next.js API routes proxying to CLI
- **Wallet**: AppKit with WalletConnect support
- **CLI Integration**: Child process execution with auto-confirmation

## 📦 Environment Variables

For local development with CLI execution:

```env
# Optional: Set to disable CLI execution
NODE_ENV=production
VERCEL=1
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is part of the Lido Staking Vault CLI ecosystem.

## 🔗 Related

- [Lido Staking Vault CLI](../README.md) - The main CLI tool
- [Lido Protocol](https://lido.fi) - Liquid staking for Ethereum

---

**Note**: For full CLI functionality, run locally or deploy on a platform supporting Node.js processes. The Vercel deployment demonstrates the UI and wallet integration concepts.
