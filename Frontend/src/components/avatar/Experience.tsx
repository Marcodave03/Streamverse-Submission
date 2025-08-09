import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";
import type { MouthCue } from "./types/avatarTypes"; // Import the MouthCue type from Avatar


type ExperienceProps = {
  expression: string | null;
  animation: string | null;
  mouthCues: MouthCue[];
  audioDuration: number;
  modelUrl: string;
};

export const Experience: React.FC<ExperienceProps > = ({
  expression,
  animation,
  mouthCues,
  audioDuration,
  modelUrl,
}) => {
  const cameraControls = useRef<CameraControls>(null);
  useEffect(() => {
    cameraControls.current?.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, [modelUrl]);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Avatar
        key={modelUrl}
        expression={expression}
        animation={animation}
        mouthCues={mouthCues}
        audioDuration={audioDuration}
        modelUrl={modelUrl}
      />
      <ContactShadows opacity={0.7} />
    </>
  );
};
