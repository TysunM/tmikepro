document.addEventListener('DOMContentLoaded', () => {
  
  // --- STATE ---
  let currentUser = null;
  let chatHistory = [];
  let chatSessionId = crypto.randomUUID();

  // --- SELECTORS ---
  const loader = document.getElementById('loader-wrapper');
  const mainContent = document.getElementById('main-content');
  const loginLink = document.getElementById('login-link');
  const signupLink = document.getElementById('signup-link');
  const dashboardLink = document.getElementById('dashboard-link');
  const logoutLink = document.getElementById('logout-link');
  const welcomeMessage = document.getElementById('welcome-message');
  const chatbotWidgetContainer = document.getElementById('ai-chatbot-widget');

  // --- 1. INITIALIZATION ---
  const init = async () => {
    // Check auth status first
    await checkAuthStatus();
    
    // Page-specific initializations
    if (document.getElementById('contact-form')) {
      initContactForm();
    }
    if (document.querySelectorAll('.purchase-btn').length > 0) {
      initPurchaseButtons();
    }
    
    // Init chatbot if user is logged in
    if (currentUser && chatbotWidgetContainer) {
      initChatbot();
    }
    
    // Fade in content
    showPageContent();
  };

  // --- 2. PAGE LOADER ---
  const showPageContent = () => {
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }
    if (mainContent) {
      mainContent.style.visibility = 'visible';
      mainContent.style.opacity = '1';
    }
  };
  
  // Fallback for loader
  setTimeout(showPageContent, 1500);

  // --- 3. AUTHENTICATION ---
  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (!res.ok) {
        throw new Error('Not authenticated');
      }
      const data = await res.json();
      
      if (data.isAuthenticated) {
        currentUser = data.user;
        updateNav(true);
        if (welcomeMessage) {
          welcomeMessage.textContent = `Welcome, ${currentUser.email}!`;
        }
      } else {
        throw new Error('Not authenticated');
      }
    } catch (err) {
      currentUser = null;
      updateNav(false);
      // Protect dashboard
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login?redirect=dashboard';
      }
      // Protect purchase page
      if (window.location.pathname.startsWith('/purchase')) {
         // This is handled by purchase.js, but good to have a fallback
      }
    }
  };

  const updateNav = (isLoggedIn) => {
    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'block';
    if (signupLink) signupLink.style.display = isLoggedIn ? 'none' : 'block';
    if (dashboardLink) dashboardLink.style.display = isLoggedIn ? 'block' : 'none';
    if (logoutLink) {
      logoutLink.style.display = isLoggedIn ? 'block' : 'none';
      if (isLoggedIn) {
        logoutLink.addEventListener('click', handleLogout);
      }
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // --- 4. CONTACT FORM ---
  const initContactForm = () => {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      formStatus.textContent = 'Sending...';
      formStatus.className = 'form-status';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        const responseData = await res.json();
        
        if (responseData.success) {
          formStatus.textContent = 'Message sent successfully!';
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          throw new Error(responseData.message || 'An error occurred.');
        }
      } catch (err) {
        formStatus.textContent = err.message;
        formStatus.className = 'form-status error';
      } finally {
        setTimeout(() => { formStatus.textContent = ''; }, 5000);
      }
    });
  };

  // --- 5. PURCHASE BUTTONS (on index.html) ---
  const initPurchaseButtons = () => {
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    purchaseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if logged in
        if (!currentUser) {
          window.location.href = '/login?redirect=purchase';
          return;
        }
        
        const packageName = button.dataset.packageName;
        const packagePrice = button.dataset.packagePrice;
        
        if (packageName && packagePrice) {
          const purchaseData = {
            name: packageName,
            price: packagePrice,
          };
          // Use localStorage to pass data to the purchase page
          localStorage.setItem('pendingPurchasePackage', JSON.stringify(purchaseData));
          window.location.href = '/purchase';
        }
      });
    });
  };

  // --- 6. AI CHATBOT WIDGET ---
  const initChatbot = () => {
    // Create chatbot HTML
    chatbotWidgetContainer.innerHTML = `
      <div id="chat-bubble">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </div>
      <div id="chat-window">
        <div class="chat-header">
          <h3>AI Assistant</h3>
          <button id="chat-close-btn">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="chat-message model">
            <div class="message-content">
              Hello ${currentUser.email}! How can I help you today?
            </div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type a message...">
          <button id="chat-send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    `;

    // Add initial greeting to history
    chatHistory.push({ role: 'model', content: `Hello ${currentUser.email}! How can I help you today?` });

    // Get Chatbot Elements
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // Event Listeners
    chatBubble.addEventListener('click', () => chatWindow.classList.toggle('open'));
    chatCloseBtn.addEventListener('click', () => chatWindow.classList.remove('open'));
    chatSendBtn.addEventListener('click', handleChatSend);
    chatInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') handleChatSend();
    });

    // Chat Functions
    const handleChatSend = async () => {
      const prompt = chatInput.value.trim();
      if (!prompt) return;

      addMessageToUI('user', prompt);
      chatInput.value = '';
      chatHistory.push({ role: 'user', content: prompt });
      
      showTypingIndicator();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            history: chatHistory.slice(0, -1), // Send history *before* this prompt
            sessionId: chatSessionId
          })
        });

        const data = await res.json();
        hideTypingIndicator();
        
        if (data.success) {
          addMessageToUI('model', data.response);
          chatHistory.push({ role: 'model', content: data.response });
        } else {
          throw new Error(data.message || 'AI error');
        }
      } catch (err) {
        hideTypingIndicator();
        addMessageToUI('model', 'Sorry, I am having trouble connecting. Please try again.');
      }
    };

    const addMessageToUI = (role, content) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${role}`;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      contentDiv.textContent = content;
      
      msgDiv.appendChild(contentDiv);
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
      chatMessages.innerHTML += `
        <div class="chat-message model" id="typing-indicator">
          <div class="message-content typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const hideTypingIndicator = () => {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
    };
  };

  // --- START THE APP ---
  init();
});
