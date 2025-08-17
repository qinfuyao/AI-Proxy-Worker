# 使用示例

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Examples.en.md) | [🇨🇳 中文](./Examples.md)

</div>

各种编程语言和框架集成 AI Proxy Worker 的实用示例。复制并调整这些示例以适应你的具体使用场景。

## 🌐 Web 应用

### JavaScript (原生)
基本网页实现：

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI 聊天演示</title>
    <meta charset="UTF-8">
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <input type="text" id="user-input" placeholder="输入你的消息...">
        <button onclick="sendMessage()">发送</button>
    </div>

    <script>
        const PROXY_URL = 'https://your-worker.workers.dev';
        const PROXY_KEY = 'your-proxy-key';

        async function sendMessage() {
            const input = document.getElementById('user-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // 添加用户消息到聊天
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
                    throw new Error(`HTTP 错误! 状态: ${response.status}`);
                }

                const data = await response.json();
                addMessage('assistant', data.choices[0].message.content);
                
            } catch (error) {
                console.error('错误:', error);
                addMessage('error', '获取 AI 响应失败');
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

        // 允许使用回车键发送消息
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
            background-color: #f9f9f9;
        }
        
        .message {
            margin-bottom: 10px;
            padding: 5px;
            border-radius: 5px;
        }
        
        .message.user {
            background-color: #e3f2fd;
            text-align: right;
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
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        
        button {
            padding: 10px 20px;
            background-color: #2196f3;
            color: white;
            border: none;
            border-radius: 5px;
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
支持流式响应的 React 组件：

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
                throw new Error(`HTTP 错误! 状态: ${response.status}`);
            }

            // 处理流式响应
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
                            console.error('解析块错误:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('错误:', error);
            setMessages(prev => [...prev, { 
                role: 'error', 
                content: '获取 AI 响应失败' 
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
                        <strong>{message.role === 'user' ? '用户' : message.role === 'assistant' ? '助手' : '错误'}:</strong> {message.content}
                    </div>
                ))}
                {isLoading && <div className="loading">AI 正在思考...</div>}
            </div>
            
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="输入你的消息..."
                    disabled={isLoading}
                />
                <button onClick={sendMessage} disabled={isLoading}>
                    发送
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
```

### Vue.js
Vue 3 组合式 API 示例：

```vue
<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        :class="`message ${message.role}`"
      >
        <strong>{{ getRoleText(message.role) }}:</strong> {{ message.content }}
      </div>
      <div v-if="isLoading" class="loading">AI 正在思考...</div>
    </div>
    
    <div class="input-container">
      <input
        v-model="input"
        @keypress.enter="sendMessage"
        placeholder="输入你的消息..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">
        发送
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

const getRoleText = (role) => {
  switch (role) {
    case 'user': return '用户';
    case 'assistant': return '助手';
    case 'error': return '错误';
    default: return role;
  }
};

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
      throw new Error(`HTTP 错误! 状态: ${response.status}`);
    }

    const data = await response.json();
    messages.value.push({
      role: 'assistant',
      content: data.choices[0].message.content
    });
    
    scrollToBottom();

  } catch (error) {
    console.error('错误:', error);
    messages.value.push({
      role: 'error',
      content: '获取 AI 响应失败'
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // 添加欢迎消息
  messages.value.push({
    role: 'assistant',
    content: '你好！我是你的 AI 助手。今天我能为你做些什么？'
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
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.message.user {
  background-color: #e3f2fd;
  text-align: right;
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
  text-align: center;
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

## 📱 移动应用

### iOS (Swift)
使用 async/await 的 Swift 实现：

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

// SwiftUI 视图中的使用
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
                            Text("AI 正在思考...")
                                .foregroundColor(.secondary)
                        }
                        .padding()
                    }
                }
            }
            
            HStack {
                TextField("输入你的消息...", text: $inputText)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(isLoading)
                
                Button("发送") {
                    Task {
                        await sendMessage()
                    }
                }
                .disabled(inputText.isEmpty || isLoading)
            }
            .padding()
        }
        .navigationTitle("AI 聊天")
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
            let errorMessage = AIProxyService.Message(role: "error", content: "获取响应失败: \(error.localizedDescription)")
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
                Text(getRoleText(message.role))
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
    
    private func getRoleText(_ role: String) -> String {
        switch role {
        case "user": return "用户"
        case "assistant": return "助手"
        case "error": return "错误"
        default: return role
        }
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

## 🖥️ 桌面应用

### Python
使用 tkinter 的 Python 桌面应用：

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
            raise Exception(f"请求失败: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"无效的响应格式: {str(e)}")

class ChatGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("AI 聊天助手")
        self.root.geometry("600x500")
        
        # 初始化 AI 客户端
        self.ai_client = AIProxyClient(
            proxy_url="https://your-worker.workers.dev",
            proxy_key="your-proxy-key"
        )
        
        self.messages = []
        self.setup_ui()
        
    def setup_ui(self):
        # 聊天显示区域
        self.chat_display = scrolledtext.ScrolledText(
            self.root,
            wrap=tk.WORD,
            state=tk.DISABLED,
            height=20,
            font=('微软雅黑', 10)
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 输入框架
        input_frame = tk.Frame(self.root)
        input_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # 消息输入
        self.message_entry = tk.Entry(input_frame, font=('微软雅黑', 10))
        self.message_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        self.message_entry.bind('<Return>', self.send_message)
        
        # 发送按钮
        self.send_button = tk.Button(
            input_frame,
            text="发送",
            command=self.send_message,
            font=('微软雅黑', 10),
            bg='#2196f3',
            fg='white',
            relief=tk.FLAT,
            padx=20
        )
        self.send_button.pack(side=tk.RIGHT)
        
        # 状态栏
        self.status_var = tk.StringVar()
        self.status_var.set("就绪")
        status_bar = tk.Label(
            self.root,
            textvariable=self.status_var,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # 添加欢迎消息
        self.add_message("assistant", "你好！我是你的 AI 助手。今天我能为你做些什么？")
    
    def add_message(self, role: str, content: str):
        self.chat_display.config(state=tk.NORMAL)
        
        # 添加角色标签
        role_text = {"user": "用户", "assistant": "助手", "error": "错误"}.get(role, role)
        self.chat_display.insert(tk.END, f"{role_text}: ", f"{role}_label")
        
        # 添加消息内容
        self.chat_display.insert(tk.END, f"{content}\n\n")
        
        # 配置标签样式
        self.chat_display.tag_config("user_label", foreground="blue", font=('微软雅黑', 10, 'bold'))
        self.chat_display.tag_config("assistant_label", foreground="purple", font=('微软雅黑', 10, 'bold'))
        self.chat_display.tag_config("error_label", foreground="red", font=('微软雅黑', 10, 'bold'))
        
        self.chat_display.config(state=tk.DISABLED)
        self.chat_display.see(tk.END)
    
    def send_message(self, event=None):
        message = self.message_entry.get().strip()
        if not message:
            return
        
        # 添加用户消息
        self.add_message("user", message)
        self.messages.append({"role": "user", "content": message})
        
        # 清空输入
        self.message_entry.delete(0, tk.END)
        
        # 禁用发送按钮并显示加载状态
        self.send_button.config(state=tk.DISABLED)
        self.status_var.set("AI 正在思考...")
        
        # 在后台线程中发送请求
        threading.Thread(target=self.get_ai_response, daemon=True).start()
    
    def get_ai_response(self):
        try:
            response = self.ai_client.send_message(self.messages)
            
            # 在主线程中更新 UI
            self.root.after(0, lambda: self.handle_ai_response(response))
            
        except Exception as e:
            error_msg = f"错误: {str(e)}"
            self.root.after(0, lambda: self.handle_error(error_msg))
    
    def handle_ai_response(self, response: str):
        self.add_message("assistant", response)
        self.messages.append({"role": "assistant", "content": response})
        
        # 重新启用发送按钮
        self.send_button.config(state=tk.NORMAL)
        self.status_var.set("就绪")
        self.message_entry.focus()
    
    def handle_error(self, error_msg: str):
        self.add_message("error", error_msg)
        
        # 重新启用发送按钮
        self.send_button.config(state=tk.NORMAL)
        self.status_var.set("就绪")
        self.message_entry.focus()
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = ChatGUI()
    app.run()
```

## 🔧 后端集成

### Node.js/Express
用于代理 AI 请求的 Express 中间件：

```javascript
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const PROXY_URL = 'https://your-worker.workers.dev';
const PROXY_KEY = 'your-proxy-key';

// 代理 AI 请求的中间件
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
            throw new Error(`代理错误: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('AI 代理错误:', error);
        res.status(500).json({
            error: 'ai_proxy_error',
            message: '获取 AI 响应失败'
        });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
```

---

**准备好集成了吗？** 🚀

选择最适合你技术栈的示例，并根据你的具体需求进行定制。所有示例都包含适当的错误处理，可以扩展更多功能，如对话历史、用户认证等。
