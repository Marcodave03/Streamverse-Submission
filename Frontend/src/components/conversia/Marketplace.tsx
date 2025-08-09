import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type NFT = {
  objectId: string;
  name: string;
  image_url: string;
  metadata_url: string;
  sender?: string;
  owner?: string;
  objectType?: string;
  version?: number;
  digest?: string;
};

type MarketPlaceProps = {
  onClose: () => void;
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
  version: number;
  digest: string;
  content?: SuiObjectContent;
  owner?: string;
};

type SuiGetOwnedObjectsResponse = {
  jsonrpc: string;
  id: number;
  result: {
    data: {
      data: SuiObjectData;
      owner?: string;
      digest: string;
      version: number;
      objectType: string;
      sender?: string;
    }[];
  };
};

const MarketPlace: React.FC<MarketPlaceProps> = ({ onClose }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const SUI_ADDRESS =
    "0xcdf86d8b2bee2139300484722b7563b09cfba83d6e5dc745d8f9af82a354557a";

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch("https://fullnode.testnet.sui.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getOwnedObjects",
            params: [SUI_ADDRESS, { options: { showContent: true } }],
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
              sender: item.sender || "Unknown",
              owner: item.owner || "Unknown",
              objectType: item.data!.content?.type || "Unknown",
              version: item.data!.version || 0,
              digest: item.data!.digest || "Unknown",
            };
          });

        setNfts(avatarNfts);
      } catch (error) {
        console.error("❌ Failed to fetch NFTs:", error);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl h-[700px] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-3xl font-bold">Marketplace NFTs</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Content */}
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
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-4 cursor-pointer"
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
                      className="text-sm text-blue-500 underline"
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-6 shadow-lg relative">
            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close details"
            >
              <X size={28} />
            </button>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              {selectedNFT.name}
            </h3>

            <div className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
              <p>
                <strong>Object ID:</strong> {selectedNFT.objectId}
              </p>
              <p>
                <strong>Sender:</strong> {selectedNFT.sender}
              </p>
              <p>
                <strong>Owner:</strong> {selectedNFT.owner}
              </p>
              <p>
                <strong>Object Type:</strong> {selectedNFT.objectType}
              </p>
              <p>
                <strong>Version:</strong> {selectedNFT.version}
              </p>
              <p>
                <strong>Digest:</strong> {selectedNFT.digest}
              </p>
              <a
                href={selectedNFT.metadata_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Metadata JSON
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketPlace;
