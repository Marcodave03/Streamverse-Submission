import { useState } from "react"
import { Send, HelpCircle, Sparkles } from "lucide-react"
import { Textarea } from "./ui/textarea"

export function GPTHelpSidebar() {
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; answer: string }>>([])

  const askGPT = async () => {
    if (!question.trim()) return

    setIsLoading(true)

    // Simulate GPT response
    setTimeout(() => {
      const mockResponse = `Great question! Here's what you need to know about ${question.toLowerCase()}:

${
  question.toLowerCase().includes("account")
    ? `Hedera accounts are identified by Account IDs in the format 0.0.x. Each account has:
  • A unique Account ID
  • Associated cryptographic keys
  • An HBAR balance
  • Optional account properties

  To create an account, you need an existing account to pay the creation fee, or you can use the Hedera Portal for testnet accounts.`
    : question.toLowerCase().includes("transaction")
      ? `Hedera transactions are atomic operations that modify the ledger state. Key points:
  • All transactions require a fee paid in HBAR
  • Transactions have a unique Transaction ID
  • They must be signed by required keys
  • Consensus is reached in 3-5 seconds

  Common transaction types include transfers, smart contract calls, and token operations.`
      : `This is a context-aware response about Hedera Network concepts. The Hedera network uses a hashgraph consensus algorithm that provides:
  • Fast finality (3-5 seconds)
  • Low fees
  • High throughput
  • Energy efficiency

  Feel free to ask more specific questions about accounts, transactions, smart contracts, or tokens!`
}

Let me know if you need clarification on any part!`

      const newEntry = { question, answer: mockResponse }
      setChatHistory((prev) => [...prev, newEntry])
      setResponse(mockResponse)
      setQuestion("")
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Need Help?</h3>
          <p className="text-sm text-gray-500">Ask GPT about Hedera concepts</p>
        </div>
      </div>

      {/* Question Input */}
      <div className="mb-4">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything about Hedera Network, accounts, transactions, smart contracts..."
          className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Ask Button */}
      <button
        onClick={askGPT}
        disabled={isLoading || !question.trim()}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Thinking...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Ask GPT</span>
            <Send className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Response Area */}
      {(response || chatHistory.length > 0) && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Assistant Response
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-4">
            {chatHistory.map((entry, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="bg-indigo-50 p-3 rounded-lg mb-2">
                  <p className="text-sm font-medium text-indigo-800">Q: {entry.question}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{entry.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Help Topics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-3">Quick topics:</p>
        <div className="flex flex-wrap gap-2">
          {["Accounts", "Transactions", "Smart Contracts", "Tokens"].map((topic) => (
            <button
              key={topic}
              onClick={() => setQuestion(`Tell me about ${topic} in Hedera`)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 rounded-full transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GPTHelpSidebar
