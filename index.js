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
      // Initialize filter words (will be loaded from Firebase)
      this.filterWords = [];
      // Track if user is admin (for filter editing permissions)
      this.isAdmin = false;
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

    // Get Firebase safe document ID
    getSafeDocId() {
      return this.docId.replace(/[.#$/[\]]/g, '_');
    }

    // Load filter words from Firebase for this specific chat room
    loadFilterWords() {
      const parent = this;
      const safeDocId = this.getSafeDocId();
      
      return new Promise((resolve) => {
        db.ref(`doc_chats/${safeDocId}/filter_words`).once("value", function(snapshot) {
          if (snapshot.exists()) {
            parent.filterWords = snapshot.val();
          } else {
            parent.filterWords = [];
          }
          resolve(parent.filterWords);
        });
      });
    }
    
    // Save filter words to Firebase for this specific chat room
    saveFilterWords(wordsList) {
      const safeDocId = this.getSafeDocId();
      db.ref(`doc_chats/${safeDocId}/filter_words`).set(wordsList);
      this.filterWords = wordsList;
    }

    // Check if user is admin for this chat room
    checkIsAdmin() {
      const parent = this;
      const safeDocId = this.getSafeDocId();
      const userName = this.get_name();
      
      return new Promise((resolve) => {
        db.ref(`doc_chats/${safeDocId}/admins`).once("value", function(snapshot) {
          if (snapshot.exists()) {
            const admins = snapshot.val();
            parent.isAdmin = admins.includes(userName);
          } else {
            // If no admins are set, make the first user an admin
            db.ref(`doc_chats/${safeDocId}/admins`).set([userName]);
            parent.isAdmin = true;
          }
          resolve(parent.isAdmin);
        });
      });
    }

    // Add a user as admin
    addAdmin(userName) {
      if (!this.isAdmin) return Promise.resolve(false);
      
      const safeDocId = this.getSafeDocId();
      return new Promise((resolve) => {
        db.ref(`doc_chats/${safeDocId}/admins`).once("value", function(snapshot) {
          let admins = [];
          if (snapshot.exists()) {
            admins = snapshot.val();
          }
          
          if (!admins.includes(userName)) {
            admins.push(userName);
            db.ref(`doc_chats/${safeDocId}/admins`).set(admins);
          }
          resolve(true);
        });
      });
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
      const parent = this;
      this.create_title();
      
      // Load filter words and check if user is admin before creating chat
      Promise.all([this.loadFilterWords(), this.checkIsAdmin()])
        .then(() => {
          parent.create_chat();
        });
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
            parent.chat();
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
      
      // Create filter settings button
      var filter_settings = document.createElement("button");
      filter_settings.setAttribute("id", "filter_settings");
      filter_settings.innerHTML = '<i class="fas fa-filter"></i> Filter Settings';
      filter_settings.onclick = function() {
        parent.show_filter_settings();
      };

      // Create an admin button if user is admin
      if (parent.isAdmin) {
        var admin_button = document.createElement("button");
        admin_button.setAttribute("id", "admin_button");
        admin_button.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
        admin_button.onclick = function() {
          parent.show_admin_panel();
        };
        chat_logout_container.append(admin_button);
      }

      chat_logout_container.append(filter_settings, chat_logout);
      chat_input_container.append(chat_input, chat_input_send);
      chat_inner_container.append(
        chat_content_container,
        chat_input_container,
        chat_logout_container
      );
      chat_container.append(chat_inner_container);
      document.body.append(chat_container);
      // After creating the chat. We immediatly create a loading circle in the 'chat_content_container'
      parent.create_load("chat_content_container");
      // then we "refresh" and get the chat data from Firebase
      parent.refresh_chat();
    }
    
    // Show filter settings modal
    show_filter_settings() {
      var parent = this;
      
      // Create modal container
      var modal = document.createElement("div");
      modal.setAttribute("id", "filter_modal");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0,0,0,0.5)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.style.zIndex = "1000";
      
      // Create modal content
      var modalContent = document.createElement("div");
      modalContent.setAttribute("id", "filter_modal_content");
      modalContent.style.backgroundColor = "white";
      modalContent.style.padding = "20px";
      modalContent.style.borderRadius = "5px";
      modalContent.style
