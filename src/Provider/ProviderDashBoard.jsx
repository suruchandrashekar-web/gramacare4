  import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
  } from "react";

  import {
    Link,
    useNavigate,
  } from "react-router-dom";

  import "./ProviderDashBoard.css";

  // =====================================================
  // API
  // =====================================================

  const API_BASE_URL = "http://localhost:8082";

  // =====================================================
  // LIST LIMITS
  // =====================================================

  const INITIAL_VISIBLE_COUNT = 3;
  const MAX_VISIBLE_COUNT = 10;

  // =====================================================
  // HELPERS
  // =====================================================

  const isValidId = (value) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number > 0;
  };

  const isValidCoordinate = (
    latitude,
    longitude
  ) => {
    const lat = Number(latitude);
    const lon = Number(longitude);

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  };

  const normalizeText = (value) =>
    String(value ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const extractArray = (
    data,
    keys = []
  ) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

  const safeJson = async (response) => {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  // =====================================================
  // CURRENT USER
  // =====================================================

  const getLoggedInUser = () => {
    const savedUser =
      localStorage.getItem("loggedInUser");

    const savedProvider =
      localStorage.getItem(
        "palleconnect_current_user"
      );

    const savedUserId =
      localStorage.getItem(
        "loggedInUserId"
      );

    const savedProviderId =
      localStorage.getItem(
        "loggedInProviderId"
      );

    const savedEmail =
      localStorage.getItem("userEmail");

    let user = null;

    if (savedUser) {
      try {
        user = JSON.parse(savedUser);
      } catch {
        user = null;
      }
    }

    if (!user && savedProvider) {
      try {
        user = JSON.parse(savedProvider);
      } catch {
        user = null;
      }
    }

    user = user || {};

    const role = String(
      user?.role ||
        localStorage.getItem("userRole") ||
        ""
    ).toUpperCase();

    let id =
      user?.providerId ??
      user?.provider?.id ??
      user?.provider?.userId ??
      user?.id ??
      user?.userId ??
      null;

    if (!isValidId(id)) {
      id =
        savedProviderId ||
        savedUserId ||
        null;
    }

    return {
      id: isValidId(id)
        ? Number(id)
        : null,

      name:
        user?.fullName ||
        user?.name ||
        user?.username ||
        "Provider",

      email:
        user?.email ||
        savedEmail ||
        "",

      mobile:
        user?.mobile ||
        user?.phone ||
        user?.mobileNumber ||
        user?.phoneNumber ||
        "",

      village:
        user?.village || "",

      district:
        user?.district || "",

      role,
    };
  };

  // =====================================================
  // COORDINATES
  // =====================================================

  const getCoordinates = (service) => {
    const provider =
      service?.provider || {};

    const pairs = [
      [
        service?.latitude,
        service?.longitude,
      ],
      [
        service?.lat,
        service?.lng,
      ],
      [
        service?.lat,
        service?.lon,
      ],
      [
        provider?.latitude,
        provider?.longitude,
      ],
      [
        provider?.lat,
        provider?.lng,
      ],
      [
        service?.providerLatitude,
        service?.providerLongitude,
      ],
    ];

    for (const pair of pairs) {
      const latitude = Number(pair[0]);
      const longitude = Number(pair[1]);

      if (
        isValidCoordinate(
          latitude,
          longitude
        )
      ) {
        return {
          latitude,
          longitude,
        };
      }
    }

    return null;
  };

  // =====================================================
  // DISTANCE
  // =====================================================

  const calculateDistance = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
  ) => {
    if (
      !isValidCoordinate(
        latitude1,
        longitude1
      ) ||
      !isValidCoordinate(
        latitude2,
        longitude2
      )
    ) {
      return null;
    }

    const earthRadius = 6371;

    const lat1 =
      (Number(latitude1) * Math.PI) / 180;

    const lat2 =
      (Number(latitude2) * Math.PI) / 180;

    const deltaLatitude =
      ((Number(latitude2) -
        Number(latitude1)) *
        Math.PI) /
      180;

    const deltaLongitude =
      ((Number(longitude2) -
        Number(longitude1)) *
        Math.PI) /
      180;

    const a =
      Math.sin(
        deltaLatitude / 2
      ) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(
          deltaLongitude / 2
        ) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return Number.isFinite(
      earthRadius * c
    )
      ? earthRadius * c
      : null;
  };

  const formatDistance = (distance) => {
    if (
      distance === null ||
      distance === undefined ||
      !Number.isFinite(distance)
    ) {
      return "Distance unavailable";
    }

    if (distance < 1) {
      return `${Math.round(
        distance * 1000
      )} m away`;
    }

    return `${distance.toFixed(1)} km away`;
  };

  // =====================================================
  // MOBILE
  // =====================================================

  const cleanMobileNumber = (mobile) => {
    if (
      mobile === null ||
      mobile === undefined
    ) {
      return "";
    }

    return String(mobile)
      .trim()
      .replace(/\s+/g, "");
  };

  const getProviderMobile = (service) => {
    const provider =
      service?.provider ||
      service?.providerDetails ||
      service?.user ||
      {};

    const values = [
      service?.providerMobile,
      service?.providerPhone,
      service?.providerMobileNumber,
      service?.providerPhoneNumber,
      service?.mobile,
      service?.phone,
      service?.mobileNumber,
      service?.phoneNumber,
      provider?.mobile,
      provider?.phone,
      provider?.mobileNumber,
      provider?.phoneNumber,
      provider?.contactNumber,
      provider?.phoneNo,
    ];

    for (const value of values) {
      const mobile =
        cleanMobileNumber(value);

      if (mobile) {
        return mobile;
      }
    }

    return "";
  };

  // Fetch the real account record when the service/request payload
  // does not contain the mobile number. This is what makes the
  // Call button work with the exact account behind the ID.
  const getAccountMobile = async (accountId, providerOnly = false) => {
    if (!isValidId(accountId)) {
      return "";
    }

    const readMobile = (account) => {
      if (!account) return "";

      const nested = [
        account,
        account?.user,
        account?.provider,
        account?.customer,
        account?.data,
      ].filter(Boolean);

      for (const item of nested) {
        const values = [
          item?.mobile,
          item?.phone,
          item?.mobileNumber,
          item?.phoneNumber,
          item?.contactNumber,
          item?.phoneNo,
        ];

        for (const value of values) {
          const mobile = cleanMobileNumber(value);
          if (mobile) return mobile;
        }
      }

      return "";
    };

    // First try the account-by-id endpoint used by the project.
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${Number(accountId)}`,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (response.ok) {
        const data = await safeJson(response);
        const mobile = readMobile(data);
        if (mobile) return mobile;
      }
    } catch (error) {
      console.warn(
        "Account mobile lookup failed:",
        error
      );
    }

    // ProviderProfile in this project already uses this endpoint,
    // so use it as a provider fallback when the service has providerId.
    if (providerOnly) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/providers`,
          {
            headers: { Accept: "application/json" },
          }
        );

        if (response.ok) {
          const data = await safeJson(response);
          const providers = extractArray(data, [
            "providers",
            "data",
            "content",
          ]);

          const provider = providers.find(
            (item) =>
              String(
                item?.id ??
                item?.userId ??
                item?.providerId
              ) === String(accountId)
          );

          const mobile = readMobile(provider);
          if (mobile) return mobile;
        }
      } catch (error) {
        console.warn(
          "Provider list mobile lookup failed:",
          error
        );
      }
    }

    return "";
  };

  // =====================================================
  // CALL PROVIDER
  // =====================================================

  const callProvider = async (service) => {
    // Use the number already returned by /api/services first.
    let mobile = getProviderMobile(service);

    // If it is missing, resolve the exact provider account by providerId.
    if (!mobile) {
      const providerId =
        service?.providerId ??
        service?.provider?.id ??
        service?.provider?.userId ??
        null;

      mobile = await getAccountMobile(
        providerId,
        true
      );
    }

    if (!mobile) {
      window.alert(
        "This provider account has no mobile number in the backend. Please add the mobile number to that user account."
      );
      return;
    }

    // Open the device phone dialer for the exact account.
    window.location.assign(`tel:${mobile}`);
  };

  // =====================================================
  // STATUS
  // =====================================================

  const normalizeStatus = (status) =>
    String(status || "PENDING")
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, "_");

  const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
      case "ACCEPTED":
        return "Accepted";

      case "REJECTED":
        return "Not Interested";

      case "IN_PROGRESS":
        return "In Progress";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      case "DELETED":
        return "Deleted";

      default:
        return "Pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case "ACCEPTED":
        return "✅";

      case "REJECTED":
        return "❌";

      case "IN_PROGRESS":
        return "🔄";

      case "COMPLETED":
        return "🎉";

      case "CANCELLED":
        return "🚫";

      case "DELETED":
        return "🗑️";

      default:
        return "⏳";
    }
  };

  // =====================================================
  // REQUEST NORMALIZER
  // =====================================================

  const normalizeRequest = (
    request,
    fallbackProviderId = null
  ) => {
    if (!request) {
      return null;
    }

    const user =
      request?.user ||
      request?.customer ||
      request?.requestedBy ||
      {};

    const service =
      request?.service || {};

    const requestId =
      request?.requestId ??
      request?.id ??
      null;

    if (!isValidId(requestId)) {
      return null;
    }

    const providerId =
      request?.providerId ??
      request?.provider?.id ??
      request?.provider?.userId ??
      service?.providerId ??
      service?.provider?.id ??
      service?.provider?.userId ??
      fallbackProviderId ??
      null;

    const customerId =
      request?.customerId ??
      request?.userId ??
      request?.customer?.id ??
      request?.user?.id ??
      user?.id ??
      user?.userId ??
      null;

    const serviceId =
      request?.serviceId ??
      service?.id ??
      null;

    return {
      ...request,

      id: Number(requestId),

      requestId: Number(requestId),

      providerId: isValidId(providerId)
        ? Number(providerId)
        : null,

      customerId: isValidId(customerId)
        ? Number(customerId)
        : null,

      userId: isValidId(customerId)
        ? Number(customerId)
        : null,

      serviceId: isValidId(serviceId)
        ? Number(serviceId)
        : null,

      customerName:
        request?.customerName ||
        user?.fullName ||
        user?.name ||
        user?.username ||
        "Customer",

      customerEmail:
        request?.customerEmail ||
        user?.email ||
        "",

      customerMobile:
        request?.customerMobile ||
        request?.mobile ||
        request?.phone ||
        user?.mobile ||
        user?.phone ||
        user?.mobileNumber ||
        user?.phoneNumber ||
        "",

      providerName:
        request?.providerName ||
        service?.provider?.fullName ||
        service?.provider?.name ||
        service?.provider?.username ||
        "Provider",

      serviceName:
        request?.serviceName ||
        service?.serviceName ||
        service?.name ||
        service?.work ||
        service?.jobType ||
        service?.serviceType ||
        "Service",

      village:
        request?.village ||
        user?.village ||
        service?.village ||
        "",

      district:
        request?.district ||
        user?.district ||
        service?.district ||
        "",

      location:
        request?.location ||
        service?.location ||
        [
          request?.village ||
            user?.village,
          request?.district ||
            user?.district,
        ]
          .filter(Boolean)
          .join(", "),

      message:
        request?.message ||
        request?.description ||
        "",

      createdAt:
        request?.createdAt ||
        request?.requestedAt ||
        request?.requestDate ||
        request?.date ||
        null,

      status: normalizeStatus(
        request?.status
      ),
    };
  };

  // =====================================================
  // MESSAGE NORMALIZER
  // =====================================================

  const normalizeMessage = (
    message,
    currentUserId
  ) => {
    if (!message) {
      return null;
    }

    const senderId =
      message?.senderId ??
      message?.sender?.id ??
      null;

    const receiverId =
      message?.receiverId ??
      message?.receiver?.id ??
      null;

    const sender =
      message?.sender || {};

    return {
      ...message,

      id:
        message?.id ??
        message?.messageId ??
        null,

      senderId: isValidId(senderId)
        ? Number(senderId)
        : null,

      receiverId: isValidId(receiverId)
        ? Number(receiverId)
        : null,

      senderRole: String(
        message?.senderRole ||
          message?.sender?.role ||
          ""
      ).toUpperCase(),

      receiverRole: String(
        message?.receiverRole ||
          message?.receiver?.role ||
          ""
      ).toUpperCase(),

      text:
        message?.message ||
        message?.content ||
        message?.text ||
        "",

      senderName:
        message?.senderName ||
        sender?.fullName ||
        sender?.name ||
        sender?.username ||
        "User",

      createdAt:
        message?.createdAt ||
        message?.timestamp ||
        message?.sentAt ||
        null,

      isFromCurrentUser:
        Number(senderId) ===
        Number(currentUserId),
    };
  };

  // =====================================================
  // COMPONENT
  // =====================================================

  function ProviderDashboard() {
    const navigate = useNavigate();

    // ===================================================
    // USER
    // ===================================================

    const [currentUser, setCurrentUser] =
      useState({
        id: null,
        name: "Provider",
        email: "",
        mobile: "",
        village: "",
        district: "",
        role: "",
      });

    // ===================================================
    // SEARCH
    // ===================================================

    const [search, setSearch] =
      useState("");

    const [
      selectedCategory,
      setSelectedCategory,
    ] = useState("ALL");

    const [
      showFilter,
      setShowFilter,
    ] = useState(false);

    // ===================================================
    // SERVICES
    // ===================================================

    const [services, setServices] =
      useState([]);

    const [loading, setLoading] =
      useState(true);

    const [
      backendError,
      setBackendError,
    ] = useState("");

    // ===================================================
    // GPS
    // ===================================================

    const [userLocation, setUserLocation] =
      useState(null);

    const [
      locationStatus,
      setLocationStatus,
    ] = useState(
      "Getting your current location..."
    );

    const [
      locationError,
      setLocationError,
    ] = useState("");

    // ===================================================
    // REQUEST MODAL
    // ===================================================

    const [
      selectedService,
      setSelectedService,
    ] = useState(null);

    const [
      requestMessage,
      setRequestMessage,
    ] = useState("");

    const [
      requestingServiceId,
      setRequestingServiceId,
    ] = useState(null);

    // ===================================================
    // CUSTOMER REQUESTS
    // ===================================================

    const [
      providerRequests,
      setProviderRequests,
    ] = useState([]);

    const [
      requestsLoading,
      setRequestsLoading,
    ] = useState(false);

    const [
      requestsError,
      setRequestsError,
    ] = useState("");

    // ===================================================
    // MY REQUESTS
    // ===================================================

    const [
      myRequests,
      setMyRequests,
    ] = useState([]);

    const [
      myRequestsLoading,
      setMyRequestsLoading,
    ] = useState(false);

    const [
      myRequestsError,
      setMyRequestsError,
    ] = useState("");

    // ===================================================
    // MESSAGES
    // ===================================================

    const [
      providerMessages,
      setProviderMessages,
    ] = useState([]);

    const [
      messagesLoading,
      setMessagesLoading,
    ] = useState(false);

    // ===================================================
    // SHOW ALL
    // ===================================================

    const [
      showAllMyRequests,
      setShowAllMyRequests,
    ] = useState(false);

    const [
      showAllProviderRequests,
      setShowAllProviderRequests,
    ] = useState(false);

    const [
      showAllMessages,
      setShowAllMessages,
    ] = useState(false);

    // ===================================================
    // DELETE
    // ===================================================

    const [
      deletingRequestId,
      setDeletingRequestId,
    ] = useState(null);

    const [
      deletingMessageId,
      setDeletingMessageId,
    ] = useState(null);

    const [
      deletingAllRequests,
      setDeletingAllRequests,
    ] = useState(false);

    // ===================================================
    // LAST UPDATE
    // ===================================================

    const [
      lastActivityUpdate,
      setLastActivityUpdate,
    ] = useState(null);

    // ===================================================
    // LOAD USER
    // ===================================================

    useEffect(() => {
      const user =
        getLoggedInUser();

      setCurrentUser(user);
    }, []);

    // ===================================================
    // GPS
    // ===================================================

    useEffect(() => {
      if (!navigator.geolocation) {
        setLocationStatus(
          "GPS is not supported by this browser."
        );

        setLocationError(
          "Please use a browser that supports location."
        );

        return;
      }

      const watchId =
        navigator.geolocation.watchPosition(
          (position) => {
            const latitude =
              Number(
                position.coords.latitude
              );

            const longitude =
              Number(
                position.coords.longitude
              );

            const accuracy =
              Number(
                position.coords.accuracy
              );

            if (
              !isValidCoordinate(
                latitude,
                longitude
              )
            ) {
              setUserLocation(null);

              setLocationStatus(
                "Invalid GPS location received."
              );

              return;
            }

            setUserLocation({
              latitude,
              longitude,
              accuracy:
                Number.isFinite(
                  accuracy
                )
                  ? accuracy
                  : 0,
            });

            setLocationStatus(
              "Your real-time location is active."
            );

            setLocationError("");
          },

          (error) => {
            console.error(
              "GPS Error:",
              error
            );

            setUserLocation(null);

            if (
              error.code ===
              error.PERMISSION_DENIED
            ) {
              setLocationStatus(
                "Location permission denied."
              );

              setLocationError(
                "Please allow location permission."
              );
            } else {
              setLocationStatus(
                "Unable to get location."
              );

              setLocationError(
                "Please try again."
              );
            }
          },

          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );

      return () => {
        navigator.geolocation.clearWatch(
          watchId
        );
      };
    }, []);

    // ===================================================
    // LOAD SERVICES
    // ===================================================

    const loadServices =
      useCallback(async () => {
        try {
          setLoading(true);
          setBackendError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/services`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `Service API error: ${response.status}`
                : data ||
                    `Service API error: ${response.status}`
            );
          }

          const list =
            extractArray(data, [
              "services",
              "data",
              "content",
            ]);

          const formatted =
            list.map((service) => {
              const provider =
                service?.provider ||
                {};

              const serviceId =
                service?.serviceId ??
                service?.id ??
                null;

              const providerId =
                service?.providerId ??
                provider?.id ??
                provider?.userId ??
                service?.userId ??
                null;

              const serviceName =
                service?.serviceName ||
                service?.name ||
                service?.work ||
                service?.jobType ||
                service?.serviceType ||
                service?.category ||
                "Service";

              const providerName =
                provider?.fullName ||
                provider?.name ||
                provider?.username ||
                service?.providerName ||
                "Provider";

              const providerEmail =
                provider?.email ||
                service?.providerEmail ||
                "";

              const providerMobile =
                getProviderMobile(
                  service
                );

              const category =
                service?.category ||
                service?.jobType ||
                service?.serviceType ||
                serviceName ||
                "Other";

              const village =
                service?.village ||
                provider?.village ||
                "";

              const district =
                service?.district ||
                provider?.district ||
                "";

              const location =
                service?.location ||
                [
                  village,
                  district,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "Location unavailable";

              const coordinates =
                getCoordinates(
                  service
                );

              return {
                ...service,

                id: serviceId,
                serviceId,

                providerId:
                  isValidId(providerId)
                    ? Number(providerId)
                    : null,

                provider,

                providerName,
                providerEmail,
                providerMobile,

                name: serviceName,
                serviceName,
                work: serviceName,

                category,

                village,
                district,
                location,

                price:
                  service?.price !==
                    undefined &&
                  service?.price !== null &&
                  service?.price !== ""
                    ? service.price
                    : "Contact provider",

                description:
                  service?.description ||
                  "",

                image:
                  service?.image ||
                  service?.imageUrl ||
                  provider?.profileImage ||
                  "",

                availability:
                  service?.available !==
                  undefined
                    ? service.available
                    : true,

                rating:
                  service?.rating ??
                  "New",

                experience:
                  service?.experience ||
                  "Not specified",

                latitude:
                  coordinates?.latitude ??
                  null,

                longitude:
                  coordinates?.longitude ??
                  null,
              };
            });

          setServices(
            formatted.filter(
              (service) =>
                isValidId(
                  service.serviceId
                )
            )
          );
        } catch (error) {
          console.error(
            "Service API Error:",
            error
          );

          setServices([]);

          setBackendError(
            error?.message ||
              "Unable to load services."
          );
        } finally {
          setLoading(false);
        }
      }, []);

    useEffect(() => {
      loadServices();
    }, [loadServices]);

    // ===================================================
    // LOAD CUSTOMER REQUESTS
    // ===================================================

    const loadProviderRequests =
      useCallback(async () => {
        const providerId =
          getLoggedInUser().id;

        if (!isValidId(providerId)) {
          return;
        }

        try {
          setRequestsLoading(true);
          setRequestsError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/requests/provider/${providerId}`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `Request API error: ${response.status}`
                : data ||
                    `Request API error: ${response.status}`
            );
          }

          const list =
            extractArray(data, [
              "requests",
              "data",
              "content",
            ]);

          const normalized =
            list
              .map((request) =>
                normalizeRequest(
                  request,
                  providerId
                )
              )
              .filter(Boolean)
              .filter(
                (request) =>
                  Number(
                    request.providerId
                  ) ===
                  Number(providerId)
              )
              .filter(
                (request) =>
                  request.status !==
                  "DELETED"
              );

          const unique =
            Array.from(
              new Map(
                normalized.map(
                  (request) => [
                    request.requestId,
                    request,
                  ]
                )
              ).values()
            );

          unique.sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ).getTime() -
              new Date(
                a.createdAt || 0
              ).getTime()
          );

          setProviderRequests(
            unique
          );
        } catch (error) {
          console.error(
            "Provider Request Error:",
            error
          );

          setRequestsError(
            error?.message ||
              "Unable to load customer requests."
          );
        } finally {
          setRequestsLoading(false);
        }
      }, []);

    // ===================================================
    // LOAD MY REQUESTS
    // ===================================================

    const loadMyRequests =
      useCallback(async () => {
        const userId =
          getLoggedInUser().id;

        if (!isValidId(userId)) {
          return;
        }

        try {
          setMyRequestsLoading(true);
          setMyRequestsError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/requests/user/${userId}`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `My request API error: ${response.status}`
                : data ||
                    `My request API error: ${response.status}`
            );
          }

          const list =
            extractArray(data, [
              "requests",
              "data",
              "content",
            ]);

          const normalized =
            list
              .map((request) =>
                normalizeRequest(request)
              )
              .filter(Boolean)
              .filter(
                (request) =>
                  Number(
                    request.customerId
                  ) === Number(userId)
              )
              .filter(
                (request) =>
                  request.status !==
                  "DELETED"
              );

          const unique =
            Array.from(
              new Map(
                normalized.map(
                  (request) => [
                    request.requestId,
                    request,
                  ]
                )
              ).values()
            );

          unique.sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ).getTime() -
              new Date(
                a.createdAt || 0
              ).getTime()
          );

          setMyRequests(unique);
        } catch (error) {
          console.error(
            "My Request Error:",
            error
          );

          setMyRequestsError(
            error?.message ||
              "Unable to load your requests."
          );
        } finally {
          setMyRequestsLoading(false);
        }
      }, []);

    // ===================================================
    // LOAD MESSAGES
    // ===================================================

    const loadProviderMessages =
      useCallback(async () => {
        const userId =
          getLoggedInUser().id;

        if (!isValidId(userId)) {
          return;
        }

        try {
          setMessagesLoading(true);

          const response =
            await fetch(
              `${API_BASE_URL}/api/messages/received/${userId}`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `Message API error: ${response.status}`
                : data ||
                    `Message API error: ${response.status}`
            );
          }

          const list =
            extractArray(data, [
              "messages",
              "data",
              "content",
            ]);

          const normalized =
            list
              .map((message) =>
                normalizeMessage(
                  message,
                  userId
                )
              )
              .filter(Boolean)
              .filter(
                (message) =>
                  Number(
                    message.receiverId
                  ) === Number(userId)
              );

          normalized.sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ).getTime() -
              new Date(
                a.createdAt || 0
              ).getTime()
          );

          setProviderMessages(
            normalized
          );
        } catch (error) {
          console.error(
            "Message API Error:",
            error
          );

          setProviderMessages([]);
        } finally {
          setMessagesLoading(false);
        }
      }, []);

    // ===================================================
    // INITIAL LOAD
    // ===================================================

    useEffect(() => {
      if (
        !isValidId(
          currentUser.id
        )
      ) {
        return;
      }

      loadProviderRequests();
      loadMyRequests();
      loadProviderMessages();

      setLastActivityUpdate(
        new Date()
      );
    }, [
      currentUser.id,
      loadProviderRequests,
      loadMyRequests,
      loadProviderMessages,
    ]);

    // ===================================================
    // AUTO REFRESH
    // ===================================================

    useEffect(() => {
      if (
        !isValidId(
          currentUser.id
        )
      ) {
        return;
      }

      const interval =
        setInterval(() => {
          loadProviderRequests();
          loadMyRequests();
          loadProviderMessages();

          setLastActivityUpdate(
            new Date()
          );
        }, 5000);

      return () =>
        clearInterval(interval);
    }, [
      currentUser.id,
      loadProviderRequests,
      loadMyRequests,
      loadProviderMessages,
    ]);

    // ===================================================
    // CATEGORIES
    // ===================================================

    const categories =
      useMemo(() => {
        const values =
          services
            .map(
              (service) =>
                service.category
            )
            .filter(Boolean)
            .map((value) =>
              String(value).trim()
            );

        return [
          "ALL",
          ...Array.from(
            new Set(values)
          ),
        ];
      }, [services]);

    // ===================================================
    // FILTERED SERVICES
    // ===================================================

    const hasActiveSearch =
      search.trim().length > 0 ||
      selectedCategory !== "ALL";

    const filteredServices =
      useMemo(() => {
        if (!hasActiveSearch) {
          return [];
        }

        const keyword =
          normalizeText(search);

        const words =
          keyword
            .split(" ")
            .filter(Boolean);

        return services
          .filter((service) => {
            if (
              selectedCategory !==
              "ALL"
            ) {
              if (
                normalizeText(
                  service.category
                ) !==
                normalizeText(
                  selectedCategory
                )
              ) {
                return false;
              }
            }

            if (words.length) {
              const searchable =
                normalizeText(
                  [
                    service.serviceName,
                    service.category,
                    service.work,
                    service.description,
                    service.village,
                    service.district,
                    service.location,
                    service.providerName,
                  ]
                    .filter(Boolean)
                    .join(" ")
                );

              return words.every(
                (word) =>
                  searchable.includes(
                    word
                  )
              );
            }

            return true;
          })
          .map((service) => {
            const coordinates =
              getCoordinates(
                service
              );

            let distance = null;

            if (
              userLocation &&
              coordinates
            ) {
              distance =
                calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  coordinates.latitude,
                  coordinates.longitude
                );
            }

            return {
              ...service,

              latitude:
                coordinates?.latitude ??
                service.latitude ??
                null,

              longitude:
                coordinates?.longitude ??
                service.longitude ??
                null,

              distance,

              hasProviderLocation:
                Boolean(coordinates),
            };
          })
          .sort((a, b) => {
            if (
              a.distance !== null &&
              b.distance !== null
            ) {
              return (
                a.distance -
                b.distance
              );
            }

            return 0;
          });
      }, [
        search,
        selectedCategory,
        services,
        userLocation,
        hasActiveSearch,
      ]);

    // ===================================================
    // REQUEST STATS
    // ===================================================

    const requestStats =
      useMemo(
        () => ({
          total:
            providerRequests.length,

          pending:
            providerRequests.filter(
              (request) =>
                request.status ===
                "PENDING"
            ).length,

          accepted:
            providerRequests.filter(
              (request) =>
                request.status ===
                  "ACCEPTED" ||
                request.status ===
                  "IN_PROGRESS"
            ).length,

          completed:
            providerRequests.filter(
              (request) =>
                request.status ===
                "COMPLETED"
            ).length,

          rejected:
            providerRequests.filter(
              (request) =>
                request.status ===
                "REJECTED"
            ).length,
        }),
        [providerRequests]
      );

    // ===================================================
    // MY REQUEST STATS
    // ===================================================

    const myRequestStats =
      useMemo(
        () => ({
          total:
            myRequests.length,

          pending:
            myRequests.filter(
              (request) =>
                request.status ===
                "PENDING"
            ).length,

          accepted:
            myRequests.filter(
              (request) =>
                request.status ===
                  "ACCEPTED" ||
                request.status ===
                  "IN_PROGRESS"
            ).length,

          rejected:
            myRequests.filter(
              (request) =>
                request.status ===
                "REJECTED"
            ).length,
        }),
        [myRequests]
      );

    // ===================================================
    // VISIBLE LISTS
    // ===================================================

    const visibleMyRequests =
      useMemo(() => {
        const limit =
          showAllMyRequests
            ? MAX_VISIBLE_COUNT
            : INITIAL_VISIBLE_COUNT;

        return myRequests.slice(
          0,
          limit
        );
      }, [
        myRequests,
        showAllMyRequests,
      ]);

    const visibleProviderRequests =
      useMemo(() => {
        const limit =
          showAllProviderRequests
            ? MAX_VISIBLE_COUNT
            : INITIAL_VISIBLE_COUNT;

        return providerRequests.slice(
          0,
          limit
        );
      }, [
        providerRequests,
        showAllProviderRequests,
      ]);

    const visibleMessages =
      useMemo(() => {
        const limit =
          showAllMessages
            ? MAX_VISIBLE_COUNT
            : INITIAL_VISIBLE_COUNT;

        return providerMessages.slice(
          0,
          limit
        );
      }, [
        providerMessages,
        showAllMessages,
      ]);

    // ===================================================
    // LOCATION
    // ===================================================

    const viewProviderLocation = (
      service
    ) => {
      const coordinates =
        getCoordinates(service);

      if (coordinates) {
        const url =
          `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      const location =
        service?.location ||
        [
          service?.village,
          service?.district,
        ]
          .filter(Boolean)
          .join(", ");

      if (!location) {
        window.alert(
          "Provider location is not available."
        );

        return;
      }

      const url =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location
        )}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

    // ===================================================
    // CALL PROVIDER
    // ===================================================
// =====================================================
// CALL CUSTOMER
// =====================================================

const getCustomerMobile = (request) => {
  const customer =
    request?.customer ||
    request?.user ||
    request?.requestedBy ||
    {};

  const mobile =
    request?.customerMobile ||
    request?.mobile ||
    request?.phone ||
    request?.customerPhone ||
    request?.userMobile ||
    request?.userPhone ||
    customer?.mobile ||
    customer?.phone ||
    customer?.mobileNumber ||
    customer?.phoneNumber ||
    "";

  if (!mobile) {
    return "";
  }

  return String(mobile)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\d+]/g, "");
};

