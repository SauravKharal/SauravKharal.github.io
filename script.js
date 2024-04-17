document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // Function to create chat bubble elements
    function createChatBubble(message, className) {
        const chatBubble = document.createElement("li");
        chatBubble.classList.add("chat", className);
        let chatContent;
        if (className === "outgoing") {
            chatContent = `<p>${message}</p>`;
        } else {
            chatContent = `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
        }
        chatBubble.innerHTML = chatContent;
        return chatBubble;
    }

    // Load chat history from session storage....
    function loadChatHistory() {
        const chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
        chatHistory.forEach(chatItem => {
            const chatBubble = createChatBubble(chatItem.message, chatItem.type);
            chatbox.appendChild(chatBubble);
        });
    }
    loadChatHistory();

    // Save chat message to session storage
    function saveChatMessage(type, message) {
        const chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
        chatHistory.push({ type, message });
        sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    // Function to handle sending messages
    function handleSendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Add the user message to the chat and session storage
        const outgoingBubble = createChatBubble(userMessage, "outgoing");
        chatbox.appendChild(outgoingBubble);
        saveChatMessage('outgoing', userMessage);

        // Clear the input area
        chatInput.value = "";

        // Send the message to the backend
        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        })
        .then(response => response.json())
        .then(data => {
            // Display the chatbot's response and save to session storage
            const incomingBubble = createChatBubble(data.message, "incoming");
            chatbox.appendChild(incomingBubble);
            saveChatMessage('incoming', data.message);
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the latest message
        });
    }

    // Event listeners
    sendChatBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent the default action to avoid breaking line
            handleSendMessage();
        }
    });
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
