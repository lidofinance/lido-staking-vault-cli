import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia, holesky } from '@reown/appkit/networks';

// Custom Hoodi testnet
const hoodiTestnet = {
  id: 560048,
  name: 'Hoodi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.hoodi.ethpandaops.io'] },
    public: { http: ['https://rpc.hoodi.ethpandaops.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Hoodi Explorer',
      url: 'https://dora.hoodi.ethpandaops.io',
    },
  },
  testnet: true,
};

// 1. Get projectId from https://cloud.reown.com
const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || '0123456789abcdef0123456789abcdef';

// 2. Set up the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [hoodiTestnet, mainnet, sepolia, holesky],
  projectId,
  ssr: true,
});

// 3. Configure the metadata
const metadata = {
  name: 'Lido Staking Vault CLI',
  description: 'Web terminal for Lido Staking Vault CLI',
  url: 'https://lsv-cli.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/30938426'],
};

// 4. Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [hoodiTestnet, mainnet, sepolia, holesky],
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

export { wagmiAdapter };
