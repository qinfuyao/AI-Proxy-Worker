# Usage Examples

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Examples.en.md) | [🇨🇳 中文](./Examples.md)

</div>

Practical examples of integrating AI Proxy Worker with various programming languages and frameworks. Copy and adapt these examples for your specific use case.

## 🌐 Web Applications

### JavaScript (Vanilla)
Basic web implementation:

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Chat Demo</title>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <input type="text" id="user-input" placeholder="Type your message...">
        <button onclick="sendMessage()">Send</button>
    </div>

    <script>
        const PROXY_URL = 'https://your-worker.workers.dev';
        const PROXY_KEY = 'your-proxy-key';

        async function sendMessage() {
            const input = document.getElementById('user-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message to chat
            addMessage('user', message);
            input.value = '';
            
            try {
                const response = await fetch(`${PROXY_URL}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${PROXY_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'user', content: message }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                addMessage('assistant', data.choices[0].message.content);
                
            } catch (error) {
                console.error('Error:', error);
                addMessage('error', 'Failed to get response from AI');
            }
        }

        function addMessage(role, content) {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}`;
            messageDiv.textContent = `${role}: ${content}`;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        // Allow sending message with Enter key
        document.getElementById('user-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>

    <style>
        #chat-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        #messages {
            height: 400px;
            overflow-y: auto;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        
        .message {
            margin-bottom: 10px;
            padding: 5px;
        }
        
        .message.user {
            background-color: #e3f2fd;
        }
        
        .message.assistant {
            background-color: #f3e5f5;
        }
        
        .message.error {
            background-color: #ffebee;
            color: #c62828;
        }
        
        #user-input {
            width: 70%;
            padding: 10px;
            margin-right: 10px;
        }
        
        button {
            padding: 10px 20px;
            background-color: #2196f3;
            color: white;
            border: none;
            cursor: pointer;
        }
        
        button:hover {
            background-color: #1976d2;
        }
    </style>
</body>
</html>
```

### React.js
React component with streaming support:

```jsx
import React, { useState, useEffect } from 'react';

const PROXY_URL = 'https://your-worker.workers.dev';
const PROXY_KEY = 'your-proxy-key';

function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${PROXY_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PROXY_KEY}`,
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [...messages, userMessage],
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = { role: 'assistant', content: '' };
            
            setMessages(prev => [...prev, assistantMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            
                            if (content) {
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1].content += content;
                                    return updated;
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                role: 'error', 
                content: 'Failed to get response from AI' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <strong>{message.role}:</strong> {message.content}
                    </div>
                ))}
                {isLoading && <div className="loading">AI is thinking...</div>}
            </div>
            
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button onClick={sendMessage} disabled={isLoading}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
```

### Vue.js
Vue 3 composition API example:

```vue
<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="`message ${message.role}`"
      >
        <strong>{{ message.role }}:</strong> {{ message.content }}
      </div>
      <div v-if="isLoading" class="loading">AI is thinking...</div>
    </div>
    
    <div class="input-container">
      <input
        v-model="input"
        @keypress.enter="sendMessage"
        placeholder="Type your message..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';

const PROXY_URL = 'https://your-worker.workers.dev';
const PROXY_KEY = 'your-proxy-key';

const messages = ref([]);
const input = ref('');
const isLoading = ref(false);
const messagesContainer = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!input.value.trim()) return;

  const userMessage = { role: 'user', content: input.value };
  messages.value.push(userMessage);
  input.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    const response = await fetch(`${PROXY_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROXY_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages.value
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    messages.value.push({
      role: 'assistant',
      content: data.choices[0].message.content
    });
    
    scrollToBottom();

  } catch (error) {
    console.error('Error:', error);
    messages.value.push({
      role: 'error',
      content: 'Failed to get response from AI'
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Add welcome message
  messages.value.push({
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant. How can I help you today?'
  });
});
</script>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.messages {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background-color: #e3f2fd;
}

.message.assistant {
  background-color: #f3e5f5;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
}

.loading {
  font-style: italic;
  color: #666;
}

.input-container {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background-color: #1976d2;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
```

## 📱 Mobile Applications

### iOS (Swift)
Swift implementation with async/await:

```swift
import Foundation

class AIProxyService {
    private let proxyURL = "https://your-worker.workers.dev"
    private let proxyKey = "your-proxy-key"
    
    struct ChatRequest: Codable {
        let model: String
        let messages: [Message]
        let stream: Bool?
    }
    
    struct Message: Codable {
        let role: String
        let content: String
    }
    
    struct ChatResponse: Codable {
        let choices: [Choice]
    }
    
    struct Choice: Codable {
        let message: Message
    }
    
    func sendMessage(_ messages: [Message]) async throws -> String {
        guard let url = URL(string: "\(proxyURL)/chat") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(proxyKey)", forHTTPHeaderField: "Authorization")
        
        let chatRequest = ChatRequest(
            model: "deepseek-chat",
            messages: messages,
            stream: false
        )
        
        request.httpBody = try JSONEncoder().encode(chatRequest)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let chatResponse = try JSONDecoder().decode(ChatResponse.self, from: data)
        return chatResponse.choices.first?.message.content ?? ""
    }
}

// Usage in SwiftUI View
import SwiftUI

struct ChatView: View {
    @State private var messages: [AIProxyService.Message] = []
    @State private var inputText = ""
    @State private var isLoading = false
    
    private let aiService = AIProxyService()
    
    var body: some View {
        VStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 10) {
                    ForEach(messages.indices, id: \.self) { index in
                        MessageBubble(message: messages[index])
                    }
                    
                    if isLoading {
                        HStack {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("AI is thinking...")
                                .foregroundColor(.secondary)
                        }
                        .padding()
                    }
                }
            }
            
            HStack {
                TextField("Type your message...", text: $inputText)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(isLoading)
                
                Button("Send") {
                    Task {
                        await sendMessage()
                    }
                }
                .disabled(inputText.isEmpty || isLoading)
            }
            .padding()
        }
        .navigationTitle("AI Chat")
    }
    
    private func sendMessage() async {
        let userMessage = AIProxyService.Message(role: "user", content: inputText)
        messages.append(userMessage)
        
        let currentInput = inputText
        inputText = ""
        isLoading = true
        
        do {
            let response = try await aiService.sendMessage(messages)
            let assistantMessage = AIProxyService.Message(role: "assistant", content: response)
            messages.append(assistantMessage)
        } catch {
            let errorMessage = AIProxyService.Message(role: "error", content: "Failed to get response: \(error.localizedDescription)")
            messages.append(errorMessage)
        }
        
        isLoading = false
    }
}

struct MessageBubble: View {
    let message: AIProxyService.Message
    
    var body: some View {
        HStack {
            if message.role == "user" {
                Spacer()
            }
            
            VStack(alignment: .leading) {
                Text(message.role.capitalized)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(message.content)
                    .padding()
                    .background(backgroundColor)
                    .cornerRadius(10)
            }
            
            if message.role == "assistant" || message.role == "error" {
                Spacer()
            }
        }
        .padding(.horizontal)
    }
    
    private var backgroundColor: Color {
        switch message.role {
        case "user":
            return .blue.opacity(0.2)
        case "assistant":
            return .purple.opacity(0.2)
        case "error":
            return .red.opacity(0.2)
        default:
            return .gray.opacity(0.2)
        }
    }
}
```

### Android (Kotlin)
Kotlin implementation with Retrofit:

```kotlin
// API Service Interface
interface AIProxyService {
    @POST("chat")
    suspend fun sendMessage(
        @Header("Authorization") authorization: String,
        @Body request: ChatRequest
    ): Response<ChatResponse>
}

// Data Classes
data class ChatRequest(
    val model: String,
    val messages: List<Message>,
    val stream: Boolean = false
)

data class Message(
    val role: String,
    val content: String
)

data class ChatResponse(
    val choices: List<Choice>
)

data class Choice(
    val message: Message
)

// Repository
class AIRepository {
    private val proxyKey = "your-proxy-key"
    private val service = Retrofit.Builder()
        .baseUrl("https://your-worker.workers.dev/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(AIProxyService::class.java)
    
    suspend fun sendMessage(messages: List<Message>): Result<String> {
        return try {
            val request = ChatRequest(
                model = "deepseek-chat",
                messages = messages
            )
            
            val response = service.sendMessage("Bearer $proxyKey", request)
            
            if (response.isSuccessful) {
                val content = response.body()?.choices?.firstOrNull()?.message?.content
                if (content != null) {
                    Result.success(content)
                } else {
                    Result.failure(Exception("Empty response"))
                }
            } else {
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// ViewModel
class ChatViewModel : ViewModel() {
    private val repository = AIRepository()
    
    private val _messages = MutableLiveData<List<Message>>()
    val messages: LiveData<List<Message>> = _messages
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    fun sendMessage(content: String) {
        val currentMessages = _messages.value?.toMutableList() ?: mutableListOf()
        val userMessage = Message("user", content)
        currentMessages.add(userMessage)
        _messages.value = currentMessages
        
        _isLoading.value = true
        
        viewModelScope.launch {
            repository.sendMessage(currentMessages).fold(
                onSuccess = { response ->
                    currentMessages.add(Message("assistant", response))
                    _messages.value = currentMessages
                },
                onFailure = { error ->
                    currentMessages.add(Message("error", "Failed to get response: ${error.message}"))
                    _messages.value = currentMessages
                }
            )
            _isLoading.value = false
        }
    }
}

// Activity/Fragment
class ChatActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChatBinding
    private lateinit var viewModel: ChatViewModel
    private lateinit var adapter: MessageAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[ChatViewModel::class.java]
        
        setupRecyclerView()
        observeViewModel()
        setupClickListeners()
    }
    
    private fun setupRecyclerView() {
        adapter = MessageAdapter()
        binding.recyclerViewMessages.adapter = adapter
        binding.recyclerViewMessages.layoutManager = LinearLayoutManager(this)
    }
    
    private fun observeViewModel() {
        viewModel.messages.observe(this) { messages ->
            adapter.submitList(messages)
            binding.recyclerViewMessages.scrollToPosition(messages.size - 1)
        }
        
        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.buttonSend.isEnabled = !isLoading
        }
    }
    
    private fun setupClickListeners() {
        binding.buttonSend.setOnClickListener {
            val message = binding.editTextMessage.text.toString().trim()
            if (message.isNotEmpty()) {
                viewModel.sendMessage(message)
                binding.editTextMessage.text.clear()
            }
        }
    }
}
```

## 🖥️ Desktop Applications

### Python
Python desktop application with tkinter:

```python
import tkinter as tk
from tkinter import scrolledtext, messagebox
import requests
import json
import threading
from typing import List, Dict

class AIProxyClient:
    def __init__(self, proxy_url: str, proxy_key: str):
        self.proxy_url = proxy_url
        self.proxy_key = proxy_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {proxy_key}',
            'Content-Type': 'application/json'
        })
    
    def send_message(self, messages: List[Dict[str, str]]) -> str:
        try:
            response = self.session.post(
                f'{self.proxy_url}/chat',
                json={
                    'model': 'deepseek-chat',
                    'messages': messages
                },
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            return data['choices'][0]['message']['content']
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Invalid response format: {str(e)}")

class ChatGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("AI Chat Assistant")
        self.root.geometry("600x500")
        
        # Initialize AI client
        self.ai_client = AIProxyClient(
            proxy_url="https://your-worker.workers.dev",
            proxy_key="your-proxy-key"
        )
        
        self.messages = []
        self.setup_ui()
        
    def setup_ui(self):
        # Chat display area
        self.chat_display = scrolledtext.ScrolledText(
            self.root,
            wrap=tk.WORD,
            state=tk.DISABLED,
            height=20,
            font=('Arial', 10)
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Input frame
        input_frame = tk.Frame(self.root)
        input_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Message input
        self.message_entry = tk.Entry(input_frame, font=('Arial', 10))
        self.message_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        self.message_entry.bind('<Return>', self.send_message)
        
        # Send button
        self.send_button = tk.Button(
            input_frame,
            text="Send",
            command=self.send_message,
            font=('Arial', 10),
            bg='#2196f3',
            fg='white',
            relief=tk.FLAT,
            padx=20
        )
        self.send_button.pack(side=tk.RIGHT)
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        status_bar = tk.Label(
            self.root,
            textvariable=self.status_var,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Add welcome message
        self.add_message("assistant", "Hello! I'm your AI assistant. How can I help you today?")
    
    def add_message(self, role: str, content: str):
        self.chat_display.config(state=tk.NORMAL)
        
        # Add role label
        self.chat_display.insert(tk.END, f"{role.title()}: ", f"{role}_label")
        
        # Add message content
        self.chat_display.insert(tk.END, f"{content}\n\n")
        
        # Configure tags for styling
        self.chat_display.tag_config("user_label", foreground="blue", font=('Arial', 10, 'bold'))
        self.chat_display.tag_config("assistant_label", foreground="purple", font=('Arial', 10, 'bold'))
        self.chat_display.tag_config("error_label", foreground="red", font=('Arial', 10, 'bold'))
        
        self.chat_display.config(state=tk.DISABLED)
        self.chat_display.see(tk.END)
    
    def send_message(self, event=None):
        message = self.message_entry.get().strip()
        if not message:
            return
        
        # Add user message
        self.add_message("user", message)
        self.messages.append({"role": "user", "content": message})
        
        # Clear input
        self.message_entry.delete(0, tk.END)
        
        # Disable send button and show loading
        self.send_button.config(state=tk.DISABLED)
        self.status_var.set("AI is thinking...")
        
        # Send request in background thread
        threading.Thread(target=self.get_ai_response, daemon=True).start()
    
    def get_ai_response(self):
        try:
            response = self.ai_client.send_message(self.messages)
            
            # Update UI in main thread
            self.root.after(0, lambda: self.handle_ai_response(response))
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.root.after(0, lambda: self.handle_error(error_msg))
    
    def handle_ai_response(self, response: str):
        self.add_message("assistant", response)
        self.messages.append({"role": "assistant", "content": response})
        
        # Re-enable send button
        self.send_button.config(state=tk.NORMAL)
        self.status_var.set("Ready")
        self.message_entry.focus()
    
    def handle_error(self, error_msg: str):
        self.add_message("error", error_msg)
        
        # Re-enable send button
        self.send_button.config(state=tk.NORMAL)
        self.status_var.set("Ready")
        self.message_entry.focus()
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = ChatGUI()
    app.run()
```

## 🔧 Backend Integration

### Node.js/Express
Express middleware for proxying AI requests:

```javascript
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const PROXY_URL = 'https://your-worker.workers.dev';
const PROXY_KEY = 'your-proxy-key';

// Middleware to proxy AI requests
app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch(`${PROXY_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PROXY_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).json({
            error: 'ai_proxy_error',
            message: 'Failed to get AI response'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Python FastAPI
FastAPI implementation with streaming support:

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
import httpx
import json
from typing import List, Dict, Optional
from pydantic import BaseModel

app = FastAPI(title="AI Proxy Backend")

PROXY_URL = "https://your-worker.workers.dev"
PROXY_KEY = "your-proxy-key"

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: List[Message]
    stream: Optional[bool] = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{PROXY_URL}/chat",
                json=request.dict(exclude_none=True),
                headers={
                    "Authorization": f"Bearer {PROXY_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Proxy request failed: {str(e)}")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

@app.post("/api/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    request.stream = True
    
    async def generate():
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream(
                    "POST",
                    f"{PROXY_URL}/chat",
                    json=request.dict(exclude_none=True),
                    headers={
                        "Authorization": f"Bearer {PROXY_KEY}",
                        "Content-Type": "application/json"
                    }
                ) as response:
                    response.raise_for_status()
                    
                    async for chunk in response.aiter_text():
                        if chunk:
                            yield chunk
                            
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-01-01T00:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 📊 Testing Examples

### Unit Tests (Jest)
JavaScript testing examples:

```javascript
// ai-proxy-client.test.js
const AIProxyClient = require('./ai-proxy-client');

describe('AIProxyClient', () => {
    let client;
    
    beforeEach(() => {
        client = new AIProxyClient(
            'https://test-worker.workers.dev',
            'test-proxy-key'
        );
    });
    
    test('should send chat message successfully', async () => {
        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{
                    message: {
                        role: 'assistant',
                        content: 'Hello! How can I help you?'
                    }
                }]
            })
        });
        
        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await client.sendMessage(messages);
        
        expect(response).toBe('Hello! How can I help you?');
        expect(fetch).toHaveBeenCalledWith(
            'https://test-worker.workers.dev/chat',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-proxy-key'
                })
            })
        );
    });
    
    test('should handle API errors gracefully', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });
        
        const messages = [{ role: 'user', content: 'Hello' }];
        
        await expect(client.sendMessage(messages))
            .rejects.toThrow('HTTP error! status: 500');
    });
});
```

---

**Ready to integrate?** 🚀

Choose the example that best fits your technology stack and customize it for your specific needs. All examples include proper error handling and can be extended with additional features like conversation history, user authentication, and more.
