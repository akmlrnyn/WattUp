// Authentication is stubbed only for HTTP authorization tests; no email/OAuth calls.
export const auth = { api: { getSession: async () => globalThis.wattupTestSession ?? null } };
