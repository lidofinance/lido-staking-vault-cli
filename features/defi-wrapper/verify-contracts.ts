import { DefiWrapperSources } from 'abi/defi-wrapper/sources.js';
import { logInfo } from 'index.js';
import { getPublicClient } from 'providers/wallet.js';
import { Address } from 'viem';

type ContractName = keyof typeof DefiWrapperSources;

export const checkExistingVerification = async (
  address: Address,
  etherscanApiKey: string,
) => {
  const chainId = (await getPublicClient()).chain.id;
  const url = `https://api.etherscan.io/v2/api?apikey=${etherscanApiKey}&chainid=${chainId}&module=contract&action=getsourcecode&address=${address}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch verification data: ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (data.status !== '1' || !data.result || data.result.length === 0) {
    throw new Error(`No verification data found for address: ${address}`);
  }
  return data.result[0].SourceCode !== ''; // Already verified
};

export const checkVerificationStatus = async (
  guid: string,
  etherscanApiKey: string,
): Promise<any> => {
  const chainId = (await getPublicClient()).chain.id;
  const url = `https://api.etherscan.io/v2/api?guid=${guid}&action=checkverifystatus&module=contract&apikey=${etherscanApiKey}&chainid=${chainId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch verification status: ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (data.status !== '1' || !data.result || data.result.length === 0) {
    throw new Error(`No verification status found for GUID: ${guid}`);
  }
  return data.result[0].result; // "Pass - Verified" or "Fail - Unable to verify"
};

export const verifyContract = async (
  contract: ContractName,
  address: Address,
  etherscanApiKey: string,
) => {
  const chainId = (await getPublicClient()).chain.id;
  const sourceData = DefiWrapperSources[contract];
  if (!sourceData) {
    throw new Error(
      `No source data found for contract: ${contract}. Available contracts: ${Object.keys(DefiWrapperSources).join(', ')}`,
    );
  }
  const body = new URLSearchParams({
    apikey: etherscanApiKey,
    chainid: chainId.toString(),
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: address,
    sourceCode: JSON.stringify(JSON.parse(sourceData.SourceCode)),
    codeformat: sourceData.codeformat,
    contractname: `${sourceData.ContractFileName}:${sourceData.ContractName}`,
    compilerversion: sourceData.CompilerVersion,
    optimizationUsed: sourceData.OptimizationUsed,
    runs: sourceData.Runs,
    evmVersion: sourceData.EVMVersion,
  });

  const res = await fetch(
    `https://api.etherscan.io/v2/api?chainid=${chainId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to submit verification: ${res.statusText}`);
  }

  const result = await res.json();

  if (result.status !== '1') {
    throw new Error(`Verification failed: ${result.result}`);
  }

  const guid = result.result;
  logInfo(`Verification submitted. GUID: ${guid}`);

  for (let i = 0; i < 10; i++) {
    logInfo(`Checking verification status (attempt ${i + 1}/10)...`);
    const status = await checkVerificationStatus(guid, etherscanApiKey);
    logInfo(`Current status: ${status}`);
    if (status === 'Pass - Verified') {
      logInfo('Contract verified successfully!');
      return;
    } else if (status === 'Fail - Unable to verify') {
      throw new Error('Verification failed after submission.');
    }
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds before retrying
  }

  throw new Error('Verification status check timed out.');
};
