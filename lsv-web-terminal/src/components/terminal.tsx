'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useAccount, useSendTransaction } from 'wagmi';
import '@xterm/xterm/css/xterm.css';

interface TransactionData {
  to: string;
  data: string;
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

export function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const currentLineRef = useRef('');
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  // Address states
  const [dashboardAddress, setDashboardAddress] = useState('');
  const [vaultAddress, setVaultAddress] = useState('');
  const [elUrl, setElUrl] = useState('');
  const [showElUrl, setShowElUrl] = useState(false);

  const { sendTransaction } = useSendTransaction();
  const { isConnected, address } = useAccount();

  // Load addresses from localStorage on mount
  useEffect(() => {
    const savedDashboard = localStorage.getItem('lsv-dashboard-address');
    const savedVault = localStorage.getItem('lsv-vault-address');
    const savedElUrl = localStorage.getItem('lsv-el-url');

    console.log('Loading addresses from localStorage:', {
      savedDashboard,
      savedVault,
      savedElUrl,
    });

    if (savedDashboard) setDashboardAddress(savedDashboard);
    if (savedVault) setVaultAddress(savedVault);
    if (savedElUrl) setElUrl(savedElUrl);
  }, []);

  // Save addresses to localStorage when they change
  useEffect(() => {
    if (dashboardAddress) {
      localStorage.setItem('lsv-dashboard-address', dashboardAddress);
    }
  }, [dashboardAddress]);

  useEffect(() => {
    if (vaultAddress) {
      localStorage.setItem('lsv-vault-address', vaultAddress);
    }
  }, [vaultAddress]);

  useEffect(() => {
    if (elUrl) {
      localStorage.setItem('lsv-el-url', elUrl);
    }
  }, [elUrl]);

  // Recalculate terminal size when component updates
  useEffect(() => {
    const resizeTerminal = () => {
      if (fitAddon.current && terminal.current) {
        setTimeout(() => {
          try {
            fitAddon.current?.fit();
          } catch (error) {
            console.warn('Error fitting terminal on update:', error);
          }
        }, 100);
      }
    };

    resizeTerminal();
  }, [dashboardAddress, vaultAddress, elUrl]);

