// Define which animations are in the shared animations.glb file
export const sharedAnimations = [
  "Angry",
  "Crying",
  "Idle",
  "Laughing",
  "Rumba",
  "Talking_0",
  "Talking_1",
  "Talking_2",
  "Terrified",
]

// Check if an animation is in the shared file
export const isSharedAnimation = (animationName: string): boolean => {
  return sharedAnimations.includes(animationName)
}

export default { sharedAnimations, isSharedAnimation }
