import type { User } from "../../types/user";

type LocalAuthRecord = User & {
  password: string;
  provider: "local" | "cognito";
  cognitoSynced: boolean;
  updatedAt: string;
};

const AUTH_SESSION_KEY = "alugfacil.auth.session";
const AUTH_USERS_KEY = "alugfacil.auth.users";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getPersistedUsers(): LocalAuthRecord[] {
  return readJson<LocalAuthRecord[]>(AUTH_USERS_KEY, []);
}

export function getPersistedSession(): User | null {
  return readJson<User | null>(AUTH_SESSION_KEY, null);
}

export function setPersistedSession(user: User | null) {
  if (!canUseStorage()) return;

  if (!user) {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  writeJson(AUTH_SESSION_KEY, user);
}

export function clearPersistedSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function upsertPersistedUser(
  user: User,
  options?: {
    password?: string;
    provider?: "local" | "cognito";
    cognitoSynced?: boolean;
  }
) {
  const users = getPersistedUsers();
  const existing = users.find((item) => item.email === user.email);

  const next: LocalAuthRecord = {
    ...existing,
    ...user,
    password: options?.password ?? existing?.password ?? "",
    provider: options?.provider ?? existing?.provider ?? "local",
    cognitoSynced: options?.cognitoSynced ?? existing?.cognitoSynced ?? false,
    updatedAt: new Date().toISOString(),
  };

  writeJson(
    AUTH_USERS_KEY,
    [...users.filter((item) => item.email !== user.email), next]
  );
}

export function validatePersistedCredentials(email: string, password: string): User | null {
  const user = getPersistedUsers().find((item) => item.email === email);
  if (!user || user.password !== password) {
    return null;
  }

  const {
    password: _password,
    provider: _provider,
    cognitoSynced: _cognitoSynced,
    updatedAt: _updatedAt,
    ...safeUser
  } = user;

  return safeUser;
}
