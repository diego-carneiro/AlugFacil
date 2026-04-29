import { client, hasAmplifyBackend } from "./client";
import { getPersistedUsers } from "../auth/persistence";
import { getMockUser, users as mockUsers } from "../../data/users";
import type { User, UserRole } from "../../types/user";

function mergeLocalUsers(baseUsers: User[]): User[] {
  const persistedUsers = getPersistedUsers().map(
    ({
      password: _password,
      provider: _provider,
      cognitoSynced: _cognitoSynced,
      updatedAt: _updatedAt,
      ...safeUser
    }) => safeUser
  );

  const map = new Map<string, User>();

  for (const user of baseUsers) {
    map.set(user.email, user);
  }

  for (const user of persistedUsers) {
    map.set(user.email, user);
  }

  return Array.from(map.values());
}

function mapBackendUser(item: Record<string, unknown>): User {
  const roleValue = String(item.role ?? "TENANT");

  return {
    id: String(item.cognitoId ?? item.id ?? ""),
    name: String(item.name ?? ""),
    email: String(item.email ?? ""),
    role:
      roleValue === "OWNER"
        ? "owner"
        : roleValue === "ADMIN"
        ? "admin"
        : "tenant",
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
  if (!hasAmplifyBackend || !client) {
    return mergeLocalUsers(mockUsers);
  }

  const response = await client.models.User.list();
  return response.data.map((item) =>
    mapBackendUser(item as unknown as Record<string, unknown>)
  );
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!hasAmplifyBackend || !client) {
    return mergeLocalUsers(mockUsers).find((user) => user.email === email) ?? null;
  }

  const response = await client.models.User.list({
    filter: {
      email: {
        eq: email,
      },
    },
  });

  const item = response.data[0];
  return item ? mapBackendUser(item as unknown as Record<string, unknown>) : null;
}

export async function getUserByRole(role: UserRole): Promise<User> {
  if (!hasAmplifyBackend || !client) {
    return mergeLocalUsers(mockUsers).find((user) => user.role === role) ?? getMockUser(role);
  }

  const response = await client.models.User.list({
    filter: {
      role: {
        eq:
          role === "owner"
            ? "OWNER"
            : role === "admin"
            ? "ADMIN"
            : "TENANT",
      },
    },
  });

  const item = response.data[0];
  if (!item) {
    throw new Error(`Nenhum usuario encontrado para o papel ${role}.`);
  }

  return mapBackendUser(item as unknown as Record<string, unknown>);
}
