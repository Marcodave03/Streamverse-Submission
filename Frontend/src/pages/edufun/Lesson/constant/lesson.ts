export interface LessonData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  objectives: string[];
  content: {
    sections: Array<{
      heading: string;
      paragraphs: string[];
    }>;
  };
  tutorIntro: string;
  sandboxCode: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  objectives: string[];
  tutorIntro: string;
  content: {
    introduction: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
  sandboxCode: string;
}

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Introduction to Hedera Hashgraph",
    description:
      "Learn the fundamentals of Hedera Hashgraph and how it differs from traditional blockchain technology.",
    duration: "15 min",
    difficulty: "Beginner",
    objectives: [
      "Understand what Hedera Hashgraph is and how it works",
      "Learn about the consensus mechanism",
      "Explore the benefits of hashgraph technology",
      "Compare Hedera with traditional blockchains",
    ],
    tutorIntro:
      "Welcome to your first lesson! I'm here to guide you through the fascinating world of Hedera Hashgraph. Let's start with the basics and build your understanding step by step.",
    content: {
      introduction:
        "Hedera Hashgraph is a distributed ledger technology that offers a new approach to consensus and transaction processing. Unlike traditional blockchains, Hedera uses a hashgraph consensus algorithm that provides fast, fair, and secure transactions.",
      sections: [
        {
          title: "What is Hashgraph?",
          content:
            "Hashgraph is a consensus algorithm that uses a gossip protocol and virtual voting to achieve consensus. It's designed to be fast, fair, and secure, processing thousands of transactions per second with low latency.",
        },
        {
          title: "Key Benefits",
          content:
            "Hedera offers several advantages including high throughput (10,000+ TPS), low fees, energy efficiency, and enterprise-grade security. It's governed by a council of leading organizations.",
        },
        {
          title: "Use Cases",
          content:
            "Hedera is ideal for applications requiring high throughput, low latency, and predictable fees, such as micropayments, supply chain tracking, and decentralized identity solutions.",
        },
      ],
    },
    sandboxCode: `// Welcome to Hedera Development!
// Let's start with a simple example

const { Client, AccountId } = require("@hashgraph/sdk");

// Create a client for testnet
const client = Client.forTestnet();

// Your account ID (replace with your actual account ID)
const myAccountId = AccountId.fromString("0.0.123456");

console.log("Connected to Hedera Testnet!");
console.log("Your Account ID:", myAccountId.toString());

// This is your first step into Hedera development
// In the next lessons, we'll explore more advanced features`,
  },
  {
    id: 2,
    title: "Creating Your First Hedera Account",
    description:
      "Set up your development environment and create your first Hedera account for testing and development.",
    duration: "20 min",
    difficulty: "Beginner",
    objectives: [
      "Set up the Hedera SDK in your development environment",
      "Create a new Hedera account",
      "Understand account IDs and keys",
      "Fund your account with test HBAR",
    ],
    tutorIntro:
      "Great job completing the first lesson! Now let's get hands-on and create your very own Hedera account. This is where your journey as a Hedera developer truly begins!",
    content: {
      introduction:
        "Creating a Hedera account is the first practical step in your development journey. You'll learn how to generate cryptographic keys, create accounts, and manage them using the Hedera SDK.",
      sections: [
        {
          title: "Setting Up the SDK",
          content:
            "The Hedera SDK is available for multiple programming languages including JavaScript, Java, Go, and Python. We'll use the JavaScript SDK for our examples, which can be installed via npm.",
        },
        {
          title: "Generating Keys",
          content:
            "Every Hedera account requires cryptographic keys for security. You'll learn how to generate ED25519 key pairs and understand the relationship between public and private keys.",
        },
        {
          title: "Account Creation",
          content:
            "Learn how to create new accounts using the AccountCreateTransaction, set initial balances, and understand the account creation process on Hedera.",
        },
      ],
    },
    sandboxCode: `// Creating Your First Hedera Account
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar
} = require("@hashgraph/sdk");

async function createAccount() {
  // Create client for testnet
  const client = Client.forTestnet();
  
  // Set operator (your existing account that pays for transactions)
  client.setOperator(operatorId, operatorKey);
  
  // Generate new keys for the account
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;
  
  // Create new account
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);
    
  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;
  
  console.log("New Account ID:", newAccountId.toString());
  console.log("Private Key:", newAccountPrivateKey.toString());
  console.log("Public Key:", newAccountPublicKey.toString());
  
  return { accountId: newAccountId, privateKey: newAccountPrivateKey };
}`,
  },
  {
    id: 3,
    title: "HBAR Transfers and Transactions",
    description:
      "Learn how to send HBAR between accounts and understand the transaction lifecycle on Hedera.",
    duration: "25 min",
    difficulty: "Intermediate",
    objectives: [
      "Execute HBAR transfers between accounts",
      "Understand transaction fees and lifecycle",
      "Query account balances",
      "Handle transaction receipts and records",
    ],
    tutorIntro:
      "Excellent progress! Now that you have your Hedera account, let's learn how to transfer HBAR - the native cryptocurrency of Hedera. This is fundamental to all Hedera applications.",
    content: {
      introduction:
        "HBAR transfers are the most basic type of transaction on Hedera. Understanding how to send and receive HBAR is essential for building any application on the network.",
      sections: [
        {
          title: "Transfer Transactions",
          content:
            "Learn how to use TransferTransaction to send HBAR between accounts. Understand the concept of debits and credits, and how Hedera ensures transaction atomicity.",
        },
        {
          title: "Transaction Fees",
          content:
            "Every transaction on Hedera requires a fee paid in HBAR. Learn how fees are calculated, how to set appropriate fees, and understand the fee schedule.",
        },
        {
          title: "Querying Balances",
          content:
            "Use AccountBalanceQuery to check account balances and understand how to verify successful transactions.",
        },
      ],
    },
    sandboxCode: `// HBAR Transfer Example
const {
  Client,
  TransferTransaction,
  AccountBalanceQuery,
  Hbar
} = require("@hashgraph/sdk");

async function transferHbar() {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  // Check initial balances
  const senderBalance = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
    
  const receiverBalance = await new AccountBalanceQuery()
    .setAccountId(receiverAccountId)
    .execute(client);
    
  console.log("Sender balance:", senderBalance.hbars.toString());
  console.log("Receiver balance:", receiverBalance.hbars.toString());
  
  // Create transfer transaction
  const transferTx = await new TransferTransaction()
    .addHbarTransfer(senderAccountId, Hbar.fromTinybars(-100))
    .addHbarTransfer(receiverAccountId, Hbar.fromTinybars(100))
    .execute(client);
    
  // Get transaction receipt
  const receipt = await transferTx.getReceipt(client);
  console.log("Transaction status:", receipt.status.toString());
  
  // Check final balances
  const newSenderBalance = await new AccountBalanceQuery()
    .setAccountId(senderAccountId)
    .execute(client);
    
  console.log("New sender balance:", newSenderBalance.hbars.toString());
}`,
  },
  {
    id: 4,
    title: "Smart Contracts on Hedera",
    description:
      "Deploy and interact with smart contracts using Hedera's EVM compatible environment.",
    duration: "35 min",
    difficulty: "Advanced",
    objectives: [
      "Understand Hedera's smart contract capabilities",
      "Deploy your first smart contract",
      "Interact with contracts using the SDK",
      "Handle contract events and errors",
    ],
    tutorIntro:
      "Excellent! Smart contracts on Hedera combine the power of Ethereum's EVM with Hedera's fast consensus. You can deploy Solidity contracts and interact with them using familiar tools, but with the benefits of 3-5 second finality and predictable fees. Let's explore how to deploy and interact with your first smart contract!",
    content: {
      introduction:
        "Hedera's smart contract service provides an EVM-compatible environment where you can deploy and execute Solidity smart contracts. This combines the familiarity of Ethereum development with Hedera's performance benefits.",
      sections: [
        {
          title: "EVM Compatibility",
          content:
            "Hedera's smart contract service is fully compatible with the Ethereum Virtual Machine (EVM). This means you can deploy existing Solidity contracts with minimal modifications and use familiar development tools.",
        },
        {
          title: "Contract Deployment",
          content:
            "Learn how to compile Solidity contracts and deploy them to Hedera using ContractCreateTransaction. Understand gas limits, contract bytecode, and constructor parameters.",
        },
        {
          title: "Contract Interaction",
          content:
            "Once deployed, interact with your contracts using ContractCallQuery for read operations and ContractExecuteTransaction for state-changing operations.",
        },
      ],
    },
    sandboxCode: `// Smart Contract Deployment and Interaction
const {
  Client,
  ContractCreateTransaction,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters
} = require("@hashgraph/sdk");

// Simple contract bytecode (HelloWorld contract)
const contractBytecode = "608060405234801561001057600080fd5b50..."; // Truncated for brevity

async function deployContract() {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  // Deploy the contract
  const contractTx = await new ContractCreateTransaction()
    .setGas(100000)
    .setBytecode(contractBytecode)
    .setConstructorParameters(
      new ContractFunctionParameters()
        .addString("Hello, Hedera!")
    )
    .execute(client);
    
  const receipt = await contractTx.getReceipt(client);
  const contractId = receipt.contractId;
  
  console.log("Contract deployed! ID:", contractId.toString());
  
  // Call a contract function (read-only)
  const callResult = await new ContractCallQuery()
    .setContractId(contractId)
    .setGas(30000)
    .setFunction("getMessage")
    .execute(client);
    
  console.log("Contract message:", callResult.getString(0));
  
  // Execute a contract function (state-changing)
  const executeTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(30000)
    .setFunction("setMessage", 
      new ContractFunctionParameters()
        .addString("Hello from Hedera SDK!")
    )
    .execute(client);
    
  const executeReceipt = await executeTx.getReceipt(client);
  console.log("Function executed:", executeReceipt.status.toString());
}`,
  },
  {
    id: 5,
    title: "Hedera Token Service (HTS)",
    description:
      "Create and manage both fungible and non-fungible tokens natively on Hedera without smart contracts.",
    duration: "30 min",
    difficulty: "Intermediate",
    objectives: [
      "Create fungible tokens using HTS",
      "Mint and manage NFT collections",
      "Understand token compliance features",
      "Implement token transfers and associations",
    ],
    tutorIntro:
      "Welcome to one of Hedera's most powerful features! The Hedera Token Service (HTS) allows you to create both fungible tokens and NFTs natively on the network, without needing smart contracts. This provides better performance, lower costs, and built-in compliance features.",
    content: {
      introduction:
        "Hedera Token Service (HTS) is a native service that allows you to create, mint, and manage both fungible and non-fungible tokens directly on the Hedera network without requiring smart contracts.",
      sections: [
        {
          title: "Fungible Tokens",
          content:
            "Create custom cryptocurrencies and utility tokens with built-in features like supply management, freezing, and KYC compliance. Perfect for loyalty points, stablecoins, and utility tokens.",
        },
        {
          title: "Non-Fungible Tokens (NFTs)",
          content:
            "Create unique digital assets with metadata support. Each NFT can have custom properties and can represent anything from digital art to certificates of authenticity.",
        },
        {
          title: "Compliance Features",
          content:
            "HTS includes built-in compliance features like KYC (Know Your Customer), account freezing, and token pausing, making it suitable for regulated industries.",
        },
      ],
    },
    sandboxCode: `// Hedera Token Service Examples
const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction
} = require("@hashgraph/sdk");

async function createFungibleToken() {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  // Create a fungible token
  const tokenTx = await new TokenCreateTransaction()
    .setTokenName("My Custom Token")
    .setTokenSymbol("MCT")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(1000000) // 10,000.00 tokens
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .execute(client);
    
  const receipt = await tokenTx.getReceipt(client);
  const tokenId = receipt.tokenId;
  
  console.log("Fungible token created:", tokenId.toString());
  
  return tokenId;
}

async function createNFTCollection() {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  // Create NFT collection
  const nftTx = await new TokenCreateTransaction()
    .setTokenName("My NFT Collection")
    .setTokenSymbol("MYNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1000)
    .setTreasuryAccountId(treasuryId)
    .setSupplyKey(supplyKey)
    .execute(client);
    
  const nftReceipt = await nftTx.getReceipt(client);
  const nftTokenId = nftReceipt.tokenId;
  
  console.log("NFT collection created:", nftTokenId.toString());
  
  // Mint an NFT
  const mintTx = await new TokenMintTransaction()
    .setTokenId(nftTokenId)
    .setMetadata([Buffer.from("NFT metadata here")])
    .execute(client);
    
  const mintReceipt = await mintTx.getReceipt(client);
  console.log("NFT minted, serial:", mintReceipt.serials[0].toString());
}`,
  },
  {
    id: 6,
    title: "Consensus Service Integration",
    description:
      "Use Hedera Consensus Service for immutable messaging and audit trails in your applications.",
    duration: "40 min",
    difficulty: "Advanced",
    objectives: [
      "Create and manage consensus topics",
      "Submit messages to topics",
      "Subscribe to topic messages",
      "Build audit trail applications",
    ],
    tutorIntro:
      "Fantastic progress! The Hedera Consensus Service (HCS) is perfect for applications that need immutable, ordered messaging without the overhead of cryptocurrency transfers. Think supply chain tracking, voting systems, or IoT data logging. Let's explore how to build tamper-proof audit trails!",
    content: {
      introduction:
        "Hedera Consensus Service (HCS) provides a way to achieve consensus on the order and timestamp of messages without requiring a full transaction. It's perfect for audit trails, logging, and messaging applications.",
      sections: [
        {
          title: "Consensus Topics",
          content:
            "Topics are the foundation of HCS. They provide an ordered log of messages with consensus timestamps. Anyone can create a topic and configure who can submit messages to it.",
        },
        {
          title: "Message Submission",
          content:
            "Submit messages to topics using TopicMessageSubmitTransaction. Messages are ordered by consensus timestamp and can include any data up to 1024 bytes.",
        },
        {
          title: "Real-world Applications",
          content:
            "HCS is ideal for supply chain tracking, voting systems, IoT data logging, chat applications, and any scenario requiring an immutable audit trail.",
        },
      ],
    },
    sandboxCode: `// Hedera Consensus Service Example
const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery
} = require("@hashgraph/sdk");

async function createTopicAndSubmitMessages() {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  // Create a new topic
  const topicTx = await new TopicCreateTransaction()
    .setTopicMemo("Supply Chain Audit Trail")
    .setSubmitKey(submitKey) // Only accounts with this key can submit
    .execute(client);
    
  const receipt = await topicTx.getReceipt(client);
  const topicId = receipt.topicId;
  
  console.log("Topic created:", topicId.toString());
  
  // Submit messages to the topic
  const messages = [
    "Product manufactured: Batch #12345",
    "Quality check passed: Inspector A",
    "Shipped to warehouse: Location B",
    "Delivered to customer: Order #67890"
  ];
  
  for (const message of messages) {
    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);
      
    const submitReceipt = await submitTx.getReceipt(client);
    console.log("Message submitted:", submitReceipt.status.toString());
    
    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return topicId;
}

// Subscribe to topic messages (in a real app, this would run continuously)
function subscribeToTopic(topicId) {
  const client = Client.forTestnet();
  
  new TopicMessageQuery()
    .setTopicId(topicId)
    .setStartTime(0) // Start from beginning
    .subscribe(client, (message) => {
      console.log(
        \`Received message at \${message.consensusTimestamp}:\`,
        Buffer.from(message.contents).toString()
      );
    });
}`,
  },
];
