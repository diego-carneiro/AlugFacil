import { getUrl, remove, uploadData } from "aws-amplify/storage";
import { hasAmplifyBackend } from "../api/client";
import type { UserRole } from "../../types/user";

const ONE_HOUR_IN_SECONDS = 60 * 60;
export const MAX_CONSULTORY_IMAGES = 6;

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function timestampedName(fileName: string): string {
  return `${Date.now()}-${sanitizeFileName(fileName)}`;
}

function ensureBackend() {
  if (!hasAmplifyBackend) {
    throw new Error("Backend AWS não configurado para upload de arquivos.");
  }
}

export async function uploadConsultoryImages(
  ownerId: string,
  files: File[]
): Promise<string[]> {
  ensureBackend();
  if (files.length > MAX_CONSULTORY_IMAGES) {
    throw new Error(`Você pode enviar no máximo ${MAX_CONSULTORY_IMAGES} fotos do consultório.`);
  }

  const uploads = files.map(async (file) => {
    const key = `public/consultories/${ownerId}/${timestampedName(file.name)}`;
    const result = await uploadData({
      path: key,
      data: file,
      options: {
        contentType: file.type || "application/octet-stream",
      },
    }).result;

    return result.path;
  });

  return Promise.all(uploads);
}

export async function uploadInspectionPhotos(
  userId: string,
  files: File[]
): Promise<string[]> {
  ensureBackend();

  const uploads = files.map(async (file) => {
    const key = `inspections/${userId}/${timestampedName(file.name)}`;
    const result = await uploadData({
      path: key,
      data: file,
      options: {
        contentType: file.type || "application/octet-stream",
      },
    }).result;

    return result.path;
  });

  return Promise.all(uploads);
}

export async function uploadConsultoryLogo(ownerId: string, file: File): Promise<string> {
  ensureBackend();

  const key = `public/consultories/${ownerId}/logo/${timestampedName(file.name)}`;

  const result = await uploadData({
    path: key,
    data: file,
    options: {
      contentType: file.type || "application/octet-stream",
    },
  }).result;

  return result.path;
}

export async function uploadUserIdentityImage(
  userId: string,
  role: Exclude<UserRole, "admin">,
  file: File
): Promise<string> {
  ensureBackend();

  const roleFolder = role === "owner" ? "owners" : "tenants";
  const key = `public/users/${roleFolder}/${userId}/${timestampedName(file.name)}`;

  const result = await uploadData({
    path: key,
    data: file,
    options: {
      contentType: file.type || "application/octet-stream",
    },
  }).result;

  return result.path;
}

export async function deleteStorageFile(path: string): Promise<void> {
  ensureBackend();
  await remove({ path });
}

export async function resolveStorageUrl(key: string): Promise<string> {
  ensureBackend();

  const { url } = await getUrl({
    path: key,
    options: {
      expiresIn: ONE_HOUR_IN_SECONDS,
    },
  });

  return url.toString();
}

export async function resolveStorageUrls(keys: string[]): Promise<string[]> {
  const urls = await Promise.all(
    keys.map(async (key) => {
      try {
        return await resolveStorageUrl(key);
      } catch {
        return "";
      }
    })
  );

  return urls.filter((item) => item.length > 0);
}