  // Function to format CLI output for web terminal
  const formatCliOutput = (output: string): string => {
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
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
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

    // Use setTimeout to ensure terminal is fully rendered before fitting
    setTimeout(() => {
      if (fitAddon.current && terminal.current) {
        try {
          fitAddon.current.fit();
        } catch (error) {
          console.warn('Error fitting terminal:', error);
        }
      }
    }, 100);

    // Welcome message
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
        `\x1b[32m│  Connected wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}        │\x1b[0m`,
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

    // Handle input
    terminal.current.onData((data) => {
      if (isExecuting) return;

      const char = data.charCodeAt(0);

      // Handle escape sequences (arrow keys)
      if (char === 27) {
        // ESC sequence - check if it's an arrow key
        const nextData = data.slice(1);
        if (nextData === '[A') {
          // Up arrow - previous command
          if (commandHistoryRef.current.length > 0) {
            if (historyIndexRef.current === -1) {
              historyIndexRef.current = commandHistoryRef.current.length - 1;
            } else if (historyIndexRef.current > 0) {
              historyIndexRef.current--;
            }

            // Clear current line and write historical command
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
          // Down arrow - next command
          if (historyIndexRef.current !== -1) {
            if (
              historyIndexRef.current <
              commandHistoryRef.current.length - 1
            ) {
              historyIndexRef.current++;

              // Clear current line and write historical command
              const currentLength = currentLineRef.current.length;
              for (let i = 0; i < currentLength; i++) {
                terminal.current?.write('\b \b');
              }

              const historicalCommand =
                commandHistoryRef.current[historyIndexRef.current];
              terminal.current?.write(historicalCommand);
              currentLineRef.current = historicalCommand;
            } else {
              // Clear line if we're at the end of history
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
          // Add command to history before executing
          const command = currentLineRef.current.trim();
          if (command !== 'clear' && command !== 'help') {
            // Don't add built-in commands to history, or avoid duplicates
            if (
              commandHistoryRef.current[
                commandHistoryRef.current.length - 1
              ] !== command
            ) {
              commandHistoryRef.current.push(command);
              // Keep history limited to last 50 commands
              if (commandHistoryRef.current.length > 50) {
                commandHistoryRef.current.shift();
              }
            }
          }
          historyIndexRef.current = -1; // Reset history index
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
        historyIndexRef.current = -1; // Reset history index
      } else if (char >= 32) {
        // Printable characters - reset history index when typing
        historyIndexRef.current = -1;
        terminal.current?.write(data);
        currentLineRef.current = currentLineRef.current + data;
      }
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        setTimeout(() => {
          try {
            fitAddon.current?.fit();
            // Also scroll to bottom to ensure cursor is visible
            terminal.current?.scrollToBottom();
          } catch (error) {
            console.warn('Error fitting terminal on resize:', error);
          }
        }, 100);
      }
    };
    window.addEventListener('resize', handleResize);

    // Initial fit with delay to ensure proper rendering after panel is loaded
    setTimeout(() => {
      handleResize();
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.current?.dispose();
    };
  }, [isConnected, address]);

  // Function to replace address shortcuts with actual addresses
  const replaceAddressShortcuts = (args: string[]): string[] => {
    console.log('replaceAddressShortcuts called with:', {
      args,
      dashboardAddress,
      vaultAddress,
      accountAddress: address,
    });

    return args.map((arg) => {
      switch (arg) {
        case 'd':
          // Try to get from state first, then fallback to localStorage
          const currentDashboard =
            dashboardAddress || localStorage.getItem('lsv-dashboard-address');
          if (!currentDashboard) {
            console.error('Dashboard address requested but not available:', {
              dashboardAddress,
              localStorageValue: localStorage.getItem('lsv-dashboard-address'),
            });
            throw new Error(
              'Dashboard address (d) shortcut used but no dashboard address is set. Please set it in the field above.',
            );
          }
          console.log(
            'Replacing "d" with dashboard address:',
            currentDashboard,
          );
          return currentDashboard;
        case 'v':
          // Try to get from state first, then fallback to localStorage
          const currentVault =
            vaultAddress || localStorage.getItem('lsv-vault-address');
          if (!currentVault) {
            console.error('Vault address requested but not available:', {
              vaultAddress,
              localStorageValue: localStorage.getItem('lsv-vault-address'),
            });
            throw new Error(
              'Vault address (v) shortcut used but no vault address is set. Please set it in the field above.',
            );
          }
          console.log('Replacing "v" with vault address:', currentVault);
          return currentVault;
        case 'a':
          if (!address) {
            throw new Error(
              'Account address (a) shortcut used but no wallet is connected.',
            );
          }
          console.log('Replacing "a" with wallet address:', address);
          return address;
        default:
          return arg;
      }
    });
  };

  const executeCommand = async (command: string) => {
    if (!terminal.current) return;

    setIsExecuting(true);

    try {
      // Handle built-in commands
      if (command === 'clear') {
        terminal.current.clear();
        terminal.current.write(PROMPT);
        setIsExecuting(false);
        return;
      }

      if (command === 'help') {
        terminal.current.writeln('');
        terminal.current.writeln(
          '\x1b[33m🌊 Lido Staking Vault CLI Commands:\x1b[0m',
        );
        terminal.current.writeln('');
        terminal.current.writeln('\x1b[36mBuilt-in Commands:\x1b[0m');
        terminal.current.writeln(
          '  clear                    - Clear terminal screen',
        );
        terminal.current.writeln(
          '  help                     - Show this help message',
        );
        terminal.current.writeln('');
        terminal.current.writeln(
          '\x1b[36mCLI Commands (proxied to server):\x1b[0m',
        );
        terminal.current.writeln(
          '  account [options]        - Connected account info',
        );
        terminal.current.writeln(
          '  vault [options]          - Vault contract operations',
        );
        terminal.current.writeln(
          '  dashboard [options]      - Dashboard contract operations',
        );
        terminal.current.writeln(
          '  factory [options]        - Vault factory contract operations',
        );
        terminal.current.writeln(
          '  hub [options]            - Vault hub contract operations',
        );
        terminal.current.writeln(
          '  pdg [options]            - Predeposit guarantee contract operations',
        );
        terminal.current.writeln(
          '  v-v [options]            - Vault viewer operations',
        );
        terminal.current.writeln(
          '  report [options]         - Report utilities',
        );
        terminal.current.writeln(
          '  operator-grid [options]  - Operator grid contract operations',
        );
        terminal.current.writeln(
          '  metrics [options]        - Metrics operations',
        );
        terminal.current.writeln('');
        terminal.current.writeln('\x1b[33m📋 Address Shortcuts:\x1b[0m');
        terminal.current.writeln(
          '  d                        - Dashboard address (from field above)',
        );
        terminal.current.writeln(
          '  v                        - Vault address (from field above)',
        );
        terminal.current.writeln(
          '  a                        - Connected account address',
        );
        terminal.current.writeln('');
        terminal.current.writeln('\x1b[36mExamples:\x1b[0m');
        terminal.current.writeln(
          '  account info a           - Show account info for connected wallet',
        );
        terminal.current.writeln(
          '  dashboard info d         - Dashboard info using saved address',
        );
        terminal.current.writeln(
          '  vault info v             - Vault info using saved address',
        );
        terminal.current.writeln(
          '  dashboard w mint d       - Mint operation with dashboard address',
        );
        terminal.current.writeln('');
        terminal.current.writeln(
          '\x1b[33mTransaction Commands:\x1b[0m Write commands automatically generate transaction data',
        );
        terminal.current.writeln(
          'and send it through your connected wallet for signing.',
        );
        terminal.current.writeln('');
        terminal.current.writeln('\x1b[33m🔗 Wallet Integration:\x1b[0m');
        if (isConnected) {
          terminal.current.writeln(
            `  • Connected wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}`,
          );
          terminal.current.writeln(
            '  • Commands automatically use your wallet address (no private key needed)',
          );
        } else {
          terminal.current.writeln(
            '  • Connect wallet for automatic address integration',
          );
        }
        terminal.current.writeln('');
        terminal.current.writeln(
          '\x1b[33mNote:\x1b[0m You can also use full addresses instead of shortcuts if needed.',
        );
        terminal.current.writeln('');
        terminal.current.write(PROMPT);
        setIsExecuting(false);
        return;
      }

      // Show executing indicator
      terminal.current.writeln(`\x1b[90mExecuting: ${command}\x1b[0m`);

      // Parse command and args
      const parts = command.split(' ');
      const mainCommand = parts[0];
      let args = parts.slice(1);

      // Replace address shortcuts with actual addresses
      try {
        args = replaceAddressShortcuts(args);
      } catch (error) {
        terminal.current?.writeln(
          `\x1b[31m❌ ${error instanceof Error ? error.message : 'Address shortcut error'}\x1b[0m`,
        );
        terminal.current?.write(PROMPT);
        setIsExecuting(false);
        return;
      }

      // Check if this is a write command
      const isWriteCommand =
        args.length > 0 && (args[0] === 'w' || args[0] === 'write');

      // Add --populate-tx flag for write commands to generate transaction data
      if (isWriteCommand && !args.includes('--populate-tx')) {
        args.push('--populate-tx');
      }

      const response = await fetch('/api/cli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: mainCommand,
          args: args,
          walletAddress: isConnected ? address : null,
          elUrl,
        }),
      });

      const result: CommandResult = await response.json();

      if (result.success) {
        if (result.isTransaction && result.transactionData && isConnected) {
          // Show transaction data first
          terminal.current?.writeln(
            '\x1b[33mTransaction Data Generated:\x1b[0m',
          );
          terminal.current?.writeln(
            `\x1b[36mContract Address (To): ${result.transactionData.to}\x1b[0m`,
          );
          terminal.current?.writeln(
            `\x1b[36mCalldata (Data): ${result.transactionData.data.slice(0, 50)}...\x1b[0m`,
          );
          if (
            result.transactionData.value &&
            result.transactionData.value !== '0x0' &&
            result.transactionData.value !== '0'
          ) {
            terminal.current?.writeln(
              `\x1b[36mValue: ${result.transactionData.value}\x1b[0m`,
            );
          } else {
            terminal.current?.writeln(`\x1b[36mValue: 0 ETH\x1b[0m`);
          }
          terminal.current?.writeln('');
          terminal.current?.writeln(
            '\x1b[33mSending transaction through connected wallet...\x1b[0m',
          );

          try {
            // Prepare transaction data
            const txData: {
              to: `0x${string}`;
              data: `0x${string}`;
              value?: bigint;
            } = {
              to: result.transactionData.to as `0x${string}`,
              data: result.transactionData.data as `0x${string}`,
            };

            // Handle value field - convert hex string to bigint if present and not zero
            if (
              result.transactionData.value &&
              result.transactionData.value !== '0x0' &&
              result.transactionData.value !== '0'
            ) {
              try {
                txData.value = BigInt(result.transactionData.value);
                terminal.current?.writeln(
                  `\x1b[36mValue: ${result.transactionData.value} (${txData.value.toString()})\x1b[0m`,
                );
              } catch (valueError) {
                console.warn('Error parsing value:', valueError);
                terminal.current?.writeln(
                  `\x1b[33mWarning: Could not parse value ${result.transactionData.value}, proceeding without value\x1b[0m`,
                );
              }
            }

            console.log('=== TRANSACTION DATA BEING SENT TO WALLET ===');
            console.log('Contract Address (to):', txData.to);
            console.log('Calldata (data):', txData.data);
            console.log('Value:', txData.value || 'undefined (0 ETH)');
            console.log('Full txData object:', txData);

            // Send transaction through wallet
            await sendTransaction(txData);

            terminal.current?.writeln(
              '\x1b[32m✅ Transaction sent successfully through wallet!\x1b[0m',
            );
          } catch (error) {
            console.error('Transaction error:', error);
            terminal.current?.writeln(
              `\x1b[31m❌ Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`,
            );

            // Show more detailed error info if available
            if (error instanceof Error && 'cause' in error) {
              terminal.current?.writeln(
                `\x1b[31mDetails: ${JSON.stringify(error.cause)}\x1b[0m`,
              );
            }
          }
        } else {
          // Regular command output
          const formattedOutput = formatCliOutput(result.output);
          const lines = formattedOutput.split('\n');
          lines.forEach((line) => {
            if (line.trim()) {
              // Use different colors for different types of content
              if (line.includes('Result:') || line.includes('LOG:')) {
                terminal.current?.writeln(`\x1b[33m${line}\x1b[0m`); // Yellow for headers
              } else if (line.includes('|') && line.includes('-')) {
                terminal.current?.writeln(`\x1b[36m${line}\x1b[0m`); // Cyan for tables
              } else if (
                line.includes('[') &&
                (line.includes('=') ||
                  line.includes('░') ||
                  line.includes('▒') ||
                  line.includes('▓') ||
                  line.includes('█'))
              ) {
                terminal.current?.writeln(`\x1b[35m${line}\x1b[0m`); // Magenta for progress bars
              } else if (
                line.includes('%') ||
                line.includes('ETH') ||
                line.includes('stETH')
              ) {
                terminal.current?.writeln(`\x1b[36m${line}\x1b[0m`); // Cyan for values
              } else {
                terminal.current?.writeln(`\x1b[32m${line}\x1b[0m`); // Green for regular content
              }
            } else {
              terminal.current?.writeln('');
            }
          });
        }
      } else {
        terminal.current.writeln(`\x1b[31mError: ${result.output}\x1b[0m`);
      }

      terminal.current.write(PROMPT);

      // Scroll to bottom after command execution with delay
      setTimeout(() => {
        if (terminal.current) {
          terminal.current.scrollToBottom();
          // Also try to fit the terminal in case dimensions changed
          if (fitAddon.current) {
            try {
              fitAddon.current.fit();
            } catch (error) {
              console.warn('Error fitting terminal after command:', error);
            }
          }
        }
      }, 100);
    } catch (error) {
      terminal.current?.writeln(
        `\x1b[31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`,
      );
      terminal.current?.write(PROMPT);

      // Scroll to bottom after error with delay
      setTimeout(() => {
        if (terminal.current) {
          terminal.current.scrollToBottom();
          // Also try to fit the terminal in case dimensions changed
          if (fitAddon.current) {
            try {
              fitAddon.current.fit();
            } catch (error) {
              console.warn('Error fitting terminal after error:', error);
            }
          }
        }
      }, 100);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Address Configuration Panel */}
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
        <div className="text-xs text-gray-400">
          💡 These addresses and RPC URL will be automatically used in CLI
          commands. Leave empty to use defaults.
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
