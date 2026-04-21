const STORAGE_KEYS = {
  apiBaseUrl: "santech-api-base-url",
  authToken: "santech-auth-token",
  authRole: "santech-auth-role",
};

const state = {
  apiBaseUrl: localStorage.getItem(STORAGE_KEYS.apiBaseUrl) || "http://localhost:50001",
  token: localStorage.getItem(STORAGE_KEYS.authToken) || "",
  role: localStorage.getItem(STORAGE_KEYS.authRole) || "Guest",
};

const elements = {
  apiBaseUrl: document.getElementById("apiBaseUrl"),
  saveConfigBtn: document.getElementById("saveConfigBtn"),
  messageBox: document.getElementById("messageBox"),
  tokenStatus: document.getElementById("tokenStatus"),
  roleStatus: document.getElementById("roleStatus"),
  navLinks: [...document.querySelectorAll(".nav-link")],
  panels: [...document.querySelectorAll(".section-panel")],
  outputs: {
    users: document.getElementById("usersOutput"),
    appointments: document.getElementById("appointmentsOutput"),
    availability: document.getElementById("availabilityOutput"),
    notifications: document.getElementById("notificationsOutput"),
  },
};

const endpointMap = {
  registerForm: { method: "POST", path: "/api/auth/register" },
  loginForm: { method: "POST", path: "/api/auth/login" },
  createUserForm: { method: "POST", path: "/api/users" },
  updateUserForm: { method: "PUT", path: (data) => `/api/users/${data.id}` },
  deleteUserForm: { method: "DELETE", path: (data) => `/api/users/${data.id}` },
  changePasswordForm: { method: "PATCH", path: (data) => `/api/users/${data.id}/password` },
  createAppointmentForm: { method: "POST", path: "/api/appointments" },
  updateAppointmentStatusForm: { method: "PATCH", path: (data) => `/api/appointments/${data.id}/status` },
  createAvailabilityForm: { method: "POST", path: "/api/availability" },
  updateAvailabilityForm: { method: "PUT", path: (data) => `/api/availability/${data.id}` },
  sendNotificationForm: { method: "POST", path: "/api/notifications" },
  updateNotificationStatusForm: { method: "PATCH", path: (data) => `/api/notifications/${data.id}/status` },
};

const loadActions = [
  {
    buttonId: "loadUsersBtn",
    path: "/api/users",
    output: "users",
    message: "Loaded users",
  },
  {
    buttonId: "loadAppointmentsBtn",
    path: "/api/appointments",
    output: "appointments",
    message: "Loaded appointments",
  },
  {
    buttonId: "loadAvailabilityBtn",
    path: "/api/availability",
    output: "availability",
    message: "Loaded doctor availability",
  },
  {
    buttonId: "loadNotificationsBtn",
    path: "/api/notifications",
    output: "notifications",
    message: "Loaded notifications",
  },
];

function init() {
  elements.apiBaseUrl.value = state.apiBaseUrl;
  updateAuthStatus();
  bindNavigation();
  bindConfig();
  bindLoadButtons();
  bindForms();
}

function bindNavigation() {
  elements.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;

      elements.navLinks.forEach((link) => {
        link.classList.toggle("nav-link--active", link === button);
      });

      elements.panels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.sectionPanel !== section);
      });
    });
  });
}

function bindConfig() {
  elements.saveConfigBtn.addEventListener("click", () => {
    const value = elements.apiBaseUrl.value.trim();

    if (!value) {
      showMessage("Please enter a valid API base URL.", "error");
      return;
    }

    state.apiBaseUrl = value.replace(/\/$/, "");
    localStorage.setItem(STORAGE_KEYS.apiBaseUrl, state.apiBaseUrl);
    showMessage(`API base URL saved: ${state.apiBaseUrl}`, "success");
  });

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", logout);
}

function bindLoadButtons() {
  loadActions.forEach(({ buttonId, path, output, message }) => {
    const button = document.getElementById(buttonId);
    button.addEventListener("click", async () => {
      try {
        const data = await apiRequest(path, { method: "GET" });
        renderOutput(output, data);
        showMessage(message, "success");
      } catch (error) {
        renderOutput(output, { error: error.message });
        showMessage(error.message, "error");
      }
    });
  });
}

