import axios from "axios";

export const BASE_URL = "https://30vkdstn-5000.inc1.devtunnels.ms"; // <-- Change this to your friend's exact IP or tunnel URL
// export const BASE_URL = "http://127.0.0.1:5000"; // 

// ─── Auth ───────────────────────────────────────────────────────────────────

export const registerAdmin = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/admin-register`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Admin register failed:", err);
    throw err;
  }
};

export const loginUser = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/login`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
};

export const getManagers = async (company) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/get-manager?company=${company}`
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch managers:", err);
    throw err;
  }
};

export const getCompanyMembers = async (company) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/get-company-members?company=${company}`
    );
    return response.data;
  } catch (err) {
    console.error("Failed to fetch company members:", err);
    throw err;
  }
};

export const addMember = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/add-member`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Add member failed:", err);
    throw err;
  }
};

// ─── Employee: Expenses ──────────────────────────────────────────────────────

export const submitExpense = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/expenses`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Submit expense failed:", err);
    throw err;
  }
};

export const getMyExpenses = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses/my`);
    return response.data;
  } catch (err) {
    console.error("Get my expenses failed:", err);
    throw err;
  }
};

// ─── Manager: Approvals ───────────────────────────────────────────────────────

export const getPendingApprovals = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses/pending`);
    return response.data;
  } catch (err) {
    console.error("Get pending approvals failed:", err);
    throw err;
  }
};

export const approveExpense = async (id) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/expenses/${id}/approve`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error(`Approve expense ${id} failed:`, err);
    throw err;
  }
};

export const rejectExpense = async (id) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/expenses/${id}/reject`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error(`Reject expense ${id} failed:`, err);
    throw err;
  }
};
