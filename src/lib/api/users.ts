import { client, hasAmplifyBackend } from "./client";
import { getPersistedUsers } from "../auth/persistence";
import type { User, UserRole } from "../../types/user";

function toBackendRole(role: UserRole): "TENANT" | "OWNER" | "ADMIN" {
  if (role === "owner") return "OWNER";
  if (role === "admin") return "ADMIN";
  return "TENANT";
}

function mapRoleFromBackend(roleValue?: string): UserRole {
  if (roleValue === "OWNER") return "owner";
  if (roleValue === "ADMIN") return "admin";
  return "tenant";
}

function mapPersistedUsers(): User[] {
  return getPersistedUsers().map(
    ({
      password: _password,
      provider: _provider,
      cognitoSynced: _cognitoSynced,
      updatedAt: _updatedAt,
      ...safeUser
    }) => safeUser
  );
}

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado para consulta de usuários.");
  }
  return client;
}

function mapBackendUser(item: Record<string, unknown>): User {
  const roleValue = String(item.role ?? "TENANT");

  return {
    id: String(item.cognitoId ?? item.id ?? ""),
    name: String(item.name ?? ""),
    email: String(item.email ?? ""),
    role: mapRoleFromBackend(roleValue),
    phone: String(item.phone ?? ""),
    avatar: typeof item.avatarKey === "string" ? item.avatarKey : undefined,
    cro: typeof item.cro === "string" ? item.cro : undefined,
    specialty: typeof item.specialty === "string" ? item.specialty : undefined,
    verified: Boolean(item.verified),
    rating: Number(item.rating ?? 0),
    totalReviews: Number(item.totalReviews ?? 0),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export async function listUsers(): Promise<User[]> {
  const api = getClient();

  const response = await api.models.User.list({
    limit: 1000,
  });

  return response.data.map((item) =>
    mapBackendUser(item as unknown as Record<string, unknown>)
  );
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!hasAmplifyBackend || !client) {
    return mapPersistedUsers().find((user) => user.email === email) ?? null;
  }

  const response = await client.models.User.list({
    filter: {
      email: {
        eq: email,
      },
    },
    limit: 1,
  });

  const item = response.data[0];
  return item ? mapBackendUser(item as unknown as Record<string, unknown>) : null;
}

export async function getUserById(cognitoId: string): Promise<User | null> {
  if (!hasAmplifyBackend || !client) {
    return mapPersistedUsers().find((user) => user.id === cognitoId) ?? null;
  }

  const response = await client.models.User.list({
    filter: {
      cognitoId: {
        eq: cognitoId,
      },
    },
    limit: 1,
  });

  const item = response.data[0];
  return item ? mapBackendUser(item as unknown as Record<string, unknown>) : null;
}

export async function getUserByRole(role: UserRole): Promise<User> {
  const api = getClient();

  const response = await api.models.User.list({
    filter: {
      role: {
        eq: toBackendRole(role),
      },
    },
    limit: 1,
  });

  const item = response.data[0];
  if (!item) {
    throw new Error(`Nenhum usuário encontrado para o papel ${role}.`);
  }

  return mapBackendUser(item as unknown as Record<string, unknown>);
}

export async function ensureUserProfile(user: User): Promise<void> {
  if (!hasAmplifyBackend || !client) {
    return;
  }
  const api = client;

  const existing = await api.models.User.list({
    filter: {
      cognitoId: {
        eq: user.id,
      },
    },
    limit: 1,
  });

  if (existing.data.length > 0) {
    return;
  }

  await api.models.User.create({
    cognitoId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    role: toBackendRole(user.role),
    cro: user.cro || undefined,
    specialty: user.specialty || undefined,
    verified: user.verified,
  });
}
