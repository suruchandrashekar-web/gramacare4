import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./ProviderRequest.css";

// =====================================================
// API
// =====================================================

const API_BASE_URL = "http://localhost:8082";

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80";

// =====================================================
// ID HELPERS
// =====================================================

const isValidId = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return false;
  }

  const numberValue = Number(value);

  return (
    Number.isFinite(numberValue) &&
    numberValue > 0
  );
};

const normalizeId = (value) => {
  return isValidId(value)
    ? String(value)
    : null;
};

// =====================================================
// STORED USER
// =====================================================

const getStoredUser = () => {
  const storageKeys = [
    "loggedInUser",
    "palleconnect_current_user",
  ];

  for (const key of storageKeys) {
    const value = localStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      const user = JSON.parse(value);

      if (
        user &&
        typeof user === "object"
      ) {
        return user;
      }
    } catch (error) {
      console.error(
        `Unable to parse ${key}:`,
        error
      );
    }
  }

  return null;
};

// =====================================================
// PROVIDER ID
// =====================================================

const getProviderId = () => {
  const user = getStoredUser();

  const role = String(
    user?.role ??
      user?.userRole ??
      user?.providerRole ??
      ""
  )
    .trim()
    .toUpperCase();

  const possibleProviderId =
    user?.providerId ??
    user?.provider?.id ??
    user?.provider?.providerId ??
    user?.id ??
    user?.userId;

  if (
    isValidId(possibleProviderId) &&
    (
      role === "" ||
      role === "PROVIDER"
    )
  ) {
    return normalizeId(
      possibleProviderId
    );
  }

  const storedProviderId =
    localStorage.getItem(
      "loggedInProviderId"
    );

  if (
    isValidId(storedProviderId)
  ) {
    return normalizeId(
      storedProviderId
    );
  }

  return null;
};

// =====================================================
// RESPONSE ARRAY
// =====================================================

const getResponseArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(data?.requests)
  ) {
    return data.requests;
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data;
  }

  if (
    Array.isArray(data?.content)
  ) {
    return data.content;
  }

  if (
    Array.isArray(data?.result)
  ) {
    return data.result;
  }

  if (
    data &&
    typeof data === "object"
  ) {
    return [data];
  }

  return [];
};

// =====================================================
// REQUEST ID
// =====================================================

const getRequestId = (request) => {
  return normalizeId(
    request?.requestId ??
      request?.id ??
      request?.request?.requestId ??
      request?.request?.id
  );
};

// =====================================================
// CUSTOMER ID
// =====================================================

const getCustomerId = (request) => {
  // IMPORTANT:
  // service_requests.user_id is the person who actually sent the request.
  // Always prefer userId before customerId.
  return normalizeId(
    request?.userId ??
      request?.customerId ??
      request?.customer?.id ??
      request?.customer?.userId ??
      request?.user?.id ??
      request?.user?.userId ??
      request?.request?.userId ??
      request?.request?.customerId ??
      request?.request?.user?.id ??
      request?.request?.user?.userId ??
      request?.request?.customer?.id ??
      request?.request?.customer?.userId
  );
};

// =====================================================
// PROVIDER ID FROM REQUEST
// =====================================================

const getRequestProviderId = (
  request
) => {
  return normalizeId(
    request?.providerId ??
      request?.provider?.id ??
      request?.provider?.providerId ??
      request?.service?.providerId ??
      request?.service?.provider?.id ??
      request?.request?.providerId ??
      request?.request?.provider?.id ??
      request?.request?.service?.providerId ??
      request?.request?.service?.provider?.id
  );
};

// =====================================================
// CUSTOMER NAME
// =====================================================

const getCustomerName = (
  request
) => {
  const name =
    request?.customerName ??
    request?.userName ??
    request?.customer?.fullName ??
    request?.customer?.name ??
    request?.customer?.username ??
    request?.user?.fullName ??
    request?.user?.name ??
    request?.user?.username ??
    request?.request?.customerName ??
    request?.request?.userName ??
    request?.request?.customer?.fullName ??
    request?.request?.user?.fullName;

  if (
    name !== null &&
    name !== undefined &&
    String(name).trim()
  ) {
    return String(name).trim();
  }

  return "Customer";
};

// =====================================================
// CUSTOMER EMAIL
// =====================================================

const getCustomerEmail = (
  request
) => {
  return (
    request?.email ??
    request?.customerEmail ??
    request?.userEmail ??
    request?.customer?.email ??
    request?.user?.email ??
    request?.request?.email ??
    request?.request?.customerEmail ??
    request?.request?.userEmail ??
    request?.request?.customer?.email ??
    request?.request?.user?.email ??
    ""
  );
};

// =====================================================
// CUSTOMER MOBILE
// =====================================================

const getCustomerMobile = (request) => {
  const customer = request?.customer || request?.user || request?.requestedBy || request?.customerDetails || request?.requester || {};
  const values = [
    request?.mobile, request?.phone, request?.mobileNumber, request?.phoneNumber,
    request?.customerMobile, request?.customerPhone, request?.customerMobileNumber, request?.customerPhoneNumber,
    request?.userMobile, request?.userPhone, request?.userMobileNumber, request?.userPhoneNumber,
    request?.contactNumber, request?.phoneNo,
    customer?.mobile, customer?.phone, customer?.mobileNumber, customer?.phoneNumber, customer?.contactNumber, customer?.phoneNo,
    request?.request?.mobile, request?.request?.phone, request?.request?.mobileNumber, request?.request?.phoneNumber,
    request?.request?.customerMobile, request?.request?.customerPhone, request?.request?.customerMobileNumber, request?.request?.customerPhoneNumber,
    request?.request?.user?.mobile, request?.request?.user?.phone, request?.request?.user?.mobileNumber, request?.request?.user?.phoneNumber,
    request?.request?.user?.contactNumber, request?.request?.user?.phoneNo, request?.request?.customer?.mobile, request?.request?.customer?.phone,
    request?.request?.customer?.mobileNumber, request?.request?.customer?.phoneNumber, request?.request?.customer?.contactNumber, request?.request?.customer?.phoneNo,
  ];
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const mobile = String(value).trim().replace(/[^\d+]/g, '');
    if (mobile) return mobile;
  }
  return '';
};

// =====================================================
// CUSTOMER IMAGE
// =====================================================

const getCustomerImage = (
  request
) => {
  return (
    request?.customerImage ??
    request?.customerAvatar ??
    request?.user?.profileImage ??
    request?.user?.avatar ??
    request?.customer?.profileImage ??
    request?.customer?.avatar ??
    request?.request?.customerImage ??
    request?.request?.customerAvatar ??
    request?.request?.user?.profileImage ??
    request?.request?.customer?.profileImage ??
    ""
  );
};

// =====================================================
// LOCATION
// =====================================================

