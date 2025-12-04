import { jwtDecode } from "jwt-decode";
import { apiClient } from "./apiClient";

interface JWTPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

interface SalesforceAgent {
  Id: string;
  MasterLabel: string;
  Description: string;
  AgentTemplate: string;
  DeveloperName: string;
}

interface SalesforceResponse {
  totalSize: number;
  done: boolean;
  records: SalesforceAgent[];
}

const TOKEN_STORAGE_KEY = "salesforce_session_token";

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded: JWTPayload = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    // Check expiry
    if (decoded.exp <= currentTime) {
      return false;
    }

    // Check if token issuer matches current Salesforce instance
    const instanceUrl = process.env.NEXT_PUBLIC_SALESFORCE_INSTANCE_URL;
    if (instanceUrl && decoded.iss) {
      // Normalize URLs for comparison (remove trailing slashes)
      const normalizedIss = decoded.iss.replace(/\/$/, '');
      const normalizedInstance = instanceUrl.replace(/\/$/, '');

      if (normalizedIss !== normalizedInstance) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && isTokenValid(token)) {
    return token;
  }
  if (token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  return null;
};

export const fetchSalesforceToken = async (): Promise<string> => {
  try {
    const data = await apiClient("/api/salesforce/session-token", {
      method: "POST",
    });

    if (!data?.session_token) {
      throw new Error("No session token received from Salesforce");
    }

    const token = data.session_token;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return token;
  } catch (error) {
    console.error("Error fetching Salesforce token:", error);
    throw error;
  }
};

export const getValidToken = async (): Promise<string> => {
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }
  return await fetchSalesforceToken();
};

export const fetchSalesforceAgents = async (): Promise<SalesforceAgent[]> => {
  try {
    const token = await getValidToken();

    const instanceUrl = process.env.NEXT_PUBLIC_SALESFORCE_INSTANCE_URL;
    if (!instanceUrl) {
      throw new Error("NEXT_PUBLIC_SALESFORCE_INSTANCE_URL is not configured");
    }

    const query = encodeURIComponent(
      "SELECT FIELDS(ALL) from BotDefinition WHERE AgentType = 'EinsteinServiceAgent' LIMIT 200",
    );
    const url = `${instanceUrl}/services/data/v64.0/query/?q=${query}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If unauthorized, try to get a new token
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        const newToken = await fetchSalesforceToken();

        const retryResponse = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(
            `Salesforce API error: ${retryResponse.status} ${retryResponse.statusText}`,
          );
        }

        const retryData: SalesforceResponse = await retryResponse.json();
        return retryData.records;
      }

      throw new Error(
        `Salesforce API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: SalesforceResponse = await response.json();
    return data.records;
  } catch (error) {
    console.error("Error fetching Salesforce agents:", error);
    throw error;
  }
};
