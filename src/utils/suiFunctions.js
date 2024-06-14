import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { sha256 } from "@noble/hashes/sha256";
import { getCookie } from "./helpers";


export const ContractAddress =
  "0x8cf30a95bfb2ce8fc0ed0e6ab0b7be83fe8864686d9cc34081dd52628ac4c8a5";
const coinType = '0x8cf30a95bfb2ce8fc0ed0e6ab0b7be83fe8864686d9cc34081dd52628ac4c8a5::NENE::NENE';
// treasury = 0x746c9c77c4bf7d133cd4dec2a4a6994228c068f1490e1662d039a7103ccb50c0
const MINT_FEE = "10000000000"
const generateKeypairFromSubId = (subId) => {
  const hash = sha256(new TextEncoder().encode(subId));
  return Ed25519Keypair.fromSecretKey(hash.slice(0, 32));
};

export const createWallet = (subId) => {
  try {
    const sub_id = subId ?? getCookie("SubId");
    const _keypair = generateKeypairFromSubId(sub_id);
    const privateKey = _keypair.getSecretKey();
    console.log("privateKey", privateKey);
    const _address = _keypair.getPublicKey().toSuiAddress();
    console.log("Address:", _address);
    return { walletAddress: _address, keypair: _keypair, error: null };
  } catch (error) {
    console.error("Failed to initialize keypair:", error);
    return { walletAddress: "", keyPair: "", error };
  }
};

export const privateWallet = () => {
  try {
    const mn =
      "home access borrow begin rabbit decorate surge coyote globe alien coin detail";
    const _keypair = Ed25519Keypair.deriveKeypair(mn);
    const privateKey = _keypair.getSecretKey();
    console.log("privateKey", privateKey);
    const _address = _keypair.getPublicKey().toSuiAddress();
    console.log("Address:", _address);
    return { walletAddress: _address, keypair: _keypair, error: null };
  } catch (error) {
    console.error("Failed to initialize keypair:", error);
    return { walletAddress: "", keyPair: "", error };
  }
};

export const getSuiClient = () => {
  // use getFullnodeUrl to define Testnet RPC location
  const rpcUrl = getFullnodeUrl("devnet")

  // create a client connected to testnet
  const client = new SuiClient({ url: rpcUrl });

  return client;
};

export const fetchSuiTokenBalance = async () => {
  try {
    const fullnodeUrl = getFullnodeUrl("devnet"); // or 'mainnet' if you're on the main network
    const client = new SuiClient({ url: fullnodeUrl });
    const { walletAddress } = createWallet();

    console.log("walletAddress", walletAddress)
    console.log("Fetching SUI balance...");
    const suiBalance = await client.getCoins({ owner: walletAddress });
    console.log("SUI Balance Response:", suiBalance);

    let tokenBalance = 0;
    let nextCursor = null;

    do {
      const tokenResponse = await client.getCoins({ coinType, owner: walletAddress, cursor: nextCursor });
      console.log("Token Balance Response:", tokenResponse);

      for (const coin of tokenResponse.data) {
        tokenBalance += parseInt(coin.balance, 10);
      }

      nextCursor = tokenResponse.nextCursor;
    } while (nextCursor);

    const suiAmount = suiBalance.data.reduce((total, coin) => total + parseInt(coin.balance, 10), 0);

    console.log("SUI Amount:", suiAmount);
    console.log("Token Amount:", tokenBalance);

    return { suiAmount, tokenBalance };
  } catch (error) {
    console.error("Error fetching token balance:", error.message);
    console.error("Stack Trace:", error.stack);
    return { suiAmount: 0, tokenBalance: 0 };
  }
};

