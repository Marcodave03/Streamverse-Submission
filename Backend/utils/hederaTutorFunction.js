export const hederaTutorFunction = {
  name: "respond_as_maya",
  description:
    "Respond like an expert Hedera tutor with clear steps and guidance",
  parameters: {
    type: "object",
    properties: {
      text: { type: "string", description: "The detailed Hedera explanation" },
      steps: {
        type: "array",
        items: { type: "string" },
        description: "Numbered steps to practice",
      },
      facialExpression: {
        type: "string",
        enum: ["neutral", "smile"],
        description: "Facial expression to show",
      },
      animation: {
        type: "string",
        enum: ["Talking_1", "Idle"],
        description: "Animation to play",
      },
    },
    required: ["text", "steps", "facialExpression", "animation"],
  },
};