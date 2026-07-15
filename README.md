# Fhish Demo Contracts

> A demo smart-contract set for **private, encrypted DAO voting** — the on-chain piece of the Fhish experiment.

## Overview

Fhish Demo Contracts is a small Hardhat project that demonstrates a privacy-preserving
voting flow on Ethereum. The core `PrivateVoting` contract lets members cast encrypted
yes/no votes on a proposal and keeps the running tallies hidden on-chain until an
authorized gateway/relayer decrypts and publishes the final result.

This is an early **V1** demo: it uses *mock* FHE primitives (encrypted values are stored
as `uint256` handles and combined with `keccak256`/XOR) so the full lifecycle —
create → vote → request reveal → fulfill tally — can be deployed and exercised end-to-end
on a testnet. The contract is explicitly written so that V2 can swap the mock handles for
real fully-homomorphic encryption via Zama's fhevm.

## Features

- **`PrivateVoting` contract** — proposal creation, one-vote-per-address enforcement, and
  encrypted tally accumulation for YES/NO votes.
- **Gateway-based reveal** — `requestTallyReveal` emits a decryption request; an authorized
  gateway/relayer calls `fulfillTally` with the decrypted counts, which finalizes the
  proposal and marks it passed/failed.
- **Owner & gateway access control** — `onlyOwner` / `onlyGateway` modifiers plus a
  settable gateway address.
- **Event-driven flow** — `ProposalCreated`, `VoteCast`, `TallyRevealRequested`,
  `DecryptionRequested`, and `ProposalResult` events for off-chain listeners/relayers.
- **Sepolia deployment scripts** — a numbered end-to-end flow (deploy, create proposal,
  cast vote, request tally, verify status) plus an alternate script set that integrates
  with a `FhishGateway` and the `@fhish/sdk` client.

## Tech Stack

- **Solidity** `0.8.24` (optimizer enabled)
- **Hardhat** `2.22.1` with `@nomicfoundation/hardhat-toolbox`
- **TypeScript** + `ts-node`
- **ethers** (via hardhat-toolbox) for scripting
- Target network: **Ethereum Sepolia** testnet

## Getting Started

```bash
# clone
git clone https://github.com/nickthelegend/fhish-demo-contracts.git
cd fhish-demo-contracts

# install
npm install

# compile
npx hardhat compile

# run the demo flow on Sepolia (requires a funded deployer account)
npx hardhat run deploy/01_deploy_voting.ts   --network sepolia
npx hardhat run deploy/02_create_proposal.ts --network sepolia
npx hardhat run deploy/03_cast_vote.ts       --network sepolia
npx hardhat run deploy/04_request_tally.ts   --network sepolia
npx hardhat run deploy/05_verify_status.ts   --network sepolia
```

> Note: `hardhat.config.ts` and some scripts contain demo/testnet account material.
> Replace these with your own keys and never commit real secrets.

## Project Structure

```
contracts/
  PrivateVoting.sol      # FHE-based private voting contract (V1 mock)
deploy/                  # numbered Sepolia deploy + interaction flow
  01_deploy_gateway.ts
  01_deploy_voting.ts
  02_create_proposal.ts
  02_deploy_voting.ts
  03_cast_vote.ts
  04_request_tally.ts
  05_verify_status.ts
scripts/                 # alternate flow using @fhish/sdk + FhishGateway
  createProposal.ts
  castVote.ts
  revealTally.ts
deployments.json         # last recorded Sepolia deployment addresses
hardhat.config.ts
package.json
tsconfig.json
```

---

Built by [nickthelegend](https://github.com/nickthelegend) · [nickthelegend.tech](https://nickthelegend.tech)
