import { lstatSync } from "fs";
import { zeroAddress, Address } from "viem";
import { resolve } from "path";
import { envs } from "./envs";
import { getValueByPath } from "@utils";

export const importConfigFile = (path?: string) => {
  const fullPath = resolve("configs", path ?? "");
  let json: Record<string, Record<string, Address>> = {};

  if (lstatSync(fullPath).isFile()) {
    json = structuredClone(require(fullPath));
  }

  return json;
};

export const getContracts = () => {
  const deployedFile = envs?.DEPLOYED;

  if (!deployedFile) {
    throw new Error("Deployed contracts file is not set, check .env file");
  }

  const mainDeployedJSON = importConfigFile(envs?.DEPLOYED);
  const extraDeployedJSON = importConfigFile(`extra-${envs?.DEPLOYED}`);

  return { ...mainDeployedJSON, ...extraDeployedJSON };
};

export const getContractDeploy = (path: string) => {
  return getValueByPath(getContracts(), path);
};

export const getDeployedAddress = (...contractKeys: string[]) => {
  const contracts = contractKeys.map((contractKey) =>
    getContractDeploy(contractKey)
  );
  const contract = contracts.find((contract) => contract);

  if (typeof contract === "string") {
    return contract as Address;
  }

  if (!contract || typeof contract !== "object") {
    throw new Error(`Contracts by ${contractKeys} not found`);
  }

  if ("proxyAddress" in contract) {
    return contract.proxyAddress as Address;
  }

  if ("address" in contract) {
    return contract.address as Address;
  }

  throw new Error(`Contracts by ${contractKeys} not found`);
};

export const getOptionalDeployedAddress = (...contractKeys: string[]) => {
  try {
    return getDeployedAddress(...contractKeys);
  } catch {
    return zeroAddress;
  }
};

export const getAddressMap = () => {
  const contracts = getContracts();

  return Object.entries(contracts).reduce((acc, [key, value]) => {
    const name = value.contract || key;
    const proxyAddress =
      value.proxyAddress || (value.implementation && value.address);
    const implementation = value.implementation;
    const isNotProxy = !implementation && !proxyAddress;

    if (proxyAddress) {
      acc[proxyAddress.toLowerCase()] = `Proxy (${name})`;
    }

    if (implementation) {
      acc[implementation.toLowerCase()] = `Implementation (${name})`;
    }

    if (isNotProxy && value.address) {
      acc[value.address.toLowerCase()] = name;
    }

    return acc;
  }, {} as Record<string, string>);
};

let addressMapCache: Record<string, string> | undefined;

export const getCachedAddressMap = () => {
  if (!addressMapCache) {
    addressMapCache = getAddressMap();
  }

  return addressMapCache;
};
