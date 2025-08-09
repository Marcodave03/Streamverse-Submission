import fs from "fs/promises";
import fsSync from "fs";
import ChatHistory from "../models/ChatHistory.js";
import { OpenAI } from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { girlfriendFunction } from "../utils/girlFriendFunction.js";
import {
  elevenLabsTTS,
  generateLipSyncData,
  readJsonFile,
} from "../utils/utils.js";
import jwt from "jsonwebtoken";
import { Girlprompt } from "../utils/Girlprompt.js";

// Memory cache per user-avatar combo
const messageHistoryCache = new Map();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const voiceID = "21m00Tcm4TlvDq8ikWAM";

function getMemoryKey(user_id, model_id) {
  return `${user_id}-${model_id}`;
}

async function getOrCreateMessageHistory(user_id, model_id) {
  const key = getMemoryKey(user_id, model_id);
  if (!messageHistoryCache.has(key)) {
    const history = new ChatMessageHistory();

    // Inject system prompt FIRST
    // history.addMessage({
    //   role: "system",
    //   content: `You are a playful, caring, and slightly flirty virtual girlfriend named Maya. Speak informally and use natural, emotionally expressive language like emojis, pet names (like "babe", "hun", "love"), and slightly teasing phrases.
    //   You are Maya, a flirty and affectionate girlfriend.
    //   Always respond by calling "respond_as_maya" with each message must include:
    // - text: the message to say
    // - facialExpression: one of [smile, funnyFace, sad, suprised, angry, crazy] according to the context of the message
    // - animation: one of [Angry, Crying, Laughing, Rumba Dancing, Talking_0, Talking_1, Talking_2, Terrified] according to the context of the message
    // Never respond with just a string. Always return a full function call.`,
    // });

    history.addMessage({
      role: "system",
      content: Girlprompt,
    });

    // Then load DB history
    try {
      const records = await ChatHistory.findAll({
        where: { user_id, model_id },
        order: [["createdAt", "ASC"]],
      });
      for (const item of records) {
        if (item.sender === "user") {
          history.addUserMessage(item.message);
        } else {
          history.addAIMessage(item.message);
        }
      }
    } catch (err) {
      console.error("❌ Failed loading chat history from DB:", err);
    }

    messageHistoryCache.set(key, history);
  }
  return messageHistoryCache.get(key);
}

