import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type NFT = {
  objectId: string;
  name: string;
  image_url: string;
  metadata_url: string;
};

type NFTGalleryProps = {
  onClose: () => void;
  walletAddress: string;
  network: "mainnet" | "testnet";
};

type SuiObjectFields = {
  name: number[];
  url: number[];
  metadata_url: number[];
};

type SuiObjectContent = {
  type: string;
  fields: SuiObjectFields;
};

type SuiObjectData = {
  objectId: string;
  content?: SuiObjectContent;
};

type SuiGetOwnedObjectsResponse = {
  jsonrpc: string;
  id: number;
  result: {
    data: {
      data: SuiObjectData;
    }[];
  };
};

const NFTGallery: React.FC<NFTGalleryProps> = ({
  onClose,
  walletAddress,
  network,
}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [recipient, setRecipient] = useState<string>("");
  const [estimatedFee] = useState<number>(0.001); // Static for now

  const RPC_ENDPOINT =
    network === "mainnet"
      ? "https://fullnode.mainnet.sui.io"
      : "https://fullnode.testnet.sui.io";

  useEffect(() => {
    if (!walletAddress) {
      setNfts([]);
      return;
    }

    const fetchNFTs = async () => {
      try {
        const response = await fetch(RPC_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getOwnedObjects",
            params: [walletAddress, { options: { showContent: true } }],
          }),
        });

        const json: SuiGetOwnedObjectsResponse = await response.json();
        const objects = json.result.data;

        const avatarNfts: NFT[] = objects
          .filter((item) =>
            item.data?.content?.type.includes("AvatarNFT::Avatar")
          )
          .map((item) => {
            const fields = item.data!.content!.fields;
            const decoder = new TextDecoder();
            return {
              objectId: item.data!.objectId,
              name: decoder.decode(new Uint8Array(fields.name)),
              image_url: decoder.decode(new Uint8Array(fields.url)),
              metadata_url: decoder.decode(new Uint8Array(fields.metadata_url)),
            };
          });

        setNfts(avatarNfts);
      } catch (error) {
        console.error("❌ Failed to fetch NFTs:", error);
        setNfts([]);
      }
    };

    fetchNFTs();
  }, [walletAddress, network, RPC_ENDPOINT]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl h-[700px] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-3xl font-bold">Your NFTs</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6">
            {nfts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No NFTs found.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <div
                    key={nft.objectId}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col cursor-pointer"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <img
                      src={nft.image_url}
                      alt={nft.name}
                      className="w-full h-40 sm:h-64 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {nft.name}
                    </h3>
                    <a
                      href={nft.metadata_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-500 underline mt-1"
                    >
                      View Metadata
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 text-right text-sm text-gray-400">
            Powered by Sui Blockchain
          </div>
        </div>
      </div>

      {/* NFT Detail Popup */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl h-[700px] flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedNFT.name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedNFT(null);
                  setRecipient("");
                }}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-full flex justify-center">
                <img
                  src={selectedNFT.image_url}
                  alt={selectedNFT.name}
                  className="rounded-lg w-[50%] h-64 object-cover"
                />
              </div>

              <div>
                <p>
                  <strong>Object ID:</strong> {selectedNFT.objectId}
                </p>
                <p>
                  <strong>Metadata:</strong>{" "}
                  <a
                    href={selectedNFT.metadata_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View JSON
                  </a>
                </p>
              </div>

              <hr className="border-gray-300 dark:border-gray-700" />

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Transfer NFT
                </h4>

                <div>
                  <label className="block text-gray-500 dark:text-gray-400 mb-1">
                    Recipient Wallet Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
                    placeholder="e.g., 0xabc..."
                  />
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Estimated Fee:</span>
                  <span>{estimatedFee} SUI</span>
                </div>

                <Button
                  className="mt-2"
                  onClick={() => {
                    alert(`Transferring "${selectedNFT.name}" to ${recipient}`);
                  }}
                >
                  Confirm Transfer
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 text-right text-sm text-gray-400">
              Powered by Sui Blockchain
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTGallery;
