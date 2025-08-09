import { useGLTF } from "@react-three/drei";

const modelsToPreload = [
  "/models/girl1.glb",
  "/models/girl2.glb",
  "/models/girl3.glb",
  "/models/girl4.glb",
  "/models/girl5.glb",
  "/models/girl6.glb",
  "/models/girl7.glb",
  "/models/girl8.glb",
  "/models/girl9.glb",
  "/models/girl10.glb",
  "/models/girl11.glb",
  "/models/girl12.glb",
];

export const preloadAllModels = () => {
  modelsToPreload.forEach((path: string) => {
    useGLTF.preload(path);
  });
};