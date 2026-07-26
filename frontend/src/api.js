const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listDistricts: () => request("/api/districts"),
  createDistrict: (data) =>
    request("/api/districts", { method: "POST", body: JSON.stringify(data) }),

  listHouseholds: (districtId) =>
    request(`/api/districts/${districtId}/households`),
  createHousehold: (districtId, data) =>
    request(`/api/districts/${districtId}/households`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateHousehold: (id, data) =>
    request(`/api/households/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteHousehold: (id) =>
    request(`/api/households/${id}`, { method: "DELETE" }),

  getActiveAlert: (districtId) =>
    request(`/api/districts/${districtId}/alerts/active`),
  listAlerts: (districtId) => request(`/api/districts/${districtId}/alerts`),
  simulateAlert: (districtId) =>
    request(`/api/districts/${districtId}/alerts/simulate`, { method: "POST" }),

  generateChecklist: (alertId) =>
    request(`/api/alerts/${alertId}/checklist/generate`, { method: "POST" }),
  getChecklist: (alertId) => request(`/api/alerts/${alertId}/checklist`),
  updateChecklistItem: (itemId, status) =>
    request(`/api/checklist-items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getProgress: (alertId) => request(`/api/alerts/${alertId}/checklist/progress`),
};
