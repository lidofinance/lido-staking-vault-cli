import { TerminalWrapper } from '@/components/terminal-wrapper';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🌊 Lido Staking Vault CLI
              </h1>
              <p className="text-gray-400">
                Web terminal interface for Lido Staking Vault operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <w3m-button />
            </div>
          </div>
        </div>

        {/* Terminal Container */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-gray-300 text-sm font-mono">
              lsv-cli-web-terminal
            </div>
            <div className="w-16"></div>
          </div>

          <div className="h-[600px] p-4">
            <TerminalWrapper />
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              🚀 Getting Started
            </h3>
            <p className="text-gray-400 text-sm">
              Connect your wallet and start using CLI commands. Type{' '}
              <code className="bg-gray-700 px-1 rounded">help</code> for
              available commands.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              🔗 Features
            </h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Real CLI command execution</li>
              <li>• Automatic wallet integration</li>
              <li>• All Lido Vault operations</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              🛠️ Commands
            </h3>
            <p className="text-gray-400 text-sm">
              Use commands like{' '}
              <code className="bg-gray-700 px-1 rounded">account info</code> or{' '}
              <code className="bg-gray-700 px-1 rounded">hub read info</code> to
              interact with the protocol.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
