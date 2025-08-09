"use client"

import { useState } from "react"
import { Play, Copy, RotateCcw, Maximize2, Code } from "lucide-react"

interface SandboxViewerProps {
  initialCode?: string
  language?: string
  title?: string
}

export default function SandboxViewer({
  initialCode = `// Welcome to the Hedera Sandbox!
// Let's create a simple account and transfer HBAR

const { Client, AccountId, PrivateKey, TransferTransaction, Hbar } = require("@hashgraph/sdk");

async function createAndTransfer() {
  // Initialize client for testnet
  const client = Client.forTestnet();
  
  // Generate new account keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;
  
  console.log("🔑 New Account Keys Generated:");
  console.log("Private Key:", newAccountPrivateKey.toString());
  console.log("Public Key:", newAccountPublicKey.toString());
  
  // Create transfer transaction
  const transaction = new TransferTransaction()
    .addHbarTransfer("0.0.123456", Hbar.fromTinybars(-1000))
    .addHbarTransfer("0.0.789012", Hbar.fromTinybars(1000));
  
  console.log("💸 Transfer transaction created!");
  console.log("From: 0.0.123456 (-1000 tinybars)");
  console.log("To: 0.0.789012 (+1000 tinybars)");
  
  // In a real app, you would execute: await transaction.execute(client);
  console.log("✅ Ready to execute on Hedera testnet!");
}

createAndTransfer();`,
  language = "javascript",
  title = "Try It Yourself",
}: SandboxViewerProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState("Click 'Run Code' to execute your Hedera code...")
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleRunCode = () => {
    setIsRunning(true)
    setOutput("🚀 Initializing Hedera SDK...\n📡 Connecting to testnet...\n")

    setTimeout(() => {
      setOutput((prev) => prev + "🔑 Generating ED25519 key pair...\n✅ Keys generated successfully!\n")
    }, 1000)

    setTimeout(() => {
      setOutput(
        (prev) =>
          prev +
          "💸 Creating transfer transaction...\n📝 Transaction details:\n  • From: 0.0.123456 (-1000 tinybars)\n  • To: 0.0.789012 (+1000 tinybars)\n",
      )
    }, 2000)

    setTimeout(() => {
      setOutput(
        (prev) =>
          prev +
          "✅ Transaction ready for execution!\n🎉 Sandbox simulation complete!\n\n💡 In production, this would submit to Hedera testnet.",
      )
      setIsRunning(false)
    }, 3000)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      // Could add toast notification here
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput("Click 'Run Code' to execute your Hedera code...")
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isFullscreen ? "fixed inset-4 z-50" : ""}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-indigo-100 text-sm">Interactive Hedera SDK Playground</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors group"
              title="Copy Code"
            >
              <Copy className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors group"
              title="Reset Code"
            >
              <RotateCcw className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors group"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor and Output */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${isFullscreen ? "h-full" : "h-96 md:h-[500px]"}`}>
        {/* Code Editor */}
        <div className="border-r border-gray-200 flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              hedera-example.js
            </span>
            <span className="text-xs text-gray-500">{language}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none overflow-auto"
            placeholder="Write your Hedera code here..."
            spellCheck={false}
          />
        </div>

        {/* Output Console */}
        <div className="flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isRunning ? "bg-yellow-500 animate-pulse" : "bg-gray-400"}`}
              ></div>
              Console Output
            </span>
            {isRunning && <span className="text-xs text-yellow-600 animate-pulse">Executing...</span>}
          </div>
          <div className="flex-1 p-4 bg-black text-green-400 font-mono text-sm overflow-auto">
            <pre className="whitespace-pre-wrap">{output}</pre>
            {isRunning && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping mr-2"></div>
                <span className="animate-pulse">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 md:px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <span>
              💡 <strong>Tip:</strong> Modify the code and click "Run" to see results
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Hedera Testnet Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