const callCustomer = async (request) => {
  let mobile = getCustomerMobile(request);

  // If the request does not contain the phone, resolve the exact
  // customer account using customerId/userId.
  if (!mobile) {
    const customerId =
      request?.customerId ??
      request?.userId ??
      request?.customer?.id ??
      request?.user?.id ??
      null;

    mobile = await getAccountMobile(
      customerId,
      false
    );
  }

  if (!mobile) {
    window.alert(
      "This customer account has no mobile number in the backend. Please add the mobile number to that user account."
    );
    return;
  }

  window.location.assign(`tel:${mobile}`);
};

    // ===================================================
    // REQUEST MODAL
    // ===================================================

    const openRequestModal = (
      service
    ) => {
      const serviceId =
        Number(
          service?.serviceId
        );

      const providerId =
        Number(
          service?.providerId
        );

      const userId =
        getLoggedInUser().id;

      if (!isValidId(serviceId)) {
        window.alert(
          "Service ID is not available."
        );

        return;
      }

      if (!isValidId(providerId)) {
        window.alert(
          "Provider ID is not available."
        );

        return;
      }

      if (!isValidId(userId)) {
        navigate("/login");
        return;
      }

      if (
        Number(userId) ===
        Number(providerId)
      ) {
        window.alert(
          "You cannot request your own service."
        );

        return;
      }

      if (
        service?.availability === false
      ) {
        window.alert(
          "This service is currently unavailable."
        );

        return;
      }

      setSelectedService(service);

      setRequestMessage(
        `I need ${
          service.serviceName ||
          "this service"
        }. Please contact me.`
      );
    };

    const closeRequestModal = () => {
      if (
        requestingServiceId !==
        null
      ) {
        return;
      }

      setSelectedService(null);
      setRequestMessage("");
    };

    // ===================================================
    // SEND REQUEST
    // ===================================================

    const requestService =
      async () => {
        if (!selectedService) {
          return;
        }

        const customerId =
          getLoggedInUser().id;

        const serviceId =
          Number(
            selectedService.serviceId
          );

        if (!isValidId(customerId)) {
          navigate("/login");
          return;
        }

        if (!isValidId(serviceId)) {
          window.alert(
            "Service ID is not available."
          );

          return;
        }

        const message =
          requestMessage.trim() ||
          `I need ${
            selectedService.serviceName ||
            "this service"
          }. Please contact me.`;

        try {
          setRequestingServiceId(
            serviceId
          );

          const response =
            await fetch(
              `${API_BASE_URL}/api/requests`,
              {
                method: "POST",

                headers: {
                  Accept:
                    "application/json",

                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  userId:
                    Number(customerId),

                  serviceId:
                    Number(serviceId),

                  message,
                }),
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `Request failed: ${response.status}`
                : data ||
                    `Request failed: ${response.status}`
            );
          }

          setSelectedService(null);
          setRequestMessage("");

          await loadMyRequests();

          window.alert(
            "Service Request Sent Successfully! 🎉\n\nYour request is now Pending."
          );
        } catch (error) {
          console.error(
            "Send Request Error:",
            error
          );

          window.alert(
            `Unable to send request.\n\n${
              error?.message ||
              "Unknown error"
            }`
          );
        } finally {
          setRequestingServiceId(
            null
          );
        }
      };

    // ===================================================
    // DELETE ONE REQUEST
    // ===================================================

    const deleteRequest =
      async (request) => {
        const requestId =
          Number(
            request?.requestId ??
              request?.id
          );

        if (!isValidId(requestId)) {
          window.alert(
            "Request ID is not available."
          );

          return;
        }

        const confirmed =
          window.confirm(
            "Are you sure you want to delete this request?\n\nIt will be removed from both sides."
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingRequestId(
            requestId
          );

          const response =
            await fetch(
              `${API_BASE_URL}/api/requests/${requestId}`,
              {
                method: "DELETE",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `Delete failed: ${response.status}`
                : data ||
                    `Delete failed: ${response.status}`
            );
          }

          // ---------------------------------------------
          // REMOVE FROM BOTH LISTS IMMEDIATELY
          // ---------------------------------------------

          setMyRequests(
            (previous) =>
              previous.filter(
                (item) =>
                  Number(
                    item.requestId
                  ) !== requestId
              )
          );

          setProviderRequests(
            (previous) =>
              previous.filter(
                (item) =>
                  Number(
                    item.requestId
                  ) !== requestId
              )
          );

          // ---------------------------------------------
          // REFRESH BACKEND DATA
          // ---------------------------------------------

          await Promise.all([
            loadMyRequests(),
            loadProviderRequests(),
          ]);

          window.alert(
            "Request deleted successfully from both sides. ✅"
          );
        } catch (error) {
          console.error(
            "Delete Request Error:",
            error
          );

          window.alert(
            `Unable to delete request.\n\n${
              error?.message ||
              "Unknown error"
            }`
          );
        } finally {
          setDeletingRequestId(
            null
          );
        }
      };

    // ===================================================
    // DELETE ALL REQUESTS
    // ===================================================

    const deleteAllRequests =
      async () => {
        const allRequests = [
          ...myRequests,
          ...providerRequests,
        ];

        // ---------------------------------------------
        // REMOVE DUPLICATE REQUEST IDS
        // ---------------------------------------------

        const requestIds =
          Array.from(
            new Set(
              allRequests
                .map(
                  (request) =>
                    Number(
                      request?.requestId ??
                        request?.id
                    )
                )
                .filter(
                  (id) =>
                    isValidId(id)
                )
            )
          );

        if (
          requestIds.length === 0
        ) {
          window.alert(
            "There are no requests to delete."
          );

          return;
        }

        const confirmed =
          window.confirm(
            `Are you sure you want to delete ALL ${requestIds.length} requests?\n\nAll selected requests will be removed from both sides.`
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingAllRequests(
            true
          );

          // ---------------------------------------------
          // DELETE EVERY REQUEST FROM BACKEND
          // ---------------------------------------------

          const results =
            await Promise.allSettled(
              requestIds.map(
                async (requestId) => {
                  const response =
                    await fetch(
                      `${API_BASE_URL}/api/requests/${requestId}`,
                      {
                        method:
                          "DELETE",

                        headers: {
                          Accept:
                            "application/json",
                        },
                      }
                    );

                  const data =
                    await safeJson(
                      response
                    );

                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      typeof data ===
                      "object"
                        ? data?.message ||
                            data?.error ||
                            `Delete failed for request ${requestId}`
                        : data ||
                            `Delete failed for request ${requestId}`
                    );
                  }

                  return requestId;
                }
              )
            );

          const failed =
            results.filter(
              (result) =>
                result.status ===
                "rejected"
            );

          // ---------------------------------------------
          // CLEAR SUCCESSFULLY DELETED REQUESTS
          // ---------------------------------------------

          const successfulIds =
            new Set(
              results
                .filter(
                  (result) =>
                    result.status ===
                    "fulfilled"
                )
                .map(
                  (result) =>
                    Number(
                      result.value
                    )
                )
            );

          setMyRequests(
            (previous) =>
              previous.filter(
                (request) =>
                  !successfulIds.has(
                    Number(
                      request.requestId
                    )
                  )
              )
          );

          setProviderRequests(
            (previous) =>
              previous.filter(
                (request) =>
                  !successfulIds.has(
                    Number(
                      request.requestId
                    )
                  )
              )
          );

          // ---------------------------------------------
          // RESET SHOW ALL
          // ---------------------------------------------

          setShowAllMyRequests(
            false
          );

          setShowAllProviderRequests(
            false
          );

          // ---------------------------------------------
          // LOAD FRESH DATA
          // ---------------------------------------------

          await Promise.all([
            loadMyRequests(),
            loadProviderRequests(),
          ]);

          if (
            failed.length > 0
          ) {
            window.alert(
              `${successfulIds.size} requests deleted.\n\n${failed.length} requests could not be deleted.`
            );
          } else {
            window.alert(
              `All ${successfulIds.size} requests deleted successfully from both sides. ✅`
            );
          }
        } catch (error) {
          console.error(
            "Delete All Requests Error:",
            error
          );

          window.alert(
            `Unable to delete all requests.\n\n${
              error?.message ||
              "Unknown error"
            }`
          );
        } finally {
          setDeletingAllRequests(
            false
          );
        }
      };

    // ===================================================
    // DELETE MESSAGE
    // ===================================================

    const deleteMessage =
      async (message) => {
        const messageId =
          Number(
            message?.id ??
              message?.messageId
          );

        if (!isValidId(messageId)) {
          window.alert(
            "Message ID is not available."
          );

          return;
        }

        const confirmed =
          window.confirm(
            "Are you sure you want to delete this message?"
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeletingMessageId(
            messageId
          );

          const response =
            await fetch(
              `${API_BASE_URL}/api/messages/${messageId}`,
              {
                method: "DELETE",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await safeJson(response);

          if (!response.ok) {
            throw new Error(
              typeof data === "object"
                ? data?.message ||
                    data?.error ||
                    `Message delete failed: ${response.status}`
                : data ||
                    `Message delete failed: ${response.status}`
            );
          }

          setProviderMessages(
            (previous) =>
              previous.filter(
                (item) =>
                  Number(
                    item.id
                  ) !== messageId
              )
          );

          window.alert(
            "Message deleted successfully."
          );
        } catch (error) {
          console.error(
            "Delete Message Error:",
            error
          );

          window.alert(
            `Unable to delete message.\n\n${
              error?.message ||
              "Please make sure DELETE /api/messages/{id} exists in your backend."
            }`
          );
        } finally {
          setDeletingMessageId(
            null
          );
        }
      };

    // ===================================================
    // DATE
    // ===================================================

    const formatDate = (
      value
    ) => {
      if (!value) {
        return "";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

    // ===================================================
    // LOGOUT
    // ===================================================

    const logout = () => {
      [
        "palleconnect_current_user",
        "loggedInUser",
        "loggedInUserId",
        "loggedInProviderId",
        "userEmail",
        "userRole",
        "isLoggedIn",
        "rememberMe",
        "loginType",
      ].forEach((key) =>
        localStorage.removeItem(key)
      );

      navigate("/login");
    };

    // ===================================================
    // RETURN
    // ===================================================

    return (
      <div className="provider-dashboard">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <nav className="provider-navbar">

          <Link
            to="/provider/dashboard"
            className="provider-logo"
          >
            <div className="logo-symbol">
              🌱
            </div>

            <div className="logo-text">
              <h2>
                GramaCare
              </h2>

              <span>
                Village Services
              </span>
            </div>
          </Link>

          <div className="provider-nav">

            <Link
              to="/provider/dashboard"
              className="provider-nav-item active"
            >
              <span>⌂</span>
              Dashboard
            </Link>

            <Link
              to="/provider/services"
              className="provider-nav-item"
            >
              <span>🔧</span>
              My Services
            </Link>

            <Link
              to="/provider/requests"
              className="provider-nav-item"
            >
              <span>✉</span>
              Requests

              {requestStats.pending >
                0 && (
                <b className="nav-request-badge">
                  {
                    requestStats.pending
                  }
                </b>
              )}
            </Link>

            <Link
              to="/provider/profile"
              className="provider-nav-item"
            >
              <span>👤</span>
              Profile
            </Link>

          </div>

          <button
            type="button"
            className="provider-logout"
            onClick={logout}
          >
            <span>⇥</span>
            Logout
          </button>

        </nav>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="provider-main">

          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="welcome-banner">

            <div className="welcome-content">

              <p className="welcome-label">
                GRAMACARE VILLAGE SERVICES
              </p>

              <h1>
                Welcome,{" "}
                {currentUser.name} 👋
              </h1>

              <p>
                Find services near you
                and manage the services
                you provide.
              </p>

            </div>

            <Link
              to="/provider/services/add"
              className="welcome-add-button"
            >
              <span>+</span>
              Add Service
            </Link>

          </section>

          {backendError && (
            <div className="dashboard-error">
              ⚠️ {backendError}
            </div>
          )}

          {/* =================================================
              SEARCH
          ================================================= */}

          <section className="service-search-section">

            <div className="service-search-heading">

              <p className="card-label">
                FIND A SERVICE
              </p>

              <h2>
                What service do you need?
              </h2>

              <p>
                Search for a service and
                find the nearest provider.
              </p>

            </div>

            <div className="service-search-box">

              <span className="service-search-icon">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setSelectedCategory(
                    "ALL"
                  );
                }}
                placeholder="Search Gas Repair, Plumber, Driver..."
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ✕
                </button>
              )}

              <button
                type="button"
                className="service-search-button"
                onClick={() =>
                  setShowFilter(
                    (value) => !value
                  )
                }
              >
                🔽 Filter
              </button>

            </div>

            {showFilter && (
              <div className="dashboard-filter-box">

                <div className="dashboard-filter-header">

                  <strong>
                    Filter by Job Type
                  </strong>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory(
                        "ALL"
                      );
                      setShowFilter(
                        false
                      );
                    }}
                  >
                    Clear Filter
                  </button>

                </div>

                <div className="dashboard-filter-options">

                  {categories.map(
                    (category) => (
                      <button
                        key={category}
                        type="button"
                        className={
                          selectedCategory ===
                          category
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() => {
                          setSelectedCategory(
                            category
                          );

                          setSearch("");
                        }}
                      >
                        {category ===
                        "ALL"
                          ? "All Jobs"
                          : category}
                      </button>
                    )
                  )}

                </div>

              </div>
            )}

          </section>

          {/* =================================================
              GPS
          ================================================= */}

          <section className="dashboard-gps-box">

            <div className="dashboard-gps-icon">
              📍
            </div>

            <div className="dashboard-gps-content">

              <strong>
                Your Current Location
              </strong>

              <p>
                {locationStatus}
              </p>

              {userLocation && (
                <small>
                  Latitude:{" "}
                  {userLocation.latitude.toFixed(
                    6
                  )}
                  {" | "}
                  Longitude:{" "}
                  {userLocation.longitude.toFixed(
                    6
                  )}
                  {" | "}
                  Accuracy:{" "}
                  {Math.round(
                    userLocation.accuracy
                  )}
                  m
                </small>
              )}

              {locationError && (
                <span className="dashboard-gps-error">
                  {locationError}
                </span>
              )}

            </div>

            <div
              className={
                userLocation
                  ? "dashboard-gps-dot active"
                  : "dashboard-gps-dot"
              }
            />

          </section>

          {/* =================================================
              SEARCH RESULTS
          ================================================= */}

          <section className="service-search-section">

            {!loading &&
              !hasActiveSearch && (
                <div className="no-search-results">

                  <div className="no-result-icon">
                    🔍
                  </div>

                  <h3>
                    Search for a Service
                  </h3>

                  <p>
                    Type a service name
                    to find providers near
                    you.
                  </p>

                  <span>
                    Example: Gas Repair,
                    Plumber, Driver,
                    Electrician, Tractor
                  </span>

                </div>
              )}

            {loading && (
              <div className="no-search-results">

                <div className="no-result-icon">
                  ⏳
                </div>

                <h3>
                  Loading Services...
                </h3>

                <p>
                  Getting GramaCare
                  services from backend.
                </p>

              </div>
            )}

            {!loading &&
              hasActiveSearch && (
                <div className="search-results-section">

                  <div className="search-results-header">

                    <div>

                      <p className="card-label">
                        GRAMACARE SERVICES
                      </p>

                      <h2>
                        {
                          filteredServices.length
                        }{" "}
                        service
                        {
                          filteredServices.length !==
                          1
                            ? "s"
                            : ""
                        }{" "}
                        found
                      </h2>

                    </div>

                    {userLocation &&
                      filteredServices.length >
                        0 && (
                        <span className="nearest-label">
                          📍 Nearest first
                        </span>
                      )}

                  </div>

                  {filteredServices.length ===
                  0 ? (
                    <div className="no-search-results">

                      <div className="no-result-icon">
                        🔍
                      </div>

                      <h3>
                        Service Not Found
                      </h3>

                      <p>
                        No service found
                        for{" "}
                        <strong>
                          "
                          {search ||
                            selectedCategory}
                          "
                        </strong>
                      </p>

                    </div>
                  ) : (
                    <div className="search-provider-grid">

                      {filteredServices.map(
                        (
                          service,
                          index
                        ) => {

                          const mobile =
                            getProviderMobile(
                              service
                            );

                          return (
                            <div
                              className="search-provider-card"
                              key={
                                service.serviceId ??
                                `${service.providerId}-${index}`
                              }
                            >

                              <div className="search-provider-image">

                                {service.image ? (
                                  <img
                                    src={
                                      service.image
                                    }
                                    alt={
                                      service.providerName
                                    }
                                  />
                                ) : (
                                  <div className="search-provider-placeholder">
                                    👤
                                  </div>
                                )}

                                {service.availability !==
                                false ? (
                                  <span className="search-available-badge">
                                    ● Available
                                  </span>
                                ) : (
                                  <span className="search-unavailable-badge">
                                    ● Unavailable
                                  </span>
                                )}

                              </div>

                              <div className="search-provider-content">

                                <div className="search-provider-top">

                                  <div>

                                    <h3>
                                      {
                                        service.providerName
                                      }
                                    </h3>

                                    <p>
                                      🔧{" "}
                                      {
                                        service.serviceName
                                      }
                                    </p>

                                  </div>

                                  <div className="search-provider-rating">
                                    ⭐{" "}
                                    {
                                      service.rating ||
                                      "New"
                                    }
                                  </div>

                                </div>

                                <div className="provider-distance-box">

                                  <div className="provider-distance-icon">
                                    📍
                                  </div>

                                  <div>

                                    <span>
                                      Distance from you
                                    </span>

                                    <strong>
                                      {!userLocation
                                        ? "Waiting for your GPS..."
                                        : !service.hasProviderLocation
                                        ? "Provider GPS unavailable"
                                        : service.distance ===
                                          null
                                        ? "Distance unavailable"
                                        : formatDistance(
                                            service.distance
                                          )}
                                    </strong>

                                  </div>

                                </div>

                                <button
                                  type="button"
                                  className="search-provider-location"
                                  onClick={() =>
                                    viewProviderLocation(
                                      service
                                    )
                                  }
                                >
                                  📍{" "}
                                  <span>
                                    {
                                      service.location ||
                                      "Location unavailable"
                                    }
                                  </span>
                                </button>

                                <div className="search-provider-info">

                                  <div>
                                    <span>
                                      Category
                                    </span>

                                    <strong>
                                      {
                                        service.category
                                      }
                                    </strong>
                                  </div>

                                  <div>
                                    <span>
                                      Starting Price
                                    </span>

                                    <strong>
                                      {
                                        service.price
                                      }
                                    </strong>
                                  </div>

                                </div>

                                {service.description && (
                                  <div className="search-provider-description">

                                    <span>
                                      Description
                                    </span>

                                    <p>
                                      {
                                        service.description
                                      }
                                    </p>

                                  </div>
                                )}

                                <div className="search-provider-actions">

                                  <button
                                    type="button"
                                    className="search-call-button"
                                    onClick={() =>
                                      callProvider(
                                        service
                                      )
                                    }
                                  >
                                    📞 Call
                                  </button>

                                  <button
                                    type="button"
                                    className="search-request-button"
                                    onClick={() =>
                                      openRequestModal(
                                        service
                                      )
                                    }
                                    disabled={
                                      service.availability ===
                                      false
                                    }
                                  >
                                    📨 Request Service
                                  </button>

                                  <button
                                    type="button"
                                    className="search-location-button"
                                    onClick={() =>
                                      viewProviderLocation(
                                        service
                                      )
                                    }
                                  >
                                    🗺️ View Location
                                  </button>

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

          {/* =================================================
              MY REQUESTS
          ================================================= */}

          <section className="provider-activity-section">

            <div className="activity-section-header">

              <div>

                <p className="card-label">
                  MY SERVICE REQUESTS
                </p>

                <h2>
                  Requests I Sent
                </h2>

                <p>
                  Track the requests you
                  sent to other service
                  providers.
                </p>

              </div>

              <div className="activity-header-actions">

                <button
                  type="button"
                  className="activity-refresh-button"
                  onClick={
                    loadMyRequests
                  }
                  disabled={
                    deletingAllRequests
                  }
                >
                  🔄 Refresh
                </button>

                {myRequests.length >
                  0 && (
                  <button
                    type="button"
                    className="activity-delete-all-button"
                    onClick={
                      deleteAllRequests
                    }
                    disabled={
                      deletingAllRequests
                    }
                  >
                    {deletingAllRequests
                      ? "⏳ Deleting All..."
                      : "🗑 Delete All"}
                  </button>
                )}

              </div>

            </div>

            <div className="activity-stats-grid">

              <div className="activity-stat-card">

                <div className="activity-stat-icon">
                  📩
                </div>

                <div>
                  <span>
                    My Requests
                  </span>

                  <strong>
                    {
                      myRequestStats.total
                    }
                  </strong>
                </div>

              </div>

              <div className="activity-stat-card pending-stat">

                <div className="activity-stat-icon">
                  ⏳
                </div>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {
                      myRequestStats.pending
                    }
                  </strong>
                </div>

              </div>

              <div className="activity-stat-card accepted-stat">

                <div className="activity-stat-icon">
                  ✅
                </div>

                <div>
                  <span>
                    Accepted
                  </span>

                  <strong>
                    {
                      myRequestStats.accepted
                    }
                  </strong>
                </div>

              </div>

              <div className="activity-stat-card rejected-stat">

                <div className="activity-stat-icon">
                  ❌
                </div>

                <div>
                  <span>
                    Not Interested
                  </span>

                  <strong>
                    {
                      myRequestStats.rejected
                    }
                  </strong>
                </div>

              </div>

            </div>

            <div className="activity-card">

              <div className="activity-card-header">

                <div>
                  <h3>
                    📤 My Requests
                  </h3>

                  <span>
                    Requests sent to
                    providers
                  </span>
                </div>

                <span className="message-count-badge">
                  {
                    myRequests.length
                  }
                </span>

              </div>

              {myRequestsLoading &&
              myRequests.length ===
                0 ? (
                <div className="activity-empty">

                  <div>⏳</div>

                  <h4>
                    Loading requests...
                  </h4>

                </div>
              ) : myRequests.length ===
                0 ? (
                <div className="activity-empty">

                  <div>📭</div>

                  <h4>
                    No Requests Sent
                  </h4>

                  <p>
                    Search for a service
                    and send your first
                    request.
                  </p>

                </div>
              ) : (
                <>

                  <div className="activity-list">

                    {visibleMyRequests.map(
                      (request) => (
                        <div
                          className="activity-request-item"
                          key={
                            request.requestId
                          }
                        >

                          <div className="activity-request-icon">
                            {getStatusIcon(
                              request.status
                            )}
                          </div>

                          <div className="activity-request-content">

                            <div className="activity-request-top">

                              <h4>
                                {
                                  request.serviceName
                                }
                              </h4>

                              <span
                                className={`request-status-badge status-${request.status.toLowerCase()}`}
                              >
                                {
                                  getStatusLabel(
                                    request.status
                                  )
                                }
                              </span>

                            </div>

                            <p className="activity-service-name">
                              👤 Provider:{" "}
                              {
                                request.providerName
                              }
                            </p>

                            {request.message && (
                              <p className="activity-request-message">
                                "
                                {
                                  request.message
                                }
                                "
                              </p>
                            )}

                            {request.location && (
                              <div className="activity-request-meta">
                                <span>
                                  📍{" "}
                                  {
                                    request.location
                                  }
                                </span>
                              </div>
                            )}

                            {request.createdAt && (
                              <small>
                                {formatDate(
                                  request.createdAt
                                )}
                              </small>
                            )}

                            <div className="activity-item-actions">

                              <button
                                type="button"
                                className="activity-delete-button"
                                onClick={() =>
                                  deleteRequest(
                                    request
                                  )
                                }
                                disabled={
                                  deletingAllRequests ||
                                  deletingRequestId ===
                                    request.requestId
                                }
                              >
                                {deletingRequestId ===
                                request.requestId
                                  ? "⏳ Deleting..."
                                  : "🗑 Delete"}
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  {myRequests.length >
                    INITIAL_VISIBLE_COUNT && (
                    <div className="activity-show-all-wrapper">

                      <button
                        type="button"
                        className="activity-show-all-button"
                        onClick={() =>
                          setShowAllMyRequests(
                            (value) =>
                              !value
                          )
                        }
                      >
                        {showAllMyRequests
                          ? "Show Less ↑"
                          : `Show All (${Math.min(
                              myRequests.length,
                              MAX_VISIBLE_COUNT
                            )}) →`}
                      </button>

                    </div>
                  )}

                </>
              )}

              {myRequestsError && (
                <div className="activity-warning">
                  ⚠️{" "}
                  {
                    myRequestsError
                  }
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              CUSTOMER REQUESTS + MESSAGES
          ================================================= */}

          <section className="provider-activity-section">

            <div className="activity-section-header">

              <div>

                <p className="card-label">
                  PROVIDER ACTIVITY
                </p>

                <h2>
                  Customer Requests
                </h2>

                <p>
                  Requests sent to your
                  services appear here.
                </p>

              </div>

              <div className="activity-header-actions">

                <button
                  type="button"
                  className="activity-refresh-button"
                  onClick={() => {
                    loadProviderRequests();
                    loadProviderMessages();
                  }}
                  disabled={
                    deletingAllRequests
                  }
                >
                  🔄 Refresh
                </button>

                {providerRequests.length >
                  0 && (
                  <button
                    type="button"
                    className="activity-delete-all-button"
                    onClick={
                      deleteAllRequests
                    }
                    disabled={
                      deletingAllRequests
                    }
                  >
                    {deletingAllRequests
                      ? "⏳ Deleting All..."
                      : "🗑 Delete All"}
                  </button>
                )}

              </div>

            </div>

            <div className="activity-stats-grid">

              <div className="activity-stat-card">

                <div className="activity-stat-icon">
                  📩
                </div>

                <div>
                  <span>
                    Total Requests
                  </span>

                  <strong>
                    {
                      requestStats.total
                    }
                  </strong>
                </div>

              </div>

              <div className="activity-stat-card pending-stat">

                <div className="activity-stat-icon">
                  ⏳
                </div>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {
                      requestStats.pending
                    }
                  </strong>
                </div>

              </div>

              <div className="activity-stat-card accepted-stat">

                <div className="activity-stat-icon">
                  ✅
                </div>

                <div>
                  <span>
                    Accepted
                  </span>

                  <strong>
                    {
                      requestStats.accepted
                    }
                  </strong>
                </div>

              </div>

              <div className="activity-stat-card rejected-stat">

                <div className="activity-stat-icon">
                  ❌
                </div>

                <div>
                  <span>
                    Not Interested
                  </span>

                  <strong>
                    {
                      requestStats.rejected
                    }
                  </strong>
                </div>

              </div>

            </div>

            <div className="activity-columns">

              {/* =================================================
                  CUSTOMER REQUESTS
              ================================================= */}

              <div className="activity-card">

                <div className="activity-card-header">

                  <div>

                    <h3>
                      📩 Customer Requests
                    </h3>

                    <span>
                      Requests received
                      for your services
                    </span>

                  </div>

                  <Link
                    to="/provider/requests"
                    className="activity-view-all"
                  >
                    View All →
                  </Link>

                </div>

                {requestsLoading &&
                providerRequests.length ===
                  0 ? (
                  <div className="activity-empty">

                    <div>⏳</div>

                    <h4>
                      Loading requests...
                    </h4>

                  </div>
                ) : providerRequests.length ===
                  0 ? (
                  <div className="activity-empty">

                    <div>📭</div>

                    <h4>
                      No Requests Yet
                    </h4>

                    <p>
                      Customer requests
                      for your services
                      will appear here.
                    </p>

                  </div>
                ) : (
                  <>

                    <div className="activity-list">

                      {visibleProviderRequests.map(
                        (request) => (
                          <div
                            className="activity-request-item"
                            key={
                              request.requestId
                            }
                          >

                            <div className="activity-request-icon">
                              {getStatusIcon(
                                request.status
                              )}
                            </div>

                            <div className="activity-request-content">

                              <div className="activity-request-top">

                                <h4>
                                  {
                                    request.customerName
                                  }
                                </h4>

                                <span
                                  className={`request-status-badge status-${request.status.toLowerCase()}`}
                                >
                                  {
                                    getStatusLabel(
                                      request.status
                                    )
                                  }
                                </span>

                              </div>

                              <p className="activity-service-name">
                                🔧{" "}
                                {
                                  request.serviceName
                                }
                              </p>

                              {request.message && (
                                <p className="activity-request-message">
                                  "
                                  {
                                    request.message
                                  }
                                  "
                                </p>
                              )}

                              <div className="activity-request-meta">

                                {request.customerMobile && (
                                  <span>
                                    📞{" "}
                                    {
                                      request.customerMobile
                                    }
                                  </span>
                                )}

                                {request.location && (
                                  <span>
                                    📍{" "}
                                    {
                                      request.location
                                    }
                                  </span>
                                )}

                              </div>

                              {request.createdAt && (
                                <small>
                                  {formatDate(
                                    request.createdAt
                                  )}
                                </small>
                              )}

                              <div className="activity-item-actions">

                                <button
                                  type="button"
                                  className="activity-delete-button"
                                  onClick={() =>
                                    deleteRequest(
                                      request
                                    )
                                  }
                                  disabled={
                                    deletingAllRequests ||
                                    deletingRequestId ===
                                      request.requestId
                                  }
                                >
                                  {deletingRequestId ===
                                  request.requestId
                                    ? "⏳ Deleting..."
                                    : "🗑 Delete"}
                                </button>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                    {providerRequests.length >
                      INITIAL_VISIBLE_COUNT && (
                      <div className="activity-show-all-wrapper">

                        <button
                          type="button"
                          className="activity-show-all-button"
                          onClick={() =>
                            setShowAllProviderRequests(
                              (value) =>
                                !value
                            )
                          }
                        >
                          {showAllProviderRequests
                            ? "Show Less ↑"
                            : `Show All (${Math.min(
                                providerRequests.length,
                                MAX_VISIBLE_COUNT
                              )}) →`}
                        </button>

                      </div>
                    )}

                  </>
                )}

              </div>

              {/* =================================================
                  MESSAGES
              ================================================= */}

              <div className="activity-card">

                <div className="activity-card-header">

                  <div>

                    <h3>
                      💬 Messages
                    </h3>

                    <span>
                      Messages received
                    </span>

                  </div>

                  <span className="message-count-badge">
                    {
                      providerMessages.length
                    }
                  </span>

                </div>

                {messagesLoading &&
                providerMessages.length ===
                  0 ? (
                  <div className="activity-empty">

                    <div>⏳</div>

                    <h4>
                      Loading messages...
                    </h4>

                  </div>
                ) : providerMessages.length ===
                  0 ? (
                  <div className="activity-empty">

                    <div>💬</div>

                    <h4>
                      No Messages Yet
                    </h4>

                    <p>
                      Messages sent to this
                      account will appear
                      here.
                    </p>

                    <Link
                      to="/provider/requests"
                      className="activity-message-link"
                    >
                      Go to Requests →
                    </Link>

                  </div>
                ) : (
                  <>

                    <div className="activity-list">

                      {visibleMessages.map(
                        (
                          message,
                          index
                        ) => (
                          <div
                            className="activity-message-item"
                            key={
                              message.id ??
                              index
                            }
                          >

                            <div className="message-avatar">
                              💬
                            </div>

                            <div className="activity-message-content">

                              <div className="activity-message-top">

                                <h4>
                                  {
                                    message.senderName
                                  }
                                </h4>

                                <span>
                                  Message
                                </span>

                              </div>

                              <p>
                                {
                                  message.text ||
                                  "Message content unavailable."
                                }
                              </p>

                              {message.createdAt && (
                                <small>
                                  {formatDate(
                                    message.createdAt
                                  )}
                                </small>
                              )}

                              <div className="activity-item-actions">

                                <button
                                  type="button"
                                  className="activity-delete-button"
                                  onClick={() =>
                                    deleteMessage(
                                      message
                                    )
                                  }
                                  disabled={
                                    deletingMessageId ===
                                    Number(
                                      message.id
                                    )
                                  }
                                >
                                  {deletingMessageId ===
                                  Number(
                                    message.id
                                  )
                                    ? "⏳ Deleting..."
                                    : "🗑 Delete"}
                                </button>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                    {providerMessages.length >
                      INITIAL_VISIBLE_COUNT && (
                      <div className="activity-show-all-wrapper">

                        <button
                          type="button"
                          className="activity-show-all-button"
                          onClick={() =>
                            setShowAllMessages(
                              (value) =>
                                !value
                            )
                          }
                        >
                          {showAllMessages
                            ? "Show Less ↑"
                            : `Show All (${Math.min(
                                providerMessages.length,
                                MAX_VISIBLE_COUNT
                              )}) →`}
                        </button>

                      </div>
                    )}

                  </>
                )}

              </div>

            </div>

            {lastActivityUpdate && (
              <div className="activity-last-updated">
                🔄 Last updated{" "}
                {formatDate(
                  lastActivityUpdate
                )}{" "}
                • Auto refresh every
                5 seconds
              </div>
            )}

            {requestsError && (
              <div className="activity-warning">
                ⚠️{" "}
                {requestsError}
              </div>
            )}

          </section>

          {/* =================================================
              STATISTICS
          ================================================= */}

         

          {/* =================================================
              PROFILE + AVAILABILITY
          ================================================= */}

          <section className="main-cards-grid">

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <p className="card-label">
                    YOUR PROFILE
                  </p>

                  <h2>
                    Provider Information
                  </h2>

                </div>

                <Link
                  to="/provider/profile"
                  className="edit-profile"
                >
                  ✎ Edit
                </Link>

              </div>

              <div className="provider-information">

                <div className="provider-image">

                  <div className="profile-placeholder">
                    👤
                  </div>

                </div>

                <div className="provider-details">

                  <h3>
                    {currentUser.name}
                  </h3>

                  <p>
                    🔧 Service Provider
                  </p>

                  <p>
                    📧{" "}
                    {currentUser.email ||
                      "Email not available"}
                  </p>

                  <p>
                    📍{" "}
                    {currentUser.village ||
                      "Village"}
                    {currentUser.district
                      ? `, ${currentUser.district}`
                      : ""}
                  </p>

                  <p>
                    📞{" "}
                    {currentUser.mobile ||
                      "Mobile not added"}
                  </p>

                </div>

              </div>

            </div>

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <p className="card-label">
                    SERVICE STATUS
                  </p>

                  <h2>
                    Availability
                  </h2>

                </div>

              </div>

              <div className="available-box">

                <div className="available-dot" />

                <div>

                  <h3>
                    Available
                  </h3>

                  <p>
                    You are currently
                    available for service
                    requests.
                  </p>

                </div>

              </div>

              <div className="service-information">

                <div>

                  <span>
                    Services
                  </span>

                  <strong>
                    {services.length}
                  </strong>

                </div>

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    Available
                  </strong>

                </div>

                <div>

                  <span>
                    Requests
                  </span>

                  <strong>
                    {
                      requestStats.total
                    }
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="quick-actions">

            <div className="quick-heading">

              <p className="card-label">
                MANAGE YOUR WORK
              </p>

              <h2>
                Quick Actions
              </h2>

              <p>
                Find services and manage
                your own services from one
                dashboard.
              </p>

            </div>

            <div className="quick-actions-grid">

              <Link
                to="/provider/services/add"
                className="quick-action-card"
              >

                <div className="quick-action-icon green-quick">
                  +
                </div>

                <div className="quick-action-content">

                  <h3>
                    Add Service
                  </h3>

                  <p>
                    Add a new service that
                    you want to provide.
                  </p>

                  <span>
                    Add service →
                  </span>

                </div>

              </Link>

              <Link
                to="/provider/services"
                className="quick-action-card"
              >

                <div className="quick-action-icon blue-quick">
                  🔧
                </div>

                <div className="quick-action-content">

                  <h3>
                    My Services
                  </h3>

                  <p>
                    View and manage all your
                    village services.
                  </p>

                  <span>
                    View services →
                  </span>

                </div>

              </Link>

              <Link
                to="/provider/requests"
                className="quick-action-card"
              >

                <div className="quick-action-icon orange-quick">
                  ✉
                </div>

                <div className="quick-action-content">

                  <h3>
                    Service Requests
                  </h3>

                  <p>
                    Check requests from
                    customers.
                  </p>

                  <span>
                    {requestStats.pending >
                    0
                      ? `${requestStats.pending} pending →`
                      : "View requests →"}
                  </span>

                </div>

              </Link>

              <Link
                to="/provider/profile"
                className="quick-action-card"
              >

                <div className="quick-action-icon purple-quick">
                  👤
                </div>

                <div className="quick-action-content">

                  <h3>
                    My Profile
                  </h3>

                  <p>
                    Update your personal and
                    contact information.
                  </p>

                  <span>
                    View profile →
                  </span>

                </div>

              </Link>

            </div>

          </section>

        </main>

        {/* =================================================
            REQUEST MODAL
        ================================================= */}

        {selectedService && (
          <div
            className="request-modal-overlay"
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeRequestModal();
              }
            }}
          >

            <div className="request-modal">

              <div className="request-modal-header">

                <div>

                  <p className="card-label">
                    SERVICE REQUEST
                  </p>

                  <h2>
                    Request this service
                  </h2>

                </div>

                <button
                  type="button"
                  className="request-modal-close"
                  onClick={
                    closeRequestModal
                  }
                >
                  ✕
                </button>

              </div>

              <div className="request-provider-box">

                <div className="request-provider-icon">

                  {selectedService.image ? (
                    <img
                      src={
                        selectedService.image
                      }
                      alt={
                        selectedService.providerName
                      }
                    />
                  ) : (
                    "👤"
                  )}

                </div>

                <div>

                  <h3>
                    {
                      selectedService.providerName
                    }
                  </h3>

                  <p>
                    🔧{" "}
                    {
                      selectedService.serviceName
                    }
                  </p>

                  <span>
                    📍{" "}
                    {
                      selectedService.location ||
                      "Location unavailable"
                    }
                  </span>

                </div>

              </div>

              <div className="request-modal-details">

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {
                      selectedService.category
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Price
                  </span>

                  <strong>
                    {
                      selectedService.price
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Rating
                  </span>

                  <strong>
                    ⭐{" "}
                    {
                      selectedService.rating
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Experience
                  </span>

                  <strong>
                    {
                      selectedService.experience
                    }
                  </strong>
                </div>

              </div>

              <div className="request-message-section">

                <label htmlFor="requestMessage">
                  Message to Provider
                </label>

                <textarea
                  id="requestMessage"
                  value={
                    requestMessage
                  }
                  onChange={(event) =>
                    setRequestMessage(
                      event.target.value
                    )
                  }
                  placeholder="Enter your requirement..."
                  rows={5}
                  disabled={
                    requestingServiceId !==
                    null
                  }
                />

              </div>

              <div className="request-user-info">

                <h4>
                  Your Contact Information
                </h4>

                <p>
                  👤{" "}
                  {currentUser.name}
                </p>

                <p>
                  📞{" "}
                  {currentUser.mobile ||
                    "Mobile not available"}
                </p>

                <p>
                  📧{" "}
                  {currentUser.email ||
                    "Email not available"}
                </p>

              </div>

              <div className="request-modal-actions">

                <button
                  type="button"
                  className="request-cancel-button"
                  onClick={
                    closeRequestModal
                  }
                  disabled={
                    requestingServiceId !==
                    null
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="request-send-button"
                  onClick={
                    requestService
                  }
                  disabled={
                    requestingServiceId !==
                    null
                  }
                >
                  {requestingServiceId !==
                  null
                    ? "⏳ Sending..."
                    : "📨 Send Request"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  }


  export default ProviderDashboard;