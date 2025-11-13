// Make sure this script is loaded AFTER main.js or after DOMContentLoaded

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat-button');
    const chatContainer = document.getElementById('chat-container');

    // --- AI Chat Functionality (Requires API Key & Backend/Serverless Function) ---
    // For a client-side only example, you'd need to use a service that offers
    // client-side APIs or a proxy. Using OpenAI directly from the client is insecure.
    // This example uses a placeholder. For real implementation:
    // - Use a backend server (Node.js/Express, Python/Flask) to handle API calls.
    // - Or use serverless functions (AWS Lambda, Google Cloud Functions).
    // - Securely store your API key on the server.

    const apiKey = 'YOUR_OPENAI_API_KEY'; // **NEVER expose this directly in client-side JS**
                                         // Use environment variables on your server.

    async function sendMessageToAI(message) {
        if (!message.trim()) return;

        // Display user's message
        appendMessage('user', message);
        chatInput.value = ''; // Clear input

        try {
            // --- Placeholder for actual API call ---
            // Replace this with your actual fetch request to your backend API endpoint
            // that then calls the OpenAI API.
            const response = await fetch('/api/chat', { // Your backend API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.reply || "Sorry, I couldn't process that."; // Assuming your backend returns { reply: '...' }

            // Display AI's response
            appendMessage('assistant', aiResponse);

        } catch (error) {
            console.error("Error sending message to AI:", error);
            appendMessage('assistant', 'Sorry, something went wrong. Please try again.');
        }
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('mb-4', 'flex', 'items-start', 'space-x-3');

        if (sender === 'user') {
            messageElement.classList.add('justify-end');
            messageElement.innerHTML = `
                <div class="bg-blue-500 text-white p-3 rounded-lg rounded-br-none shadow">
                    ${text}
                </div>
                <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">U</div>
            `;
        } else { // assistant
            messageElement.classList.add('justify-start');
            messageElement.innerHTML = `
                <div class="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-800 font-bold">AI</div>
                <div class="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none shadow">
                    ${text}
                </div>
            `;
        }
        chatContainer.appendChild(messageElement);
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Event listeners for chat
    if (sendChatButton && chatInput) {
        sendChatButton.addEventListener('click', () => {
            sendMessageToAI(chatInput.value);
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessageToAI(chatInput.value);
            }
        });
    }

    // Initial placeholder message or greeting
    if (chatContainer) {
        chatContainer.innerHTML = '<p class="text-center text-gray-500">How can I help you today?</p>';
    }

    // --- "Chat Us" / Contact Form Logic (can be same as above or simpler) ---
    // If you had a separate 'Chat Us' functionality beyond the AI, you'd implement it here.
    // For now, we've integrated a standard contact form on the dashboard.
});

// NOTE: For a real AI chat, you'd need a backend.
// Example backend structure (Node.js/Express):
/*
// server.js (simplified example)
require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // Serve your HTML/CSS/JS files

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or another model
      messages: [{ role: "user", content: message }],
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
*/