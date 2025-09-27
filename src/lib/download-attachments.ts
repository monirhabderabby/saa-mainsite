// utils/downloadAttachment.ts
import { saveAs } from "file-saver";
import JSZip from "jszip";

export async function downloadAttachment(url: string, name = "attachment") {
  // Detect Google Drive folder by pattern
  const isDriveFolder = /drive\.google\.com\/drive\/folders\/([^/?]+)/.test(
    url
  );

  console.log("directDownload", !isDriveFolder);

  if (isDriveFolder) {
    return downloadGoogleDriveFolder(url, name);
  }

  // Otherwise, direct download
  return directDownload(url, name);
}

function getDirectDownloadUrl(url: string) {
  // Google Drive file pattern
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url; // fallback
}

async function directDownload(url: string, name: string) {
  try {
    const directUrl = getDirectDownloadUrl(url);
    const response = await fetch(directUrl);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const fileName = getFileNameFromUrl(url) || name;
    saveAs(blob, fileName);
  } catch (err) {
    console.error("Download failed:", err);
  }
}

async function downloadGoogleDriveFolder(url: string, name: string) {
  try {
    const folderId = extractFolderId(url);
    if (!folderId) throw new Error("Invalid folder URL");

    // ⚠️ Requires Google Drive API integration
    const files = await fetchFilesFromDrive(folderId);

    const zip = new JSZip();
    for (const file of files) {
      const res = await fetch(file.downloadUrl);
      const blob = await res.blob();
      zip.file(file.name, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${name}.zip`);
  } catch (err) {
    console.error("Folder download failed:", err);
  }
}

function extractFolderId(url: string) {
  const match = url.match(/folders\/([^/?]+)/);
  return match ? match[1] : null;
}

function getFileNameFromUrl(url: string) {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1].split("?")[0];
  } catch {
    return null;
  }
}

// Example mock: Replace with Google Drive API call
async function fetchFilesFromDrive(folderId: string) {
  // You’ll need to hit Google Drive API with an API key or OAuth token
  // For now return dummy data:
  console.log(folderId);
  return [
    { name: "file1.png", downloadUrl: "https://example.com/file1.png" },
    { name: "file2.pdf", downloadUrl: "https://example.com/file2.pdf" },
  ];
}
