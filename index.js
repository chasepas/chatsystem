// We enclose this in window.onload.
// So we don't have ridiculous errors.
window.onload = function () {
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyALfdyCH5E4DQp2cA2AVeQ7XWP7Aa2fF2w",
    authDomain: "chat-8c5e5.firebaseapp.com",
    projectId: "chat-8c5e5",
    storageBucket: "chat-8c5e5.firebasestorage.app",
    messagingSenderId: "775152032980",
    appId: "1:775152032980:web:143b4fd6d604c86dbe6f41",
    measurementId: "G-G2SMKSX5Y4",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // This is very IMPORTANT!! We're going to use "db" a lot.
  var db = firebase.database();
  // We're going to use oBjEcT OrIeNtEd PrOgRaMmInG. Lol
  class DOC_CHAT {
    constructor() {
      // Extract the Google Doc ID from the URL or referrer when possible
      this.docId = this.extractGoogleDocId();
      // Track the message that is being replied to
      this.replyingTo = null;
    }
    
    // Function to extract Google Doc ID from URL parameters or referrer
    extractGoogleDocId() {
      // Try to get from URL parameters first (for direct access)
      const urlParams = new URLSearchParams(window.location.search);
      const docId = urlParams.get('docId');
      if (docId) {
        return docId;
      }
      
      // Try to get from referrer URL (when launched from Google Docs)
      const referrer = document.referrer;
      if (referrer && referrer.includes('docs.google.com/document/d/')) {
        // Extract the document ID from the referrer URL
        // Google Doc URLs look like: https://docs.google.com/document/d/DOC_ID/edit
        const matches = referrer.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
        if (matches && matches[1]) {
          return matches[1];
        }
      }
      
      // If we can't determine the docId, use a default or generate a random one
      return 'default-room';
    }

    // Home() is used to create the home page
    home() {
      // First clear the body before adding in
      // a title and the join form
      document.body.innerHTML = "";
      this.create_title();
      this.create_join_form();
    }
    // chat() is used to create the chat page
    chat() {
      this.create_title();
      this.create_chat();
    }
    // create_title() is used to create the title
    create_title() {
      // This is the title creator. 🎉
      var title_container = document.createElement("div");
      title_container.setAttribute("id", "title_container");
      var title_inner_container = document.createElement("div");
      title_inner_container.setAttribute("id", "title_inner_container");

      var title = document.createElement("h1");
      title.setAttribute("id", "title");
      title.textContent = "Doc Chat";

      title_inner_container.append(title);
      title_container.append(title_inner_container);
      document.body.append(title_container);
    }
    // create_join_form() creates the join form
    create_join_form() {
      var parent = this;

      var join_container = document.createElement("div");
      join_container.setAttribute("id", "join_container");
      var join_inner_container = document.createElement("div");
      join_inner_container.setAttribute("id", "join_inner_container");

      var join_button_container = document.createElement("div");
      join_button_container.setAttribute("id", "join_button_container");

      var join_button = document.createElement("button");
      join_button.setAttribute("id", "join_button");
      join_button.innerHTML = 'Join <i class="fas fa-sign-in-alt"></i>';

      var join_input_container = document.createElement("div");
      join_input_container.setAttribute("id", "join_input_container");

      var join_input = document.createElement("input");
      join_input.setAttribute("id", "join_input");
      join_input.setAttribute("maxlength", 15);
      join_input.placeholder = "Your name...";
      
      // Add information about the document chat
      var room_info = document.createElement("div");
      room_info.setAttribute("id", "room_info");
      room_info.style.marginTop = "10px";
      room_info.style.marginBottom = "15px";
      room_info.style.textAlign = "center";
      room_info.innerHTML = `Joining chat for document: <strong>${parent.docId}</strong>`;
      
      // Every time we type into the join_input
      join_input.onkeyup = function () {
        // If the input we have is longer that 0 letters
        if (join_input.value.length > 0) {
          // Make the button light up
          join_button.classList.add("enabled");
          // Allow the user to click the button
          join_button.onclick = function () {
            // Save the name to local storage
            parent.save_name(join_input.value);
            // Remove the join_container. So the site doesn't look weird.
            join_container.remove();
            // parent = this. But it is not the join_button
            parent.create_chat();
          };
        } else {
          // If the join_input is empty then turn off the
          // join button
          join_button.classList.remove("enabled");
        }
      };

      // Append everything to the body
      join_button_container.append(join_button);
      join_input_container.append(join_input);
      join_inner_container.append(join_input_container, room_info, join_button_container);
      join_container.append(join_inner_container);
      document.body.append(join_container);
    }
    // create_load() creates a loading circle that is used in the chat container
    create_load(container_id) {
      // YOU ALSO MUST HAVE (PARENT = THIS). BUT IT'S WHATEVER THO.
      var parent = this;

      // This is a loading function. Something cool to have.
      var container = document.getElementById(container_id);
      container.innerHTML = "";

      var loader_container = document.createElement("div");
      loader_container.setAttribute("class", "loader_container");

      var loader = document.createElement("div");
      loader.setAttribute("class", "loader");

      loader_container.append(loader);
      container.append(loader_container);
    }
    // create_chat() creates the chat container and stuff
    create_chat() {
      // Again! You need to have (parent = this)
      var parent = this;
      // GET THAT MEMECHAT HEADER OUTTA HERE
      var title_container = document.getElementById("title_container");
      var title = document.getElementById("title");
      title_container.classList.add("chat_title_container");
      // Make the title smaller by making it 'chat_title'
      title.classList.add("chat_title");
      
      // Show a shortened version of the document ID in the title
      const shortDocId = parent.docId.length > 10 
        ? parent.docId.substring(0, 10) + "..." 
        : parent.docId;
      title.textContent = `Doc Chat: ${shortDocId}`;

      var chat_container = document.createElement("div");
      chat_container.setAttribute("id", "chat_container");

      var chat_inner_container = document.createElement("div");
      chat_inner_container.setAttribute("id", "chat_inner_container");

      var chat_content_container = document.createElement("div");
      chat_content_container.setAttribute("id", "chat_content_container");

      var chat_input_container = document.createElement("div");
      chat_input_container.setAttribute("id", "chat_input_container");

      // Create reply indicator container
      var reply_indicator = document.createElement("div");
      reply_indicator.setAttribute("id", "reply_indicator");
      reply_indicator.style.display = "none";
      
      var reply_text = document.createElement("span");
      reply_text.setAttribute("id", "reply_text");
      
      var reply_view_button = document.createElement("button");
      reply_view_button.setAttribute("id", "reply_view_button");
      reply_view_button.textContent = "View";
      reply_view_button.style.display = "none"; // Hide initially, will be shown when replying
      
      var cancel_reply = document.createElement("button");
      cancel_reply.setAttribute("id", "cancel_reply");
      cancel_reply.innerHTML = "×";
      cancel_reply.onclick = function() {
        parent.cancelReply();
      };
      
      reply_indicator.append(reply_text, reply_view_button, cancel_reply);

      var chat_input_send = document.createElement("button");
      chat_input_send.setAttribute("id", "chat_input_send");
      chat_input_send.setAttribute("disabled", true);
      chat_input_send.innerHTML = `<h1>></h1>`;

      var chat_input = document.createElement("input");
      chat_input.setAttribute("id", "chat_input");
      // Only a max message length of 1000
      chat_input.setAttribute("maxlength", 1000);
      // Get the name of the user
      chat_input.placeholder = `${parent.get_name()}. Say something...`;
      chat_input.onkeyup = function () {
        if (chat_input.value.length > 0) {
          chat_input_send.removeAttribute("disabled");
          chat_input_send.classList.add("enabled");
          chat_input_send.onclick = function () {
            chat_input_send.setAttribute("disabled", true);
            chat_input_send.classList.remove("enabled");
            if (chat_input.value.length <= 0) {
              return;
            }
            // Enable the loading circle in the 'chat_content_container'
            parent.create_load("chat_content_container");
            // Filter the message before sending (handling the async operation)
            parent.filter_message(chat_input.value).then((filtered_message) => {
              // Send the filtered message
              parent.send_message(filtered_message);
            });
            // Clear the chat input box
            chat_input.value = "";
            // Clear the reply if there is one
            parent.cancelReply();
            // Focus on the input just after
            chat_input.focus();
          };
        } else {
          chat_input_send.classList.remove("enabled");
        }
      };

      var chat_logout_container = document.createElement("div");
      chat_logout_container.setAttribute("id", "chat_logout_container");

      var chat_logout = document.createElement("button");
      chat_logout.setAttribute("id", "chat_logout");
      chat_logout.textContent = `${parent.get_name()} • logout`;
      // "Logout" is really just deleting the name from the localStorage
      chat_logout.onclick = function () {
        localStorage.clear();
        // Go back to home page
        parent.home();
      };

      chat_logout_container.append(chat_logout);
      chat_input_container.append(reply_indicator, chat_input, chat_input_send);
      chat_inner_container.append(
        chat_content_container,
        chat_input_container,
        chat_logout_container
      );
      chat_container.append(chat_inner_container);
      document.body.append(chat_container);
      
      // Add CSS for reply functionality
      this.addReplyStyles();
      
      // After creating the chat. We immediatly create a loading circle in the 'chat_content_container'
      parent.create_load("chat_content_container");
      // then we "refresh" and get the chat data from Firebase
      parent.refresh_chat();
    }
    
    // Add CSS styles for the reply functionality
    addReplyStyles() {
      const style = document.createElement('style');
      style.textContent = `
        #reply_indicator {
          display: flex;
          align-items: center;
          background-color: #f1f1f1;
          padding: 5px 10px;
          margin-bottom: 5px;
          border-radius: 5px;
          width: 100%;
        }
        
        #reply_text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.8em;
          color: #555;
        }
        
        #reply_view_button {
          background-color: #e0e0e0;
          border: none;
          border-radius: 3px;
          color: #555;
          cursor: pointer;
          font-size: 12px;
          margin-right: 5px;
          padding: 2px 6px;
        }
        
        #reply_view_button:hover {
          background-color: #d0d0d0;
        }
        
        #cancel_reply {
          background: none;
          border: none;
          color: #999;
          font-size: 16px;
          cursor: pointer;
          padding: 0 5px;
        }
        
        #cancel_reply:hover {
          color: #333;
        }
        
        .reply_button {
          background: none;
          border: none;
          color: #777;
          font-size: 12px;
          cursor: pointer;
          padding: 2px 5px;
          margin-top: 5px;
          text-align: right;
        }
        
        .reply_button:hover {
          color: #333;
          text-decoration: underline;
        }
        
        .replied_message {
          background-color: #f0f4f8;
          border-left: 3px solid #7eb0db;
          padding: 5px 8px;
          margin-bottom: 8px;
          font-size: 0.9em;
          color: #444;
          border-radius: 3px;
          cursor: pointer;
          position: relative;
        }
        
        .replied_message:hover {
          background-color: #e8f0f8;
        }
        
        .replied_message:after {
          content: "▼";
          position: absolute;
          bottom: -12px;
          left: 15px;
          color: #7eb0db;
          font-size: 16px;
          line-height: 16px;
        }
        
        .replied_user {
          font-weight: bold;
          color: #3b5998;
        }
        
        .message_actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .message_container.has_replies {
          border-left: 2px solid #7eb0db;
          padding-left: 3px;
        }
        
        .message_container.is_reply {
          margin-left: 15px;
          border-left: 2px solid #7eb0db;
          padding-left: 3px;
        }
        
        .message_container.highlight {
          animation: highlight-animation 2s ease-in-out;
        }
        
        @keyframes highlight-animation {
          0% { background-color: rgba(255, 255, 150, 0.5); }
          100% { background-color: transparent; }
        }
        @keyframes highlight-animation {
          0% { background-color: rgba(255, 255, 150, 0.5); }
          100% { background-color: transparent; }
        }
        
        /* Thread view styles */
        .thread_line {
          width: 2px;
          background-color: #7eb0db;
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          opacity: 0.6;
        }
        
        .reply_count_badge {
          background-color: #7eb0db;
          color: white;
          border-radius: 10px;
          padding: 1px 6px;
          font-size: 0.7em;
          margin-left: 5px;
          display: inline-block;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Set up a reply to a specific message
    setReply(messageId, userName, messageContent) {
      const parent = this;
      parent.replyingTo = messageId;
      
      // Display the reply indicator
      const replyIndicator = document.getElementById('reply_indicator');
      const replyText = document.getElementById('reply_text');
      const replyViewButton = document.getElementById('reply_view_button');
      
      // Truncate long messages for the reply indicator
      const truncatedContent = messageContent.length > 50 
        ? messageContent.substring(0, 47) + '...' 
        : messageContent;
      
      replyText.textContent = `Replying to ${userName}: ${truncatedContent}`;
      replyIndicator.style.display = 'flex';
      
      // Show and set up the View button
      replyViewButton.style.display = 'block';
      replyViewButton.onclick = function() {
        parent.scrollToMessage(messageId);
      };
      
      // Focus on the input
      document.getElementById('chat_input').focus();
    }
    
    // Scroll to a specific message and highlight it
    scrollToMessage(messageId) {
      const messageEl = document.getElementById(messageId);
      if (messageEl) {
        // Scroll the message into view
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add and then remove highlight class for animation effect
        messageEl.classList.add('highlight');
        setTimeout(() => {
          messageEl.classList.remove('highlight');
        }, 2000);
      }
    }
    
    // Cancel the current reply
    cancelReply() {
      this.replyingTo = null;
      const replyIndicator = document.getElementById('reply_indicator');
      const replyViewButton = document.getElementById('reply_view_button');
      
      if (replyIndicator) {
        replyIndicator.style.display = 'none';
      }
      
      if (replyViewButton) {
        replyViewButton.style.display = 'none';
      }
    }

    // Filter message to remove swear words using PurgoMalum API
    async filter_message(message) {
      if (!message) return message;

      try {
        // Use the PurgoMalum API to filter profanity
        // This is a free API that filters profanity and returns clean text
        const response = await fetch(
          `https://www.purgomalum.com/service/json?text=${encodeURIComponent(
            message
          )}`
        );
        const data = await response.json();
        console.log("data", data);

        // Return the filtered message
        return data.result;
      } catch (error) {
        console.error("Error filtering message:", error);

        // Fallback to a simple asterisk replacement for common profanity patterns
        // This is just in case the API fails
        return message.replace(
          /\b(f+u+c+k+|s+h+i+t+|b+i+t+c+h+)\b/gi,
          (match) => "*".repeat(match.length)
        );
      }
    }

    // Save name. It literally saves the name to localStorage
    save_name(name) {
      // Save name to localStorage
      localStorage.setItem("name", name);
    }
    
    // Sends message/saves the message to firebase database
    send_message(message) {
      var parent = this;
      // if the local storage name is null and there is no message
      // then return/don't send the message. The user is somehow hacking
      // to send messages. Or they just deleted the
      // localstorage themselves. But hacking sounds cooler!!
      if (parent.get_name() == null && message == null) {
        return;
      }

      // Get the firebase database reference for this specific document's chat
      const docId = parent.docId;
      // Make sure the docId is safe for Firebase (removing invalid characters)
      const safeDocId = docId.replace(/[.#$/[\]]/g, '_');
      
      db.ref(`doc_chats/${safeDocId}/messages`).once("value", function (message_object) {
        // This index is important. It will help organize the chat in order
        var index = parseFloat(message_object.numChildren()) + 1;
        
        // Create the message object with basic properties
        const messageData = {
          name: parent.get_name(),
          message: message,
          index: index,
          timestamp: Date.now()
        };
        
        // If this is a reply, add the reply information
        if (parent.replyingTo) {
          messageData.isReply = true;
          messageData.replyTo = parent.replyingTo;
          
          // Update the original message to include this as a reply
          const replyingToIndex = parent.replyingTo.split('_')[1];
          const replyUpdates = {};
          
          // First, check if the message being replied to already has replies
          db.ref(`doc_chats/${safeDocId}/messages/message_${replyingToIndex}`).once("value", function(originalMessageSnapshot) {
            if (originalMessageSnapshot.exists()) {
              const originalMessage = originalMessageSnapshot.val();
              
              // Create or update the replies array
              let replies = originalMessage.replies || [];
              replies.push(`message_${index}`);
              
              // Update the original message with the new reply reference
              replyUpdates[`/replies`] = replies;
              db.ref(`doc_chats/${safeDocId}/messages/message_${replyingToIndex}`).update(replyUpdates);
            }
          });
        }
        
        // Save the new message to Firebase
        db.ref(`doc_chats/${safeDocId}/messages/` + `message_${index}`)
          .set(messageData)
          .then(function () {
            // After we send the chat refresh to get the new messages
            parent.refresh_chat();
          });
      });
    }
    
    // Get name. Gets the username from localStorage
    get_name() {
      // Get the name from localstorage
      if (localStorage.getItem("name") != null) {
        return localStorage.getItem("name");
      } else {
        this.home();
        return null;
      }
    }
    
    // Create a reply button for a message
    create_reply_button(messageId, userName, messageContent) {
      const parent = this;
      const replyButton = document.createElement("button");
      replyButton.setAttribute("class", "reply_button");
      replyButton.innerHTML = "Reply";
      replyButton.onclick = function() {
        parent.setReply(messageId, userName, messageContent);
      };
      return replyButton;
    }
    
    // Create a replied message element to show what message is being replied to
    create_replied_message(repliedMessage, replyToMsgId) {
      if (!repliedMessage) return null;
      
      const parent = this;
      const repliedContainer = document.createElement("div");
      repliedContainer.setAttribute("class", "replied_message");
      
      const repliedContent = document.createElement("div");
      repliedContent.innerHTML = `<span class="replied_user">${repliedMessage.name}:</span> ${repliedMessage.message}`;
      
      repliedContainer.append(repliedContent);
      
      // Make the replied message clickable to navigate to the original
      repliedContainer.onclick = function() {
        parent.scrollToMessage(replyToMsgId);
      };
      
      return repliedContainer;
    }
    
    // Refresh chat gets the message/chat data from firebase
    refresh_chat() {
      var parent = this;
      var chat_content_container = document.getElementById(
        "chat_content_container"
      );
      
      // Get the document ID and ensure it's safe for Firebase
      const docId = parent.docId;
      // Make sure the docId is safe for Firebase (removing invalid characters)
      const safeDocId = docId.replace(/[.#$/[\]]/g, '_');

      // Get the chats from firebase for this specific document
      db.ref(`doc_chats/${safeDocId}/messages`).on("value", function (messages_object) {
        // When we get the data clear chat_content_container
        chat_content_container.innerHTML = "";
        // if there are no messages in the chat. Return. Don't load anything
        if (!messages_object.exists() || messages_object.numChildren() == 0) {
          // Show a welcome message for a new document chat
          var welcome_container = document.createElement("div");
          welcome_container.setAttribute("class", "message_container");
          welcome_container.innerHTML = `
            <div class="message_inner_container">
              <div class="message_user_container">
                <p class="message_user">System</p>
              </div>
              <div class="message_content_container">
                <p class="message_content">Welcome to the chat for this document! This is the beginning of the conversation.</p>
              </div>
            </div>
          `;
          chat_content_container.append(welcome_container);
          return;
        }

        // convert the message object values to an array.
        var messages = Object.values(messages_object.val());
        var guide = []; // this will be our guide to organizing the messages
        var unordered = []; // unordered messages
        var ordered = []; // we're going to order these messages
        var messagesById = {}; // messages indexed by their ID for quick lookup

        for (var i, i = 0; i < messages.length; i++) {
          // The guide is simply an array from 0 to the messages.length
          guide.push(i + 1);
          // unordered is the [message, index_of_the_message]
          unordered.push([messages[i], messages[i].index]);
          // Store messages by their ID for reply lookups
          messagesById[`message_${messages[i].index}`] = messages[i];
        }

        // Now this is straight up from stack overflow 🤣
        // Sort the unordered messages by the guide
        guide.forEach(function (key) {
          var found = false;
          unordered = unordered.filter(function (item) {
            if (!found && item[1] == key) {
              // Now push the ordered messages to ordered array
              ordered.push(item[0]);
              found = true;
              return false;
            } else {
              return true;
            }
          });
        });

        // Now we're done. Simply display the ordered messages
        ordered.forEach(function (data) {
          var name = data.name;
          var message = data.message;
          var messageId = `message_${data.index}`;
          
          var message_container = document.createElement("div");
          message_container.setAttribute("class", "message_container");
          message_container.setAttribute("id", messageId);
          
          // Add appropriate classes based on reply status
          if (data.isReply) {
            message_container.classList.add("is_reply");
          }
          
          if (data.replies && data.replies.length > 0) {
            message_container.classList.add("has_replies");
          }

          var message_inner_container = document.createElement("div");
          message_inner_container.setAttribute(
            "class",
            "message_inner_container"
          );

          var message_user_container = document.createElement("div");
          message_user_container.setAttribute(
            "class",
            "message_user_container"
          );

          var message_user = document.createElement("p");
          message_user.setAttribute("class", "message_user");
          message_user.textContent = `${name}`;
          
          // If this message has replies, show the count
          if (data.replies && data.replies.length > 0) {
            const replyCountBadge = document.createElement("span");
            replyCountBadge.className = "reply_count_badge";
            replyCountBadge.textContent = data.replies.length;
            message_user.appendChild(replyCountBadge);
          }

          var message_content_container = document.createElement("div");
          message_content_container.setAttribute(
            "class",
            "message_content_container"
          );
          
          // If this message is a reply to another message, show the replied message
          if (data.isReply && data.replyTo && messagesById[data.replyTo]) {
            const repliedMessage = messagesById[data.replyTo];
            const repliedEl = parent.create_replied_message(repliedMessage, data.replyTo);
            if (repliedEl) {
              message_content_container.append(repliedEl);
            }
          }

          var message_content = document.createElement("p");
          message_content.setAttribute("class", "message_content");
          message_content.textContent = `${message}`;
          
          // Message actions container (for reply button)
          var message_actions = document.createElement("div");
          message_actions.setAttribute("class", "message_actions");
          
          // Create reply button
          var reply_button = parent.create_reply_button(messageId, name, message);
          message_actions.append(reply_button);

          message_user_container.append(message_user);
          message_content_container.append(message_content);
          message_inner_container.append(
            message_user_container,
            message_content_container,
            message_actions
          );
          message_container.append(message_inner_container);

          chat_content_container.append(message_container);
        });
        // Go to the recent message at the bottom of the container
        chat_content_container.scrollTop = chat_content_container.scrollHeight;
      });
    }
  }
  // So we've "built" our app. Let's make it work!!
  var app = new DOC_CHAT();
  // If we have a name stored in localStorage.
  // Then use that name. Otherwise, go to home.
  if (app.get_name() != null) {
    app.chat();
  } else {
    app.home();
  }
};