export const handleTokenTransferByAdmin = async (amount) => {
  const { keypair, walletAddress } = privateWallet();
  if (!keypair) {
    console.error("Keypair is not initialized");
    return null;
  }

  try {
    const tx = new Transaction();
    const client = getSuiClient(); // Fetch the coin details
    console.log("client: ", client)

    const coins = await client.getCoins({ coinType, owner: walletAddress });
    console.log("coins", coins);

    const sui = await client.getCoins({ owner: walletAddress });
    console.log("sui", sui);
    if (coins.data.length === 0) {
      console.error("No coins found for the address");
      return;
    }
    let coinObjectId = coins?.data?.[coins?.data?.length - 1]?.coinObjectId
    console.log("coinObjectId", coinObjectId)
    let myVectorOfObjects = [tx.object(coinObjectId)]
    const serializedVector = tx.makeMoveVec({ elements: myVectorOfObjects });


    console.log("rd", walletAddress)
    tx.setGasBudget(10000000);
    const Recipient = createWallet();
    tx.moveCall({
      target: `${ContractAddress}::NENE::transfer`,
      arguments: [
        serializedVector, // Registry object ID
        tx.pure(Number(amount) * 1e9, "u64"), // Amount to transfer
        tx.pure(Recipient?.walletAddress), // Recipient's address
      ],
    });
    console.log("before sign")
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log("result", result);
    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log("transaction", transaction, transaction?.effects?.status?.status);
    if (transaction?.effects?.status?.status === "success") {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return error;
  }
};


export const handleTokenTransferByUser = async (amount, recipient) => {
  const { keypair, walletAddress } = createWallet();
  if (!keypair) {
    console.error("Keypair is not initialized");
    return null;
  }

  try {
    // const tx = new Transaction();
    const client = getSuiClient(); // Fetch the coin details
    console.log("client: ", client)
    const coins = await client.getCoins({ coinType, owner: walletAddress });
    console.log("coins", coins);
    if (coins.data.length === 0) {
      console.error("No coins found for the address");
      return;
    }
    let coinObjectId = coins?.data?.[coins?.data?.length - 1]?.coinObjectId
    console.log("coinObjectId", coinObjectId)
    const tx = new Transaction();

    console.log("rd", walletAddress)
    tx.setGasBudget(10000000);


    console.log("before sign")
    let myVectorOfObjects = [tx.object(coinObjectId)]
    const serializedVector = tx.makeMoveVec({ elements: myVectorOfObjects });


    console.log("rd", walletAddress)
    tx.setGasBudget(10000000);
    tx.moveCall({
      target: `${ContractAddress}::NENE::transfer`,
      arguments: [
        serializedVector, // Registry object ID
        tx.pure(Number(amount) * 1e9, "u64"), // Amount to transfer
        tx.pure(recipient), // Recipient's address
      ],
    });
    console.log("before sign")
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log("result", result);
    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log("transaction", transaction, transaction?.effects?.status?.status);
    if (transaction?.effects?.status?.status === "success") {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return error;
  }
};

// export const mintFreeNft = async () => {
//   const { keypair, walletAddress } = createWallet();
//   if (!keypair) {
//     console.error("Keypair is not initialized");
//     return null;
//   }

//   try {
//     // const tx = new Transaction();
//     const client = getSuiClient(); // Fetch the coin details
//     console.log("client: ", client)
//     const coins = await client.getCoins({ coinType, owner: walletAddress });
//     console.log("coins", coins);
//     if (coins.data.length === 0) {
//       console.error("No coins found for the address");
//       return;
//     }

//     const tx = new Transaction();

//     console.log("rd", walletAddress)
//     tx.setGasBudget(10000000);


//     console.log("before sign")

//     tx.setGasBudget(10000000);
//     tx.moveCall({
//       target: `0x4abe2ecc6091623a552b9dae4d6d4138f9879e9fed0f5bc758e4b639569c296e::nft::mint`,
//       arguments: [
//         tx.pure("Token1"), // Registry object ID
//         tx.pure("Descriptioopn"), // Amount to transfer
//         tx.pure("url"), // Recipient's address
//       ],
//     });
//     console.log("before sign")
//     const result = await client.signAndExecuteTransaction({
//       signer: keypair,
//       transaction: tx,
//     });
//     console.log("result", result);
//     const transaction = await client.waitForTransaction({
//       digest: result.digest,
//       options: {
//         showEffects: true,
//       },
//     });
//     console.log("transaction", transaction, transaction?.effects?.status?.status);
//     if (transaction?.effects?.status?.status === "success") {
//       return true
//     }
//     return false
//   } catch (error) {
//     console.log(error)
//     return error;
//   }
// };

// export const mintNft = async () => {
//   const { keypair, walletAddress } = createWallet();
//   if (!keypair) {
//     console.error("Keypair is not initialized");
//     return null;
//   }

//   try {
//     // const tx = new Transaction();
//     const client = getSuiClient(); // Fetch the coin details
//     console.log("client: ", client)
//     let coins = await client.getCoins({ coinType, owner: walletAddress });
//     console.log("coins", coins);
//     if (coins.data.length === 0) {
//       console.error("No coins found for the address");
//       return;
//     }

//     const tx = new Transaction();

//     console.log("rd", walletAddress)
//     tx.setGasBudget(10000000);

//     const sui = await client.getCoins({ owner: walletAddress });
//     console.log("sui", sui);
//     console.log("before sign")


//     // Merge all coins into one
//     const primaryCoinId = coins.data[0].coinObjectId;
//     if (coins.data[0]?.balance < Number(MINT_FEE)) {

//     }
//     const coinIdsToMerge = coins.data.slice(1).map(coin => coin.coinObjectId);

//     if (coinIdsToMerge.length > 0) {
//       const mergeTx = new Transaction();
//       mergeTx.setGasBudget(10000000);

//       console.log("Primary Coin ID: ", primaryCoinId);
//       console.log("Coins to merge: ", coinIdsToMerge);

//       mergeTx.mergeCoins(mergeTx.object(primaryCoinId), coinIdsToMerge.map(id => mergeTx.object(id)));

//       // Sign and execute the merge transaction
//       const mergeResult = await client.signAndExecuteTransaction({
//         signer: keypair,
//         transaction: mergeTx,
//       });

//       console.log("Merge Result: ", mergeResult);

//       // Wait for the merge transaction to be confirmed
//       const mergeTransaction = await client.waitForTransaction({
//         digest: mergeResult.digest,
//         options: {
//           showEffects: true,
//         },
//       });

//       console.log("Merge Transaction: ", mergeTransaction);

//       if (mergeTransaction.effects.status.status !== "success") {
//         console.error("Merge transaction failed");
//         return;
//       }
//     } else {
//       console.log("No additional coins to merge");
//     }

//     // Fetch the updated coin details
//     const updatedCoins = await client.getCoins({ coinType, owner: walletAddress });
//     console.log("updatedCoins", updatedCoins);
//     if (updatedCoins.data.length === 0) {
//       console.error("No coins found for the address after merge");
//       return;
//     }

//     // Get the primary coin with updated balance
//     const updatedPrimaryCoinId = updatedCoins.data[0].coinObjectId;
//     // console.log("tx.gas", tx.splitCoins({ coinType }, [tx.pure(1000000)]))
//     // let [coin] = tx.splitCoins(coins?.nextCursor, [tx.pure(1000000)])
//     console.log("coin", coins, updatedPrimaryCoinId)

//     let paymentCoin = tx.splitCoins(tx.object(updatedPrimaryCoinId), [tx.pure(MINT_FEE)]);
//     console.log("paymentCoin", paymentCoin)
//     tx.moveCall({
//       target: "0x15798db89b1b0fbc19c5fa80d2c73bf6238fcb7d3864c7d21a43b872086f57ed::nft::mint",
//       typeArguments: [coinType],
//       arguments: [
//         tx.pure("Token1"), // Registry object ID
//         tx.pure("Description"), // Amount to transfer
//         tx.pure("url"), // Recipient's address
//         tx.object(paymentCoin),
//       ]
//     });
//     console.log("before sign")
//     const result = await client.signAndExecuteTransaction({
//       signer: keypair,
//       transaction: tx,
//     });
//     console.log("result", result);
//     const transaction = await client.waitForTransaction({
//       digest: result.digest,
//       options: {
//         showEffects: true,
//       },
//     });
//     console.log("transaction", transaction, transaction?.effects?.status?.status);
//     if (transaction?.effects?.status?.status === "success") {
//       return true
//     }
//     return false
//   } catch (error) {
//     console.log(error)
//     return error;
//   }
// };

// export const mintNftWithReturnPaymentInContract = async () => {
//   const { keypair, walletAddress } = createWallet();
//   if (!keypair) {
//     console.error("Keypair is not initialized");
//     return null;
//   }

//   try {
//     // const tx = new Transaction();
//     const client = getSuiClient(); // Fetch the coin details
//     console.log("client: ", client)
//     let coins = await client.getCoins({ coinType, owner: walletAddress });
//     console.log("coins", coins);
//     if (coins.data.length === 0) {
//       console.error("No coins found for the address");
//       return;
//     }

//     const tx = new Transaction();

//     console.log("rd", walletAddress)
//     tx.setGasBudget(10000000);

//     const sui = await client.getCoins({ owner: walletAddress });
//     console.log("sui", sui);
//     console.log("before sign")


//     // Merge all coins into one
//     let primaryCoinId = coins.data[0].coinObjectId;
//     if (coins.data[0]?.balance < Number(MINT_FEE)) {
//       const coinIdsToMerge = coins.data.slice(1).map(coin => coin.coinObjectId);

//       if (coinIdsToMerge.length > 0) {
//         const mergeTx = new Transaction();
//         mergeTx.setGasBudget(MINT_FEE);

//         console.log("Primary Coin ID: ", primaryCoinId);
//         console.log("Coins to merge: ", coinIdsToMerge);

//         mergeTx.mergeCoins(mergeTx.object(primaryCoinId), coinIdsToMerge.map(id => mergeTx.object(id)));

//         // Sign and execute the merge transaction
//         const mergeResult = await client.signAndExecuteTransaction({
//           signer: keypair,
//           transaction: mergeTx,
//         });

//         console.log("Merge Result: ", mergeResult);

//         // Wait for the merge transaction to be confirmed
//         const mergeTransaction = await client.waitForTransaction({
//           digest: mergeResult.digest,
//           options: {
//             showEffects: true,
//           },
//         });

//         console.log("Merge Transaction: ", mergeTransaction);

//         if (mergeTransaction.effects.status.status !== "success") {
//           console.error("Merge transaction failed");
//           return;
//         }
//       } else {
//         console.log("No additional coins to merge");
//       }

//       // Fetch the updated coin details
//       primaryCoinId = await client.getCoins({ coinType, owner: walletAddress });
//       console.log("updatedCoins", primaryCoinId);
//       if (primaryCoinId.data.length === 0) {
//         console.error("No coins found for the address after merge");
//         return;
//       }

//       // Get the primary coin with updated balance
//       primaryCoinId = primaryCoinId.data[0].coinObjectId;
//       // console.log("tx.gas", tx.splitCoins({ coinType }, [tx.pure(1000000)]))
//       // let [coin] = tx.splitCoins(coins?.nextCursor, [tx.pure(1000000)])
//       console.log("coin", coins, primaryCoinId)
//     }


//     let paymentCoin = tx.splitCoins(tx.object(primaryCoinId), [tx.pure(MINT_FEE)]);
//     console.log("paymentCoin", paymentCoin)
//     tx.moveCall({
//       target: "0x4b37d99aa8214019172dbd063e539b7ce9cf5d81b2b3dab349408aaded2c6756::nft::mint",
//       typeArguments: [coinType],
//       arguments: [
//         tx.pure("Token1"), // Registry object ID
//         tx.pure("Description"), // Amount to transfer
//         tx.pure("url"), // Recipient's address
//         tx.object(paymentCoin),
//       ]
//     });
//     console.log("before sign")
//     const result = await client.signAndExecuteTransaction({
//       signer: keypair,
//       transaction: tx,
//     });
//     console.log("result", result);
//     const transaction = await client.waitForTransaction({
//       digest: result.digest,
//       options: {
//         showEffects: true,
//       },
//     });
//     console.log("transaction", transaction, transaction?.effects?.status?.status);
//     if (transaction?.effects?.status?.status === "success") {
//       return true
//     }
//     return false
//   } catch (error) {
//     console.log(error)
//     return error;
//   }
// };


export const mintNft = async () => {
  const { keypair, walletAddress } = privateWallet();
  if (!keypair) {
    console.error("Keypair is not initialized");
    return null;
  }

  try {
    // const tx = new Transaction();
    const client = getSuiClient(); // Fetch the coin details
    console.log("client: ", client)
    let coins = await client.getCoins({ coinType, owner: walletAddress });
    console.log("coins", coins);
    if (coins.data.length === 0) {
      console.error("No coins found for the address");
      return;
    }

    const tx = new Transaction();

    console.log("rd", walletAddress)
    tx.setGasBudget(10000000);

    const sui = await client.getCoins({ owner: walletAddress });
    console.log("sui", sui);
    console.log("before sign")


    // Merge all coins into one
    let primaryCoinId = coins.data[0].coinObjectId;
    if (coins.data[0]?.balance < Number(MINT_FEE)) {
      const coinIdsToMerge = coins.data.slice(1).map(coin => coin.coinObjectId);

      if (coinIdsToMerge.length > 0) {
        const mergeTx = new Transaction();
        mergeTx.setGasBudget(MINT_FEE);

        console.log("Primary Coin ID: ", primaryCoinId);
        console.log("Coins to merge: ", coinIdsToMerge);

        mergeTx.mergeCoins(mergeTx.object(primaryCoinId), coinIdsToMerge.map(id => mergeTx.object(id)));

        // Sign and execute the merge transaction
        const mergeResult = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: mergeTx,
        });

        console.log("Merge Result: ", mergeResult);

        // Wait for the merge transaction to be confirmed
        const mergeTransaction = await client.waitForTransaction({
          digest: mergeResult.digest,
          options: {
            showEffects: true,
          },
        });

        console.log("Merge Transaction: ", mergeTransaction);

        if (mergeTransaction.effects.status.status !== "success") {
          console.error("Merge transaction failed");
          return;
        }
      } else {
        console.log("No additional coins to merge");
      }

      // Fetch the updated coin details
      primaryCoinId = await client.getCoins({ coinType, owner: walletAddress });
      console.log("updatedCoins", primaryCoinId);
      if (primaryCoinId.data.length === 0) {
        console.error("No coins found for the address after merge");
        return;
      }

      // Get the primary coin with updated balance
      primaryCoinId = primaryCoinId.data[0].coinObjectId;
      // console.log("tx.gas", tx.splitCoins({ coinType }, [tx.pure(1000000)]))
      // let [coin] = tx.splitCoins(coins?.nextCursor, [tx.pure(1000000)])
      console.log("coin", coins, primaryCoinId)
    }


    let paymentCoin = tx.splitCoins(tx.object(primaryCoinId), [tx.pure(MINT_FEE)]);
    console.log("paymentCoin", paymentCoin)
    const paymentCoinId = paymentCoin.id;
    console.log("paymentCoinId", primaryCoinId);

    tx.moveCall({
      target: "0x479396e2c178dbfbe9871623acf0cd55867ddc559cdf722dd48bb62430fa2481::flash_lender::withdraw",
      // typeArguments: ["0x8cf30a95bfb2ce8fc0ed0e6ab0b7be83fe8864686d9cc34081dd52628ac4c8a5::NENE::NENE"],
      arguments: [
        tx.object("0xeb6d69c648f3e1253828eb31c7dd0723ce1fff0de146482a2e979b157befb681"),
        tx.pure(10000, "u64")
      ]
    });
    console.log("before sign")
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log("result", result);
    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log("transaction", transaction, transaction?.effects?.status?.status);
    if (transaction?.effects?.status?.status === "success") {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return error;
  }
};



export const stake = async () => {
  const { keypair, walletAddress } = createWallet();
  if (!keypair) {
    console.error("Keypair is not initialized");
    return null;
  }

  try {
    // const tx = new Transaction();
    const client = getSuiClient(); // Fetch the coin details
    console.log("client: ", client)
    let coins = await client.getCoins({ coinType, owner: walletAddress });
    console.log("coins", coins);
    if (coins.data.length === 0) {
      console.error("No coins found for the address");
      return;
    }

    const tx = new Transaction();

    console.log("rd", walletAddress)
    tx.setGasBudget(1000000000);

    const sui = await client.getCoins({ owner: walletAddress });
    console.log("sui", sui);
    console.log("before sign")


    // Merge all coins into one
    let primaryCoinId = coins.data[0].coinObjectId;
    if (coins.data[0]?.balance < Number(MINT_FEE)) {
      const coinIdsToMerge = coins.data.slice(1).map(coin => coin.coinObjectId);

      if (coinIdsToMerge.length > 0) {
        const mergeTx = new Transaction();
        mergeTx.setGasBudget(MINT_FEE);

        console.log("Primary Coin ID: ", primaryCoinId);
        console.log("Coins to merge: ", coinIdsToMerge);

        mergeTx.mergeCoins(mergeTx.object(primaryCoinId), coinIdsToMerge.map(id => mergeTx.object(id)));

        // Sign and execute the merge transaction
        const mergeResult = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: mergeTx,
        });

        console.log("Merge Result: ", mergeResult);

        // Wait for the merge transaction to be confirmed
        const mergeTransaction = await client.waitForTransaction({
          digest: mergeResult.digest,
          options: {
            showEffects: true,
          },
        });

        console.log("Merge Transaction: ", mergeTransaction);

        if (mergeTransaction.effects.status.status !== "success") {
          console.error("Merge transaction failed");
          return;
        }
      } else {
        console.log("No additional coins to merge");
      }

      // Fetch the updated coin details
      primaryCoinId = await client.getCoins({ coinType, owner: walletAddress });
      console.log("updatedCoins", primaryCoinId);
      if (primaryCoinId.data.length === 0) {
        console.error("No coins found for the address after merge");
        return;
      }

      // Get the primary coin with updated balance
      primaryCoinId = primaryCoinId.data[0].coinObjectId;
      // console.log("tx.gas", tx.splitCoins({ coinType }, [tx.pure(1000000)]))
      // let [coin] = tx.splitCoins(coins?.nextCursor, [tx.pure(1000000)])
      console.log("coin", coins, primaryCoinId)
    }


    let paymentCoin = tx.splitCoins(tx.object(primaryCoinId), [tx.pure(MINT_FEE)]);
    console.log("paymentCoin", paymentCoin)
    const paymentCoinId = paymentCoin.id;
    console.log("paymentCoinId", primaryCoinId);

    tx.moveCall({
      target: "0x89065b7151bb4a18aed0a409d075336d67b2e766e5c67d9c7096e89c224f82fd::staking::stake",
      typeArguments: ["0x8cf30a95bfb2ce8fc0ed0e6ab0b7be83fe8864686d9cc34081dd52628ac4c8a5::NENE::NENE"],
      arguments: [
        tx.object("0x4b0a270e03b1702a6e77d45278007001d879b7e4cdd6de710b920735426cee27"),
        tx.object("0xbed80ff48430a07bdff9f60d3e9d8b977004c6d4023230475695612fd24aa3ae"),
        tx.pure(10),
        tx.object("0x1449caec2c1b1f45ad420c6a1e326da8ea2bb3ea5e39e956befbdf9fa7f59952"),
        tx.object("0x000000000000000000000000000000000000000000000000000000000000006"),
      ]
    });
    console.log("before sign")
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log("result", result);
    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log("transaction", transaction, transaction?.effects?.status?.status);
    if (transaction?.effects?.status?.status === "success") {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return error;
  }
};


