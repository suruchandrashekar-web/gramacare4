import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import adminApi from "./AdminApi.js";

const API_BASE_URL = "http://localhost:8082";
const ADMIN_EMAIL = "chandrasekarsuru@gmail.com";

const REFRESH_MS = 5000;
const CHAT_REFRESH_MS = 2000;

// =============================================================
// HELPERS
// =============================================================

const roleOf = (item) =>
  String(
    item?.role ??
      item?.userRole ??
      ""
  ).toUpperCase();

const idOf = (item) =>
  item?.id ??
  item?.userId ??
  item?.user_id ??
  null;

const emailOf = (item) =>
  item?.email ??
  item?.userEmail ??
  item?.emailAddress ??
  "";

const nameOf = (item) =>
  item?.fullName ??
  item?.name ??
  item?.userName ??
  item?.username ??
  item?.customerName ??
  "Unknown User";

const phoneOf = (item) =>
  item?.phone ??
  item?.phoneNumber ??
  item?.mobile ??
  item?.mobileNumber ??
  "";

const isBlockedOf = (item) => {
  if (
    item?.blocked !== undefined &&
    item?.blocked !== null
  ) {
    return (
      item.blocked === true ||
      String(item.blocked).toLowerCase() ===
        "true"
    );
  }

  if (
    item?.isBlocked !== undefined &&
    item?.isBlocked !== null
  ) {
    return (
      item.isBlocked === true ||
      String(item.isBlocked).toLowerCase() ===
        "true"
    );
  }

  return item?.active === false;
};

const statusOf = (item) =>
  String(
    item?.status ?? "PENDING"
  ).toUpperCase();

const senderOf = (item) =>
  String(
    item?.sender ?? "USER"
  ).toUpperCase();

const formatTime = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "-";
  }

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =============================================================
// ADMIN DASHBOARD
// =============================================================

