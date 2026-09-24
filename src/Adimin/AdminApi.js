// src/Admin/adminApi.js

const API_BASE_URL = "https://gramacare4.onrender.com";
/*
|--------------------------------------------------------------------------
| COMMON JSON REQUEST HELPER
|--------------------------------------------------------------------------
*/

const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        data &&
        typeof data === "object" &&
        (data.message || data.error)
          ? data.message || data.error
          : `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

/**
 * Get all registered users
 */
export const getUsers = async () => {
  return request(`${API_BASE_URL}/api/users`);
};


/**
 * Get one user by ID
 */
export const getUserById = async (userId) => {
  if (
    userId === null ||
    userId === undefined ||
    String(userId).trim() === ""
  ) {
    throw new Error("User ID is required.");
  }

  return request(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}`
  );
};


/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  if (!email || !String(email).trim()) {
    throw new Error("Email is required.");
  }

  const encodedEmail = encodeURIComponent(
    String(email).trim()
  );

  return request(
    `${API_BASE_URL}/api/users/by-email?email=${encodedEmail}`
  );
};


/*
|--------------------------------------------------------------------------
| BLOCK USER
|--------------------------------------------------------------------------
|
| Backend endpoint:
|
| PUT /api/users/block/{id}
|
*/

export const blockUser = async (userId) => {
  if (
    userId === null ||
    userId === undefined ||
    String(userId).trim() === ""
  ) {
    throw new Error("User ID is required to block user.");
  }

  return request(
    `${API_BASE_URL}/api/users/block/${encodeURIComponent(userId)}`,
    {
      method: "PUT",
    }
  );
};


/*
|--------------------------------------------------------------------------
| UNBLOCK USER
|--------------------------------------------------------------------------
|
| Backend endpoint:
|
| PUT /api/users/unblock/{id}
|
*/

export const unblockUser = async (userId) => {
  if (
    userId === null ||
    userId === undefined ||
    String(userId).trim() === ""
  ) {
    throw new Error("User ID is required to unblock user.");
  }

  return request(
    `${API_BASE_URL}/api/users/unblock/${encodeURIComponent(userId)}`,
    {
      method: "PUT",
    }
  );
};


/*
|--------------------------------------------------------------------------
| PROVIDERS
|--------------------------------------------------------------------------
*/

/**
 * Get all providers
 */
export const getProviders = async () => {
  return request(
    `${API_BASE_URL}/api/users/providers`
  );
};


/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

/**
 * Get all services
 */
export const getServices = async () => {
  return request(
    `${API_BASE_URL}/api/services`
  );
};


/**
 * Get service by ID
 */
export const getServiceById = async (serviceId) => {
  if (
    serviceId === null ||
    serviceId === undefined ||
    String(serviceId).trim() === ""
  ) {
    throw new Error("Service ID is required.");
  }

  return request(
    `${API_BASE_URL}/api/services/${encodeURIComponent(serviceId)}`
  );
};


/*
|--------------------------------------------------------------------------
| PROVIDER REQUESTS
|--------------------------------------------------------------------------
*/

/**
 * Get requests for one provider
 */
export const getProviderRequests = async (providerId) => {
  if (
    providerId === null ||
    providerId === undefined ||
    String(providerId).trim() === ""
  ) {
    return [];
  }

  return request(
    `${API_BASE_URL}/api/requests/provider/${encodeURIComponent(
      providerId
    )}`
  );
};


/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
*/

/**
 * Extract array from different backend response formats.
 *
 * Supports:
 * [
 *   ...
 * ]
 *
 * or:
 * {
 *   content: [...]
 * }
 *
 * or:
 * {
 *   data: [...]
 * }
 */
const extractArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};


/*
|--------------------------------------------------------------------------
| GET ALL REQUESTS
|--------------------------------------------------------------------------
|
| 1. Get all providers
| 2. Get requests for each provider
| 3. Combine everything into one array
|
|--------------------------------------------------------------------------
*/

export const getAllRequests = async () => {
  const providersData = await getProviders();

  const providers = extractArray(providersData);

  if (providers.length === 0) {
    return [];
  }

  const requestGroups = await Promise.all(
    providers.map(async (provider) => {
      const providerId =
        provider?.id ??
        provider?.userId ??
        provider?.providerId;

      if (
        providerId === null ||
        providerId === undefined ||
        String(providerId).trim() === ""
      ) {
        return [];
      }

      try {
        const providerRequests =
          await getProviderRequests(providerId);

        const requests =
          extractArray(providerRequests);

        return requests.map((item) => ({
          ...item,
          providerId,
        }));
      } catch (error) {
        console.error(
          `Failed to load requests for provider ${providerId}:`,
          error
        );

        return [];
      }
    })
  );

  return requestGroups.flat();
};


/*
|--------------------------------------------------------------------------
| REFRESH ALL ADMIN DATA
|--------------------------------------------------------------------------
|
| Loads:
|
| - Users
| - Providers
| - Services
| - Requests
|
|--------------------------------------------------------------------------
*/

export const getAdminData = async () => {
  const [
    usersResponse,
    providersResponse,
    servicesResponse,
  ] = await Promise.all([
    getUsers(),
    getProviders(),
    getServices(),
  ]);

  const users = extractArray(usersResponse);
  const providers = extractArray(providersResponse);
  const services = extractArray(servicesResponse);

  let requests = [];

  try {
    requests = await getAllRequests();
  } catch (error) {
    console.error(
      "Failed to load all requests:",
      error
    );

    requests = [];
  }

  return {
    users,
    providers,
    services,
    requests,
  };
};


/*
|--------------------------------------------------------------------------
| DEFAULT ADMIN API OBJECT
|--------------------------------------------------------------------------
*/

const adminApi = {
  // Users
  getUsers,
  getUserById,
  getUserByEmail,

  // Block / Unblock
  blockUser,
  unblockUser,

  // Providers
  getProviders,

  // Services
  getServices,
  getServiceById,

  // Requests
  getProviderRequests,
  getAllRequests,

  // All admin data
  getAdminData,
};


export default adminApi;