const getLocation = (
  request
) => {
  if (!request) {
    return "Location not available";
  }

  const directLocation =
    request?.location ??
    request?.address ??
    request?.userLocation ??
    request?.customerLocation;

  if (
    directLocation !== null &&
    directLocation !== undefined &&
    String(directLocation).trim()
  ) {
    return String(
      directLocation
    ).trim();
  }

  const nestedLocation =
    request?.user?.location ??
    request?.customer?.location ??
    request?.service?.location ??
    request?.request?.location ??
    request?.request?.user?.location ??
    request?.request?.customer?.location;

  if (
    nestedLocation !== null &&
    nestedLocation !== undefined &&
    String(nestedLocation).trim()
  ) {
    return String(
      nestedLocation
    ).trim();
  }

  const village =
    request?.village ??
    request?.user?.village ??
    request?.customer?.village ??
    request?.request?.village ??
    request?.request?.user?.village ??
    request?.request?.customer?.village ??
    "";

  const district =
    request?.district ??
    request?.user?.district ??
    request?.customer?.district ??
    request?.request?.district ??
    request?.request?.user?.district ??
    request?.request?.customer?.district ??
    "";

  if (
    village &&
    district
  ) {
    return `${village}, ${district}`;
  }

  if (village) {
    return String(village);
  }

  if (district) {
    return String(district);
  }

  return "Location not available";
};

// =====================================================
// SERVICE NAME
// =====================================================

const getServiceName = (
  request
) => {
  if (
    typeof request?.service ===
      "string" &&
    request.service.trim()
  ) {
    return request.service.trim();
  }

  const serviceName =
    request?.serviceName ??
    request?.service?.name ??
    request?.service?.serviceName ??
    request?.service?.title ??
    request?.request?.serviceName ??
    request?.request?.service?.name ??
    request?.request?.service?.serviceName;

  if (
    serviceName !== null &&
    serviceName !== undefined &&
    String(serviceName).trim()
  ) {
    return String(
      serviceName
    ).trim();
  }

  return "Service";
};

// =====================================================
// SERVICE IMAGE
// =====================================================

const getServiceImage = (
  request
) => {
  return (
    request?.image ??
    request?.imageUrl ??
    request?.serviceImage ??
    request?.service?.image ??
    request?.service?.imageUrl ??
    request?.request?.image ??
    request?.request?.imageUrl ??
    request?.request?.service?.image ??
    DEFAULT_SERVICE_IMAGE
  );
};

// =====================================================
// PRICE
// =====================================================

const getPrice = (
  request
) => {
  const price =
    request?.price ??
    request?.amount ??
    request?.servicePrice ??
    request?.service?.price ??
    request?.request?.price ??
    request?.request?.amount ??
    request?.request?.service?.price;

  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Contact provider";
  }

  return `₹ ${String(price)
    .replace("₹", "")
    .trim()}`;
};

// =====================================================
// DURATION
// =====================================================

const getDuration = (
  request
) => {
  return (
    request?.duration ??
    request?.serviceDuration ??
    request?.service?.duration ??
    request?.request?.duration ??
    request?.request?.serviceDuration ??
    request?.request?.service?.duration ??
    "Not specified"
  );
};

// =====================================================
// CUSTOMER REQUEST MESSAGE
// =====================================================

const getProblem = (
  request
) => {
  const message =
    request?.problem ??
    request?.description ??
    request?.requestMessage ??
    request?.customerMessage ??
    request?.message ??
    request?.request?.problem ??
    request?.request?.description ??
    request?.request?.requestMessage ??
    request?.request?.customerMessage ??
    request?.request?.message;

  if (
    message !== null &&
    message !== undefined &&
    String(message).trim()
  ) {
    return String(message).trim();
  }

  return "No problem description";
};

// =====================================================
// CREATED AT
// =====================================================

const getCreatedAt = (
  request
) => {
  return (
    request?.createdAt ??
    request?.requestedAt ??
    request?.requestDate ??
    request?.date ??
    request?.request?.createdAt ??
    request?.request?.requestedAt ??
    request?.request?.requestDate ??
    request?.request?.date ??
    null
  );
};

// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (
  value
) => {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (
  value
) => {
  if (!value) {
    return "Time not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// =====================================================
// STATUS
// =====================================================

const getStatus = (
  request
) => {
  return String(
    request?.status ??
      request?.requestStatus ??
      request?.request?.status ??
      "PENDING"
  )
    .trim()
    .toUpperCase();
};

// =====================================================
// NORMALIZE REQUEST
// =====================================================

const normalizeRequest = (
  request
) => {
  const requestId =
    getRequestId(request);

  const customerId =
    getCustomerId(request);

  const providerId =
    getRequestProviderId(request);

  const serviceId =
    normalizeId(
      request?.serviceId ??
        request?.service?.id ??
        request?.request?.serviceId ??
        request?.request?.service?.id
    );

  const createdAt =
    getCreatedAt(request);

  return {
    id: requestId,
    requestId,
    userId: customerId,
    customerId,
    providerId,
    serviceId,

    customerName:
      getCustomerName(request),

    customerEmail:
      getCustomerEmail(request),

    customerImage:
      getCustomerImage(request),

    mobile:
      getCustomerMobile(request),

    location:
      getLocation(request),

    service:
      getServiceName(request),

    serviceImage:
      getServiceImage(request),

    price:
      getPrice(request),

    duration:
      getDuration(request),

    problem:
      getProblem(request),

    date: createdAt,
    time: createdAt,
    createdAt,

    status:
      getStatus(request),

    originalRequest:
      request,
  };
};

// =====================================================
// STATUS TEXT
// =====================================================

const getStatusText = (
  status
) => {
  switch (
    String(status).toUpperCase()
  ) {
    case "PENDING":
      return "Pending";

    case "ACCEPTED":
      return "Accepted";

    case "IN_PROGRESS":
      return "In Progress";

    case "COMPLETED":
      return "Completed";

    case "REJECTED":
      return "Not Interested";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
};

// =====================================================
// STATUS MESSAGE
// =====================================================

const getStatusMessage = (
  status
) => {
  switch (
    String(status).toUpperCase()
  ) {
    case "ACCEPTED":
      return "This customer request has been accepted.";

    case "REJECTED":
      return "You marked this customer's request as Not Interested.";

    case "COMPLETED":
      return "This service request has been completed.";

    case "IN_PROGRESS":
      return "This service request is currently in progress.";

    case "CANCELLED":
      return "This service request has been cancelled.";

    default:
      return "";
  }
};

// =====================================================
// COMPONENT
// =====================================================

function ProviderRequest() {
  const navigate =
    useNavigate();

  // ===================================================
  // REQUEST STATE
  // ===================================================

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    loggedInProviderId,
    setLoggedInProviderId,
  ] = useState(null);

  // ===================================================
  // DELETED REQUESTS
  // ===================================================
  // IMPORTANT:
  // Auto refresh every 3 seconds can otherwise bring
  // deleted records back into UI.
  // ===================================================

  const deletedRequestIdsRef =
    useRef(new Set());

  const DELETED_REQUEST_STORAGE_KEY = "providerDeletedRequestIds";

  const loadDeletedRequestIds = () => {
    try {
      const raw = localStorage.getItem(DELETED_REQUEST_STORAGE_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      if (Array.isArray(ids)) ids.forEach((id) => { if (isValidId(id)) deletedRequestIdsRef.current.add(String(id)); });
    } catch (error) {
      console.error("Unable to load deleted request IDs:", error);
    }
  };

  const saveDeletedRequestId = (requestId) => {
    try {
      localStorage.setItem(DELETED_REQUEST_STORAGE_KEY, JSON.stringify(Array.from(deletedRequestIdsRef.current)));
    } catch (error) {
      console.error("Unable to save deleted request ID:", error);
    }
  };

  // ===================================================
  // FILTER STATE
  // ===================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All Status");

  const [
    serviceFilter,
    setServiceFilter,
  ] = useState("All Services");

  const [
    sort,
    setSort,
  ] = useState("Newest");

  // ===================================================
  // ACTION STATE
  // ===================================================

  const [
    updatingRequestId,
    setUpdatingRequestId,
  ] = useState(null);

  const [
    deletingRequestId,
    setDeletingRequestId,
  ] = useState(null);

  const [
    sendingMessageRequestId,
    setSendingMessageRequestId,
  ] = useState(null);

  // Call Customer loading state
  const [
    callingCustomerRequestId,
    setCallingCustomerRequestId,
  ] = useState(null);

  // ===================================================
  // DETAILS
  // ===================================================

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState(null);

  // ===================================================
  // MESSAGE MODAL
  // ===================================================

  const [
    messageModalOpen,
    setMessageModalOpen,
  ] = useState(false);

  const [
    messageTargetRequest,
    setMessageTargetRequest,
  ] = useState(null);

  const [
    messageText,
    setMessageText,
  ] = useState("");

  // ===================================================
  // LOAD PROVIDER REQUESTS
  // ===================================================

  const loadRequests =
    useCallback(
      async () => {
        const providerId =
          getProviderId();

        setLoggedInProviderId(
          providerId
        );

        if (!providerId) {
          setRequests([]);

          setError(
            "Provider ID not found. Please login again."
          );

          setLoading(false);

          return;
        }

        try {
          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/api/requests/provider/${providerId}`,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const responseText =
            await response.text();

          let data = null;

          if (responseText) {
            try {
              data =
                JSON.parse(
                  responseText
                );
            } catch (parseError) {
              console.error(
                "Invalid request JSON:",
                parseError
              );
            }
          }

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Unable to load requests: ${response.status}`
            );
          }

          const incoming =
            getResponseArray(data);

          const normalized =
            incoming
              .map(
                normalizeRequest
              )
              .filter(
                (request) => {
                  if (
                    !isValidId(
                      request.id
                    )
                  ) {
                    return false;
                  }

                  // -----------------------------------------
                  // DO NOT SHOW SUCCESSFULLY DELETED REQUEST
                  // -----------------------------------------

                  if (
                    deletedRequestIdsRef.current.has(
                      String(request.id)
                    )
                  ) {
                    return false;
                  }

                  // -----------------------------------------
                  // PROVIDER CHECK
                  // -----------------------------------------

                  if (
                    isValidId(
                      request.providerId
                    )
                  ) {
                    return (
                      String(
                        request.providerId
                      ) ===
                      String(
                        providerId
                      )
                    );
                  }

                  return true;
                }
              );

          const uniqueMap =
            new Map();

          normalized.forEach(
            (request) => {
              uniqueMap.set(
                String(
                  request.id
                ),
                request
              );
            }
          );

          const finalRequests =
            Array.from(
              uniqueMap.values()
            );

          finalRequests.sort(
            (a, b) => {
              const dateA =
                new Date(
                  a.createdAt || 0
                ).getTime();

              const dateB =
                new Date(
                  b.createdAt || 0
                ).getTime();

              return (
                dateB - dateA
              );
            }
          );

          setRequests(
            finalRequests
          );

          // -----------------------------------------
          // KEEP SELECTED REQUEST UPDATED
          // -----------------------------------------

          setSelectedRequest(
            (previous) => {
              if (!previous) {
                return null;
              }

              return (
                finalRequests.find(
                  (item) =>
                    String(
                      item.id
                    ) ===
                    String(
                      previous.id
                    )
                ) || null
              );
            }
          );
        } catch (err) {
          console.error(
            "Provider requests error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load provider requests."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadDeletedRequestIds();
    loadRequests();
  }, [loadRequests]);

  // ===================================================
  // AUTO REFRESH
  // ===================================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadRequests();
      }, 3000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [loadRequests]);

  // ===================================================
  // SUCCESS MESSAGE TIMER
  // ===================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);

    return () =>
      clearTimeout(timer);
  }, [successMessage]);

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalRequests =
    requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status ===
        "PENDING"
    ).length;

  const acceptedRequests =
    requests.filter(
      (request) =>
        request.status ===
          "ACCEPTED" ||
        request.status ===
          "IN_PROGRESS"
    ).length;

  const completedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "COMPLETED"
    ).length;

  const rejectedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "REJECTED"
    ).length;

  const cancelledRequests =
    requests.filter(
      (request) =>
        request.status ===
        "CANCELLED"
    ).length;

  // ===================================================
  // SERVICE OPTIONS
  // ===================================================

  const serviceOptions =
    useMemo(() => {
      return [
        ...new Set(
          requests
            .map(
              (request) =>
                request.service
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [requests]);

  // ===================================================
  // FILTERED REQUESTS
  // ===================================================

  const filteredRequests =
    useMemo(() => {
      let result = [
        ...requests,
      ];

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (keyword) {
        result =
          result.filter(
            (request) => {
              const text = [
                request.customerName,
                request.customerEmail,
                request.service,
                request.location,
                request.mobile,
                request.problem,
                request.status,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return text.includes(
                keyword
              );
            }
          );
      }

      if (
        statusFilter !==
        "All Status"
      ) {
        result =
          result.filter(
            (request) =>
              request.status ===
              statusFilter
          );
      }

      if (
        serviceFilter !==
        "All Services"
      ) {
        result =
          result.filter(
            (request) =>
              request.service ===
              serviceFilter
          );
      }

      result.sort(
        (a, b) => {
          const dateA =
            new Date(
              a.createdAt || 0
            ).getTime();

          const dateB =
            new Date(
              b.createdAt || 0
            ).getTime();

          return sort ===
            "Newest"
            ? dateB - dateA
            : dateA - dateB;
        }
      );

      return result;
    }, [
      requests,
      search,
      statusFilter,
      serviceFilter,
      sort,
    ]);

  // ===================================================
  // UPDATE STATUS
  // ===================================================

  const updateRequestStatus =
    async (
      requestId,
      newStatus
    ) => {
      const validRequestId =
        normalizeId(
          requestId
        );

      if (!validRequestId) {
        setError(
          "Request ID is missing."
        );

        return false;
      }

      const finalStatus =
        String(newStatus)
          .trim()
          .toUpperCase();

      const allowedStatuses = [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ];

      if (
        !allowedStatuses.includes(
          finalStatus
        )
      ) {
        setError(
          "Invalid request status."
        );

        return false;
      }

      try {
        setUpdatingRequestId(
          validRequestId
        );

        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/requests/${validRequestId}/status`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                status:
                  finalStatus,
              }),
            }
          );

        const responseText =
          await response.text();

        let responseData = null;

        if (responseText) {
          try {
            responseData =
              JSON.parse(
                responseText
              );
          } catch {
            responseData = null;
          }
        }

        if (!response.ok) {
          throw new Error(
            responseData?.message ||
              responseData?.error ||
              `Status update failed: ${response.status}`
          );
        }

        // -----------------------------------------
        // UPDATE LIST
        // -----------------------------------------

        setRequests(
          (previous) =>
            previous.map(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  validRequestId
                )
                  ? {
                      ...item,
                      status:
                        finalStatus,
                      originalRequest:
                        responseData ||
                        item.originalRequest,
                    }
                  : item
            )
        );

        // -----------------------------------------
        // UPDATE OPEN DETAILS
        // -----------------------------------------

        setSelectedRequest(
          (previous) => {
            if (
              !previous ||
              String(
                previous.id
              ) !==
                String(
                  validRequestId
                )
            ) {
              return previous;
            }

            return {
              ...previous,
              status:
                finalStatus,
              originalRequest:
                responseData ||
                previous.originalRequest,
            };
          }
        );

        const currentRequest =
          requests.find(
            (item) =>
              String(
                item.id
              ) ===
              String(
                validRequestId
              )
          );

        const customerName =
          currentRequest
            ? getCustomerName(
                currentRequest
              )
            : "customer";

        if (
          finalStatus ===
          "ACCEPTED"
        ) {
          setSuccessMessage(
            `Request from ${customerName} accepted successfully.`
          );
        } else if (
          finalStatus ===
          "REJECTED"
        ) {
          setSuccessMessage(
            `Request from ${customerName} marked as Not Interested.`
          );
        } else if (
          finalStatus ===
          "COMPLETED"
        ) {
          setSuccessMessage(
            `Request from ${customerName} completed successfully.`
          );
        } else {
          setSuccessMessage(
            `Request changed to ${getStatusText(
              finalStatus
            )}.`
          );
        }

        return true;
      } catch (err) {
        console.error(
          "Status update error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update request."
        );

        return false;
      } finally {
        setUpdatingRequestId(
          null
        );
      }
    };

  // ===================================================
  // ACCEPT
  // ===================================================

  const acceptRequest =
    async (request) => {
      if (!request) {
        return;
      }

      await updateRequestStatus(
        request.id,
        "ACCEPTED"
      );
    };

  // ===================================================
  // NOT INTERESTED
  // ===================================================

  const notInterestedRequest =
    async (request) => {
      if (!request) {
        return;
      }

      const customerName =
        getCustomerName(
          request
        );

      const confirmed =
        window.confirm(
          `Are you sure you are not interested in this request from ${customerName}?`
        );

      if (!confirmed) {
        return;
      }

      await updateRequestStatus(
        request.id,
        "REJECTED"
      );
    };

  // ===================================================
  // COMPLETE
  // ===================================================

  const completeRequest =
    async (request) => {
      if (!request) {
        return;
      }

      await updateRequestStatus(
        request.id,
        "COMPLETED"
      );
    };

  // ===================================================
  // PERMANENT DELETE
  // ===================================================

  const deleteRequest =
    async (request) => {
      if (
        !request ||
        !isValidId(
          request.id
        )
      ) {
        setError(
          "Valid request ID is not available."
        );

        return;
      }

      const customerName =
        getCustomerName(
          request
        );

      const confirmed =
        window.confirm(
          `Delete this request from ${customerName}?\n\nService: ${request.service}\n\nThis will permanently delete the request from the backend database.`
        );

      if (!confirmed) {
        return;
      }

      const requestId =
        String(request.id);

      try {
        setDeletingRequestId(
          requestId
        );

        setError("");

        // -----------------------------------------
        // DELETE FROM BACKEND
        // -----------------------------------------

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

        const responseText =
          await response.text();

        let responseData = null;

        if (responseText) {
          try {
            responseData =
              JSON.parse(
                responseText
              );
          } catch {
            responseData = null;
          }
        }

        if (!response.ok) {
          throw new Error(
            responseData?.message ||
              responseData?.error ||
              `Delete failed: ${response.status}`
          );
        }

        // -----------------------------------------
        // IMPORTANT
        // MARK ID AS DELETED BEFORE REFRESH
        // -----------------------------------------

        deletedRequestIdsRef.current.add(
          requestId
        );
        saveDeletedRequestId(requestId);

        // -----------------------------------------
        // REMOVE FROM UI IMMEDIATELY
        // -----------------------------------------

        setRequests(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item.id
                ) !==
                requestId
            )
        );

        // -----------------------------------------
        // CLOSE DETAILS
        // -----------------------------------------

        setSelectedRequest(
          (previous) => {
            if (
              previous &&
              String(
                previous.id
              ) === requestId
            ) {
              return null;
            }

            return previous;
          }
        );

        setSuccessMessage(
          `Request from ${customerName} deleted permanently.`
        );

        // -----------------------------------------
        // RELOAD FROM BACKEND
        // Deleted ID is already protected above,
        // so 3-second polling won't show it again.
        // -----------------------------------------

        await loadRequests();
      } catch (err) {
        console.error(
          "Delete request error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete request."
        );
      } finally {
        setDeletingRequestId(
          null
        );
      }
    };

  // ===================================================
  // GET EXACT REQUESTER ACCOUNT
  // ===================================================
  //
  // The requester ID comes from service_requests.user_id.
  // That is the person who sent the request.
  //
  // We do NOT check the role here. The Call Customer action
  // must call the exact account attached to this request.
  // ===================================================

  const getCustomerAccountMobile = async (customerId) => {
    const validCustomerId = normalizeId(customerId);

    if (!validCustomerId) {
      return "";
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${validCustomerId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const responseText = await response.text();

      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error(
            "Unable to parse requester account response:",
            error
          );
        }
      }

      if (!response.ok || !data) {
        console.error(
          "Requester account lookup failed:",
          response.status,
          data
        );

        return "";
      }

      const phone =
        data?.phone ??
        data?.mobile ??
        data?.mobileNumber ??
        data?.phoneNumber ??
        "";

      return String(phone)
        .trim()
        .replace(/[^\d+]/g, "");
    } catch (error) {
      console.error(
        "Unable to fetch requester phone:",
        error
      );

      return "";
    }
  };

  // ===================================================
  // CALL CUSTOMER / REQUESTER
  // ===================================================
  //
  // Flow:
  // Request card
  //      ↓
  // request.userId  (service_requests.user_id)
  //      ↓
  // GET /api/users/{userId}
  //      ↓
  // users.phone
  //      ↓
  // tel:phone
  //
  // No role blocking is done here.
  // ===================================================

  const callCustomer = async (request) => {
    if (!request) {
      return;
    }

    const customerId = getCustomerId(request);

    console.log("====================================");
    console.log("CALL CUSTOMER - REQUEST:", request);
    console.log("CALL CUSTOMER - REQUEST ID:", request.id);
    console.log("CALL CUSTOMER - REQUESTER ID:", customerId);
    console.log("====================================");

    if (!customerId) {
      setError(
        "The person who sent this request could not be identified."
      );

      return;
    }

    try {
      setCallingCustomerRequestId(String(request.id));
      setError("");

      // Always fetch the phone from the exact account linked to this request.
      const mobile = await getCustomerAccountMobile(customerId);

      console.log(
        "REQUESTER PHONE FROM DATABASE:",
        mobile
      );

      if (!mobile) {
        setError(
          `Requester account ID ${customerId} does not have a phone number saved in the database.`
        );

        return;
      }

      // Keep the fetched phone in the current UI.
      setRequests((previous) =>
        previous.map((item) =>
          String(item.id) === String(request.id)
            ? { ...item, mobile }
            : item
        )
      );

      setSelectedRequest((previous) => {
        if (
          !previous ||
          String(previous.id) !== String(request.id)
        ) {
          return previous;
        }

        return {
          ...previous,
          mobile,
        };
      });

      console.log(
        "CALLING REQUESTER ID:",
        customerId
      );

      console.log(
        "CALLING REQUESTER PHONE:",
        mobile
      );

      // Open the device/browser phone dialer.
      window.location.assign(`tel:${mobile}`);
    } catch (error) {
      console.error(
        "Call Customer Error:",
        error
      );

      setError(
        error?.message ||
          "Unable to call the requester."
      );
    } finally {
      setCallingCustomerRequestId(null);
    }
  };

  // ===================================================
  // OPEN MESSAGE MODAL
  // ===================================================

  const openMessageModal =
    (request) => {
      if (!request) {
        return;
      }

      const customerId =
        getCustomerId(
          request
        );

      const providerId =
        normalizeId(
          loggedInProviderId ||
            getProviderId()
        );

      const requestId =
        getRequestId(
          request
        );

      if (!requestId) {
        setError(
          "Request ID is not available."
        );

        return;
      }

      if (!customerId) {
        setError(
          "Customer ID is not available in this request."
        );

        console.error(
          "Customer ID missing:",
          request
        );

        return;
      }

      if (!providerId) {
        setError(
          "Provider ID is not available. Please login again."
        );

        return;
      }

      setMessageTargetRequest({
        ...request,

        id: requestId,

        requestId,

        customerId,

        userId:
          customerId,

        providerId,
      });

      setMessageText("");

      setError("");

      setMessageModalOpen(
        true
      );
    };

  // ===================================================
  // CLOSE MESSAGE MODAL
  // ===================================================

  const closeMessageModal =
    () => {
      if (
        sendingMessageRequestId !==
        null
      ) {
        return;
      }

      setMessageModalOpen(
        false
      );

      setMessageTargetRequest(
        null
      );

      setMessageText("");
    };

  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const sendMessage =
    async () => {
      if (
        !messageTargetRequest
      ) {
        return;
      }

      const finalMessage =
        messageText.trim();

      if (!finalMessage) {
        setError(
          "Please enter a message."
        );

        return;
      }

      const request =
        messageTargetRequest;

      const requestId =
        getRequestId(
          request
        );

      const customerId =
        getCustomerId(
          request
        );

      const providerId =
        normalizeId(
          request.providerId ||
            loggedInProviderId ||
            getProviderId()
        );

      if (!requestId) {
        setError(
          "Request ID is missing."
        );

        return;
      }

      if (!customerId) {
        setError(
          "Customer ID is missing."
        );

        return;
      }

      if (!providerId) {
        setError(
          "Provider ID is missing."
        );

        return;
      }

      try {
        setSendingMessageRequestId(
          requestId
        );

        setError("");

        const messageData = {
          senderId:
            Number(
              providerId
            ),

          receiverId:
            Number(
              customerId
            ),

          requestId:
            Number(
              requestId
            ),

          senderRole:
            "PROVIDER",

          receiverRole:
            "USER",

          message:
            finalMessage,
        };

        console.log(
          "Provider → Customer message:",
          messageData
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/messages`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  messageData
                ),
            }
          );

        const responseText =
          await response.text();

        let responseData = null;

        if (responseText) {
          try {
            responseData =
              JSON.parse(
                responseText
              );
          } catch {
            responseData = null;
          }
        }

        if (!response.ok) {
          throw new Error(
            responseData?.message ||
              responseData?.error ||
              `Message sending failed: ${response.status}`
          );
        }

        setMessageModalOpen(
          false
        );

        setMessageTargetRequest(
          null
        );

        setMessageText("");

        setSuccessMessage(
          `Message sent to ${getCustomerName(
            request
          )}.`
        );
      } catch (err) {
        console.error(
          "Message sending error:",
          err
        );

        setError(
          err?.message ||
            "Unable to send message."
        );
      } finally {
        setSendingMessageRequestId(
          null
        );
      }
    };

  // ===================================================
  // VIEW DETAILS
  // ===================================================

  const viewDetails =
    (request) => {
      if (!request) {
        return;
      }

      // Toggle:
      // Same card click = close
      if (
        selectedRequest &&
        String(
          selectedRequest.id
        ) ===
          String(
            request.id
          )
      ) {
        setSelectedRequest(
          null
        );

        return;
      }

      // Open clicked request
      setSelectedRequest(
        request
      );

      setError("");

      // Details are now rendered directly
      // under clicked request card.
    };

  // ===================================================
  // CLOSE DETAILS
  // ===================================================

  const closeDetails =
    () => {
      setSelectedRequest(
        null
      );
    };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    const keysToRemove = [
      "palleconnect_current_user",
      "loggedInUser",
      "loggedInUserId",
      "loggedInProviderId",
      "userEmail",
      "userRole",
      "isLoggedIn",
      "rememberMe",
      "loginType",
    ];

    keysToRemove.forEach(
      (key) => {
        localStorage.removeItem(
          key
        );
      }
    );

    navigate(
      "/login"
    );
  };

  // ===================================================
  // RESET FILTERS
  // ===================================================

  const resetFilters =
    () => {
      setSearch("");

      setStatusFilter(
        "All Status"
      );

      setServiceFilter(
        "All Services"
      );

      setSort(
        "Newest"
      );
    };

  // ===================================================
  // DETAILS CONTENT
  // ===================================================

  const renderDetailsPanel =
    (request) => {
      if (!request) {
        return null;
      }

      const isPending =
        request.status ===
        "PENDING";

      const isAccepted =
        request.status ===
          "ACCEPTED" ||
        request.status ===
          "IN_PROGRESS";

      const isCompleted =
        request.status ===
        "COMPLETED";

      const isRejected =
        request.status ===
        "REJECTED";

      const isDeleting =
        String(
          deletingRequestId
        ) ===
        String(
          request.id
        );

      return (
        <aside
          className="request-details-panel"
          data-request-id={
            request.id
          }
        >
          <div className="details-panel-header">
            <div>
              <span>
                📋 Request Information
              </span>

              <h2>
                Request Details
              </h2>
            </div>

            <button
              type="button"
              className="details-close-button"
              onClick={
                closeDetails
              }
            >
              ×
            </button>
          </div>

          {/* CUSTOMER */}

          <div className="details-customer">
            <div className="details-customer-avatar">
              {request.customerImage ? (
                <img
                  src={
                    request.customerImage
                  }
                  alt={
                    request.customerName
                  }
                />
              ) : (
                <span>
                  👤
                </span>
              )}
            </div>

            <div>
              <h3>
                {
                  request.customerName
                }
              </h3>

              <p>
                📍{" "}
                {
                  request.location
                }
              </p>

              <p>
                📞{" "}
                {
                  request.mobile ||
                  "Mobile not available"
                }
              </p>

              {request.customerEmail && (
                <p>
                  ✉{" "}
                  {
                    request.customerEmail
                  }
                </p>
              )}
            </div>
          </div>

          {/* CONTACT */}

          {isAccepted && (
            <div className="details-contact-section">
              <div className="contact-section-heading">
                <span className="contact-small-label">
                  QUICK CONTACT
                </span>

                <h3>
                  Contact Customer
                </h3>

                <p>
                  Send a message or call
                  the customer.
                </p>
              </div>

              <div className="details-contact-buttons">
                <button
                  type="button"
                  className="details-call-button"
                  onClick={() =>
                    callCustomer(
                      request
                    )
                  }
                  disabled={false}
                >
                  <span className="details-contact-icon">
                    📞
                  </span>

                  <div className="details-contact-content">
                    <strong>
                      Call Customer
                    </strong>

                    <small>
                      {
                        request.mobile ||
                        "Mobile unavailable"
                      }
                    </small>
                  </div>

                  <span className="contact-arrow">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  className="details-message-button"
                  onClick={() =>
                    openMessageModal(
                      request
                    )
                  }
                  disabled={
                    !isValidId(
                      getCustomerId(
                        request
                      )
                    )
                  }
                >
                  <span className="details-contact-icon">
                    💬
                  </span>

                  <div className="details-contact-content">
                    <strong>
                      Message Customer
                    </strong>

                    <small>
                      Open message window
                    </small>
                  </div>

                  <span className="contact-arrow">
                    →
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* SERVICE */}

          <div className="details-service-card">
            <img
              src={
                request.serviceImage
              }
              alt={
                request.service
              }
              onError={(
                event
              ) => {
                event.currentTarget.src =
                  DEFAULT_SERVICE_IMAGE;
              }}
            />

            <div>
              <h3>
                {
                  request.service
                }
              </h3>

              <p>
                ◷{" "}
                {
                  request.duration
                }
              </p>

              <strong>
                {
                  request.price
                }
              </strong>

              <span>
                {
                  request.problem
                }
              </span>
            </div>
          </div>

          {/* DETAILS GRID */}

          <div className="details-grid">
            <div>
              <span>
                📅 Date
              </span>

              <strong>
                {
                  formatDate(
                    request.date
                  )
                }
              </strong>
            </div>

            <div>
              <span>
                ◷ Time
              </span>

              <strong>
                {
                  formatTime(
                    request.time
                  )
                }
              </strong>
            </div>

            <div>
              <span>
                ⏱ Duration
              </span>

              <strong>
                {
                  request.duration
                }
              </strong>
            </div>

            <div>
              <span>
                ₹ Price
              </span>

              <strong>
                {
                  request.price
                }
              </strong>
            </div>

            <div className="details-full">
              <span>
                📍 Location
              </span>

              <strong>
                {
                  request.location
                }
              </strong>
            </div>
          </div>

          {/* CUSTOMER MESSAGE */}

          <div className="details-problem">
            <span>
              💬 Customer Request Message
            </span>

            <p>
              {
                request.problem
              }
            </p>
          </div>

          {/* CURRENT STATUS */}

          <div className="details-current-status">
            <span>
              Current Status
            </span>

            <strong
              className={`details-status ${request.status.toLowerCase()}`}
            >
              {
                getStatusText(
                  request.status
                )
              }
            </strong>
          </div>

          {/* ACTIONS */}

          <div className="details-actions">
            {isPending && (
              <>
                <button
                  type="button"
                  className="details-accept-button"
                  onClick={() =>
                    acceptRequest(
                      request
                    )
                  }
                  disabled={
                    updatingRequestId !==
                    null
                  }
                >
                  {updatingRequestId !==
                  null
                    ? "⏳ Updating..."
                    : "✓ Accept Request"}
                </button>

                <button
                  type="button"
                  className="details-not-interested-button"
                  onClick={() =>
                    notInterestedRequest(
                      request
                    )
                  }
                  disabled={
                    updatingRequestId !==
                    null
                  }
                >
                  ✕ Not Interested
                </button>
              </>
            )}

            {isAccepted && (
              <button
                type="button"
                className="details-complete-button"
                onClick={() =>
                  completeRequest(
                    request
                  )
                }
                disabled={
                  updatingRequestId !==
                  null
                }
              >
                {updatingRequestId !==
                null
                  ? "⏳ Updating..."
                  : "✓ Mark Completed"}
              </button>
            )}

            <button
              type="button"
              className="details-delete-button"
              onClick={() =>
                deleteRequest(
                  request
                )
              }
              disabled={
                isDeleting ||
                updatingRequestId !==
                  null
              }
            >
              {isDeleting
                ? "⏳ Deleting..."
                : "🗑 Delete Request"}
            </button>
          </div>

          {/* ACCEPTED */}

          {request.status ===
            "ACCEPTED" && (
            <div className="details-success-box">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  Request Accepted
                </strong>

                <p>
                  The request status
                  has been updated in
                  the backend.
                </p>
              </div>
            </div>
          )}

          {/* REJECTED */}

          {request.status ===
            "REJECTED" && (
            <div className="details-rejected-box">
              <span>
                ✕
              </span>

              <div>
                <strong>
                  Not Interested
                </strong>

                <p>
                  The request status
                  has been updated in
                  the backend.
                </p>
              </div>
            </div>
          )}

          {/* COMPLETED */}

          {request.status ===
            "COMPLETED" && (
            <div className="details-success-box">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  Request Completed
                </strong>

                <p>
                  The request has been
                  completed successfully.
                </p>
              </div>
            </div>
          )}

          {/* CANCELLED */}

          {request.status ===
            "CANCELLED" && (
            <div className="details-rejected-box">
              <span>
                ✕
              </span>

              <div>
                <strong>
                  Request Cancelled
                </strong>

                <p>
                  This service request
                  has been cancelled.
                </p>
              </div>
            </div>
          )}
        </aside>
      );
    };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="provider-request-page">

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
            className="provider-nav-item"
          >
            <span>
              ⌂
            </span>

            Dashboard
          </Link>

          <Link
            to="/provider/services"
            className="provider-nav-item"
          >
            <span>
              🔧
            </span>

            My Services
          </Link>

          <Link
            to="/provider/requests"
            className="provider-nav-item active"
          >
            <span>
              ✉
            </span>

            Requests

            {pendingRequests > 0 && (
              <b className="nav-request-badge">
                {
                  pendingRequests
                }
              </b>
            )}
          </Link>

          <Link
            to="/provider/profile"
            className="provider-nav-item"
          >
            <span>
              👤
            </span>

            Profile
          </Link>

        </div>

        <button
          type="button"
          className="provider-logout"
          onClick={logout}
        >
          <span>
            ⇥
          </span>

          Logout
        </button>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="provider-request-main">

        {/* HERO */}

        <section className="request-hero">

          <div className="request-hero-overlay"></div>

          <div className="request-hero-content">

            <p>
              SERVICE REQUESTS
            </p>

            <h1>
              Customer Requests ✉️
            </h1>

            <h3>
              Requests sent by customers
              to your provider account.
            </h3>

          </div>

        </section>

        {/* PAGE HEADER */}

        <section className="request-page-header">

          <div>

            <h2>
              Your Requests
            </h2>

            <p>
              Provider ID:{" "}
              <strong>
                {
                  loggedInProviderId ||
                  "Not found"
                }
              </strong>
            </p>

          </div>

          <button
            type="button"
            className="request-refresh-button"
            onClick={
              loadRequests
            }
            disabled={loading}
          >
            {loading
              ? "⏳ Loading..."
              : "↻ Refresh"}
          </button>

        </section>

        {/* SUCCESS */}

        {successMessage && (
          <div className="request-success-message">

            <span className="success-icon">
              ✓
            </span>

            <div>

              <strong>
                Success
              </strong>

              <p>
                {
                  successMessage
                }
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  ""
                )
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="request-error-message">

            <span>
              ⚠
            </span>

            <div>
              {error}
            </div>

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

        {/* =================================================
            SIX STATISTICS
        ================================================= */}

        <section className="request-statistics">

          <div className="request-stat-card">

            <div className="request-stat-icon blue">
              ✉
            </div>

            <div>
              <p>
                Total Requests
              </p>

              <h2>
                {
                  totalRequests
                }
              </h2>

              <span>
                Customer requests
              </span>
            </div>

          </div>

          <div className="request-stat-card">

            <div className="request-stat-icon green">
              ◷
            </div>

            <div>
              <p>
                Pending
              </p>

              <h2>
                {
                  pendingRequests
                }
              </h2>

              <span>
                Need your response
              </span>
            </div>

          </div>

          <div className="request-stat-card">

            <div className="request-stat-icon orange">
              ✓
            </div>

            <div>
              <p>
                Accepted
              </p>

              <h2>
                {
                  acceptedRequests
                }
              </h2>

              <span>
                Accepted / In progress
              </span>
            </div>

          </div>

          <div className="request-stat-card">

            <div className="request-stat-icon purple">
              ✓
            </div>

            <div>
              <p>
                Completed
              </p>

              <h2>
                {
                  completedRequests
                }
              </h2>

              <span>
                Successfully finished
              </span>
            </div>

          </div>

          <div className="request-stat-card">

            <div className="request-stat-icon red">
              ✕
            </div>

            <div>
              <p>
                Not Interested
              </p>

              <h2>
                {
                  rejectedRequests
                }
              </h2>

              <span>
                Requests declined
              </span>
            </div>

          </div>

          <div className="request-stat-card">

            <div className="request-stat-icon red">
              ⊘
            </div>

            <div>
              <p>
                Cancelled
              </p>

              <h2>
                {
                  cancelledRequests
                }
              </h2>

              <span>
                Cancelled requests
              </span>
            </div>

          </div>

        </section>

        {/* SECTION HEADER */}

        <section className="request-section-header">

          <div>

            <h2>
              Incoming Customer Requests
            </h2>

            <p>
              {
                filteredRequests.length
              }{" "}
              request
              {
                filteredRequests.length !==
                1
                  ? "s"
                  : ""
              }{" "}
              found
            </p>

          </div>

          <button
            type="button"
            className="request-refresh-button"
            onClick={
              loadRequests
            }
            disabled={loading}
          >
            {loading
              ? "⏳ Loading..."
              : "↻ Refresh"}
          </button>

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="request-filters">

          <div className="request-search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search customer, service or location..."
            />

            {search && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <select
            value={statusFilter}
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option>
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
              Not Interested
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <select
            value={serviceFilter}
            onChange={(
              event
            ) =>
              setServiceFilter(
                event.target.value
              )
            }
          >

            <option>
              All Services
            </option>

            {serviceOptions.map(
              (service) => (
                <option
                  key={service}
                  value={service}
                >
                  {
                    service
                  }
                </option>
              )
            )}

          </select>

          <select
            value={sort}
            onChange={(
              event
            ) =>
              setSort(
                event.target.value
              )
            }
          >

            <option value="Newest">
              ⇅ Sort by: Newest
            </option>

            <option value="Oldest">
              ⇅ Sort by: Oldest
            </option>

          </select>

        </section>

        {/* CLEAR FILTERS */}

        {(
          search ||
          statusFilter !==
            "All Status" ||
          serviceFilter !==
            "All Services"
        ) && (
          <button
            type="button"
            className="reset-filters-button"
            onClick={
              resetFilters
            }
          >
            Clear Filters
          </button>
        )}

        {/* =================================================
            REQUEST CONTENT
        ================================================= */}

        <section className="request-content-layout">

          <div className="request-list">

            {/* LOADING */}

            {loading ? (

              <div className="request-empty-card">

                <div className="request-loader">
                  ⏳
                </div>

                <h3>
                  Loading Requests...
                </h3>

                <p>
                  Please wait.
                </p>

              </div>

            ) : filteredRequests.length ===
              0 ? (

              <div className="request-empty-card">

                <div className="empty-icon">
                  📥
                </div>

                <h3>
                  No Customer Requests
                </h3>

                <p>
                  {search ||
                  statusFilter !==
                    "All Status" ||
                  serviceFilter !==
                    "All Services"
                    ? "No requests match your current filters."
                    : "When a customer sends you a service request, it will appear here."}
                </p>

              </div>

            ) : (

              filteredRequests.map(
                (request) => {

                  const isPending =
                    request.status ===
                    "PENDING";

                  const isAccepted =
                    request.status ===
                      "ACCEPTED" ||
                    request.status ===
                      "IN_PROGRESS";

                  const isCompleted =
                    request.status ===
                    "COMPLETED";

                  const isRejected =
                    request.status ===
                    "REJECTED";

                  const isSelected =
                    selectedRequest &&
                    String(
                      selectedRequest.id
                    ) ===
                      String(
                        request.id
                      );

                  const isUpdating =
                    String(
                      updatingRequestId
                    ) ===
                    String(
                      request.id
                    );

                  const isDeleting =
                    String(
                      deletingRequestId
                    ) ===
                    String(
                      request.id
                    );

                  const hasCustomerId =
                    isValidId(
                      getCustomerId(
                        request
                      )
                    );

                  return (
                    <Fragment
                      key={
                        request.id
                      }
                    >

                      {/* =================================================
                          REQUEST CARD
                      ================================================= */}

                      <article
                        className={`request-card ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                      >

                        {/* CARD TYPE */}

                        <div className="request-card-type">

                          <span className="incoming-type">
                            📥 Incoming Customer Request
                          </span>

                          {isPending && (
                            <span className="new-request-label">
                              NEW
                            </span>
                          )}

                        </div>

                        {/* CUSTOMER MESSAGE */}

                        <div className="customer-request-message">

                          <div className="customer-message-avatar">

                            {request.customerImage ? (

                              <img
                                src={
                                  request.customerImage
                                }
                                alt={
                                  request.customerName
                                }
                              />

                            ) : (

                              <span>
                                👤
                              </span>

                            )}

                          </div>

                          <div className="customer-message-content">

                            <div className="customer-message-top">

                              <strong>
                                {
                                  request.customerName
                                }
                              </strong>

                              <span>
                                {
                                  formatTime(
                                    request.time
                                  )
                                }
                              </span>

                            </div>

                            <div className="customer-message-bubble">

                              <strong>
                                🔧{" "}
                                {
                                  request.service
                                }
                              </strong>

                              <p>
                                {
                                  request.problem
                                }
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* CUSTOMER */}

                        <div className="request-customer">

                          <div className="customer-avatar">

                            {request.customerImage ? (

                              <img
                                src={
                                  request.customerImage
                                }
                                alt={
                                  request.customerName
                                }
                              />

                            ) : (

                              <span>
                                👤
                              </span>

                            )}

                          </div>

                          <div className="customer-info">

                            <h3>
                              {
                                request.customerName
                              }
                            </h3>

                            <p>
                              📍{" "}
                              {
                                request.location
                              }
                            </p>

                            <p>
                              📞{" "}
                              {
                                request.mobile ||
                                "Mobile not available"
                              }
                            </p>

                          </div>

                        </div>

                        {/* SERVICE */}

                        <div className="request-service">

                          <img
                            src={
                              request.serviceImage
                            }
                            alt={
                              request.service
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.src =
                                DEFAULT_SERVICE_IMAGE;
                            }}
                          />

                          <div className="request-service-info">

                            <h3>
                              {
                                request.service
                              }
                            </h3>

                            <p>
                              ◷{" "}
                              {
                                request.duration
                              }
                            </p>

                            <strong>
                              {
                                request.price
                              }
                            </strong>

                            <span>
                              {
                                request.problem
                              }
                            </span>

                          </div>

                        </div>

                        {/* STATUS */}

                        <div className="request-status-column">

                          <div
                            className={`request-status ${request.status.toLowerCase()}`}
                          >

                            <span></span>

                            {
                              getStatusText(
                                request.status
                              )
                            }

                          </div>

                          <p>
                            📅{" "}
                            {
                              formatDate(
                                request.date
                              )
                            }
                          </p>

                          <p>
                            ◷{" "}
                            {
                              formatTime(
                                request.time
                              )
                            }
                          </p>

                        </div>

                        {/* ACTIONS */}

                        <div className="request-actions">

                          {/* ACCEPT */}

                          {isPending && (
                            <button
                              type="button"
                              className="accept-request"
                              onClick={() =>
                                acceptRequest(
                                  request
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                            >
                              {isUpdating
                                ? "⏳ Updating..."
                                : "✓ Accept"}
                            </button>
                          )}

                          {/* COMPLETE */}

                          {isAccepted && (
                            <button
                              type="button"
                              className="complete-request"
                              onClick={() =>
                                completeRequest(
                                  request
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                            >
                              {isUpdating
                                ? "⏳ Updating..."
                                : "✓ Complete"}
                            </button>
                          )}

                          {/* VIEW DETAILS */}

                          <button
                            type="button"
                            className="view-details-request"
                            onClick={() =>
                              viewDetails(
                                request
                              )
                            }
                            disabled={
                              isDeleting
                            }
                          >
                            {isSelected
                              ? "▲ Hide Details"
                              : "👁 View Details"}
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-request"
                            onClick={() =>
                              deleteRequest(
                                request
                              )
                            }
                            disabled={
                              isDeleting ||
                              isUpdating
                            }
                          >
                            {isDeleting
                              ? "⏳ Deleting..."
                              : "🗑 Delete"}
                          </button>

                          {/* NOT INTERESTED */}

                          {isPending && (
                            <button
                              type="button"
                              className="not-interested-request"
                              onClick={() =>
                                notInterestedRequest(
                                  request
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                            >
                              ✕ Not Interested
                            </button>
                          )}

                          {/* CALL */}

                          {isAccepted && (
                            <button
                              type="button"
                              className="call-request"
                              onClick={() =>
                                callCustomer(
                                  request
                                )
                              }
                              disabled={false}
                            >
                              📞 Call Customer
                            </button>
                          )}

                          {/* MESSAGE */}

                          {isAccepted && (
                            <button
                              type="button"
                              className="message-request"
                              onClick={() =>
                                openMessageModal(
                                  request
                                )
                              }
                              disabled={
                                !hasCustomerId
                              }
                              title={
                                hasCustomerId
                                  ? "Message customer"
                                  : "Customer ID is missing"
                              }
                            >
                              💬 Message Customer
                            </button>
                          )}

                        </div>

                        {/* STATUS MESSAGE */}

                        {(
                          isAccepted ||
                          isCompleted ||
                          isRejected
                        ) && (

                          <div
                            className={`request-card-message ${
                              isRejected
                                ? "rejected-message"
                                : isCompleted
                                ? "completed-message"
                                : "accepted-message"
                            }`}
                          >

                            <span>
                              {isRejected
                                ? "✕"
                                : "✓"}
                            </span>

                            <div>

                              <strong>
                                {isRejected
                                  ? "Not Interested"
                                  : isCompleted
                                  ? "Request Completed"
                                  : "Request Accepted"}
                              </strong>

                              <p>
                                {
                                  getStatusMessage(
                                    request.status
                                  )
                                }
                              </p>

                            </div>

                          </div>

                        )}

                      </article>

                      {/* =================================================
                          IMPORTANT:
                          DETAILS DIRECTLY UNDER CLICKED CARD
                      ================================================= */}

                      {isSelected &&
                        renderDetailsPanel(
                          request
                        )}

                    </Fragment>
                  );
                }
              )

            )}

          </div>

        </section>

      </main>

      {/* =================================================
          MESSAGE MODAL
      ================================================= */}
      {/* =================================================
          MESSAGE MODAL
          ================================================= */}

      {messageModalOpen && messageTargetRequest && (

        <div
          className="message-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeMessageModal();
            }
          }}
        >

          <div className="message-modal">

            {/* ================= HEADER ================= */}

            <div className="message-modal-header">

              <div className="message-modal-title-area">

                <span className="message-modal-label">
                  💬 CUSTOMER MESSAGE
                </span>

                <h2>
                  Message Customer
                </h2>

              </div>

              <button
                type="button"
                className="message-modal-close"
                onClick={closeMessageModal}
                disabled={sendingMessageRequestId !== null}
                aria-label="Close message"
              >
                ×
              </button>

            </div>


            {/* ================= CUSTOMER ================= */}

            <div className="message-modal-customer">

              <div className="message-modal-avatar">

                {messageTargetRequest.customerImage ? (

                  <img
                    src={messageTargetRequest.customerImage}
                    alt={messageTargetRequest.customerName}
                  />

                ) : (

                  <span>👤</span>

                )}

              </div>


              <div className="message-modal-customer-info">

                <strong>
                  {messageTargetRequest.customerName}
                </strong>

                <span>
                  {messageTargetRequest.service}
                </span>

              </div>

            </div>


            {/* ================= BODY ================= */}

            <div className="message-modal-body">

              <label htmlFor="provider-message">
                Your Message
              </label>

              <textarea
                id="provider-message"
                value={messageText}
                onChange={(event) => {
                  setMessageText(event.target.value);
                }}
                placeholder="Type your message to the customer..."
                rows={6}
                maxLength={2000}
                disabled={sendingMessageRequestId !== null}
                autoFocus
              />

              <div className="message-character-count">
                {messageText.length}/2000
              </div>

            </div>


            {/* ================= FOOTER ================= */}

            <div className="message-modal-footer">

              {/* CANCEL */}

              <button
                type="button"
                className="message-cancel-button"
                onClick={closeMessageModal}
                disabled={sendingMessageRequestId !== null}
              >
                Cancel
              </button>


              {/* SEND MESSAGE */}

              <button
                type="button"
                className="message-send-button"
                onClick={sendMessage}
                disabled={
                  !messageText.trim() ||
                  sendingMessageRequestId !== null
                }
              >

                {sendingMessageRequestId !== null
                  ? "⏳ Sending..."
                  : "💬 Send Message"}

              </button>

            </div>

          </div>

        </div>

      )}
    </div>
  );
}

export default ProviderRequest;