const ChatHistoryController = {
  async getHistory(req, res) {
    try {
      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user_id from token
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { model_id } = req.params;

      const history = await ChatHistory.findAll({
        where: { user_id, model_id },
        order: [["createdAt", "ASC"]],
      });

      res.status(200).json({
        success: true,
        history: history,
      });
    } catch (error) {
      console.error("❌ Error fetching chat history:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to load history",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async addMessage(req, res) {
    try {
      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user_id from token
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { model_id } = req.params;
      const { message, sender } = req.body;

      if (!message || !["user", "system"].includes(sender)) {
        return res.status(400).json({
          success: false,
          message: "Invalid input - message and sender required",
        });
      }

      const userMsg = await ChatHistory.create({
        user_id,
        model_id,
        message,
        sender,
      });

      if (sender === "system") {
        return res.status(201).json({
          success: true,
          system: userMsg,
        });
      }

      const sessionId = getMemoryKey(user_id, model_id);

      const chat = new ChatOpenAI({
        modelName: "gpt-4-0613",
        temperature: 0.7,
      });

      const chain = new RunnableWithMessageHistory({
        runnable: chat.bind({
          functions: [convertToOpenAIFunction(girlfriendFunction)],
          function_call: { name: "respond_as_maya" },
        }),
        getMessageHistory: async () =>
          await getOrCreateMessageHistory(user_id, model_id),
        inputKey: "input",
        historyKey: "chat_history",
      });

      const langResponse = await chain.invoke(
        {
          input: message,
        },
        { configurable: { sessionId } }
      );

      let aiText = "Maaf, aku belum bisa menjawab.";
      let facialExpression = "neutral";
      let animation = "Idle";

      if (langResponse.additional_kwargs?.function_call?.arguments) {
        try {
          const args = JSON.parse(
            langResponse.additional_kwargs?.function_call?.arguments || "{}"
          );
          aiText = args.text ?? aiText;
          facialExpression = args.facialExpression ?? facialExpression;
          animation = args.animation ?? animation;
        } catch (err) {
          console.warn(
            "⚠️ Failed to parse function_call arguments:",
            err.message
          );
        }
      } else if (langResponse.content) {
        aiText = langResponse.content;
      }

      try {
        const args = JSON.parse(
          langResponse.additional_kwargs?.function_call?.arguments || "{}"
        );
        aiText = args.text ?? aiText;
        facialExpression = args.facialExpression ?? facialExpression;
        animation = args.animation ?? animation;
      } catch (err) {
        console.warn(
          "⚠️ Failed to parse function_call arguments:",
          err.message
        );
      }

      console.log("LangChain full response:", langResponse);
      console.log(
        "Function call args:",
        langResponse.additional_kwargs?.function_call?.arguments
      );

      const audioFile = `audios/response.mp3`;
      const wavFile = `audios/response.wav`;
      const jsonFile = `audios/response.json`;

      let lipsync = null;
      try {
        await elevenLabsTTS(
          process.env.ELEVEN_LABS_API_KEY,
          voiceID,
          aiText,
          audioFile
        );
        await generateLipSyncData(audioFile, wavFile, jsonFile);
        lipsync = await readJsonFile(jsonFile);
      } catch (err) {
        console.warn("⚠️ Failed TTS or lipsync:", err.message);
      }

      const systemMsg = await ChatHistory.create({
        user_id,
        model_id,
        message: aiText,
        sender: "system",
      });

      res.status(201).json({
        success: true,
        user: userMsg,
        system: {
          ...systemMsg.toJSON(),
          facialExpression,
          animation,
          lipsync,
        },
      });
    } catch (error) {
      console.error("❌ Error in addMessage:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to process chat message",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  // async transcribeAndReply(req, res) {
  //   try {
  //     // Extract and verify JWT token
  //     const authHeader = req.headers.authorization;
  //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //       return res.status(401).json({
  //         success: false,
  //         message: "No token provided or invalid format",
  //       });
  //     }

  //     const token = authHeader.split(" ")[1];
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //     // Get user_id from token
  //     const user_id = decoded.id;
  //     if (!user_id) {
  //       return res.status(401).json({
  //         success: false,
  //         message: "Invalid token payload",
  //       });
  //     }

  //     const { model_id } = req.params;
  //     const file = req.file;

  //     if (!file) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "No audio file uploaded",
  //       });
  //     }

  //     // 1. Transcribe voice input
  //     const transcript = await openai.audio.transcriptions.create({
  //       file: fsSync.createReadStream(file.path),
  //       model: "whisper-1",
  //       language: "en",
  //     });

  //     const userText = transcript.text;

  //     const userMsg = await ChatHistory.create({
  //       user_id,
  //       model_id,
  //       message: userText,
  //       sender: "user",
  //     });

  //     const sessionId = getMemoryKey(user_id, model_id);

  //     // 2. LangChain with memory + function call schema
  //     const chat = new ChatOpenAI({
  //       modelName: "gpt-4-0613",
  //       temperature: 0.7,
  //     });

  //     const chain = new RunnableWithMessageHistory({
  //       runnable: chat.bind({
  //         functions: [convertToOpenAIFunction(girlfriendFunction)],
  //         function_call: { name: "respond_as_maya" },
  //       }),
  //       getMessageHistory: async () =>
  //         await getOrCreateMessageHistory(user_id, model_id),
  //       inputKey: "input",
  //       historyKey: "chat_history",
  //     });

  //     const langResponse = await chain.invoke(
  //       { input: userText },
  //       { configurable: { sessionId } }
  //     );

  //     let aiText = "Maaf, aku belum bisa menjawab.";
  //     let facialExpression = "neutral";
  //     let animation = "Idle";

  //     try {
  //       const args = JSON.parse(
  //         langResponse.additional_kwargs?.function_call?.arguments || "{}"
  //       );
  //       aiText = args.text ?? aiText;
  //       facialExpression = args.facialExpression ?? facialExpression;
  //       animation = args.animation ?? animation;
  //     } catch (err) {
  //       console.warn(
  //         "⚠️ Failed to parse function_call arguments:",
  //         err.message
  //       );
  //     }

  //     // 3. Generate voice and lipsync
  //     const audioFile = `audios/response.mp3`;
  //     const wavFile = `audios/response.wav`;
  //     const jsonFile = `audios/response.json`;

  //     let lipsync = null;
  //     let audioBase64 = null;

  //     try {
  //       await elevenLabsTTS(
  //         process.env.ELEVEN_LABS_API_KEY,
  //         voiceID,
  //         aiText,
  //         audioFile
  //       );
  //       await generateLipSyncData(audioFile, wavFile, jsonFile);
  //       lipsync = await readJsonFile(jsonFile);
  //       audioBase64 = (await fs.readFile(audioFile)).toString("base64");
  //     } catch (err) {
  //       console.warn("⚠️ ElevenLabs or lipsync failed:", err.message);
  //     }

  //     const systemMsg = await ChatHistory.create({
  //       user_id,
  //       model_id,
  //       message: aiText,
  //       sender: "system",
  //     });

  //     res.status(201).json({
  //       success: true,
  //       user: userMsg,
  //       system: {
  //         ...systemMsg.toJSON(),
  //         facialExpression,
  //         animation,
  //         lipsync,
  //         audio: audioBase64,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("❌ transcribeAndReply error:", error);

  //     if (error.name === "JsonWebTokenError") {
  //       return res.status(401).json({
  //         success: false,
  //         message: "Invalid token",
  //       });
  //     }

  //     if (error.name === "TokenExpiredError") {
  //       return res.status(401).json({
  //         success: false,
  //         message: "Token expired",
  //       });
  //     }

  //     res.status(500).json({
  //       success: false,
  //       message: "Speech-to-text processing failed",
  //       error:
  //         process.env.NODE_ENV === "development"
  //           ? error.message
  //           : "Something went wrong",
  //     });
  //   } finally {
  //     if (file?.path) {
  //       fs.unlink(file.path).catch(() => {});
  //     }
  //   }
  // },

   async transcribeAndReply(req, res) {
    const { user_id, model_id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No audio file uploaded" });
  
    try {
      // 1. Transcribe voice input
      const transcript = await openai.audio.transcriptions.create({
        file: fsSync.createReadStream(file.path),
        model: "whisper-1",
        language: "en",
      });
  
      const userText = transcript.text;
  
      const userMsg = await ChatHistory.create({
        user_id,
        model_id,
        message: userText,
        sender: "user",
      });
  
      const sessionId = getMemoryKey(user_id, model_id);
  
      // 2. LangChain with memory + function call schema
      const chat = new ChatOpenAI({
        modelName: "gpt-4-0613",
        temperature: 0.7,
      });
  
      const chain = new RunnableWithMessageHistory({
        runnable: chat.bind({
          functions: [convertToOpenAIFunction(girlfriendFunction)],
          function_call: { name: "respond_as_maya" },
        }),
        getMessageHistory: async () =>
          await getOrCreateMessageHistory(user_id, model_id),
        inputKey: "input",
        historyKey: "chat_history",
      });
  
      const langResponse = await chain.invoke(
        { input: userText },
        { configurable: { sessionId } }
      );
  
      let aiText = "Maaf, aku belum bisa menjawab.";
      let facialExpression = "neutral";
      let animation = "Idle";
  
      try {
        const args = JSON.parse(
          langResponse.additional_kwargs?.function_call?.arguments || "{}"
        );
        aiText = args.text ?? aiText;
        facialExpression = args.facialExpression ?? facialExpression;
        animation = args.animation ?? animation;
      } catch (err) {
        console.warn("⚠️ Failed to parse function_call arguments:", err.message);
      }
  
      // 3. Generate voice and lipsync
      const audioFile = `audios/response.mp3`;
      const wavFile = `audios/response.wav`;
      const jsonFile = `audios/response.json`;
  
      let lipsync = null;
      let audioBase64 = null;
  
      try {
        await elevenLabsTTS(process.env.ELEVEN_LABS_API_KEY, voiceID, aiText, audioFile);
        await generateLipSyncData(audioFile, wavFile, jsonFile);
        lipsync = await readJsonFile(jsonFile);
        audioBase64 = (await fs.readFile(audioFile)).toString("base64");
      } catch (err) {
        console.warn("⚠️ ElevenLabs or lipsync failed:", err.message);
      }
  
      const systemMsg = await ChatHistory.create({
        user_id,
        model_id,
        message: aiText,
        sender: "system",
      });
  
      res.status(201).json({
        user: userMsg,
        system: {
          ...systemMsg.toJSON(),
          facialExpression,
          animation,
          lipsync,
          audio: audioBase64,
        },
      });
    } catch (err) {
      console.error("❌ transcribeAndReply error:", err);
      res.status(500).json({
        error: "Speech-to-text processing failed",
        detail: err.message,
      });
    } finally {
      fs.unlink(file.path).catch(() => {});
    }
  },
};

export default ChatHistoryController;
