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
      // Track which message we're replying to
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
      var reply_indicator_container = document.createElement("div");
      reply_indicator_container.setAttribute("id", "reply_indicator_container");
      reply_indicator_container.style.display = "none";
      
      var reply_text = document.createElement("div");
      reply_text.setAttribute("id", "reply_text");
      
      var cancel_reply = document.createElement("button");
      cancel_reply.setAttribute("id", "cancel_reply");
      cancel_reply.innerHTML = "×";
      cancel_reply.onclick = function() {
        parent.replyingTo = null;
        reply_indicator_container.style.display = "none";
      };
      
      reply_indicator_container.append(reply_text, cancel_reply);

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
              // Send the filtered message with reply info if available
              parent.send_message(filtered_message, parent.replyingTo);
              
              // Clear reply state
              parent.replyingTo = null;
              reply_indicator_container.style.display = "none";
            });
            // Clear the chat input box
            chat_input.value = "";
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
      chat_input_container.append(reply_indicator_container, chat_input, chat_input_send);
      chat_inner_container.append(
        chat_content_container,
        chat_input_container,
        chat_logout_container
      );
      chat_container.append(chat_inner_container);
      document.body.append(chat_container);
      
      // Add CSS for reply-related elements
      this.add_reply_styles();
      
      // After creating the chat. We immediatly create a loading circle in the 'chat_content_container'
      parent.create_load("chat_content_container");
      // then we "refresh" and get the chat data from Firebase
      parent.refresh_chat();
    }
    
    // Add CSS styles for reply system
    add_reply_styles() {
      const style = document.createElement('style');
      style.textContent = `
        .reply_button {
          background: none;
          border: none;
          color: #7e7e7e;
          cursor: pointer;
          font-size: 0.8em;
          padding: 2px 5px;
          margin-right: 5px;
          border-radius: 3px;
        }
        
        .reply_button:hover {
          background-color: #f1f1f1;
          color: #555;
        }
        
        .message_actions {
          display: flex;
          padding-top: 3px;
          padding-left: 10px;
        }
        
        .replied_to {
          font-size: 0.8em;
          color: #7e7e7e;
          padding: 2px 0;
          margin-bottom: 2px;
          border-left: 2px solid #ccc;
          padding-left: 8px;
        }
        
        #reply_indicator_container {
          display: flex;
          align-items: center;
          background-color: #f1f1f1;
          padding: 5px 10px;
          border-radius: 5px;
          margin-bottom: 5px;
          width: 100%;
          justify-content: space-between;
        }
        
        #reply_text {
          color: #555;
          font-size: 0.9em;
        }
        
        #cancel_reply {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 1.2em;
          padding: 0 5px;
        }
        
        #cancel_reply:hover {
          color: #555;
        }
      `;
      document.head.appendChild(style);
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
    
    // Set up replying to a specific message
    set_reply(messageId, userName, messageContent) {
      var parent = this;
      parent.replyingTo = messageId;
      
      // Show the reply indicator
      var reply_indicator = document.getElementById("reply_indicator_container");
      var reply_text = document.getElementById("reply_text");
      
      // Truncate message if it's too long
      const truncatedContent = messageContent.length > 30 
        ? messageContent.substring(0, 30) + "..." 
        : messageContent;
        
      reply_text.textContent = `Replying to ${userName}: "${truncatedContent}"`;
      reply_indicator.style.display = "flex";
      
      // Focus on the input box
      document.getElementById("chat_input").focus();
    }
    
    // Sends message/saves the message to firebase database
    send_message(message, replyToId = null) {
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
        const messageData = {
          name: parent.get_name(),
          message: message,
          index: index,
          timestamp: Date.now()
        };
        
        // Add reply info if replying to a message
        if (replyToId) {
          messageData.replyTo = replyToId;
        }
        
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
        var messageMap = {}; // Map to store messages by their indices for lookup
        
        for (var i, i = 0; i < messages.length; i++) {
          // The guide is simply an array from 0 to the messages.length
          guide.push(i + 1);
          // unordered is the [message, index_of_the_message]
          unordered.push([messages[i], messages[i].index]);
          // Store the message in our map with its index as the key
          messageMap[messages[i].index] = messages[i];
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
          var messageId = data.index;
          var replyTo = data.replyTo;

          var message_container = document.createElement("div");
          message_container.setAttribute("class", "message_container");
          message_container.setAttribute("data-message-id", messageId);

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

          var message_content_container = document.createElement("div");
          message_content_container.setAttribute(
            "class",
            "message_content_container"
          );
          
          // If this is a reply to another message, show the reference
          if (replyTo && messageMap[replyTo]) {
            var replied_to = document.createElement("div");
            replied_to.setAttribute("class", "replied_to");
            replied_to.innerHTML = `
              <span>Replying to <b>${messageMap[replyTo].name}</b>: "${messageMap[replyTo].message.substring(0, 30)}${messageMap[replyTo].message.length > 30 ? '...' : ''}"</span>
            `;
            message_content_container.append(replied_to);
          }

          var message_content = document.createElement("p");
          message_content.setAttribute("class", "message_content");
          message_content.textContent = `${message}`;
          
          // Create message actions container (for reply button)
          var message_actions = document.createElement("div");
          message_actions.setAttribute("class", "message_actions");
          
          // Add reply button
          var reply_button = document.createElement("button");
          reply_button.setAttribute("class", "reply_button");
          reply_button.textContent = "Reply";
          reply_button.onclick = function() {
            parent.set_reply(messageId, name, message);
          };
          
          message_actions.append(reply_button);

          message_user_container.append(message_user);
          message_content_container.append(message_content);
          message_inner_container.append(
            message_user_container,
            message_content_container
          );
          message_container.append(message_inner_container, message_actions);

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

// Add this method to the DOC_CHAT class
create_history_button() {
  var parent = this;
  
  // Create history button
  var history_button = document.createElement("button");
  history_button.setAttribute("id", "history_button");
  history_button.innerHTML = '<i class="fas fa-history"></i> Chat History';
  history_button.style.margin = "10px";
  history_button.style.padding = "5px 10px";
  history_button.style.backgroundColor = "#f0f0f0";
  history_button.style.border = "1px solid #ddd";
  history_button.style.borderRadius = "4px";
  history_button.style.cursor = "pointer";
  history_button.style.fontSize = "14px";
  
  // Add hover effect
  history_button.onmouseover = function() {
    this.style.backgroundColor = "#e0e0e0";
  };
  
  history_button.onmouseout = function() {
    this.style.backgroundColor = "#f0f0f0";
  };
  
  // Add click event to show history modal
  history_button.onclick = function() {
    parent.show_chat_history();
  };
  
  // Append to the chat container
  var chat_logout_container = document.getElementById("chat_logout_container");
  chat_logout_container.prepend(history_button);
}

// Method to show chat history
show_chat_history() {
  var parent = this;
  
  // Get the document ID and ensure it's safe for Firebase
  const docId = parent.docId;
  const safeDocId = docId.replace(/[.#$/[\]]/g, '_');
  
  // Create modal container
  var modal = document.createElement("div");
  modal.setAttribute("id", "history_modal");
  modal.style.position = "fixed";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";
  
  // Create modal content
  var modal_content = document.createElement("div");
  modal_content.setAttribute("id", "history_modal_content");
  modal_content.style.backgroundColor = "#fff";
  modal_content.style.padding = "20px";
  modal_content.style.borderRadius = "5px";
  modal_content.style.width = "80%";
  modal_content.style.maxWidth = "600px";
  modal_content.style.maxHeight = "80%";
  modal_content.style.overflow = "auto";
  
  // Modal header
  var modal_header = document.createElement("div");
  modal_header.style.display = "flex";
  modal_header.style.justifyContent = "space-between";
  modal_header.style.alignItems = "center";
  modal_header.style.marginBottom = "15px";
  
  var modal_title = document.createElement("h2");
  modal_title.textContent = "Chat History Summary";
  modal_title.style.margin = "0";
  
  var close_button = document.createElement("button");
  close_button.innerHTML = "×";
  close_button.style.background = "none";
  close_button.style.border = "none";
  close_button.style.fontSize = "24px";
  close_button.style.cursor = "pointer";
  close_button.onclick = function() {
    document.body.removeChild(modal);
  };
  
  modal_header.append(modal_title, close_button);
  
  // Modal content - will be filled with history data
  var history_content = document.createElement("div");
  history_content.setAttribute("id", "history_content");
  
  // Loading indicator
  var loading = document.createElement("p");
  loading.textContent = "Loading chat history...";
  history_content.append(loading);
  
  // Append all elements
  modal_content.append(modal_header, history_content);
  modal.append(modal_content);
  document.body.append(modal);
  
  // Fetch chat history from Firebase
  db.ref(`doc_chats/${safeDocId}/messages`).once("value", function(messages_object) {
    history_content.innerHTML = "";
    
    if (!messages_object.exists() || messages_object.numChildren() == 0) {
      history_content.innerHTML = "<p>No chat history available for this document.</p>";
      return;
    }
    
    // Process messages to generate summary
    var messages = Object.values(messages_object.val());
    
    // Sort messages by index
    messages.sort((a, b) => a.index - b.index);
    
    // Count messages per user
    var userMessageCounts = {};
    var totalMessages = messages.length;
    
    messages.forEach(msg => {
      if (userMessageCounts[msg.name]) {
        userMessageCounts[msg.name]++;
      } else {
        userMessageCounts[msg.name] = 1;
      }
    });
    
    // Create summary section
    var summary_section = document.createElement("div");
    summary_section.style.marginBottom = "20px";
    
    var total_messages_el = document.createElement("p");
    total_messages_el.innerHTML = `<strong>Total messages:</strong> ${totalMessages}`;
    
    var participants_title = document.createElement("p");
    participants_title.innerHTML = "<strong>Participants:</strong>";
    
    var participants_list = document.createElement("ul");
    participants_list.style.marginTop = "5px";
    
    // Sort users by message count (most active first)
    var sortedUsers = Object.keys(userMessageCounts).sort((a, b) => 
      userMessageCounts[b] - userMessageCounts[a]
    );
    
    sortedUsers.forEach(user => {
      var user_item = document.createElement("li");
      user_item.textContent = `${user}: ${userMessageCounts[user]} messages`;
      participants_list.append(user_item);
    });
    
    summary_section.append(total_messages_el, participants_title, participants_list);
    
    // Create timeline section
    var timeline_section = document.createElement("div");
    var timeline_title = document.createElement("h3");
    timeline_title.textContent = "Recent Activity Timeline";
    timeline_title.style.marginBottom = "10px";
    
    var timeline_list = document.createElement("ul");
    timeline_list.style.listStyleType = "none";
    timeline_list.style.padding = "0";
    timeline_list.style.borderLeft = "2px solid #ddd";
    timeline_list.style.marginLeft = "10px";
    
    // Show last 10 messages in timeline
    var recentMessages = messages.slice(-10);
    
    recentMessages.forEach(msg => {
      var time_item = document.createElement("li");
      time_item.style.paddingLeft = "20px";
      time_item.style.position = "relative";
      time_item.style.marginBottom = "15px";
      
      // Add timeline dot
      var timeline_dot = document.createElement("div");
      timeline_dot.style.position = "absolute";
      timeline_dot.style.left = "-5px";
      timeline_dot.style.top = "0";
      timeline_dot.style.width = "8px";
      timeline_dot.style.height = "8px";
      timeline_dot.style.borderRadius = "50%";
      timeline_dot.style.backgroundColor = "#4682B4";
      
      // Format timestamp
      var timestamp = new Date(msg.timestamp);
      var formattedTime = timestamp.toLocaleString();
      
      // Create message content
      var message_text = document.createElement("div");
      message_text.innerHTML = `<strong>${msg.name}</strong> (${formattedTime}): `;
      
      // Truncate message if too long
      var messageContent = msg.message.length > 50 ? 
        msg.message.substring(0, 50) + "..." : 
        msg.message;
      
      message_text.innerHTML += messageContent;
      
      // Add reply info if present
      if (msg.replyTo && messages.find(m => m.index === msg.replyTo)) {
        var repliedTo = messages.find(m => m.index === msg.replyTo);
        var reply_info = document.createElement("div");
        reply_info.style.fontSize = "0.85em";
        reply_info.style.color = "#777";
        reply_info.style.marginTop = "3px";
        reply_info.textContent = `↪ Replied to ${repliedTo.name}`;
        message_text.appendChild(reply_info);
      }
      
      time_item.append(timeline_dot, message_text);
      timeline_list.append(time_item);
    });
    
    timeline_section.append(timeline_title, timeline_list);
    
    // Append all sections to history content
    history_content.append(summary_section, timeline_section);
  });
}

// Modify the create_chat() method to add the history button
// Add the following line after creating chat_logout_container:
// parent.create_history_button();
