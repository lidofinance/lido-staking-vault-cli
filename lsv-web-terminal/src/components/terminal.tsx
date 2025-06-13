'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useAccount, useSendTransaction } from 'wagmi';
import '@xterm/xterm/css/xterm.css';
import { Address, Hex } from 'viem';

interface TransactionData {
  to: Address;
  data: Hex;
  value?: string;
  gas?: string;
}

interface CommandResult {
  success: boolean;
  output: string;
  exitCode: number;
  transactionData?: TransactionData;
  isTransaction?: boolean;
}

const PROMPT = '\x1b[32mlsv-cli$\x1b[0m ';

function formatCliOutput(output: string): string {
  // Remove ANSI escape sequences and npm warnings
  const cleaned = output
    .replace(/\x1b\[[0-9;]*[mGJKH]/g, '') // Remove ANSI codes (including cursor control)
    .replace(/\[2K\[1A\[2K\[G/g, '') // Remove specific cursor control sequences
    .replace(/●∙∙ Executing\.\.\./g, '') // Remove loading animation
    .replace(/∙●∙ Executing\.\.\./g, '') // Remove loading animation
    .replace(/∙∙● Executing\.\.\./g, '') // Remove loading animation
    .replace(/^> @lidofinance\/lsv-cli@.*\n> tsx \.\/index\.ts.*\n\n/m, '') // Remove npm start output
    .replace(/npm warn.*\n/g, '') // Remove npm warnings
    .replace(/program \{.*\}\n/g, '') // Remove program debug output
    .replace(/Are you sure.*\(auto-confirmed with -y flag\)\n/g, ''); // Remove auto-confirm messages

  const lines = cleaned.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      processedLines.push('');
      continue;
    }

    // Skip pure border lines (top, bottom, separator lines made only of box-drawing characters)
    if (line.match(/^[─┌┐└┘├┤┬┴┼\s]+$/)) {
      continue;
    }

    // Handle table rows containing data (contains │ and not just borders)
    if (line.includes('│')) {
      // Check if this is a data row (not just border characters)
      const withoutBorders = line.replace(/[┌┐└┘├┤┬┴┼─]/g, '');
      if (withoutBorders.includes('│')) {
        // Split by │ and clean up parts
        const parts = line
          .split('│')
          .map((part) => part.trim())
          .filter((part) => part && !part.match(/^[─┌┐└┘├┤┬┴┼\s]+$/));

        // Skip header lines
        if (
          parts.length >= 2 &&
          parts.some(
            (part) =>
              part.toLowerCase() === 'role' ||
              part.toLowerCase() === 'keccak' ||
              part.toLowerCase() === 'members',
          )
        ) {
          continue;
        }

        if (parts.length >= 3) {
          // 3-column table (Role, Keccak, Members)
          const role = parts[0] || '';
          const keccak = parts[1] || '';
          const members = parts[2] || '';

          if (role && keccak) {
            processedLines.push(`\x1b[33m${role}:\x1b[0m`);
            processedLines.push(`  \x1b[36mKeccak:\x1b[0m ${keccak}`);
            if (members && members !== 'None' && members.trim() !== '') {
              if (members.includes(',')) {
                processedLines.push(`  \x1b[36mMembers:\x1b[0m`);
                const membersList = members.split(',').map((m) => m.trim());
                membersList.forEach((member) => {
                  processedLines.push(`    ${member}`);
                });
              } else {
                processedLines.push(`  \x1b[36mMembers:\x1b[0m ${members}`);
              }
            } else {
              processedLines.push(`  \x1b[36mMembers:\x1b[0m None`);
            }
            processedLines.push(''); // Add spacing between roles
          }
        } else if (parts.length >= 2) {
          // 2-column table
          const leftPart = parts[0] || '';
          const rightPart = parts[1] || '';

          if (leftPart && rightPart) {
            processedLines.push(`\x1b[36m${leftPart}:\x1b[0m ${rightPart}`);
          }
        }
      }
    } else {
      // For non-table lines, just add them as is
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

export function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const currentLineRef = useRef('');
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  // State — единственный источник истины
  const [dashboardAddress, setDashboardAddress] = useState('');
  const [vaultAddress, setVaultAddress] = useState('');
  const [elUrl, setElUrl] = useState('');
  const [showElUrl, setShowElUrl] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { sendTransaction } = useSendTransaction();
  const { isConnected, address } = useAccount();

  // refs для актуальных значений
  const dashboardRef = useRef('');
  const vaultRef = useRef('');
  const elUrlRef = useRef('');
  const addressRef = useRef<string | undefined>('');

  useEffect(() => {
    dashboardRef.current = dashboardAddress;
  }, [dashboardAddress]);
  useEffect(() => {
    vaultRef.current = vaultAddress;
  }, [vaultAddress]);
  useEffect(() => {
    elUrlRef.current = elUrl;
  }, [elUrl]);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  // Load from localStorage only on first render
  useEffect(() => {
    setDashboardAddress(localStorage.getItem('lsv-dashboard-address') || '');
    setVaultAddress(localStorage.getItem('lsv-vault-address') || '');
    setElUrl(localStorage.getItem('lsv-el-url') || '');
    setIsReady(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (isReady)
      localStorage.setItem('lsv-dashboard-address', dashboardAddress);
  }, [dashboardAddress, isReady]);
  useEffect(() => {
    if (isReady) localStorage.setItem('lsv-vault-address', vaultAddress);
  }, [vaultAddress, isReady]);
  useEffect(() => {
    if (isReady) localStorage.setItem('lsv-el-url', elUrl);
  }, [elUrl, isReady]);

  // Create terminal with original welcome message
  useEffect(() => {
    if (!terminalRef.current || !isReady) return;
    if (terminal.current) terminal.current.dispose();

    terminal.current = new Terminal({
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#00ff00',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#bbbbbb',
        brightBlack: '#555555',
        brightRed: '#ff5555',
        brightGreen: '#50fa7b',
        brightYellow: '#f1fa8c',
        brightBlue: '#bd93f9',
        brightMagenta: '#ff79c6',
        brightCyan: '#8be9fd',
        brightWhite: '#ffffff',
      },
      fontFamily: 'JetBrains Mono, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.open(terminalRef.current);

    // Оригинальное приветствие
    terminal.current.writeln(
      '\x1b[32m╭─────────────────────────────────────────────────────╮\x1b[0m',
    );
    terminal.current.writeln(
      '\x1b[32m│           🌊 Lido Staking Vault CLI Web             │\x1b[0m',
    );
    terminal.current.writeln(
      '\x1b[32m│                                                     │\x1b[0m',
    );
    terminal.current.writeln(
      '\x1b[32m│  Type "help" to see available commands             │\x1b[0m',
    );
    if (isConnected) {
      terminal.current.writeln(
        `\x1b[32m│  Connected wallet: ${addressRef.current?.slice(0, 6)}...${addressRef.current?.slice(-4)}        │\x1b[0m`,
      );
    } else {
      terminal.current.writeln(
        '\x1b[32m│  Connect wallet for transaction features           │\x1b[0m',
      );
    }
    terminal.current.writeln(
      '\x1b[32m│  📋 Set dashboard/vault addresses above for        │\x1b[0m',
    );
    terminal.current.writeln(
      '\x1b[32m│      automatic injection into commands             │\x1b[0m',
    );
    terminal.current.writeln(
      '\x1b[32m╰─────────────────────────────────────────────────────╯\x1b[0m',
    );
    terminal.current.writeln('');
    terminal.current.write(PROMPT);

    function replaceShortcuts(args: string[]) {
      return args.map((arg) => {
        if (arg === 'd') {
          if (!dashboardRef.current)
            throw new Error('Dashboard address (d) не задан');
          return dashboardRef.current;
        }
        if (arg === 'v') {
          if (!vaultRef.current) throw new Error('Vault address (v) не задан');
          return vaultRef.current;
        }
        if (arg === 'a') {
          if (!addressRef.current)
            throw new Error('Account address (a) не задан');
          return addressRef.current;
        }
        return arg;
      });
    }

    async function executeCommand(command: string) {
      if (!terminal.current) return;
      if (!isReady) {
        terminal.current.writeln('\x1b[33m⏳ Loading addresses...⏎\x1b[0m');
        terminal.current.write(PROMPT);
        return;
      }
      setIsExecuting(true);
      try {
        if (command === 'clear') {
          terminal.current.clear();
          terminal.current.write(PROMPT);
          return;
        }
        if (command === 'help') {
          terminal.current.writeln('');
          terminal.current.writeln(
            '\x1b[33m🌊 Lido Staking Vault CLI Commands:\x1b[0m',
          );
          terminal.current.writeln('');
          terminal.current.writeln(
            '\x1b[36mShortcuts:\x1b[0m d - dashboard, v - vault, a - account',
          );
          terminal.current.writeln('Examples:');
          terminal.current.writeln('  account info a');
          terminal.current.writeln('  dashboard info d');
          terminal.current.writeln('  vault info v');
          terminal.current.writeln('');
          terminal.current.write(PROMPT);
          return;
        }
        terminal.current.writeln(`\x1b[90mExecuting: ${command}\x1b[0m`);
        const parts = command.split(' ');
        const mainCommand = parts[0];
        let args = parts.slice(1);
        try {
          args = replaceShortcuts(args);
        } catch (error) {
          terminal.current.writeln(
            `\x1b[31m❌ ${error instanceof Error ? error.message : error}\x1b[0m`,
          );
          terminal.current.write(PROMPT);
          return;
        }
        const isWriteCommand =
          args.length > 0 && (args[0] === 'w' || args[0] === 'write');
        if (isWriteCommand && !args.includes('--populate-tx'))
          args.push('--populate-tx');
        const response = await fetch('/api/cli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: mainCommand,
            args,
            walletAddress: isConnected ? addressRef.current : null,
            elUrl: elUrlRef.current,
          }),
        });
        const result: CommandResult = await response.json();
        if (result.success) {
          if (result.isTransaction && result.transactionData && isConnected) {
            terminal.current.writeln(
              '\x1b[33mTransaction Data Generated:\x1b[0m',
            );
            terminal.current.writeln(
              `\x1b[36mTo: ${result.transactionData.to}\x1b[0m`,
            );
            terminal.current.writeln(
              `\x1b[36mData: ${result.transactionData.data.slice(0, 50)}...\x1b[0m`,
            );
            try {
              const txData: {
                to: Address;
                data: Hex;
                value?: bigint;
              } = {
                to: result.transactionData.to,
                data: result.transactionData.data,
              };
              if (
                result.transactionData.value &&
                result.transactionData.value !== '0x0' &&
                result.transactionData.value !== '0'
              ) {
                txData.value = BigInt(result.transactionData.value);
              }
              await sendTransaction(txData);
              terminal.current.writeln(
                '\x1b[32m✅ Transaction sent successfully!\x1b[0m',
              );
            } catch (error) {
              terminal.current.writeln(
                `\x1b[31m❌ Transaction failed: ${error instanceof Error ? error.message : error}\x1b[0m`,
              );
            }
          } else {
            const formattedOutput = formatCliOutput(result.output || '');
            const lines = formattedOutput.split('\n');
            lines.forEach((line) => {
              terminal.current?.writeln(line);
            });
          }
        } else {
          terminal.current.writeln(`\x1b[31mError:\x1b[0m`);
          const formattedOutput = formatCliOutput(result.output || '');
          const lines = formattedOutput.split('\n');
          lines.forEach((line) => {
            terminal.current?.writeln(`\x1b[31m${line}\x1b[0m`);
          });
        }
      } catch (error) {
        terminal.current.writeln(
          `\x1b[31mError: ${error instanceof Error ? error.message : error}\x1b[0m`,
        );
      } finally {
        setIsExecuting(false);
        terminal.current.write(PROMPT);
        setTimeout(() => {
          terminal.current?.scrollToBottom();
          fitAddon.current?.fit();
        }, 100);
      }
    }

    terminal.current.onData((data) => {
      if (isExecuting) return;
      const char = data.charCodeAt(0);
      if (char === 27) {
        // ESC
        const nextData = data.slice(1);
        if (nextData === '[A') {
          // Up arrow
          if (commandHistoryRef.current.length > 0) {
            if (historyIndexRef.current === -1) {
              historyIndexRef.current = commandHistoryRef.current.length - 1;
            } else if (historyIndexRef.current > 0) {
              historyIndexRef.current--;
            }
            // Очистить текущий ввод
            const currentLength = currentLineRef.current.length;
            for (let i = 0; i < currentLength; i++) {
              terminal.current?.write('\b \b');
            }
            const historicalCommand =
              commandHistoryRef.current[historyIndexRef.current];
            terminal.current?.write(historicalCommand);
            currentLineRef.current = historicalCommand;
          }
          return;
        } else if (nextData === '[B') {
          // Down arrow
          if (historyIndexRef.current !== -1) {
            if (
              historyIndexRef.current <
              commandHistoryRef.current.length - 1
            ) {
              historyIndexRef.current++;
              // Очистить текущий ввод
              const currentLength = currentLineRef.current.length;
              for (let i = 0; i < currentLength; i++) {
                terminal.current?.write('\b \b');
              }
              const historicalCommand =
                commandHistoryRef.current[historyIndexRef.current];
              terminal.current?.write(historicalCommand);
              currentLineRef.current = historicalCommand;
            } else {
              // If we've reached the end of history — clear the line
              historyIndexRef.current = -1;
              const currentLength = currentLineRef.current.length;
              for (let i = 0; i < currentLength; i++) {
                terminal.current?.write('\b \b');
              }
              currentLineRef.current = '';
            }
          }
          return;
        }
      }
      if (char === 13) {
        // Enter
        terminal.current?.writeln('');
        if (currentLineRef.current.trim()) {
          const command = currentLineRef.current.trim();
          // История
          if (command !== 'clear' && command !== 'help') {
            const lastCommand =
              commandHistoryRef.current[commandHistoryRef.current.length - 1];
            if (lastCommand !== command) {
              commandHistoryRef.current.push(command);
              if (commandHistoryRef.current.length > 50)
                commandHistoryRef.current.shift();
            }
          }
          historyIndexRef.current = -1;
          executeCommand(command);
        } else {
          terminal.current?.write(PROMPT);
        }
        currentLineRef.current = '';
      } else if (char === 127) {
        // Backspace
        if (currentLineRef.current.length > 0) {
          terminal.current?.write('\b \b');
          currentLineRef.current = currentLineRef.current.slice(0, -1);
        }
      } else if (char === 3) {
        // Ctrl+C
        terminal.current?.writeln('^C');
        terminal.current?.write(PROMPT);
        currentLineRef.current = '';
      } else if (char >= 32) {
        // Printable
        terminal.current?.write(data);
        currentLineRef.current += data;
      }
    });

    setTimeout(() => {
      fitAddon.current?.fit();
    }, 100);

    return () => {
      terminal.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isConnected]);

  // UI
  return (
    <div className="w-full h-full flex flex-col">
      {/* Address Panel */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-3 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 text-sm font-medium">
              🏢 Dashboard:
            </span>
            <input
              type="text"
              value={dashboardAddress}
              onChange={(e) => setDashboardAddress(e.target.value)}
              placeholder="0x... (dashboard contract address)"
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none w-80"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-sm font-medium">
              🏛️ Vault:
            </span>
            <input
              type="text"
              value={vaultAddress}
              onChange={(e) => setVaultAddress(e.target.value)}
              placeholder="0x... (vault contract address)"
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-green-400 focus:outline-none w-80"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400 text-sm font-medium">
              🔗 EL RPC URL:
            </span>
            <div className="relative">
              <input
                type={showElUrl ? 'text' : 'password'}
                value={elUrl}
                onChange={(e) => setElUrl(e.target.value)}
                placeholder="https://lb.drpc.org/ogrpc?network=hoodi&dkey=YOUR_KEY"
                className="bg-gray-700 text-white px-3 py-1 pr-10 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none w-80"
              />
              <button
                type="button"
                onClick={() => setShowElUrl(!showElUrl)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                title={showElUrl ? 'Hide URL' : 'Show URL'}
              >
                {showElUrl ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            💡 These addresses will be automatically used in CLI commands.
          </div>
          {!isReady && (
            <div className="text-xs text-yellow-400 animate-pulse">
              ⏳ Loading...
            </div>
          )}
          {isReady && <div className="text-xs text-green-400">✅ Ready</div>}
        </div>
      </div>
      {/* Terminal */}
      <div className="flex-1 min-h-0">
        <div
          ref={terminalRef}
          className="w-full h-full bg-gray-900 rounded-b-lg"
        />
      </div>
    </div>
  );
}
