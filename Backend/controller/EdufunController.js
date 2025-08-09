// controllers/EduFunController.js
// import path from "path";
// import { fileURLToPath } from "url";
import fs from "fs/promises";
import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { girlfriendFunction } from "../utils/girlFriendFunction.js";
import { hederaTutorFunction } from "../utils/hederaTutorFunction.js";
import {
  elevenLabsTTS,
  generateLipSyncData,
  readJsonFile,
} from "../utils/utils.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export const getLessonList = (req, res) => {
//   // Hardcoded lesson list for simplicity
//   const lessons = [
//     { id: "intro-hedera", title: "Intro to Hedera" },
//     { id: "create-account", title: "Create a Hedera Testnet Account" },
//     { id: "send-hbar", title: "Transfer HBAR using SDK" },
//     { id: "use-topic", title: "Publish to a Topic (HCS)" },
//   ];
//   res.json(lessons);
// };

// export const getLessonContent = (req, res) => {
//   const { id } = req.params;
//   // In a real project you may load HTML/JSON from file
//   // Here we simulate sandbox content
//   const sandboxTemplates = {
//     "intro-hedera":
//       "<h2>What is Hedera?</h2><p>Hedera is a public network...</p>",
//     "create-account":
//       "<h2>Create Account</h2><p>Use the SDK to create a testnet account.</p>",
//     "send-hbar": "<h2>Transfer HBAR</h2><pre>// code to send HBAR</pre>",
//     "use-topic": "<h2>HCS Demo</h2><pre>// code to publish message</pre>",
//   };

//   if (sandboxTemplates[id]) {
//     res.send(sandboxTemplates[id]);
//   } else {
//     res.status(404).send("Lesson not found");
//   }
// };

const voiceID = "21m00Tcm4TlvDq8ikWAM";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const GPTHelpController = {
  async chat(req, res) {
    try {
      const { message, mode } = req.body;

      const activeFunction =
        mode === "respond_as_maya" ? hederaTutorFunction : girlfriendFunction;

      if (!message) {
        return res
          .status(400)
          .json({ success: false, message: "Message required" });
      }

      // 💬 Strict prompt to enforce function call format
      let systemPrompt = `You are Maya, a flirty and affectionate virtual girlfriend. 
You MUST respond using the function call "respond_as_maya" and NEVER with plain text. 
Always include the following fields:
- text (required)
- facialExpression: one of [smile, sad, crazy, angry, surprised]
- animation: one of [Laughing, Talking_1, Crying, Dancing, Idle]`;

      if (mode === "respond_as_maya_a_hedera_tutor") {
        systemPrompt = `You are Maya, an expert tutor in Hedera Hashgraph technologies.

Your job is to help users learn Hedera clearly and confidently. Speak in a warm, encouraging tone like a friendly tutor. Your response must be formatted for spoken delivery — short sentences, clear steps, and good pacing.

You MUST respond using the function call "respond_as_maya" and NEVER reply with plain text.

Your response should follow this format:

1. A **brief intro** (1–2 sentences) to explain the topic.
2. A **step-by-step walkthrough**:
   - Use numbered steps (1, 2, 3...) for clarity.
   - Each step should be short and simple (1–2 sentences max).
   - Use bold section titles like **Step 1: Create Token**
3. A **final practical tip**, warning, or encouragement.

Also, include:
- facialExpression: choose from [smile, surprised]
- animation: choose from [Talking_1, Dancing, Idle]

Avoid long paragraphs. Use line breaks between numbered sections to make the speech easy to follow.
`;
      }

      const chat = new ChatOpenAI({
        modelName: "gpt-4-0613",
        temperature: 0.9,
      });

      const response = await chat.invoke(
        [new SystemMessage(systemPrompt), new HumanMessage(message)],
        {
          functions: [convertToOpenAIFunction(activeFunction)],
          function_call: { name: "respond_as_maya" }, // ✅ unified name
        }
      );

      let aiText = "Hmm, I'm not sure what to say.";
      let facialExpression = "neutral";
      let animation = "Idle";

      try {
        const raw =
          response.additional_kwargs?.function_call?.arguments || "{}";
        console.log("📦 Raw function call args:", raw);

        const cleaned =
          typeof raw === "string"
            ? raw
                .replace(/\\\s/g, "") // <-- remove bad escaped backslash-space
                .replace(/[\r\n\t]+/g, " ") // clean newlines, tabs
            : raw;

        let args = {};
        try {
          args = typeof cleaned === "string" ? JSON.parse(cleaned) : cleaned;
        } catch (err) {
          console.warn("⚠️ Still failed to parse cleaned args:", cleaned);
          throw err;
        }

        aiText =
          (typeof args.text === "string" ? args.text : args.text?.ssml) ??
          args.speech ??
          aiText;

        facialExpression = args.facialExpression ?? facialExpression;
        animation = args.animation ?? animation;
      } catch (err) {
        console.warn("⚠️ Parsing error:", err.message);
      }

      const audioFile = "audios/sidebar-response.mp3";
      const wavFile = "audios/sidebar-response.wav";
      const jsonFile = "audios/sidebar-response.json";

      let lipsync = null;
      let audioBase64 = null;

      try {
        await elevenLabsTTS(
          process.env.ELEVEN_LABS_API_KEY,
          voiceID,
          aiText,
          audioFile
        );

        await generateLipSyncData(audioFile, wavFile, jsonFile);
        lipsync = await readJsonFile(jsonFile);
        audioBase64 = (await fs.readFile(audioFile)).toString("base64");
      } catch (err) {
        if (
          err?.message?.includes("quota_exceeded") ||
          err?.message?.includes("quota") ||
          err?.message?.includes("insufficient")
        ) {
          console.warn(
            "⚠️ ElevenLabs quota exceeded, skipping audio and lipsync"
          );
        } else {
          console.warn("⚠️ ElevenLabs or lipsync failed:", err.message);
        }
      }

      return res.status(200).json({
        success: true,
        maya: {
          text: aiText,
          facialExpression,
          animation,
          lipsync,
          audio: audioBase64,
        },
      });
    } catch (error) {
      console.error("❌ GPTHelpController error:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  },
};

// const audioDir = path.resolve("audios");

// export const LessonAudioController = {
//   async getLessonAudio(req, res) {
//     const { lessonId } = req.params;

//     // ✅ SANITIZE lessonId to prevent directory traversal
//     const safeLessonId = String(lessonId).replace(/[^0-9]/g, "");

//     // ✅ SUPPORT MULTIPLE FORMATS (optional: add more if needed)
//     const formats = [".mp3", ".wav"];
//     let audioBuffer = null;
//     let foundFormat = "";

//     for (const ext of formats) {
//       const candidatePath = path.join(audioDir, `Lesson${safeLessonId}${ext}`);
//       try {
//         audioBuffer = await fs.readFile(candidatePath);
//         foundFormat = ext.slice(1); // e.g., "mp3"
//         break;
//       } catch {
//         continue;
//       }
//     }

//     if (!audioBuffer) {
//       return res.status(404).json({
//         success: false,
//         message: `Audio file for Lesson ${safeLessonId} not found.`,
//       });
//     }

//     // ✅ RETURN base64 audio with format info
//     const audioBase64 = audioBuffer.toString("base64");
//     res.setHeader("Cache-Control", "public, max-age=86400"); // optional caching

//     res.status(200).json({
//       success: true,
//       audio: audioBase64,
//       format: foundFormat,
//       animation: "Talking_1",
//       duration: 14000,
//     });
//   },
// };