function AdminDashboard() {
  const navigate = useNavigate();

  // ===========================================================
  // MAIN DATA
  // ===========================================================

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);

  // ===========================================================
  // SUPPORT DATA
  // ===========================================================

  const [supportMessages, setSupportMessages] =
    useState([]);

  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [chatMessages, setChatMessages] =
    useState([]);

  const [replyText, setReplyText] =
    useState("");

  const [sendingReply, setSendingReply] =
    useState(false);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [deletingMessageId, setDeletingMessageId] =
    useState(null);

  // ===========================================================
  // USER SEARCH
  // ===========================================================

  const [userIdSearch, setUserIdSearch] =
    useState("");

  const [searchedUser, setSearchedUser] =
    useState(null);

  const [userSearchError, setUserSearchError] =
    useState("");

  // ===========================================================
  // UI
  // ===========================================================

  const [activeTab, setActiveTab] =
    useState("overview");

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");

  // ===========================================================
  // LOGGED ADMIN
  // ===========================================================

  const loggedUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "loggedInUser"
        ) || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const loggedEmail = String(
    localStorage.getItem("userEmail") ||
      loggedUser?.email ||
      ""
  )
    .trim()
    .toLowerCase();

  const isAdmin =
    loggedEmail ===
    ADMIN_EMAIL.toLowerCase();

  // ===========================================================
  // NOTICE HELPER
  // ===========================================================

  const showNotice = useCallback(
    (message, duration = 3000) => {
      setNotice(message);

      setTimeout(() => {
        setNotice("");
      }, duration);
    },
    []
  );

  // ===========================================================
  // ADMIN PROTECTION
  // ===========================================================

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [isAdmin, navigate]);

  // ===========================================================
  // LOAD SUPPORT MESSAGES
  // ===========================================================

  const loadSupportMessages =
    useCallback(async () => {
      if (!isAdmin) return;

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/support/messages`
          );

        if (!response.ok) {
          throw new Error(
            `Support API error: ${response.status}`
          );
        }

        const data =
          await response.json();

        setSupportMessages(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Support messages load error:",
          error
        );
      }
    }, [isAdmin]);

  // ===========================================================
  // LOAD CHAT
  // ===========================================================

  const loadChatMessages =
    useCallback(
      async (
        userEmail,
        showLoader = false
      ) => {
        if (!userEmail) return;

        try {
          if (showLoader) {
            setChatLoading(true);
          }

          const encodedEmail =
            encodeURIComponent(
              userEmail
            );

          const response =
            await fetch(
              `${API_BASE_URL}/api/support/messages/user/${encodedEmail}`
            );

          if (!response.ok) {
            throw new Error(
              `Chat API error: ${response.status}`
            );
          }

          const data =
            await response.json();

          setChatMessages(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Chat load error:",
            error
          );

          setError(
            "Chat load avvaledu. Spring Boot backend check cheyyi."
          );
        } finally {
          if (showLoader) {
            setChatLoading(false);
          }
        }
      },
      []
    );

  // ===========================================================
  // OPEN SUPPORT CHAT
  // ===========================================================

  const openSupportChat =
    async (user) => {
      if (!user) return;

      const userEmail =
        emailOf(user).trim();

      if (!userEmail) {
        setError(
          "User email missing. Ee user ki chat open cheyyalem."
        );
        return;
      }

      setSelectedUser(user);

      setSelectedMessage({
        id: `user-${idOf(user) || userEmail}`,
        userName:
          nameOf(user),
        userEmail:
          userEmail,
        phone:
          phoneOf(user),
      });

      setReplyText("");
      setError("");

      await loadChatMessages(
        userEmail,
        true
      );
    };

  // ===========================================================
  // CLOSE SUPPORT CHAT
  // ===========================================================

  const closeSupportChat = () => {
    setSelectedMessage(null);
    setSelectedUser(null);
    setChatMessages([]);
    setReplyText("");
    setError("");
  };

  // ===========================================================
  // SEND ADMIN MESSAGE
  // ===========================================================

  const sendAdminReply =
    async () => {
      const text =
        replyText.trim();

      if (!text) return;

      const user =
        selectedUser ||
        selectedMessage;

      if (!user) {
        setError(
          "Please select a user."
        );
        return;
      }

      const userEmail =
        emailOf(user).trim();

      if (!userEmail) {
        setError(
          "User email is missing."
        );
        return;
      }

      try {
        setSendingReply(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/support/messages/admin-reply`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                message: text,

                userName:
                  nameOf(user),

                userEmail:
                  userEmail,

                sender:
                  "ADMIN",
              }),
            }
          );

        if (!response.ok) {
          const errorText =
            await response.text();

          throw new Error(
            errorText ||
              `Reply failed: ${response.status}`
          );
        }

        const savedMessage =
          await response.json();

        if (savedMessage) {
          setChatMessages(
            (previous) => [
              ...previous,
              savedMessage,
            ]
          );
        }

        setReplyText("");

        await loadSupportMessages();

        showNotice(
          "Message sent to user successfully."
        );
      } catch (error) {
        console.error(
          "Admin reply error:",
          error
        );

        setError(
          "Message send avvaledu. Spring Boot backend check cheyyi."
        );
      } finally {
        setSendingReply(false);
      }
    };

  // ===========================================================
  // ENTER KEY
  // ===========================================================

  const handleReplyKeyDown =
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        if (
          !sendingReply &&
          replyText.trim()
        ) {
          sendAdminReply();
        }
      }
    };

  // ===========================================================
  // DELETE SUPPORT MESSAGE
  // ===========================================================

  const deleteSupportMessage =
    async (message) => {
      if (!message?.id) {
        setError(
          "Message ID missing. Delete cheyyalem."
        );
        return;
      }

      const confirmed =
        window.confirm(
          "Ee message ni permanently delete cheyyala?"
        );

      if (!confirmed) return;

      try {
        setDeletingMessageId(
          message.id
        );

        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/support/messages/${message.id}`,
            {
              method: "DELETE",
            }
          );

        if (!response.ok) {
          const text =
            await response.text();

          throw new Error(
            text ||
              `Delete failed: ${response.status}`
          );
        }

        // Remove from chat immediately
        setChatMessages(
          (previous) =>
            previous.filter(
              (item) =>
                String(item.id) !==
                String(message.id)
            )
        );

        // Remove from support list
        setSupportMessages(
          (previous) =>
            previous.filter(
              (item) =>
                String(item.id) !==
                String(message.id)
            )
        );

        showNotice(
          "Message deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete message error:",
          error
        );

        setError(
          "Message delete avvaledu. Backend DELETE API check cheyyi."
        );
      } finally {
        setDeletingMessageId(
          null
        );
      }
    };

  // ===========================================================
  // CALL USER
  // ===========================================================

  const callUser = (user) => {
    const phone =
      phoneOf(user);

    if (!phone) {
      window.alert(
        "Ee user phone number database lo ledu."
      );
      return;
    }

    const cleanPhone =
      String(phone).replace(
        /[^0-9+]/g,
        ""
      );

    window.location.href =
      `tel:${cleanPhone}`;
  };

  // ===========================================================
  // WHATSAPP
  // ===========================================================

  const openWhatsApp =
    (user) => {
      const phone =
        phoneOf(user);

      if (!phone) {
        window.alert(
          "Ee user phone number database lo ledu."
        );
        return;
      }

      let cleanPhone =
        String(phone).replace(
          /[^0-9]/g,
          ""
        );

      if (
        cleanPhone.length ===
        10
      ) {
        cleanPhone =
          "91" +
          cleanPhone;
      }

      window.open(
        `https://wa.me/${cleanPhone}`,
        "_blank",
        "noopener,noreferrer"
      );
    };

  // ===========================================================
  // SEARCH USER
  // ===========================================================

  const searchUserById =
    () => {
      const searchValue =
        userIdSearch
          .trim()
          .toLowerCase();

      setUserSearchError("");
      setSearchedUser(null);

      if (!searchValue) {
        setUserSearchError(
          "Please enter User ID / Username / Email / Phone."
        );
        return;
      }

      const foundUser =
        users.find(
          (user) => {
            const id =
              String(
                idOf(user) ?? ""
              ).toLowerCase();

            const name =
              String(
                nameOf(user) ?? ""
              ).toLowerCase();

            const email =
              String(
                emailOf(user) ?? ""
              ).toLowerCase();

            const phone =
              String(
                phoneOf(user) ?? ""
              ).toLowerCase();

            const username =
              String(
                user?.username ??
                  user?.userName ??
                  ""
              ).toLowerCase();

            return (
              id === searchValue ||
              name === searchValue ||
              username === searchValue ||
              email === searchValue ||
              phone === searchValue ||
              id.includes(searchValue) ||
              name.includes(searchValue) ||
              username.includes(searchValue) ||
              email.includes(searchValue) ||
              phone.includes(searchValue)
            );
          }
        );

      if (!foundUser) {
        setUserSearchError(
          `"${userIdSearch}" user/account not found.`
        );
        return;
      }

      setSearchedUser(
        foundUser
      );

      setActiveTab("users");
    };

  // ===========================================================
  // CLEAR SEARCH
  // ===========================================================

  const clearUserSearch =
    () => {
      setUserIdSearch("");
      setSearchedUser(null);
      setUserSearchError("");
    };

  // ===========================================================
  // MESSAGE SEARCHED USER
  // ===========================================================

  const messageSearchedUser =
    async () => {
      if (!searchedUser) return;

      await openSupportChat(
        searchedUser
      );
    };

  // ===========================================================
  // BLOCK / UNBLOCK USER
  // ===========================================================

  const toggleBlock =
    async (account) => {
      const id =
        idOf(account);

      const email =
        emailOf(account).trim();

      if (
        id === null ||
        id === undefined
      ) {
        setError(
          "User ID missing."
        );
        return;
      }

      if (!email) {
        setError(
          "User email missing."
        );
        return;
      }

      // Never block admin
      if (
        email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
      ) {
        showNotice(
          "Admin account cannot be blocked."
        );
        return;
      }

      const currentlyBlocked =
        isBlockedOf(account);

      const confirmed =
        window.confirm(
          currentlyBlocked
            ? `Unblock ${nameOf(
                account
              )}?\n\nThis user will get login access again.`
            : `Block ${nameOf(
                account
              )}?\n\nThis user will lose login access.`
        );

      if (!confirmed) return;

      try {
        setError("");

        // =====================================================
        // BLOCK
        // =====================================================

        if (!currentlyBlocked) {
          await adminApi.blockUser(
            id
          );
        }

        // =====================================================
        // UNBLOCK
        // =====================================================

        else {
          await adminApi.unblockUser(
            id
          );
        }

        const newBlocked =
          !currentlyBlocked;

        const updateAccount =
          (user) => {
            if (
              String(
                idOf(user)
              ) !==
              String(id)
            ) {
              return user;
            }

            return {
              ...user,

              blocked:
                newBlocked,

              isBlocked:
                newBlocked,

              active:
                !newBlocked,
            };
          };

        // Update all users
        setUsers(
          (previous) =>
            previous.map(
              updateAccount
            )
        );

        // Update searched user
        setSearchedUser(
          (previous) =>
            previous
              ? updateAccount(
                  previous
                )
              : previous
        );

        // Update selected user
        setSelectedUser(
          (previous) =>
            previous
              ? updateAccount(
                  previous
                )
              : previous
        );

        // Update selected message
        setSelectedMessage(
          (previous) => {
            if (
              !previous
            ) {
              return previous;
            }

            if (
              String(
                idOf(previous)
              ) !==
              String(id)
            ) {
              return previous;
            }

            return {
              ...previous,
              blocked:
                newBlocked,
            };
          }
        );

        showNotice(
          newBlocked
            ? `${nameOf(
                account
              )} blocked successfully. Login access disabled.`
            : `${nameOf(
                account
              )} unblocked successfully. Login access restored.`
        );

        // Get fresh database data
        await loadData();
      } catch (error) {
        console.error(
          "Block/unblock error:",
          error
        );

        setError(
          "Block/Unblock failed. Check adminApi and Spring Boot backend."
        );
      }
    };

  // ===========================================================
  // LOAD ALL DATA
  // ===========================================================

  const loadData =
    useCallback(async () => {
      if (!isAdmin) return;

      try {
        setError("");
        setRefreshing(true);

        const data =
          await adminApi.getAdminData();

        setUsers(
          Array.isArray(
            data?.users
          )
            ? data.users
            : []
        );

        setProviders(
          Array.isArray(
            data?.providers
          )
            ? data.providers
            : []
        );

        setServices(
          Array.isArray(
            data?.services
          )
            ? data.services
            : []
        );

        setRequests(
          Array.isArray(
            data?.requests
          )
            ? data.requests
            : []
        );

        await loadSupportMessages();
      } catch (error) {
        console.error(
          "Dashboard load error:",
          error
        );

        setError(
          "Unable to load dashboard. Spring Boot port 8082 check cheyyi."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      isAdmin,
      loadSupportMessages,
    ]);

  // ===========================================================
  // AUTO REFRESH
  // ===========================================================

  useEffect(() => {
    if (!isAdmin) return;

    loadData();

    const timer =
      setInterval(
        loadData,
        REFRESH_MS
      );

    return () =>
      clearInterval(timer);
  }, [
    isAdmin,
    loadData,
  ]);

  // ===========================================================
  // CHAT AUTO REFRESH
  // ===========================================================

  useEffect(() => {
    const email =
      selectedUser
        ? emailOf(selectedUser)
        : selectedMessage?.userEmail;

    if (!email) return;

    const timer =
      setInterval(() => {
        loadChatMessages(
          email
        );
      }, CHAT_REFRESH_MS);

    return () =>
      clearInterval(timer);
  }, [
    selectedUser,
    selectedMessage,
    loadChatMessages,
  ]);

  // ===========================================================
  // ALL ACCOUNTS
  // ===========================================================

  const allAccounts =
    useMemo(() => {
      return users.map(
        (user) => ({
          ...user,

          _blocked:
            isBlockedOf(user),
        })
      );
    }, [users]);

  // ===========================================================
  // SUPPORT CONVERSATIONS
  // ===========================================================

  const supportConversations =
    useMemo(() => {
      const conversationMap =
        new Map();

      supportMessages.forEach(
        (message) => {
          const email =
            String(
              message?.userEmail ||
                ""
            )
              .trim()
              .toLowerCase();

          if (!email) return;

          if (
            !conversationMap.has(
              email
            )
          ) {
            conversationMap.set(
              email,
              []
            );
          }

          conversationMap
            .get(email)
            .push(message);
        }
      );

      return Array.from(
        conversationMap.entries()
      )
        .map(
          ([
            email,
            messages,
          ]) => {
            const sorted =
              [...messages].sort(
                (a, b) =>
                  new Date(
                    a.createdAt
                  ) -
                  new Date(
                    b.createdAt
                  )
              );

            const latest =
              sorted[
                sorted.length - 1
              ];

            const relatedUser =
              users.find(
                (user) =>
                  emailOf(user)
                    .trim()
                    .toLowerCase() ===
                  email
              );

            const user = {
              ...(relatedUser ||
                {}),

              userName:
                relatedUser
                  ? nameOf(
                      relatedUser
                    )
                  : latest?.userName ||
                    "Unknown User",

              userEmail:
                email,

              phone:
                phoneOf(
                  relatedUser
                ) ||
                latest?.phone ||
                "",
            };

            const unread =
              sorted.filter(
                (item) =>
                  senderOf(
                    item
                  ) === "USER"
              ).length;

            return {
              email,
              user,
              messages:
                sorted,
              latest,
              messageCount:
                sorted.length,
              unread,
            };
          }
        )
        .sort(
          (a, b) =>
            new Date(
              b.latest?.createdAt ||
                0
            ) -
            new Date(
              a.latest?.createdAt ||
                0
            )
        );
    }, [
      supportMessages,
      users,
    ]);

  // ===========================================================
  // UNREAD SUPPORT
  // ===========================================================

  const unreadSupportCount =
    useMemo(() => {
      return supportMessages.filter(
        (message) =>
          senderOf(message) ===
          "USER"
      ).length;
    }, [
      supportMessages,
    ]);

  // ===========================================================
  // STATS
  // ===========================================================

  const stats =
    useMemo(() => {
      const blocked =
        users.filter(
          (user) =>
            isBlockedOf(user)
        ).length;

      const pending =
        requests.filter(
          (request) =>
            statusOf(request) ===
            "PENDING"
        ).length;

      return {
        users:
          users.length,

        providers:
          providers.length,

        services:
          services.length,

        requests:
          requests.length,

        pending,

        supportMessages:
          supportMessages.length,

        blocked,
      };
    }, [
      users,
      providers,
      services,
      requests,
      supportMessages,
    ]);

  // ===========================================================
  // FILTER USERS
  // ===========================================================

  const filteredUsers =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return allAccounts.filter(
        (user) => {
          const text = `
            ${idOf(user)}
            ${nameOf(user)}
            ${emailOf(user)}
            ${phoneOf(user)}
            ${roleOf(user)}
            ${user?.username || ""}
            ${user?.userName || ""}
          `.toLowerCase();

          return (
            !q ||
            text.includes(q)
          );
        }
      );
    }, [
      allAccounts,
      query,
    ]);

  // ===========================================================
  // FILTER PROVIDERS
  // ===========================================================

  const filteredProviders =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return providers.filter(
        (provider) => {
          const text = `
            ${idOf(provider)}
            ${nameOf(provider)}
            ${emailOf(provider)}
            ${phoneOf(provider)}
          `.toLowerCase();

          return (
            !q ||
            text.includes(q)
          );
        }
      );
    }, [
      providers,
      query,
    ]);

  // ===========================================================
  // FILTER SERVICES
  // ===========================================================

  const filteredServices =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return services.filter(
        (service) => {
          const text = `
            ${idOf(service)}
            ${nameOf(service)}
            ${service?.category || ""}
            ${service?.location || ""}
          `.toLowerCase();

          return (
            !q ||
            text.includes(q)
          );
        }
      );
    }, [
      services,
      query,
    ]);

  // ===========================================================
  // FILTER REQUESTS
  // ===========================================================

  const filteredRequests =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return requests.filter(
        (request) => {
          const text = `
            ${idOf(request)}
            ${request?.customerName || ""}
            ${request?.serviceName || ""}
            ${statusOf(request)}
          `.toLowerCase();

          const searchMatch =
            !q ||
            text.includes(q);

          const statusMatch =
            statusFilter ===
              "ALL" ||
            statusOf(request) ===
              statusFilter;

          return (
            searchMatch &&
            statusMatch
          );
        }
      );
    }, [
      requests,
      query,
      statusFilter,
    ]);

  // ===========================================================
  // FILTER SUPPORT
  // ===========================================================

  const filteredSupportConversations =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return supportConversations.filter(
        (conversation) => {
          const user =
            conversation.user;

          const latest =
            conversation.latest;

          const text = `
            ${idOf(user)}
            ${nameOf(user)}
            ${user?.username || ""}
            ${emailOf(user)}
            ${phoneOf(user)}
            ${latest?.message || ""}
            ${latest?.sender || ""}
          `.toLowerCase();

          return (
            !q ||
            text.includes(q)
          );
        }
      );
    }, [
      supportConversations,
      query,
    ]);

  // ===========================================================
  // VIEW ALL SUPPORT
  // ===========================================================

  const handleViewAll =
    () => {
      setQuery("");
      setUserIdSearch("");
      setSearchedUser(null);
      setUserSearchError("");
      setActiveTab("support");
    };

  // ===========================================================
  // LOGOUT
  // ===========================================================

  const logout = () => {
    [
      "isLoggedIn",
      "loggedInUser",
      "loggedInUserId",
      "userEmail",
      "userPhone",
      "userRole",
      "rememberMe",
      "loginType",
      "googleUser",
    ].forEach(
      (key) =>
        localStorage.removeItem(
          key
        )
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ===========================================================
  // NOT ADMIN
  // ===========================================================

  if (!isAdmin) {
    return null;
  }

  // ===========================================================
  // UI
  // ===========================================================

  return (
    <div className="admin-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            🌱
          </div>

          <div>
            <strong>
              GramaCare
            </strong>

            <span>
              Admin Panel
            </span>
          </div>

        </div>

        <div className="admin-nav-title">
          MANAGEMENT
        </div>

        {[
          [
            "overview",
            "▦",
            "Overview",
          ],
          [
            "users",
            "👥",
            "All Accounts",
          ],
          [
            "providers",
            "🧑‍🔧",
            "Providers",
          ],
          [
            "services",
            "🛠",
            "Services",
          ],
          [
            "requests",
            "✉",
            "Requests",
          ],
          [
            "support",
            "💬",
            "Support Messages",
          ],
        ].map(
          ([
            key,
            icon,
            label,
          ]) => (
            <button
              key={key}
              type="button"
              className={`admin-nav-item ${
                activeTab === key
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab(key)
              }
            >
              <span>
                {icon}
              </span>

              {label}

              {key ===
                "support" &&
                unreadSupportCount >
                  0 && (
                  <span className="support-unread-badge">
                    {
                      unreadSupportCount
                    }
                  </span>
                )}
            </button>
          )
        )}

        <div className="admin-sidebar-spacer" />

        <button
          type="button"
          className="admin-logout"
          onClick={logout}
        >
          ⇥ Logout
        </button>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div>

            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage users, requests and
              direct support communication.
            </p>

          </div>

          <div className="admin-topbar-actions">

            <span className="admin-email">
              {ADMIN_EMAIL}
            </span>

            <button
              type="button"
              className="admin-refresh"
              onClick={loadData}
              disabled={refreshing}
            >
              {refreshing
                ? "⏳ Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

        </header>

        {/* ALERT */}

        {error && (
          <div className="admin-alert">
            ⚠ {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div className="admin-notice">
            ✓ {notice}
          </div>
        )}

        {/* ===================================================
            DIRECT USER SEARCH
        =================================================== */}

        <section className="admin-direct-user-search">

          <div className="direct-search-title">

            <span className="direct-search-icon">
              🔎
            </span>

            <div>
              <h2>
                Direct User Access
              </h2>

              <p>
                Search by User ID,
                Username, Name, Email
                or Phone.
              </p>
            </div>

          </div>

          <div className="direct-search-box">

            <input
              type="text"
              value={
                userIdSearch
              }
              onChange={(event) => {
                setUserIdSearch(
                  event.target.value
                );

                setUserSearchError("");
              }}
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  searchUserById();
                }
              }}
              placeholder="Enter User ID / Username / Email / Phone"
            />

            <button
              type="button"
              onClick={
                searchUserById
              }
            >
              🔎 Search User
            </button>

            <button
              type="button"
              className="support-show-all"
              onClick={
                handleViewAll
              }
            >
              📋 View All
            </button>

          </div>

          {userSearchError && (
            <div className="user-search-error">
              ⚠ {userSearchError}
            </div>
          )}

          {/* SEARCHED USER */}

          {searchedUser && (
            <div className="direct-user-card">

              <div className="direct-user-avatar">
                {nameOf(
                  searchedUser
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="direct-user-info">

                <h3>
                  {nameOf(
                    searchedUser
                  )}
                </h3>

                <p>
                  User ID:{" "}
                  <strong>
                    {idOf(
                      searchedUser
                    )}
                  </strong>
                </p>

                <p>
                  Username:{" "}
                  <strong>
                    {searchedUser?.username ||
                      searchedUser?.userName ||
                      "-"}
                  </strong>
                </p>

                <p>
                  📧{" "}
                  {emailOf(
                    searchedUser
                  ) || "-"}
                </p>

                <p>
                  📞{" "}
                  {phoneOf(
                    searchedUser
                  ) ||
                    "Phone not available"}
                </p>

                <p>
                  👤 Role:{" "}
                  {roleOf(
                    searchedUser
                  ) || "USER"}
                </p>

                <span
                  className={
                    isBlockedOf(
                      searchedUser
                    )
                      ? "status-pill blocked"
                      : "status-pill active"
                  }
                >
                  {isBlockedOf(
                    searchedUser
                  )
                    ? "BLOCKED"
                    : "ACTIVE"}
                </span>

              </div>

              <div className="direct-user-actions">

                <button
                  type="button"
                  className="direct-message-button"
                  onClick={
                    messageSearchedUser
                  }
                >
                  💬 Message
                </button>

                <button
                  type="button"
                  className="direct-call-button"
                  onClick={() =>
                    callUser(
                      searchedUser
                    )
                  }
                >
                  📞 Call
                </button>

                <button
                  type="button"
                  className="direct-whatsapp-button"
                  onClick={() =>
                    openWhatsApp(
                      searchedUser
                    )
                  }
                >
                  📱 WhatsApp
                </button>

                <button
                  type="button"
                  className={
                    isBlockedOf(
                      searchedUser
                    )
                      ? "direct-unblock-button"
                      : "direct-block-button"
                  }
                  onClick={() =>
                    toggleBlock(
                      searchedUser
                    )
                  }
                >
                  {isBlockedOf(
                    searchedUser
                  )
                    ? "🔓 Unblock"
                    : "🚫 Block"}
                </button>

                <button
                  type="button"
                  className="view-button"
                  onClick={
                    clearUserSearch
                  }
                >
                  ✕ Clear
                </button>

              </div>

            </div>
          )}

        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="admin-stats-grid">

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              setActiveTab("users")
            }
          >
            <span className="stat-icon">
              👥
            </span>

            <span>
              <small>
                Total Users
              </small>

              <strong>
                {stats.users}
              </strong>
            </span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              setActiveTab(
                "providers"
              )
            }
          >
            <span className="stat-icon">
              🧑‍🔧
            </span>

            <span>
              <small>
                Providers
              </small>

              <strong>
                {stats.providers}
              </strong>
            </span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              setActiveTab(
                "services"
              )
            }
          >
            <span className="stat-icon">
              🛠
            </span>

            <span>
              <small>
                Services
              </small>

              <strong>
                {stats.services}
              </strong>
            </span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              setActiveTab(
                "requests"
              )
            }
          >
            <span className="stat-icon">
              ✉
            </span>

            <span>
              <small>
                Requests
              </small>

              <strong>
                {stats.requests}
              </strong>
            </span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              setActiveTab("users")
            }
          >
            <span className="stat-icon">
              🚫
            </span>

            <span>
              <small>
                Blocked Users
              </small>

              <strong>
                {stats.blocked}
              </strong>
            </span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              setActiveTab(
                "support"
              )
            }
          >
            <span className="stat-icon">
              💬
            </span>

            <span>
              <small>
                Support Messages
              </small>

              <strong>
                {stats.supportMessages}
              </strong>
            </span>
          </button>

        </section>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section className="admin-toolbar">

          <div className="admin-search">

            <span>
              🔎
            </span>

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder={
                activeTab ===
                "support"
                  ? "Search user / email / phone / message..."
                  : "Search..."
              }
            />

          </div>

          {activeTab ===
            "requests" && (
            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="ACCEPTED">
                Accepted
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          )}

        </section>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <section className="admin-content-card">

          {loading ? (

            <div className="admin-loading">
              ⏳ Loading...
            </div>

          ) : activeTab ===
            "overview" ? (

            <div className="overview-grid">

              <div className="overview-panel">

                <h2>
                  GramaCare Overview
                </h2>

                <div className="overview-list">

                  <div>
                    <span>
                      Registered Users
                    </span>

                    <strong>
                      {stats.users}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Providers
                    </span>

                    <strong>
                      {stats.providers}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Services
                    </span>

                    <strong>
                      {stats.services}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Requests
                    </span>

                    <strong>
                      {stats.requests}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Support Messages
                    </span>

                    <strong>
                      {stats.supportMessages}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Blocked Users
                    </span>

                    <strong>
                      {stats.blocked}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="overview-panel">

                <h2>
                  Direct User Communication
                </h2>

                <p>
                  🔎 Search User ID,
                  Username, Name, Email
                  or Phone.
                </p>

                <p>
                  💬 Send direct message
                </p>

                <p>
                  📞 Call user
                </p>

                <p>
                  📱 WhatsApp user
                </p>

                <p>
                  🚫 Block user
                </p>

                <p>
                  🔓 Unblock user
                </p>

                <p>
                  📋 View All Support
                  Conversations
                </p>

                <p>
                  🗑 Delete support messages
                </p>

              </div>

            </div>

          ) : activeTab ===
            "users" ? (

            <div className="admin-table-wrap">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map(
                    (user) => {

                      const blocked =
                        isBlockedOf(
                          user
                        );

                      const isAdminAccount =
                        emailOf(user)
                          .trim()
                          .toLowerCase() ===
                        ADMIN_EMAIL.toLowerCase();

                      return (
                        <tr
                          key={
                            String(
                              idOf(user)
                            )
                          }
                        >

                          <td>
                            {idOf(user) ??
                              "-"}
                          </td>

                          <td>
                            {nameOf(
                              user
                            )}
                          </td>

                          <td>
                            {user?.username ||
                              user?.userName ||
                              "-"}
                          </td>

                          <td>
                            {emailOf(
                              user
                            ) || "-"}
                          </td>

                          <td>
                            {phoneOf(
                              user
                            ) || "-"}
                          </td>

                          <td>
                            {roleOf(
                              user
                            ) || "USER"}
                          </td>

                          <td>
                            <span
                              className={
                                blocked
                                  ? "status-pill blocked"
                                  : "status-pill active"
                              }
                            >
                              {blocked
                                ? "Blocked"
                                : "Active"}
                            </span>
                          </td>

                          <td>

                            <div className="table-actions">

                              <button
                                type="button"
                                className="view-button"
                                onClick={() =>
                                  setSearchedUser(
                                    user
                                  )
                                }
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className="direct-message-small"
                                onClick={() =>
                                  openSupportChat(
                                    user
                                  )
                                }
                                title="Message user"
                              >
                                💬
                              </button>

                              <button
                                type="button"
                                className="direct-call-small"
                                onClick={() =>
                                  callUser(
                                    user
                                  )
                                }
                                title="Call user"
                              >
                                📞
                              </button>

                              {!isAdminAccount && (
                                <button
                                  type="button"
                                  className={
                                    blocked
                                      ? "unblock-button"
                                      : "block-button"
                                  }
                                  onClick={() =>
                                    toggleBlock(
                                      user
                                    )
                                  }
                                  title={
                                    blocked
                                      ? "Unblock user"
                                      : "Block user"
                                  }
                                >
                                  {blocked
                                    ? "🔓 Unblock"
                                    : "🚫 Block"}
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

              {filteredUsers.length ===
                0 && (
                <div className="admin-empty">
                  No users found.
                </div>
              )}

            </div>

          ) : activeTab ===
            "providers" ? (

            <Table
              headers={[
                "ID",
                "Provider",
                "Email",
                "Phone",
              ]}
              rows={filteredProviders.map(
                (item) => [
                  idOf(item),
                  nameOf(item),
                  emailOf(item) ||
                    "-",
                  phoneOf(item) ||
                    "-",
                ]
              )}
              empty="No providers found."
            />

          ) : activeTab ===
            "services" ? (

            <Table
              headers={[
                "ID",
                "Service",
                "Category",
                "Location",
                "Price",
                "Available",
              ]}
              rows={filteredServices.map(
                (item) => [
                  idOf(item),
                  nameOf(item),
                  item?.category ||
                    "-",
                  item?.location ||
                    "-",
                  item?.price !=
                  null
                    ? `₹ ${item.price}`
                    : "-",
                  item?.available ===
                  false
                    ? "No"
                    : "Yes",
                ]
              )}
              empty="No services found."
            />

          ) : activeTab ===
            "requests" ? (

            <Table
              headers={[
                "ID",
                "Customer",
                "Service",
                "Status",
                "Created",
              ]}
              rows={filteredRequests.map(
                (item) => [
                  item?.id ??
                    item?.requestId ??
                    "-",

                  item?.customerName ??
                    item?.user?.fullName ??
                    "Customer",

                  item?.serviceName ??
                    item?.service?.name ??
                    "Service",

                  statusOf(item),

                  formatDateTime(
                    item?.createdAt
                  ),
                ]
              )}
              empty="No requests found."
            />

          ) : (

            // =================================================
            // SUPPORT
            // =================================================

            <div className="support-admin-section">

              <div className="support-header">

                <div>
                  <h2>
                    💬 Support Messages
                  </h2>

                  <p>
                    Admin → specific user
                    direct communication
                  </p>
                </div>

                <div className="support-header-actions">

                  <span className="support-total">
                    {
                      filteredSupportConversations.length
                    }{" "}
                    Conversations
                  </span>

                  <button
                    type="button"
                    className="admin-refresh"
                    onClick={
                      loadSupportMessages
                    }
                  >
                    ↻ Refresh
                  </button>

                </div>

              </div>

              {/* SHOW ALL */}

              <div className="support-show-all-bar">

                <button
                  type="button"
                  className="support-show-all active"
                  onClick={
                    handleViewAll
                  }
                >
                  📋 View All
                </button>

                <span>
                  {
                    filteredSupportConversations.length
                  }{" "}
                  conversation(s)
                </span>

              </div>

              {filteredSupportConversations.length ===
              0 ? (

                <div className="admin-empty">

                  <div
                    style={{
                      fontSize:
                        "45px",
                    }}
                  >
                    💬
                  </div>

                  No support conversations.

                </div>

              ) : (

                <div className="support-message-list">

                  {filteredSupportConversations.map(
                    (conversation) => {

                      const user =
                        conversation.user;

                      const latest =
                        conversation.latest;

                      const blocked =
                        isBlockedOf(
                          user
                        );

                      return (
                        <div
                          className="support-message-card"
                          key={
                            conversation.email
                          }
                        >

                          <div className="support-avatar">

                            {String(
                              nameOf(
                                user
                              ) ||
                                "U"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="support-message-main">

                            <div className="support-user-row">

                              <div>

                                <h3>
                                  {nameOf(
                                    user
                                  )}
                                </h3>

                                <span className="support-email">
                                  {emailOf(
                                    user
                                  )}
                                </span>

                                {phoneOf(
                                  user
                                ) && (
                                  <span className="support-phone">
                                    📞{" "}
                                    {phoneOf(
                                      user
                                    )}
                                  </span>
                                )}

                              </div>

                              <span className="support-time">
                                {formatDateTime(
                                  latest?.createdAt
                                )}
                              </span>

                            </div>

                            <div className="support-message-preview">

                              <span className="support-sender">
                                {senderOf(
                                  latest
                                ) ===
                                "ADMIN"
                                  ? "Admin:"
                                  : "User:"}
                              </span>

                              <span>
                                {latest?.message ||
                                  ""}
                              </span>

                            </div>

                            <div className="support-card-bottom">

                              <div>

                                <span className="support-status read">
                                  💬{" "}
                                  {
                                    conversation.messageCount
                                  }{" "}
                                  messages
                                </span>

                                {latest &&
                                  senderOf(
                                    latest
                                  ) ===
                                    "USER" && (
                                    <span className="support-status">
                                      🔔 New User Message
                                    </span>
                                  )}

                                {blocked && (
                                  <span className="status-pill blocked">
                                    BLOCKED
                                  </span>
                                )}

                              </div>

                              <div className="support-actions">

                                <button
                                  type="button"
                                  className="support-view-button"
                                  onClick={() =>
                                    openSupportChat(
                                      user
                                    )
                                  }
                                >
                                  💬 Message
                                </button>

                                <button
                                  type="button"
                                  className="support-call-button"
                                  onClick={() =>
                                    callUser(
                                      user
                                    )
                                  }
                                >
                                  📞 Call
                                </button>

                                <button
                                  type="button"
                                  className="support-whatsapp-button"
                                  onClick={() =>
                                    openWhatsApp(
                                      user
                                    )
                                  }
                                >
                                  📱 WhatsApp
                                </button>

                                <button
                                  type="button"
                                  className={
                                    blocked
                                      ? "unblock-button"
                                      : "block-button"
                                  }
                                  onClick={() =>
                                    toggleBlock(
                                      user
                                    )
                                  }
                                >
                                  {blocked
                                    ? "🔓 Unblock"
                                    : "🚫 Block"}
                                </button>

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>
          )}

        </section>

        {/* =====================================================
            CHAT MODAL
        ===================================================== */}

        {selectedMessage && (
          <div
            className="chat-modal-overlay"
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeSupportChat();
              }
            }}
          >

            <div
              className="whatsapp-chat-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="whatsapp-chat-header">

                <div className="whatsapp-user-avatar">

                  {String(
                    selectedMessage?.userName ||
                      "U"
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="whatsapp-user-details">

                  <strong>
                    {selectedMessage?.userName ||
                      "Unknown User"}
                  </strong>

                  <span>
                    {selectedMessage?.userEmail ||
                      "Unknown Email"}
                  </span>

                  {phoneOf(
                    selectedUser ||
                      selectedMessage
                  ) && (
                    <span>
                      📞{" "}
                      {phoneOf(
                        selectedUser ||
                          selectedMessage
                      )}
                    </span>
                  )}

                </div>

                <button
                  type="button"
                  className="admin-chat-call"
                  onClick={() =>
                    callUser(
                      selectedUser ||
                        selectedMessage
                    )
                  }
                  title="Call user"
                >
                  📞
                </button>

                <button
                  type="button"
                  className="admin-chat-whatsapp"
                  onClick={() =>
                    openWhatsApp(
                      selectedUser ||
                        selectedMessage
                    )
                  }
                  title="WhatsApp"
                >
                  📱
                </button>

                {selectedUser &&
                  emailOf(
                    selectedUser
                  ).toLowerCase() !==
                    ADMIN_EMAIL.toLowerCase() && (
                    <button
                      type="button"
                      className={
                        isBlockedOf(
                          selectedUser
                        )
                          ? "direct-unblock-button"
                          : "direct-block-button"
                      }
                      onClick={() =>
                        toggleBlock(
                          selectedUser
                        )
                      }
                      title={
                        isBlockedOf(
                          selectedUser
                        )
                          ? "Unblock user"
                          : "Block user"
                      }
                    >
                      {isBlockedOf(
                        selectedUser
                      )
                        ? "🔓"
                        : "🚫"}
                    </button>
                  )}

                <button
                  type="button"
                  className="whatsapp-close"
                  onClick={
                    closeSupportChat
                  }
                >
                  ×
                </button>

              </div>

              {/* BODY */}

              <div className="whatsapp-chat-body">

                <div className="chat-date">
                  🔒 Complete Support Conversation
                </div>

                {chatLoading ? (

                  <div className="chat-loading">
                    ⏳ Loading conversation...
                  </div>

                ) : chatMessages.length ===
                  0 ? (

                  <div className="chat-empty">

                    <div
                      style={{
                        fontSize:
                          "40px",
                      }}
                    >
                      💬
                    </div>

                    <p>
                      No messages yet.
                    </p>

                    <small>
                      You can send the
                      first message to
                      this user.
                    </small>

                  </div>

                ) : (

                  chatMessages.map(
                    (message) => {

                      const isAdminMessage =
                        senderOf(
                          message
                        ) ===
                        "ADMIN";

                      return (
                        <div
                          key={
                            message.id
                          }
                          className={`chat-row ${
                            isAdminMessage
                              ? "admin-row"
                              : "user-row"
                          }`}
                        >

                          <div
                            className={`chat-bubble ${
                              isAdminMessage
                                ? "admin-bubble"
                                : "user-bubble"
                            }`}
                          >

                            <div className="chat-sender">

                              {isAdminMessage
                                ? "GramaCare Admin"
                                : message.userName ||
                                  "User"}

                            </div>

                            <div className="chat-text">

                              {
                                message.message
                              }

                            </div>

                            <div className="chat-time-row">

                              <span className="chat-time">
                                {formatTime(
                                  message.createdAt
                                )}
                              </span>

                              {isAdminMessage && (
                                <span className="chat-ticks">
                                  ✓✓
                                </span>
                              )}

                            </div>

                            {/* DELETE */}

                            <button
                              type="button"
                              className="chat-message-delete"
                              onClick={() =>
                                deleteSupportMessage(
                                  message
                                )
                              }
                              disabled={
                                deletingMessageId ===
                                message.id
                              }
                              title="Delete message"
                            >
                              {deletingMessageId ===
                              message.id
                                ? "⏳"
                                : "🗑"}
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )

                )}

              </div>

              {/* FOOTER */}

              <div className="whatsapp-chat-footer">

                <div className="admin-chat-input-wrap">

                  <textarea
                    value={
                      replyText
                    }
                    onChange={(event) =>
                      setReplyText(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={
                      handleReplyKeyDown
                    }
                    placeholder={`Message ${
                      selectedMessage?.userName ||
                      "user"
                    }...`}
                    rows="1"
                    maxLength={1000}
                    disabled={
                      sendingReply
                    }
                  />

                  <span className="reply-hint">
                    Enter = Send • Shift+Enter = New line
                  </span>

                </div>

                <button
                  type="button"
                  className="chat-send-button"
                  onClick={
                    sendAdminReply
                  }
                  disabled={
                    sendingReply ||
                    !replyText.trim()
                  }
                >
                  {sendingReply
                    ? "..."
                    : "➤"}
                </button>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

// =============================================================
// TABLE COMPONENT
// =============================================================

const Table = ({
  headers,
  rows,
  empty,
}) => {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        {empty}
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">

      <table className="admin-table">

        <thead>
          <tr>
            {headers.map(
              (header) => (
                <th key={header}>
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>

          {rows.map(
            (
              row,
              rowIndex
            ) => (
              <tr
                key={rowIndex}
              >
                {row.map(
                  (
                    cell,
                    cellIndex
                  ) => (
                    <td
                      key={
                        cellIndex
                      }
                    >
                      {cell}
                    </td>
                  )
                )}
              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
};

export default AdminDashboard;