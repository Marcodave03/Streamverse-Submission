// // src/components/HashConnectManager.tsx

// import { useEffect, useRef, useState } from "react";
// import { HashConnect, HashConnectConnectionState, SessionData } from "hashconnect";
// import { LedgerId, AccountId  } from "@hashgraph/sdk";

// const APP_METADATA = {
//   name: "Conversia",
//   description: "Conversia AI avatar chat",
//   icons: ["https://your-app-icon-url.png"],
//   url: "https://your-dapp-url.com"
// };

// const PROJECT_ID = "your-project-id-here"; // TODO: Replace with actual ID
// const NETWORK = LedgerId.TESTNET; // or MAINNET if ready

// export const useHashConnect = () => {
//   const [state, setState] = useState<HashConnectConnectionState>(
//     HashConnectConnectionState.Disconnected
//   );
//   const [pairingData, setPairingData] = useState<SessionData | null>(null);
//   const hashconnectRef = useRef<HashConnect | null>(null);

//   useEffect(() => {
//     const initHashConnect = async () => {
//       const hc = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, true);
//       hashconnectRef.current = hc;

//       hc.connectionStatusChangeEvent.on((newStatus) => {
//         console.log("🔌 Connection state:", newStatus);
//         setState(newStatus);
//       });

//       hc.pairingEvent.on((newPairing) => {
//         console.log("🔗 Paired:", newPairing);
//         setPairingData(newPairing);

//         // Optional: Save to localStorage
//         localStorage.setItem("hashconnectAccountId", newPairing.accountIds[0]);
//         // Optional: trigger backend login if needed
//       });

//       hc.disconnectionEvent.on(() => {
//         console.log("❌ Disconnected");
//         setPairingData(null);
//         localStorage.removeItem("hashconnectAccountId");
//       });

//       const initData = await hc.init();
//       hc.openPairingModal(initData.pairingString);
//     };

//     initHashConnect();
//   }, []);

//   const sendTransaction = async (accountId: string, transaction: unknown) => {
//   try {
//     const hc = hashconnectRef.current;
//     if (!hc) throw new Error("HashConnect not initialized");

//     const result = await hc.sendTransaction(AccountId.fromString(accountId), transaction);
//     console.log("✅ TX Result:", result);
//     return result;
//   } catch (err) {
//     console.error("❌ TX Error:", err);
//     throw err;
//   }
// };

//   return { state, pairingData, sendTransaction };
// };
