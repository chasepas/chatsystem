// Add this to the DOC_CHAT class in your existing code

class DOC_CHAT {
  constructor() {
    // Existing code...
    this.docId = this.extractGoogleDocId();
    // Initialize admin status
    this.isAdmin = false;
  }

  // Existing methods...

  // New method to check if a user is an admin
  checkAdminStatus() {
    const parent = this;
    const safeDocId = this.docId.replace(/[.#$/[\]]/g, '_');
    const userName = this.get_name();
    
    return new Promise((resolve) => {
      db.ref(`doc_chats/${safeDocId}/admins`).once("value", function(snapshot) {
        if (snapshot.exists() && snapshot.val().includes(userName)) {
          parent.isAdmin = true;
          resolve(true);
        } else {
          parent.isAdmin = false;
          resolve(false);
        }
      });
    });
  }

  // Modified create_chat to include filter management
  create_chat() {
    // Existing code...
    var parent = this;
    
    // Get existing elements from the original function
    var title_container = document.getElementById("title_container");
    var title = document.getElementById("title");
    title_container.classList.add("chat_title_container");
    title.classList.add("chat_title");
    
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

    var chat_input_send = document.createElement("button");
    chat_input_send.setAttribute("id", "chat_input_send");
    chat_input_send.setAttribute("disabled", true);
    chat_input_send.innerHTML = `<h1>></h1>`;

    var chat_input = document.createElement("input");
    chat_input.setAttribute("id", "chat_input");
    chat_input.setAttribute("maxlength", 1000);
    chat_input.placeholder = `${parent.get_name()}. Say something...`;
    
    // Add filter management UI
    var filter_container = document.createElement("div");
    filter_container.setAttribute("id", "filter_container");
    filter_container.style.display = "none"; // Hidden by default
    
    var filter_title = document.createElement("h3");
    filter_title.textContent = "Manage Censor Filter";
    filter_title.style.margin = "10px 0";
    
    var filter_textarea = document.createElement("textarea");
    filter_textarea.setAttribute("id", "filter_textarea");
    filter_textarea.setAttribute("placeholder", "Enter words to censor (one per line)");
    filter_textarea.style.width = "100%";
    filter_textarea.style.height = "100px";
    filter_textarea.style.margin = "5px 0";
    
    var filter_submit = document.createElement("button");
    filter_submit.textContent = "Update Filter";
    filter_submit.style.padding = "5px 10px";
    filter_submit.style.margin = "5px 0";
    
    filter_container.append(filter_title, filter_textarea, filter_submit);
    
    // Add filter button to toggle filter management
    var filter_button = document.createElement("button");
    filter_button.setAttribute("id", "filter_button");
    filter_button.textContent = "Manage Filter";
    filter_button.style.marginLeft = "10px";
    
    // Check admin status and load filter settings
    parent.checkAdminStatus().then(isAdmin => {
      if (isAdmin) {
        filter_button.style.display = "inline-block";
      } else {
        filter_button.style.display = "none";
      }
      
      // Load existing filter words
      parent.loadFilterWords();
    });
    
    // Toggle filter management visibility
    filter_button.onclick = function() {
      const currentDisplay = filter_container.style.display;
      filter_container.style.display = currentDisplay === "none" ? "block" : "none";
      
      if (filter_container.style.display === "block") {
        parent.loadFilterWords();
      }
    };
    
    // Update filter when submitted
    filter_submit.onclick = function() {
      const filterWords = filter_textarea.value.split("\n")
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      parent.updateFilterWords(filterWords);
      filter_container.style.display = "none";
    };
    
    // Rest of the chat creation code...
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
          parent.create_load("chat_content_container");
          parent.custom_filter_message(chat_input.value).then((filtered_message) => {
            parent.send_message(filtered_message);
          });
          chat_input.value = "";
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
    chat_logout.onclick = function () {
      localStorage.clear();
      parent.home();
    };

    chat_logout_container.append(chat_logout, filter_button);
    chat_input_container.append(chat_input, chat_input_send);
    chat_inner_container.append(
      chat_content_container,
      chat_input_container,
      filter_container,
      chat_logout_container
    );
    chat_container.append(chat_inner_container);
    document.body.append(chat_container);
    
    parent.create_load("chat_content_container");
    parent.refresh_chat();
  }
  
  // New method to load filter words
  loadFilterWords() {
    const parent = this;
    const safeDocId = this.docId.replace(/[.#$/[\]]/g, '_');
    
    db.ref(`doc_chats/${safeDocId}/filter_words`).once("value", function(snapshot) {
      if (snapshot.exists()) {
        const filterWords = snapshot.val();
        const textArea = document.getElementById("filter_textarea");
        if (textArea) {
          textArea.value = filterWords.join("\n");
        }
      }
    });
  }
  
  // New method to update filter words
  updateFilterWords(filterWords) {
    const safeDocId = this.docId.replace(/[.#$/[\]]/g, '_');
    
    db.ref(`doc_chats/${safeDocId}/filter_words`).set(filterWords)
      .then(() => {
        alert("Filter words updated successfully!");
      })
      .catch(error => {
        console.error("Error updating filter words:", error);
        alert("Failed to update filter words. Please try again.");
      });
  }
  
  // New method to make a user an admin
  makeAdmin(userName) {
    if (!this.isAdmin) return;
    
    const safeDocId = this.docId.replace(/[.#$/[\]]/g, '_');
    
    db.ref(`doc_chats/${safeDocId}/admins`).once("value", function(snapshot) {
      let admins = [];
      if (snapshot.exists()) {
        admins = snapshot.val();
      }
      
      if (!admins.includes(userName)) {
        admins.push(userName);
        db.ref(`doc_chats/${safeDocId}/admins`).set(admins)
          .then(() => {
            alert(`${userName} is now an admin for this chat.`);
          });
      }
    });
  }
  
  // New custom filter method that uses the room's filter words
  async custom_filter_message(message) {
    if (!message) return message;
    
    const safeDocId = this.docId.replace(/[.#$/[\]]/g, '_');
    
    try {
      // Get filter words for this specific chat room
      const snapshot = await db.ref(`doc_chats/${safeDocId}/filter_words`).once("value");
      let filterWords = [];
      
      if (snapshot.exists()) {
        filterWords = snapshot.val();
      }
      
      // If no custom filter words, use the PurgoMalum API as fallback
      if (!filterWords || filterWords.length === 0) {
        return this.filter_message(message);
      }
      
      // Apply custom filter
      let filteredMessage = message;
      
      filterWords.forEach(word => {
        if (word && word.trim().length > 0) {
          const regex = new RegExp(`\\b${word.trim()}\\b`, 'gi');
          filteredMessage = filteredMessage.replace(regex, '*'.repeat(word.length));
        }
      });
      
      return filteredMessage;
    } catch (error) {
      console.error("Error applying custom filter:", error);
      // Fall back to the original filter method
      return this.filter_message(message);
    }
  }
  
  // Create a new chat room with current user as admin
  create_new_chat_room(roomName) {
    const userName = this.get_name();
    if (!userName) return;
    
    const safeRoomName = roomName.replace(/[.#$/[\]]/g, '_');
    
    db.ref(`doc_chats/${safeRoomName}/admins`).set([userName])
      .then(() => {
        this.docId = safeRoomName;
        this.isAdmin = true;
        this.chat();
      })
      .catch(error => {
        console.error("Error creating new chat room:", error);
        alert("Failed to create chat room. Please try again.");
      });
  }
  
  // Modified home method to include room creation
  home() {
    document.body.innerHTML = "";
    this.create_title();
    
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
    
    var room_info = document.createElement("div");
    room_info.setAttribute("id", "room_info");
    room_info.style.marginTop = "10px";
    room_info.style.marginBottom = "15px";
    room_info.style.textAlign = "center";
    room_info.innerHTML = `Joining chat for document: <strong>${parent.docId}</strong>`;
    
    // Add option to create a new room
    var create_room_container = document.createElement("div");
    create_room_container.style.marginTop = "20px";
    create_room_container.style.textAlign = "center";
    
    var create_room_input = document.createElement("input");
    create_room_input.setAttribute("id", "create_room_input");
    create_room_input.setAttribute("maxlength", 20);
    create_room_input.placeholder = "New room name...";
    create_room_input.style.marginRight = "10px";
    
    var create_room_button = document.createElement("button");
    create_room_button.textContent = "Create Room";
    create_room_button.style.padding = "5px 10px";
    
    create_room_button.onclick = function() {
      const roomName = create_room_input.value.trim();
      const userName = join_input.value.trim();
      
      if (roomName.length > 0 && userName.length > 0) {
        parent.save_name(userName);
        parent.create_new_chat_room(roomName);
      } else {
        alert("Please enter both your name and a room name.");
      }
    };
    
    create_room_container.append(create_room_input, create_room_button);
    
    // Original login functionality
    join_input.onkeyup = function () {
      if (join_input.value.length > 0) {
        join_button.classList.add("enabled");
        join_button.onclick = function () {
          parent.save_name(join_input.value);
          join_container.remove();
          parent.chat();
        };
      } else {
        join_button.classList.remove("enabled");
      }
    };
    
    join_button_container.append(join_button);
    join_input_container.append(join_input);
    join_inner_container.append(join_input_container, room_info, join_button_container, create_room_container);
    join_container.append(join_inner_container);
    document.body.append(join_container);
  }
}
