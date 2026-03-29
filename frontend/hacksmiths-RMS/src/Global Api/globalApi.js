import axios from "axios";

export const BASE_URL = "";

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginUser = async (email, password, role) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/login`,
      { email, password, role },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
};

export const signupUser = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/signup`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.error("Signup failed:", err);
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
