import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import facialExpressions from "./constants/facialExpression";
import correspondingViseme from "./constants/visemeMap";
import animationFiles from "./constants/animationFiles";
import animationClipMap from "./constants/animationClipMap";
import { isSharedAnimation } from "./constants/animationSources";
import type { AvatarProps } from "./types/avatarTypes";
import { preloadAllModels } from "./constants/preloadAvatar";

// GLTF Model Type
type GLTFResult = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.Bone };
  materials: { [name: string]: THREE.Material };
  scene: THREE.Group;
};

export function Avatar({
  expression,
  animation,
  mouthCues = [],
  audioDuration = 0,
  modelUrl = "/models/girl4.glb",
}: AvatarProps) {
  preloadAllModels(); // Preload all models

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, scene } = useGLTF(modelUrl) as GLTFResult;

  // Determine which animation file to load based on animation name
  const resolvedAnimation = animation?.trim() || "Idle"; // Fallback to "Idle"
  const animationFile = isSharedAnimation(resolvedAnimation)
    ? "/models/girlAnimations/animations.glb"
    : `/models/girlAnimations/${resolvedAnimation}.glb`;

  console.log("Animation requested:", animation);
  console.log(
    "Is shared animation:",
    animation ? isSharedAnimation(animation) : false
  );
  console.log("Loading file:", animationFile);

  const { animations } = useGLTF(animationFile) as GLTFResult & {
    animations: THREE.AnimationClip[];
  };

  console.log(
    "Clips inside loaded file:",
    animations.map((a) => a.name)
  );

  const [blink, setBlink] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Play animation
  useEffect(() => {
    if (!group.current) return;

    // Dispose previous mixer if it exists
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current.uncacheRoot(group.current);
      mixerRef.current = null;
    }

    // Create new mixer for the current model
    const animationRoot = isSharedAnimation(resolvedAnimation)
      ? nodes.Hips // <-- the animated rig of your character!
      : group.current;

    mixerRef.current = new THREE.AnimationMixer(animationRoot!);
    console.log(
      "🎯 Mixer root:",
      isSharedAnimation(resolvedAnimation) ? "Hips" : "group"
    );

    console.log("🎛️ New mixer created for:", animationFile);
  }, [animationFile]); // 👈 IMPORTANT: reset mixer on file change

  useEffect(() => {
    if (!mixerRef.current || !animations || animations.length === 0) return;

    const actualClipName =
      animationClipMap[resolvedAnimation] || resolvedAnimation;
    const clip = animations.find((clip) => clip.name === actualClipName);
    if (!clip) return;

    // Stop previous actions except the new one
    // animations.forEach((clip) => {
    //   const action = mixerRef.current!.clipAction(clip);
    //   if (action !== newAction) {
    //     action.stop();
    //   }
    // });
    // Clean all previous actions before applying new one
    mixerRef.current.stopAllAction(); // Hard stop

    // Remove all cached clipActions (VERY IMPORTANT)
    animations.forEach((clip) => {
      mixerRef.current!.uncacheAction(clip);
    });

    const newAction = mixerRef.current.clipAction(clip);

    newAction.reset();
    newAction.timeScale = 1.0;

    newAction.fadeIn(0.3).play();

    return () => {
      newAction.fadeOut(0.3);
    };
  }, [animation, animations]);

  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 200);
      }, THREE.MathUtils.randInt(3000, 6000));
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Watch for mouthCues change -> reset timer
  useEffect(() => {
    if (mouthCues.length > 0) {
      setStartTime(performance.now());
    }
  }, [mouthCues]);

  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child) => {
      if ("morphTargetDictionary" in child) {
        const skinned = child as THREE.SkinnedMesh & {
          morphTargetInfluences: number[];
          morphTargetDictionary: { [key: string]: number };
        };
        const index = skinned.morphTargetDictionary[target];
        if (index !== undefined && skinned.morphTargetInfluences) {
          skinned.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            skinned.morphTargetInfluences[index] || 0,
            value,
            speed
          );
        }
      }
    });
  };

  // Map animation clips to actions for easy access (e.g., actions["Idle"])
  const actions: { [key: string]: THREE.AnimationAction } = {};
  if (mixerRef.current && animations) {
    animations.forEach((clip) => {
      actions[clip.name] = mixerRef.current!.clipAction(clip);
    });
  }

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    let talkingNow = false;

    if (startTime !== null && audioDuration > 0) {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed <= audioDuration / 1000) {
        talkingNow = true;
        let activeViseme: string | null = null;

        for (const cue of mouthCues) {
          if (elapsed >= cue.start && elapsed <= cue.end) {
            activeViseme =
              correspondingViseme[
                cue.value as keyof typeof correspondingViseme
              ];
            break;
          }
        }

        Object.values(correspondingViseme).forEach((viseme) => {
          lerpMorphTarget(viseme, viseme === activeViseme ? 1 : 0, 0.2);
        });
      } else {
        Object.values(correspondingViseme).forEach((viseme) => {
          lerpMorphTarget(viseme, 0, 0.2);
        });
      }
    }

    if (talkingNow !== isTalking) {
      setIsTalking(talkingNow);
      if (!talkingNow && actions["Idle"]) {
        actions["Idle"].reset().fadeIn(0.5).play();
      }
    }

    // Blinking
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.3);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.3);

    // Expression when not talking
    if (
      !talkingNow &&
      expression &&
      nodes.EyeLeft instanceof THREE.SkinnedMesh &&
      nodes.EyeLeft.morphTargetDictionary
    ) {
      const face: Record<string, number> =
        facialExpressions[expression as keyof typeof facialExpressions] || {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
        lerpMorphTarget(key, face[key] || 0, 0.1);
      });
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={nodes.Hips} />
      {/* Character Meshes */}
      {nodes.Wolf3D_Body instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Body.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Bottom instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Footwear instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Top instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
      )}
      {nodes.Wolf3D_Hair instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
      )}
      {nodes.EyeLeft instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
      )}
      {nodes.EyeRight instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Head instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Teeth instanceof THREE.SkinnedMesh && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
      )}
    </group>
  );
}

// Preload shared animations
useGLTF.preload("/models/girlAnimations/animations.glb");

// Preload individual animation files
// animationFiles.forEach((file: string) => {
//   useGLTF.preload(`/models/girlAnimations/${file}`);
// });

Object.keys(animationFiles).forEach((file) => {
  useGLTF.preload(`/models/girlAnimations/${file}.glb`);
});
