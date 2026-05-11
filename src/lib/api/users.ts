import { client, hasAmplifyBackend } from "./client";
import { getPersistedUsers } from "../auth/persistence";
import type { User, UserRole } from "../../types/user";
import { deleteStorageFile, uploadUserIdentityImage } from "../storage/media";
import {
  createPublicSlug,
  matchesNameSlug,
  normalizeRouteSlug,
} from "../slug";

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

function withFallbackTenantSlug(user: User): User {
  if (user.role !== "tenant") {
    return user;
  }

  return {
    ...user,
    publicSlug: user.publicSlug ?? createPublicSlug(user.name, "dentista"),
  };
}

function mapPersistedUsers(): User[] {
  return getPersistedUsers().map(
    ({
      password: _password,
      provider: _provider,
      cognitoSynced: _cognitoSynced,
      updatedAt: _updatedAt,
      ...safeUser
    }) => withFallbackTenantSlug(safeUser)
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
  const createdAtRaw =
    typeof item.createdAt === "string" && item.createdAt.length >= 10
      ? item.createdAt
      : new Date().toISOString();

  return {
    id: String(item.cognitoId ?? item.id ?? ""),
    name: String(item.name ?? ""),
    publicSlug: typeof item.publicSlug === "string" ? item.publicSlug : undefined,
    email: String(item.email ?? ""),
    role: mapRoleFromBackend(roleValue),
    phone: String(item.phone ?? ""),
    avatar: typeof item.avatarKey === "string" ? item.avatarKey : undefined,
    taxId: typeof item.taxId === "string" ? item.taxId : undefined,
    cro: typeof item.cro === "string" ? item.cro : undefined,
    specialty: typeof item.specialty === "string" ? item.specialty : undefined,
    verified: Boolean(item.verified),
    rating: Number(item.rating ?? 0),
    totalReviews: Number(item.totalReviews ?? 0),
    createdAt: createdAtRaw.slice(0, 10),
  };
}

async function findUniqueTenantSlug(baseSlug: string, currentUserId?: string): Promise<string> {
  const api = getClient();
  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const response = await api.models.User.list({
      filter: {
        and: [
          { role: { eq: "TENANT" } },
          { publicSlug: { eq: candidate } },
        ],
      },
      limit: 1,
    });

    const item = response.data[0] as Record<string, unknown> | undefined;
    const sameUser = String(item?.cognitoId ?? "") === currentUserId;

    if (!item || sameUser) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function buildTenantPublicSlug(name: string, currentUserId?: string): Promise<string> {
  const baseSlug = createPublicSlug(name, "dentista");
  return findUniqueTenantSlug(baseSlug, currentUserId);
}

export async function listUsers(): Promise<User[]> {
  const api = getClient();

  const response = await api.models.User.list({
    limit: 1000,
  });

  return response.data.map((item) =>
    withFallbackTenantSlug(mapBackendUser(item as unknown as Record<string, unknown>))
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
  return item
    ? withFallbackTenantSlug(mapBackendUser(item as unknown as Record<string, unknown>))
    : null;
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
  return item
    ? withFallbackTenantSlug(mapBackendUser(item as unknown as Record<string, unknown>))
    : null;
}

export async function getTenantByPublicSlug(slug: string): Promise<User | null> {
  const normalizedSlug = normalizeRouteSlug(slug);

  if (!hasAmplifyBackend || !client) {
    return (
      mapPersistedUsers().find(
        (user) =>
          user.role === "tenant" &&
          (user.publicSlug === normalizedSlug ||
            matchesNameSlug(user.name, normalizedSlug, "dentista"))
      ) ?? null
    );
  }

  const exact = await client.models.User.list({
    authMode: "apiKey",
    filter: {
      and: [
        { role: { eq: "TENANT" } },
        { publicSlug: { eq: normalizedSlug } },
      ],
    },
    limit: 1,
  });

  const exactItem = exact.data[0];
  if (exactItem) {
    return withFallbackTenantSlug(
      mapBackendUser(exactItem as unknown as Record<string, unknown>)
    );
  }

  const legacyCandidates = await client.models.User.list({
    authMode: "apiKey",
    filter: {
      role: {
        eq: "TENANT",
      },
    },
    limit: 1000,
  });

  const legacyMatch = legacyCandidates.data.find((item) => {
    const payload = item as unknown as Record<string, unknown>;
    const name = String(payload.name ?? "");
    return matchesNameSlug(name, normalizedSlug, "dentista");
  });

  if (!legacyMatch) {
    return null;
  }

  const payload = legacyMatch as unknown as Record<string, unknown>;
  let mapped = mapBackendUser(payload);

  if (!mapped.publicSlug && mapped.id) {
    const generatedSlug = await buildTenantPublicSlug(mapped.name, mapped.id);
    const updated = await client.models.User.update({
      cognitoId: mapped.id,
      publicSlug: generatedSlug,
    });

    if (!updated.errors?.length) {
      mapped = {
        ...mapped,
        publicSlug: generatedSlug,
      };
    }
  }

  return withFallbackTenantSlug(mapped);
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

  return withFallbackTenantSlug(mapBackendUser(item as unknown as Record<string, unknown>));
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

  const existingItem = existing.data[0] as Record<string, unknown> | undefined;
  if (existingItem) {
    const isTenant = String(existingItem.role ?? "TENANT") === "TENANT";
    const hasSlug = typeof existingItem.publicSlug === "string" && existingItem.publicSlug.length > 0;

    if (isTenant && !hasSlug) {
      const publicSlug = await buildTenantPublicSlug(user.name, user.id);
      const updated = await api.models.User.update({
        cognitoId: user.id,
        publicSlug,
      });

      if (updated.errors?.length) {
        throw new Error(
          updated.errors[0].message ?? "Não foi possível atualizar o slug público do usuário."
        );
      }
    }

    return;
  }

  const publicSlug = user.role === "tenant" ? await buildTenantPublicSlug(user.name, user.id) : undefined;

  const created = await api.models.User.create({
    cognitoId: user.id,
    name: user.name,
    publicSlug,
    email: user.email,
    phone: user.phone || undefined,
    role: toBackendRole(user.role),
    taxId: user.taxId || undefined,
    cro: user.cro || undefined,
    specialty: user.specialty || undefined,
    verified: user.verified,
  });

  if (created.errors?.length) {
    throw new Error(created.errors[0].message ?? "Não foi possível criar o perfil User.");
  }
}

export async function updateUserAvatarKey(cognitoId: string, avatarKey?: string): Promise<void> {
  const api = getClient();

  const updated = await api.models.User.update({
    cognitoId,
    avatarKey: avatarKey ?? null,
  });

  if (updated.errors?.length) {
    throw new Error(updated.errors[0].message ?? "Não foi possível atualizar a foto do perfil.");
  }
}

export async function uploadAndSaveUserIdentityImage(input: {
  userId: string;
  role: Exclude<UserRole, "admin">;
  file: File;
  previousAvatarKey?: string;
}): Promise<string> {
  const key = await uploadUserIdentityImage(input.userId, input.role, input.file);
  await updateUserAvatarKey(input.userId, key);

  if (input.previousAvatarKey && input.previousAvatarKey !== key) {
    try {
      await deleteStorageFile(input.previousAvatarKey);
    } catch {
      // Keep operation non-blocking if old file cleanup fails.
    }
  }

  return key;
}
