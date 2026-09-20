import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const API_BASE_URL = "http://localhost:8082";

const Footer = () => {
  const adminPhone = "93924180907";
  const adminEmail = "suruchandrashekar@gmail.com";

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Unread admin message count
  const [unreadCount, setUnreadCount] = useState(0);

  const chatBodyRef = useRef(null);

  // --------------------------------------------------
  // GET LOGGED-IN USER
  // --------------------------------------------------
  const getLoggedInUser = () => {
    const possibleKeys = [
      "user",
      "loggedUser",
      "currentUser",
      "userData",
      "googleUser",
      "loggedInUser",
    ];

    for (const key of possibleKeys) {
      try {
        const storedUser = localStorage.getItem(key);

        if (!storedUser) {
          continue;
        }

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser) {
          const userName =
            parsedUser.name ||
            parsedUser.fullName ||
            parsedUser.userName ||
            parsedUser.username ||
            "";

          const userEmail =
            parsedUser.email ||
            parsedUser.userEmail ||
            "";

          if (userName || userEmail) {
            return {
              userName: userName || "Unknown User",
              userEmail: userEmail || "Unknown Email",
            };
          }
        }
      } catch (error) {
        console.log(
          `Error reading localStorage key: ${key}`,
          error
        );
      }
    }

    return {
      userName: "Unknown User",
      userEmail: "Unknown Email",
    };
  };

  // --------------------------------------------------
  // GET UNREAD MESSAGE COUNT
  // --------------------------------------------------
  const calculateUnreadMessages = (chatMessages) => {
    const loggedInUser = getLoggedInUser();

    if (
      !loggedInUser.userEmail ||
      loggedInUser.userEmail === "Unknown Email"
    ) {
      setUnreadCount(0);
      return;
    }

    const readKey =
      `gramacare_support_last_read_${loggedInUser.userEmail}`;

    const lastReadTime = localStorage.getItem(readKey);

    const adminMessages = chatMessages.filter(
      (item) => item.sender === "ADMIN"
    );

    if (!lastReadTime) {
      setUnreadCount(adminMessages.length);
      return;
    }

    const lastReadDate = new Date(lastReadTime);

    const unreadMessages = adminMessages.filter((item) => {
      if (!item.createdAt) {
        return false;
      }

      return new Date(item.createdAt) > lastReadDate;
    });

    setUnreadCount(unreadMessages.length);
  };

  // --------------------------------------------------
  // MARK CHAT AS READ
  // --------------------------------------------------
  const markMessagesAsRead = () => {
    const loggedInUser = getLoggedInUser();

    if (
      !loggedInUser.userEmail ||
      loggedInUser.userEmail === "Unknown Email"
    ) {
      return;
    }

    const readKey =
      `gramacare_support_last_read_${loggedInUser.userEmail}`;

    localStorage.setItem(
      readKey,
      new Date().toISOString()
    );

    setUnreadCount(0);
  };

  // --------------------------------------------------
  // LOAD USER CHAT
  // --------------------------------------------------
  const loadMessages = async () => {
    const loggedInUser = getLoggedInUser();

    if (
      !loggedInUser.userEmail ||
      loggedInUser.userEmail === "Unknown Email"
    ) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoadingMessages(true);

      const encodedEmail = encodeURIComponent(
        loggedInUser.userEmail
      );

      const response = await fetch(
        `${API_BASE_URL}/api/support/messages/user/${encodedEmail}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load messages: ${response.status}`
        );
      }

      const data = await response.json();

      const receivedMessages =
        Array.isArray(data) ? data : [];

      setMessages(receivedMessages);

      // Calculate unread messages
      calculateUnreadMessages(receivedMessages);

    } catch (error) {
      console.error(
        "Error loading support messages:",
        error
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  // --------------------------------------------------
  // OPEN SUPPORT CHAT
  // --------------------------------------------------
  const openMessageBox = async () => {
    setShowMessageBox(true);
    setMessage("");

    // Opening chat means user has seen messages
    markMessagesAsRead();

    // Load previous conversation
    await loadMessages();

    // Mark again after loading
    markMessagesAsRead();
  };

  // --------------------------------------------------
  // CLOSE SUPPORT CHAT
  // --------------------------------------------------
  const closeMessageBox = () => {
    setShowMessageBox(false);
    setMessage("");
  };

  // --------------------------------------------------
  // SEND USER MESSAGE
  // --------------------------------------------------
  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    const loggedInUser = getLoggedInUser();

    if (
      !loggedInUser.userEmail ||
      loggedInUser.userEmail === "Unknown Email"
    ) {
      alert("Please login first to contact support.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch(
        `${API_BASE_URL}/api/support/messages`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: message.trim(),
            userName: loggedInUser.userName,
            userEmail: loggedInUser.userEmail,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Message sending failed: ${response.status} ${errorText}`
        );
      }

      // Clear input
      setMessage("");

      // Reload conversation
      await loadMessages();

      // User message is already seen
      markMessagesAsRead();

    } catch (error) {
      console.error(
        "Error sending support message:",
        error
      );

      alert(
        "Message send avvaledu. Backend server running lo undho check cheyyi."
      );
    } finally {
      setSending(false);
    }
  };

  // --------------------------------------------------
  // POLLING
  // CHECK ADMIN REPLIES EVERY 2 SECONDS
  // --------------------------------------------------
  useEffect(() => {
    if (!showMessageBox) {
      return;
    }

    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [showMessageBox]);

  // --------------------------------------------------
  // CHECK NEW ADMIN MESSAGES EVEN WHEN CHAT IS CLOSED
  // --------------------------------------------------
  useEffect(() => {
    const checkUnreadMessages = async () => {
      const loggedInUser = getLoggedInUser();

      if (
        !loggedInUser.userEmail ||
        loggedInUser.userEmail === "Unknown Email"
      ) {
        return;
      }

      // If chat is already open, normal polling handles it
      if (showMessageBox) {
        return;
      }

      try {
        const encodedEmail = encodeURIComponent(
          loggedInUser.userEmail
        );

        const response = await fetch(
          `${API_BASE_URL}/api/support/messages/user/${encodedEmail}`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const receivedMessages =
          Array.isArray(data) ? data : [];

        setMessages(receivedMessages);

        calculateUnreadMessages(receivedMessages);

      } catch (error) {
        console.error(
          "Unread message check error:",
          error
        );
      }
    };

    // First check
    checkUnreadMessages();

    // Check every 3 seconds
    const interval = setInterval(() => {
      checkUnreadMessages();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [showMessageBox]);

  // --------------------------------------------------
  // AUTO SCROLL CHAT TO BOTTOM
  // --------------------------------------------------
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // --------------------------------------------------
  // FORMAT TIME
  // --------------------------------------------------
  const formatTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    try {
      const date = new Date(createdAt);

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  const formatDate = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    try {
      const date = new Date(createdAt);

      return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  // --------------------------------------------------
  // GROUP MESSAGES BY DATE
  // --------------------------------------------------
  const groupedMessages = messages.reduce(
    (groups, currentMessage) => {
      const date = formatDate(
        currentMessage.createdAt
      );

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(currentMessage);

      return groups;
    },
    {}
  );

  return (
    <>
      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">

        <div className="footer-container">

          {/* ABOUT */}
          <div className="footer-section">

            <h3>GramaCare</h3>

            <p>
              GramaCare helps people easily connect with
              local services and support.
            </p>

          </div>


          {/* QUICK LINKS */}
          <div className="footer-section">

            <h3>Quick Links</h3>

            <Link to="/">Home</Link>

            <Link to="/about">About</Link>

            <Link to="/services">Services</Link>

            <Link to="/contact">Contact</Link>

          </div>


          {/* SUPPORT */}
          <div className="footer-section">

            <h3>Support</h3>

            {/* MESSAGE SUPPORT BUTTON */}

            <button
              type="button"
              className="footer-support-button"
              onClick={openMessageBox}
            >

              <span className="support-button-icon">
                💬
              </span>

              <span>
                Message Support
              </span>

              {/* UNREAD BADGE */}

              {unreadCount > 0 && (
                <span className="support-unread-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>


            {/* CALL BUTTON */}

            <a
              href={`tel:${adminPhone}`}
              className="footer-call-button"
            >

              <span>
                📞
              </span>

              <span>
                Call GramaCare
              </span>

            </a>


            {/* WHATSAPP */}

            <a
              href={`https://wa.me/${adminPhone}`}
              target="_blank"
              rel="noopener noreferrer"
            >

              📱 WhatsApp

            </a>


            {/* EMAIL */}

            <a
              href={`mailto:${adminEmail}`}
            >

              📧 Email Support

            </a>

          </div>


          {/* CONTACT */}
          <div className="footer-section">

            <h3>Contact</h3>

            <p>
              📞 {adminPhone}
            </p>

            <p>
              📧 {adminEmail}
            </p>

          </div>

        </div>


        {/* BOTTOM FOOTER */}

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} GramaCare.
            All rights reserved.
          </p>

        </div>

      </footer>


      {/* ==================================================
          WHATSAPP STYLE SUPPORT CHAT
      ================================================== */}

      {showMessageBox && (

        <div
          className="chat-modal-overlay"
          onClick={closeMessageBox}
        >

          <div
            className="whatsapp-chat-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CHAT HEADER */}

            <div className="whatsapp-chat-header">

              <div className="whatsapp-user-avatar">
                💬
              </div>


              <div className="whatsapp-user-details">

                <h3>
                  GramaCare Support
                </h3>

                <span>
                  {loadingMessages
                    ? "Checking messages..."
                    : "Support Team"}
                </span>

              </div>


              <button
                type="button"
                className="whatsapp-close"
                onClick={closeMessageBox}
                aria-label="Close"
              >
                ✕
              </button>

            </div>


            {/* CHAT BODY */}

            <div
              className="whatsapp-chat-body"
              ref={chatBodyRef}
            >

              {/* WELCOME */}

              {messages.length === 0 &&
                !loadingMessages && (

                  <div className="chat-welcome">

                    <div className="chat-welcome-icon">
                      💬
                    </div>

                    <h4>
                      Welcome to GramaCare Support
                    </h4>

                    <p>
                      Send us your problem or question.
                      Our admin team will reply here.
                    </p>

                  </div>

                )}


              {/* LOADING */}

              {loadingMessages &&
                messages.length === 0 && (

                  <div className="chat-loading">
                    Loading chat...
                  </div>

                )}


              {/* MESSAGES */}

              {Object.entries(groupedMessages).map(
                ([date, dateMessages]) => (

                  <React.Fragment key={date}>

                    <div className="chat-date">
                      {date}
                    </div>


                    {dateMessages.map(
                      (chatMessage) => {

                        const isUser =
                          chatMessage.sender === "USER";

                        const isAdmin =
                          chatMessage.sender === "ADMIN";


                        return (

                          <div
                            key={chatMessage.id}
                            className={`chat-row ${
                              isUser
                                ? "user-row"
                                : "admin-row"
                            }`}
                          >

                            <div
                              className={`chat-bubble ${
                                isUser
                                  ? "user-bubble"
                                  : "admin-bubble"
                              }`}
                            >

                              {/* SENDER */}

                              <div className="chat-sender">

                                {isUser
                                  ? "You"
                                  : "GramaCare Support"}

                              </div>


                              {/* MESSAGE */}

                              <div className="chat-text">

                                {chatMessage.message}

                              </div>


                              {/* TIME */}

                              <div className="chat-time">

                                {formatTime(
                                  chatMessage.createdAt
                                )}


                                {isUser && (

                                  <span className="message-ticks">
                                    ✓✓
                                  </span>

                                )}

                              </div>

                            </div>

                          </div>

                        );

                      }
                    )}

                  </React.Fragment>

                )
              )}

            </div>


            {/* CHAT FOOTER */}

            <form
              className="whatsapp-chat-footer"
              onSubmit={handleSendMessage}
            >

              <input
                type="text"
                className="chat-message-input"
                placeholder="Type a message..."
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                disabled={sending}
                maxLength={1000}
              />


              <button
                type="submit"
                className="chat-send-button"
                disabled={
                  sending ||
                  !message.trim()
                }
              >

                {sending
                  ? "..."
                  : "➤"}

              </button>

            </form>

          </div>

        </div>

      )}

    </>
  );
};

export default Footer;