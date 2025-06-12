import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

interface TransactionData {
  to: string;
  data: string;
  value?: string;
  gas?: string;
}

interface ApiResponse {
  success: boolean;
  output: string;
  exitCode: number;
  transactionData?: TransactionData;
  isTransaction?: boolean;
}

function parseTransactionData(output: string): TransactionData | null {
  try {
    const lines = output.split('\n');

    // Look for the new JSON format: "Populated transaction data: { ... }" or "LOG: Populated transaction data: { ... }"
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('Populated transaction data:')) {
        // Find the start of the JSON object
        const jsonStartIndex = line.indexOf('{');
        if (jsonStartIndex === -1) continue; // No JSON object found in this line

        // Try to extract JSON object from this line and potentially following lines
        let jsonStr = line.substring(jsonStartIndex);

        // If the JSON spans multiple lines, collect them
        if (!jsonStr.includes('}')) {
          for (let j = i + 1; j < lines.length; j++) {
            jsonStr += lines[j];
            if (lines[j].includes('}')) {
              break;
            }
          }
        }

        try {
          // Convert JavaScript object literal to valid JSON
          // Replace single quotes with double quotes and add quotes around unquoted keys
          const validJsonStr = jsonStr
            .replace(/(\w+):/g, '"$1":') // Add quotes around keys
            .replace(/'/g, '"'); // Replace single quotes with double quotes

          console.log('=== CONVERTING TO VALID JSON ===');
          console.log('Original string:', jsonStr);
          console.log('Converted JSON:', validJsonStr);

          // Parse the JSON object
          const txData = JSON.parse(validJsonStr);

          console.log('=== PARSED TRANSACTION JSON ===');
          console.log('Raw JSON string:', jsonStr);
          console.log('Parsed txData:', txData);
          console.log('Contract address (to):', txData.to);
          console.log('Calldata (data):', txData.data);
          console.log('Value:', txData.value);

          // Validate that we have the required fields
          if (txData.to && txData.data) {
            const result = {
              to: txData.to,
              data: txData.data,
              value: txData.value || '0x0',
              gas: txData.gas,
            };

            console.log('=== RETURNING TRANSACTION DATA ===');
            console.log('Final result:', result);

            return result;
          } else {
            console.log(
              'Missing required fields - to:',
              !!txData.to,
              'data:',
              !!txData.data,
            );
          }
        } catch (jsonError) {
          console.log('Failed to parse transaction JSON:', jsonError);
          console.log('JSON string was:', jsonStr);
        }
      }
    }

    // Fallback: try the old format for backward compatibility
    const txData: Partial<TransactionData> = {};

    for (const line of lines) {
      // Look for old format populated transaction data
      if (line.includes('LOG: Populated transaction data:')) {
        const match = line.match(/0x[a-fA-F0-9]+/);
        if (match) {
          txData.data = match[0];
        }
      }

      // Look for contract address (to field)
      if (
        line.includes('to:') ||
        line.includes('To:') ||
        line.includes('Contract:')
      ) {
        const match = line.match(/0x[a-fA-F0-9]{40}/);
        if (match) txData.to = match[0];
      }

      // Look for value field
      if (line.includes('value:') || line.includes('Value:')) {
        const match = line.match(/0x[a-fA-F0-9]+/);
        if (match) txData.value = match[0];
      }
    }

    // If we have calldata but no "to" address from old format, try to extract from context
    if (txData.data && !txData.to) {
      const allLines = output.replace(/\n/g, ' ');
      const addresses = allLines.match(/0x[a-fA-F0-9]{40}/g);
      if (addresses && addresses.length > 0) {
        txData.to = addresses[0];
      }
    }

    if (txData.data && txData.to) {
      return txData as TransactionData;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { command, args, walletAddress, elUrl } = await request.json();

    // Add -y flag for write commands to auto-confirm prompts
    const enhancedArgs = [...args];
    const isWriteCommand =
      args.length > 0 && (args[0] === 'w' || args[0] === 'write');
    if (isWriteCommand) {
      if (!enhancedArgs.includes('-y')) {
        enhancedArgs.unshift('-y');
      }
      if (!enhancedArgs.includes('--populate-tx')) {
        enhancedArgs.push('--populate-tx');
      }
    }

    // Add wallet address for account commands that don't have address yet
    if (walletAddress && command === 'account') {
      // For account info command, add wallet address as argument if not provided
      if (
        args.includes('info') &&
        !args.some((arg: string) => arg.startsWith('0x'))
      ) {
        enhancedArgs.push(walletAddress);
      }
    }

    // Check if this is an interactive blessed command (charts, graphs, etc.)
    const isInteractiveCommand =
      (command === 'metrics' && args.includes('charts-apr')) ||
      (command === 'metrics' &&
        args.some((arg: string) => arg.startsWith('charts'))) ||
      args.some(
        (arg: string) => arg.includes('chart') || arg.includes('graph'),
      );

    console.log('=== COMMAND EXECUTION ===');
    console.log('Original command:', command, args);
    console.log('Enhanced args:', enhancedArgs);
    console.log('Wallet address:', walletAddress);
    console.log('EL URL from request:', elUrl);
    console.log('Is write command:', isWriteCommand);
    console.log('Is interactive command:', isInteractiveCommand);

    return new Promise<NextResponse>((resolve) => {
      // Используем npx с автоматической установкой
      const child = spawn(
        'npx',
        ['--yes', '@lidofinance/lsv-cli', command, ...enhancedArgs],
        {
          env: {
            ...process.env,
            NODE_ENV: 'production',
            FORCE_COLOR: '0',
            CHAIN_ID: '560048',
            DEPLOYED: 'deployed-hoodi-vaults-testnet.json',
            EL_URL: elUrl || process.env.EL_URL,
            // Только минимальные настройки для npm
            HOME: '/tmp',
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        const chunk = data.toString();
        console.log('STDOUT chunk:', chunk);
        output += chunk;
      });

      child.stderr?.on('data', (data) => {
        const chunk = data.toString();
        console.log('STDERR chunk:', chunk);
        error += chunk;
      });

      child.on('close', (code) => {
        console.log('Process closed with code:', code);
        console.log('Final output length:', output.length);
        console.log('Final error length:', error.length);

        const finalOutput = output || error;
        const response: ApiResponse = {
          success: code === 0,
          output: finalOutput,
          exitCode: code ?? 1,
        };

        // Check if this was a --populate-tx command and try to parse transaction data
        if (enhancedArgs.includes('--populate-tx') && code === 0) {
          console.log('=== CLI Output for transaction parsing ===');
          console.log(finalOutput.substring(0, 1000)); // First 1000 chars
          console.log('=== End Output ===');

          const txData = parseTransactionData(finalOutput);
          console.log('Parsed transaction data:', txData);

          if (txData) {
            response.transactionData = txData;
            response.isTransaction = true;
          }
        }

        // Special logging for dashboard roles command
        if (command === 'dashboard' && args.includes('roles')) {
          console.log('=== DASHBOARD ROLES COMMAND OUTPUT ===');
          console.log('Full output length:', finalOutput.length);
          console.log('Full output:');
          console.log(finalOutput);
          console.log('=== END DASHBOARD ROLES OUTPUT ===');
        }

        resolve(NextResponse.json(response));
      });

      child.on('error', (err) => {
        console.log('Process error:', err);
        resolve(
          NextResponse.json({
            success: false,
            output: `Error executing command: ${err.message}`,
            exitCode: 1,
          }),
        );
      });

      // Special handling for interactive commands
      let timeoutMs: number;
      if (isInteractiveCommand) {
        // For interactive blessed commands, give them 15 seconds to render then auto-terminate
        timeoutMs = 15000;
        console.log(
          'Interactive command detected, will auto-terminate after 15 seconds',
        );

        // Try to send Ctrl+C after 10 seconds to capture any rendered output
        setTimeout(() => {
          if (!child.killed) {
            console.log(
              'Sending Ctrl+C to interactive command after 10 seconds...',
            );
            child.kill('SIGINT'); // Try Ctrl+C first
          }
        }, 10000);
      } else {
        // Normal timeout for other commands
        timeoutMs = isWriteCommand ? 120000 : 120000;
      }

      const timeoutHandle = setTimeout(() => {
        console.log(`Process timed out after ${timeoutMs}ms, killing...`);
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) {
            console.log('Force killing process...');
            child.kill('SIGKILL');
          }
        }, 5000);

        const timeoutOutput =
          output ||
          error ||
          'Command timed out - this appears to be an interactive command that requires user input to exit.';
        resolve(
          NextResponse.json({
            success: false,
            output: isInteractiveCommand
              ? `🚫 Interactive blessed command limitation:\n\n` +
                `This command creates interactive charts/graphs using the 'blessed' library, ` +
                `which requires a real TTY terminal environment. Web-based terminals cannot ` +
                `provide the full TTY interface needed for blessed visualizations.\n\n` +
                `Available output:\n${timeoutOutput}\n\n` +
                `💡 To view interactive charts, please run this command directly in your terminal:\n` +
                `npm start -- ${command} ${args.join(' ')}`
              : `Command timed out after ${timeoutMs / 1000} seconds`,
            exitCode: 1,
          }),
        );
      }, timeoutMs);

      // Clear timeout if process exits normally
      child.on('close', () => {
        clearTimeout(timeoutHandle);
      });
    });
  } catch (error) {
    console.log('API error:', error);
    return NextResponse.json({
      success: false,
      output: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      exitCode: 1,
    });
  }
}