function bindForms() {
  Object.entries(endpointMap).forEach(([formId, config]) => {
    const form = document.getElementById(formId);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = collectFormData(form);
      const path = typeof config.path === "function" ? config.path(formData) : config.path;
      const payload = normalizePayload(formId, formData);

      try {
        const data = await apiRequest(path, {
          method: config.method,
          body: ["GET", "DELETE"].includes(config.method) ? undefined : payload,
        });

        handleSpecialSuccess(formId, data, form);
        renderRelatedOutput(formId, data);
        showMessage(getSuccessMessage(formId), "success");
        if (formId !== "loginForm") {
          form.reset();
        }
      } catch (error) {
        renderRelatedOutput(formId, { error: error.message });
        showMessage(error.message, "error");
      }
    });
  });
}

function collectFormData(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function normalizePayload(formId, data) {
  const payload = { ...data };

  ["id"].forEach((field) => {
    delete payload[field];
  });

  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") {
      delete payload[key];
    }
  });

  if (formId === "changePasswordForm") {
    return { password: data.password };
  }

  if (formId === "updateAppointmentStatusForm" || formId === "updateNotificationStatusForm") {
    return { status: data.status };
  }

  return payload;
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${state.apiBaseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = { raw: text };
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error || `${response.status} ${response.statusText}` || "Request failed";
    throw new Error(message);
  }

  return data;
}

function handleSpecialSuccess(formId, data, form) {
  if (formId === "loginForm") {
    const token = data?.token || data?.accessToken || data?.data?.token || "";
    const role = data?.user?.role || data?.role || data?.data?.user?.role || "Authenticated";

    if (token) {
      state.token = token;
      state.role = role;
      localStorage.setItem(STORAGE_KEYS.authToken, token);
      localStorage.setItem(STORAGE_KEYS.authRole, role);
      updateAuthStatus();
    }

    form.reset();
  }

  if (formId === "registerForm") {
    renderOutput("users", data);
  }
}

function renderRelatedOutput(formId, data) {
  const outputKeyMap = {
    registerForm: "users",
    createUserForm: "users",
    updateUserForm: "users",
    deleteUserForm: "users",
    changePasswordForm: "users",
    createAppointmentForm: "appointments",
    updateAppointmentStatusForm: "appointments",
    createAvailabilityForm: "availability",
    updateAvailabilityForm: "availability",
    sendNotificationForm: "notifications",
    updateNotificationStatusForm: "notifications",
    loginForm: "users",
  };

  const outputKey = outputKeyMap[formId];
  if (outputKey) {
    renderOutput(outputKey, data);
  }
}

function renderOutput(outputKey, data) {
  const target = elements.outputs[outputKey];
  if (!target) {
    return;
  }

  target.textContent = JSON.stringify(data, null, 2);
}

function updateAuthStatus() {
  elements.tokenStatus.textContent = state.token ? `${state.token.slice(0, 18)}...` : "Not connected";
  elements.roleStatus.textContent = state.role || "Guest";
}

function logout() {
  state.token = "";
  state.role = "Guest";
  localStorage.removeItem(STORAGE_KEYS.authToken);
  localStorage.removeItem(STORAGE_KEYS.authRole);
  updateAuthStatus();
  showMessage("Logged out successfully.", "success");
}

function showMessage(message, type = "success") {
  elements.messageBox.textContent = message;
  elements.messageBox.className = `message message--${type}`;
  clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = setTimeout(() => {
    elements.messageBox.className = "message hidden";
    elements.messageBox.textContent = "";
  }, 4000);
}

function getSuccessMessage(formId) {
  const messages = {
    registerForm: "Registration request sent successfully.",
    loginForm: "Login successful.",
    createUserForm: "User created successfully.",
    updateUserForm: "User updated successfully.",
    deleteUserForm: "User deleted successfully.",
    changePasswordForm: "Password changed successfully.",
    createAppointmentForm: "Appointment created successfully.",
    updateAppointmentStatusForm: "Appointment status updated successfully.",
    createAvailabilityForm: "Availability saved successfully.",
    updateAvailabilityForm: "Availability updated successfully.",
    sendNotificationForm: "Notification sent successfully.",
    updateNotificationStatusForm: "Notification status updated successfully.",
  };

  return messages[formId] || "Request completed successfully.";
}

init();
