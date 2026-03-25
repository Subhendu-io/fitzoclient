import { BRANCH_CONFIG } from '@/constants/config';

export interface DeepLinkParams {
  tenantId: string;
  branchId: string;
}

export const parseDeepLink = (url: string): DeepLinkParams | null => {
  if (!url) return null;

  try {
    // Basic URL parsing
    let tenantId = "";
    let branchId = BRANCH_CONFIG.DEFAULT_BRANCH_ID as "main";

    if (url.includes("tenantId=")) {
      const parts = url.split("tenantId=");
      if (parts.length > 1) {
        tenantId = parts[1].split("&")[0];
      }
      
      if (url.includes("branchId=")) {
        const branchParts = url.split("branchId=");
        if (branchParts.length > 1) {
          branchId = branchParts[1].split("&")[0];
        }
      }
    } else if (url.startsWith("fitzo://") || url.startsWith("https://")) {
      // If it's a URL but doesn't have tenantId=, check if it's raw text after a specific path
      // Handle potential raw text after slash if not a query param
      const lastSlashIndex = url.lastIndexOf('/');
      const potentialId = url.substring(lastSlashIndex + 1);
      if (potentialId && !potentialId.includes('?') && !potentialId.includes(':')) {
        tenantId = potentialId;
      }
    } else {
      // Assume raw text if not a URL
      tenantId = url;
    }

    if (!tenantId || tenantId.trim() === "") {
      return null;
    }

    return {
      tenantId: tenantId.trim(),
      branchId: branchId.trim() || BRANCH_CONFIG.DEFAULT_BRANCH_ID,
    };
  } catch (error) {
    console.error("Error parsing deep link:", error);
    return null;
  }
};
