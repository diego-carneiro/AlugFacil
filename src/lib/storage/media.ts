import { getUrl, uploadData } from "aws-amplify/storage";
import { hasAmplifyBackend } from "../api/client";

const ONE_HOUR_IN_SECONDS = 60 * 60;

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
