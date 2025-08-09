import React, { useState } from "react";
import Girl1 from "../../assets/girl1.png";
import Girl2 from "../../assets/girl2.png";
import Girl3 from "../../assets/girl3.png";
import Girl4 from "../../assets/girl4.png";
import Girl5 from "../../assets/girl5.png";
import Girl6 from "../../assets/girl6.png";
import Girl7 from "../../assets/girl7.png";
import Girl8 from "../../assets/girl8.png";
import Girl9 from "../../assets/girl9.png";
import Girl10 from "../../assets/girl10.png";
import Girl11 from "../../assets/girl11.png";
import Girl12 from "../../assets/girl12.png";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface Avatar {
  id: string;
  src: string;
  alt: string;
  modelUrl: string;
  owned: boolean;
}

interface AvatarPickProps {
  onClose: () => void;
  onSelectAvatar: (modelUrl: string, modelId: number) => void;
}

const modelIdToAvatarId: Record<number, string> = {
  1: "girl1",
  2: "girl2",
  3: "girl3",
  4: "girl4",
  5: "girl5",
  6: "girl6",
  7: "girl7",
  8: "girl8",
  9: "girl9",
  10: "girl10",
  11: "girl11",
  12: "girl12",
};

const avatarCatalog: Avatar[] = [
  {
    id: "girl1",
    src: Girl1,
    alt: "Amelia",
    modelUrl: "/models/girl1.glb",
    owned: true,
  },
  {
    id: "girl2",
    src: Girl2,
    alt: "Isabella",
    modelUrl: "/models/girl2.glb",
    owned: true,
  },
  {
    id: "girl3",
    src: Girl3,
    alt: "Sophia",
    modelUrl: "/models/girl3.glb",
    owned: true,
  },
  {
    id: "girl4",
    src: Girl4,
    alt: "Olivia",
    modelUrl: "/models/girl4.glb",
    owned: true,
  },
  {
    id: "girl5",
    src: Girl5,
    alt: "Emma",
    modelUrl: "/models/girl5.glb",
    owned: true,
  },
  {
    id: "girl6",
    src: Girl6,
    alt: "Mia",
    modelUrl: "/models/girl6.glb",
    owned: true,
  },
  {
    id: "girl7",
    src: Girl7,
    alt: "Ava",
    modelUrl: "/models/girl7.glb",
    owned: true,
  },
  {
    id: "girl8",
    src: Girl8,
    alt: "Charlotte",
    modelUrl: "/models/girl8.glb",
    owned: true,
  },
  {
    id: "girl9",
    src: Girl9,
    alt: "Lily",
    modelUrl: "/models/girl9.glb",
    owned: true,
  },
  {
    id: "girl10",
    src: Girl10,
    alt: "Grace",
    modelUrl: "/models/girl10.glb",
    owned: true,
  },
  {
    id: "girl11",
    src: Girl11,
    alt: "Chloe",
    modelUrl: "/models/girl11.glb",
    owned: true,
  },
  {
    id: "girl12",
    src: Girl12,
    alt: "Ella",
    modelUrl: "/models/girl12.glb",
    owned: true,
  },
];

const cn = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const AvatarPick: React.FC<AvatarPickProps> = ({ onClose, onSelectAvatar }) => {
  const [avatars] = useState<Avatar[]>(avatarCatalog);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl h-[700px] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-3xl font-bold">Pick Your Avatar</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Select your avatar below.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={cn(
                  "relative rounded-lg overflow-hidden border-4 transition-all cursor-pointer hover:shadow-lg",
                  selectedAvatar?.id === avatar.id
                    ? "border-blue-500"
                    : "border-transparent"
                )}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <div className="aspect-square relative">
                  <img
                    src={avatar.src}
                    alt={avatar.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  {avatar.alt}
                </div>
              </div>
            ))}
          </div>
        </div> 


        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => {
              if (selectedAvatar) {
                const modelId = Object.entries(modelIdToAvatarId).find(
                  ([, avatarId]) => avatarId === selectedAvatar.id
                )?.[0];
                if (modelId) {
                  onSelectAvatar(selectedAvatar.modelUrl, parseInt(modelId));
                  onClose();
                }
              }
            }}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedAvatar}
          >
            Select Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPick;
