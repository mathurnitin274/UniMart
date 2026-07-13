document.addEventListener('DOMContentLoaded', () => {
  if (!API.auth.isAuthenticated()) {
    showToast('Please login to view messages', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  let chatList = [];
  let activeChat = null;
  let activeMessages = [];
  let pollInterval = null;
  const currentUser = API.auth.getCurrentUser();

  const urlParams = new URLSearchParams(window.location.search);
  let preselectedChatId = urlParams.get('chatId');

  // DOM Elements
  const threadContainer = document.getElementById('thread-list-container');
  const threadsLoading = document.getElementById('threads-loading');
  const threadsEmpty = document.getElementById('threads-empty');
  
  const activeChatContainer = document.getElementById('active-chat-container');
  const noChatSelected = document.getElementById('no-chat-selected');
  const messagesFeed = document.getElementById('messages-feed');
  
  const chatInput = document.getElementById('chat-input');
  const sendMsgBtn = document.getElementById('send-msg-btn');
  const chatPartnerName = document.getElementById('chat-partner-name');
  const chatItemImg = document.getElementById('chat-item-img');
  const chatItemLink = document.getElementById('chat-item-link');
  const chatItemPrice = document.getElementById('chat-item-price');
  
  const suggestMeetupBtn = document.getElementById('suggest-meetup-btn');
  const backToInboxBtn = document.getElementById('back-to-inbox-btn');

  // Meetup modal DOM
  const meetupModal = document.getElementById('meetup-modal');
  const closeMeetupBtn = document.getElementById('close-meetup-modal');
  const sendMeetupBtn = document.getElementById('send-meetup-plan-btn');

  // Fetch user chats initially
  loadInbox();

  // Polling for updates
  pollInterval = setInterval(() => {
    if (activeChat) {
      pollMessages();
    }
  }, 4000);

  // Clean interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(pollInterval);
  });

  async function loadInbox() {
    try {
      const res = await API.chat.getAll();
      if (res.success && res.data) {
        chatList = res.data;
        renderThreads();
        
        if (preselectedChatId) {
          const selected = chatList.find(c => c._id === preselectedChatId);
          if (selected) {
            selectChat(selected);
          }
          preselectedChatId = null; // Clear to prevent loops
        }
      }
    } catch(err) {
      console.error(err);
    }
  }

  function renderThreads() {
    threadsLoading.style.display = 'none';
    
    if (chatList.length === 0) {
      threadsEmpty.style.display = 'block';
      threadContainer.innerHTML = '';
      return;
    }

    threadsEmpty.style.display = 'none';
    
    threadContainer.innerHTML = chatList.map(chat => {
      const product = chat.productId || {};
      const buyer = chat.buyerId || {};
      const seller = chat.sellerId || {};
      
      const partner = buyer._id === currentUser._id ? seller : buyer;
      const avatar = partner.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
      
      const isSelected = activeChat && activeChat._id === chat._id;
      
      // Last message preview
      let preview = 'No messages yet';
      if (chat.lastMessage) {
        if (chat.lastMessage.message.startsWith('__OFFER__')) {
          preview = '🤝 Price Offer Sent';
        } else if (chat.lastMessage.message.startsWith('__MEETUP__')) {
          preview = '📅 Meetup proposed';
        } else if (chat.lastMessage.message === '__OFFER_ACCEPT__') {
          preview = '✅ Deal accepted!';
        } else if (chat.lastMessage.message === '__OFFER_DECLINE__') {
          preview = '❌ Offer declined';
        } else {
          preview = chat.lastMessage.message;
        }
      }

      const imgUrl = product.images && product.images.length > 0
        ? product.images[0].url
        : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60';

      return `
        <div class="thread-list-item ${isSelected ? 'active' : ''}" onclick="window.selectChatById('${chat._id}')">
          <img src="${avatar}" alt="${partner.name}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">
          <div style="flex:1; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <h5 style="font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${partner.name}</h5>
              <span style="font-size:0.7rem; color:var(--text-muted);">${new Date(chat.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p style="font-size:0.8rem; font-weight:600; color:var(--primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${product.title || 'Product'}</p>
            <p style="font-size:0.78rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${preview}</p>
          </div>
          <img src="${imgUrl}" alt="${product.title}" style="width:36px; height:36px; border-radius:var(--radius-sm); object-fit:cover; margin-left:8px;">
        </div>
      `;
    }).join('');
  }

  window.selectChatById = (chatId) => {
    const selected = chatList.find(c => c._id === chatId);
    if (selected) selectChat(selected);
  };

  async function selectChat(chat) {
    activeChat = chat;
    noChatSelected.style.display = 'none';
    activeChatContainer.style.display = 'flex';

    // Mark as read in localStorage
    localStorage.setItem(`unimart_chat_last_seen_${chat._id}`, new Date().toISOString());

    // Highlight selected thread in sidebar
    renderThreads();

    const product = chat.productId || {};
    const buyer = chat.buyerId || {};
    const seller = chat.sellerId || {};
    const partner = buyer._id === currentUser._id ? seller : buyer;

    // Header info bind
    chatPartnerName.textContent = partner.name;
    chatItemPrice.textContent = `₹${(product.price || 0).toLocaleString()}`;
    chatItemLink.href = `product-details.html?id=${product._id || ''}`;
    
    const imgUrl = product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60';
    chatItemImg.src = imgUrl;

    // Load Messages
    await pollMessages();

    // Scroll to bottom
    messagesFeed.scrollTop = messagesFeed.scrollHeight;

    // Responsive mobile view adjust
    if (window.innerWidth <= 768) {
      document.getElementById('threads-pane').style.display = 'none';
      document.getElementById('message-pane').style.display = 'flex';
      backToInboxBtn.style.display = 'inline-block';
    }
  }

  async function pollMessages() {
    if (!activeChat) return;
    try {
      const res = await API.chat.getMessages(activeChat._id);
      if (res.success && res.data) {
        // Mark as read in localStorage
        localStorage.setItem(`unimart_chat_last_seen_${activeChat._id}`, new Date().toISOString());

        // Only trigger redraw if count or timestamps changed to preserve scroll
        const countChanged = res.data.length !== activeMessages.length;
        const lastTimestamp = res.data.length > 0 ? res.data[res.data.length - 1].createdAt : '';
        const activeLastTimestamp = activeMessages.length > 0 ? activeMessages[activeMessages.length - 1].createdAt : '';
        
        if (countChanged || lastTimestamp !== activeLastTimestamp) {
          activeMessages = res.data;
          renderMessages();
          messagesFeed.scrollTop = messagesFeed.scrollHeight;
        }
      }
    } catch(err) {
      console.error('Failed to poll messages', err);
    }
  }

  function renderMessages() {
    messagesFeed.innerHTML = activeMessages.map(msg => {
      const isOutgoing = msg.senderId._id === currentUser._id;
      const content = msg.message;
      const date = new Date(msg.createdAt);
      const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      // Render interactive offer card
      if (content.startsWith('__OFFER__')) {
        let offerObj = {};
        try {
          offerObj = JSON.parse(content.substring(10));
        } catch(e) {}

        const isSeller = activeChat.sellerId._id === currentUser._id;
        const status = offerObj.status;

        let actionButtons = '';
        if (isSeller && status === 'pending') {
          actionButtons = `
            <div style="display:flex; gap:12px; margin-top:8px;">
              <button class="btn btn-success" style="padding:6px 12px; font-size:0.8rem;" onclick="handleOfferAction('${msg._id}', 'accept')">Accept</button>
              <button class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem;" onclick="handleOfferAction('${msg._id}', 'decline')">Decline</button>
            </div>
          `;
        }

        let statusText = `<span style="color:var(--warning); font-weight:700;">Pending approval</span>`;
        if (status === 'accepted') statusText = `<span style="color:var(--success); font-weight:700;">Accepted</span>`;
        if (status === 'declined') statusText = `<span style="color:var(--danger); font-weight:700;">Declined</span>`;

        return `
          <div class="chat-interactive-card" style="align-self: ${isOutgoing ? 'flex-end' : 'flex-start'}; border-color:var(--primary);">
            <h5>🤝 Price Negotiation</h5>
            <p style="font-size:1.1rem; font-weight:800; color:var(--primary);">Offer Amount: ₹${(offerObj.amount || 0).toLocaleString()}</p>
            <p style="font-size:0.85rem;">Status: ${statusText}</p>
            ${actionButtons}
          </div>
        `;
      }

      // Render system confirmations
      if (content === '__OFFER_ACCEPT__') {
        return `
          <div style="align-self: center; background:hsla(142,70%,45%,0.1); border: 1px solid var(--success); padding: 8px 16px; border-radius: var(--radius-sm); font-size:0.85rem; font-weight:600; color:var(--success); text-align:center; max-width: 80%; margin: 8px 0;">
            🤝 Deal Accepted! The seller agreed to the pricing offer. Arrange campus pick-up below.
          </div>
        `;
      }

      if (content === '__OFFER_DECLINE__') {
        return `
          <div style="align-self: center; background:hsla(350,80%,55%,0.1); border: 1px solid var(--danger); padding: 8px 16px; border-radius: var(--radius-sm); font-size:0.85rem; font-weight:600; color:var(--danger); text-align:center; max-width: 80%; margin: 8px 0;">
            ❌ Offer declined. Try making another offer or chat directly.
          </div>
        `;
      }

      // Render interactive meetup proposal card
      if (content.startsWith('__MEETUP__')) {
        let meetupObj = {};
        try {
          meetupObj = JSON.parse(content.substring(10));
        } catch(e) {}

        const mTime = new Date(meetupObj.time).toLocaleString([], {
          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
          <div class="chat-interactive-card" style="align-self: ${isOutgoing ? 'flex-end' : 'flex-start'}; border-color:var(--info);">
            <h5>📅 Meetup Proposed</h5>
            <p style="font-size:0.9rem; font-weight:600; color:var(--text);">📍 Location: ${meetupObj.location}</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">🕒 Time: ${mTime}</p>
            <p style="font-size:0.8rem; color:var(--info); font-weight:700;">⚠️ Meet in public, well-lit university zones!</p>
          </div>
        `;
      }

      // Normal Message bubble
      return `
        <div class="message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
          <div>${escapeHTML(content)}</div>
          <div class="message-time">${timeStr}</div>
        </div>
      `;
    }).join('');
  }

  // Handle Offer acceptance/declining
  window.handleOfferAction = async (msgId, action) => {
    if (action === 'accept') {
      try {
        // 1. Mark product status as sold
        const prodId = activeChat.productId._id || activeChat.productId;
        await API.products.update(prodId, { status: 'sold' });

        // 2. Send Acceptance text in chat to show card
        await API.chat.sendMessage(activeChat._id, '__OFFER_ACCEPT__');
        showToast('Offer accepted and product marked as Sold!', 'success');
        
        // Refresh local messages
        await pollMessages();
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await API.chat.sendMessage(activeChat._id, '__OFFER_DECLINE__');
        showToast('Offer declined', 'info');
        await pollMessages();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Meetup Modals Trigger
  if (suggestMeetupBtn && meetupModal && closeMeetupBtn && sendMeetupBtn) {
    suggestMeetupBtn.addEventListener('click', () => {
      meetupModal.style.display = 'flex';
      
      // Set default datetime to tomorrow noon
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      document.getElementById('meetup-time-select').value = tomorrow.toISOString().substring(0, 16);
    });

    closeMeetupBtn.addEventListener('click', () => {
      meetupModal.style.display = 'none';
    });

    sendMeetupBtn.addEventListener('click', async () => {
      const spot = document.getElementById('meetup-spot-select').value;
      const time = document.getElementById('meetup-time-select').value;

      if (!time) {
        showToast('Please pick a meetup time', 'warning');
        return;
      }

      sendMeetupBtn.disabled = true;
      try {
        const payload = {
          location: spot,
          time: time
        };
        const meetupString = `__MEETUP__:${JSON.stringify(payload)}`;
        
        await API.chat.sendMessage(activeChat._id, meetupString);
        meetupModal.style.display = 'none';
        showToast('Meetup spot suggested!', 'success');
        await pollMessages();
      } catch(err) {
        console.error(err);
      } finally {
        sendMeetupBtn.disabled = false;
      }
    });
  }

  // Send message
  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    sendMsgBtn.disabled = true;

    try {
      await API.chat.sendMessage(activeChat._id, text);
      await pollMessages();
    } catch(e) {
      chatInput.value = text; // Restore on fail
    } finally {
      sendMsgBtn.disabled = false;
      chatInput.focus();
    }
  }

  if (sendMsgBtn) {
    sendMsgBtn.addEventListener('click', handleSendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }

  // Responsive Mobile Back to Inbox
  if (backToInboxBtn) {
    backToInboxBtn.addEventListener('click', () => {
      document.getElementById('threads-pane').style.display = 'flex';
      document.getElementById('message-pane').style.display = 'none';
      backToInboxBtn.style.display = 'none';
      activeChat = null;
    });
  }

  // Helpers
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
