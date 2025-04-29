---
sidebar_position: 3
---

# Supply (Fund) and Withdrawal

## Supply (Fund)

Fund your vault:

```bash
yarn start dashboard w fund <dashboard_address> <ether>
```

### Required

- `<dashboard_address>`: Dashboard address
- `<ether>`: Amount of ether to be funded (in ETH)

### Example

```bash
yarn start dashboard w fund 0x 1
```

## Withdrawal

Withdraw funds from your vault:

```bash
yarn start dashboard w withdraw <dashboard_address> <recipient_address> <ether>
```

### Required

- `<dashboard_address>`: Dashboard address
- `<recipient_address>`: Address of the recipient
- `<ether>`: Amount of ether to be funded (in ETH)

### Example

```bash
yarn start dashboard w withdraw 0x 0x 5
```