export const unstake = async () => {
  const { keypair, walletAddress } = createWallet();
  if (!keypair) {
    console.error("Keypair is not initialized");
    return null;
  }

  try {
    // const tx = new Transaction();
    const client = getSuiClient(); // Fetch the coin details
    console.log("client: ", client)
    let coins = await client.getCoins({ coinType, owner: walletAddress });
    console.log("coins", coins);
    if (coins.data.length === 0) {
      console.error("No coins found for the address");
      return;
    }

    const tx = new Transaction();

    console.log("rd", walletAddress)
    tx.setGasBudget(1000000000);

    const sui = await client.getCoins({ owner: walletAddress });
    console.log("sui", sui);
    console.log("before sign")


    // Merge all coins into one
    let primaryCoinId = coins.data[0].coinObjectId;
    if (coins.data[0]?.balance < Number(MINT_FEE)) {
      const coinIdsToMerge = coins.data.slice(1).map(coin => coin.coinObjectId);

      if (coinIdsToMerge.length > 0) {
        const mergeTx = new Transaction();
        mergeTx.setGasBudget(MINT_FEE);

        console.log("Primary Coin ID: ", primaryCoinId);
        console.log("Coins to merge: ", coinIdsToMerge);

        mergeTx.mergeCoins(mergeTx.object(primaryCoinId), coinIdsToMerge.map(id => mergeTx.object(id)));

        // Sign and execute the merge transaction
        const mergeResult = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: mergeTx,
        });

        console.log("Merge Result: ", mergeResult);

        // Wait for the merge transaction to be confirmed
        const mergeTransaction = await client.waitForTransaction({
          digest: mergeResult.digest,
          options: {
            showEffects: true,
          },
        });

        console.log("Merge Transaction: ", mergeTransaction);

        if (mergeTransaction.effects.status.status !== "success") {
          console.error("Merge transaction failed");
          return;
        }
      } else {
        console.log("No additional coins to merge");
      }

      // Fetch the updated coin details
      primaryCoinId = await client.getCoins({ coinType, owner: walletAddress });
      console.log("updatedCoins", primaryCoinId);
      if (primaryCoinId.data.length === 0) {
        console.error("No coins found for the address after merge");
        return;
      }

      // Get the primary coin with updated balance
      primaryCoinId = primaryCoinId.data[0].coinObjectId;
      // console.log("tx.gas", tx.splitCoins({ coinType }, [tx.pure(1000000)]))
      // let [coin] = tx.splitCoins(coins?.nextCursor, [tx.pure(1000000)])
      console.log("coin", coins, primaryCoinId)
    }


    let paymentCoin = tx.splitCoins(tx.object(primaryCoinId), [tx.pure(MINT_FEE)]);
    console.log("paymentCoin", paymentCoin)
    const paymentCoinId = paymentCoin.id;
    console.log("paymentCoinId", primaryCoinId);

    tx.moveCall({
      target: "0x85ef92abee62db14c79a205364fa7f526cedd2fcfeedcad9928c92a4c56b31e0::staking::unstake",
      typeArguments: ["0x8cf30a95bfb2ce8fc0ed0e6ab0b7be83fe8864686d9cc34081dd52628ac4c8a5::NENE::NENE"],
      arguments: [
        tx.object("0xfe8098356d39356df4ccaa49bb5f4392c8d43498f5a292e36e9c79a03849e44c"),
        tx.object("0xbd47b37cf006ab68ec787a09643336cf49891b0a9876d2430d5ed784a3d073e2"),
        tx.object("0xfe5d4408c856dd237859948cfd0a51f9d26517831525c8d5b06c829428ea5af8"),
        tx.object("0x000000000000000000000000000000000000000000000000000000000000006"),
      ]
    });
    console.log("before sign")
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log("result", result);
    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log("transaction", transaction, transaction?.effects?.status?.status);
    if (transaction?.effects?.status?.status === "success") {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return error;
  }
};
