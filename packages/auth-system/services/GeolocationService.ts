// ============================================
// PRODUCTION GEOLOCATION SERVICE
// ============================================
// Real IP geolocation service for security monitoring

import type { LocationInfo } from "@auth/types";

interface GeolocationProvider {
  name: string;
  getLocation(ipAddress: string): Promise<LocationInfo | null>;
  isAvailable(): boolean;
}

interface GeolocationCache {
  [ip: string]: {
    location: LocationInfo;
    timestamp: number;
    ttl: number;
  };
}

export class GeolocationService {
  private static cache: GeolocationCache = {};
  private static providers: GeolocationProvider[] = [];
  private static cacheMaxAge = 24 * 60 * 60 * 1000; // 24 hours
  private static maxCacheSize = 10000;

  // ============================================
  // SERVICE INITIALIZATION
  // ============================================

  /**
   * Initialize geolocation service with providers
   */
  static async initialize(): Promise<void> {
    // Add available providers in order of preference
    this.providers = [
      new IpApiProvider(),
      new IpInfoProvider(),
      new FreeGeoIpProvider(),
      new LocalProvider(), // Fallback for local/development
    ];

    console.log(
      `🌍 [GeolocationService] Initialized with ${this.providers.length} providers`,
    );
  }

  // ============================================
  // MAIN GEOLOCATION METHOD
  // ============================================

  /**
   * Get location information for IP address
   */
  static async getLocationFromIP(
    ipAddress: string,
  ): Promise<LocationInfo | undefined> {
    try {
      // Sanitize IP address
      const cleanIP = this.sanitizeIPAddress(ipAddress);
      if (!cleanIP) {
        return this.getLocalLocation();
      }

      // Check cache first
      const cached = this.getCachedLocation(cleanIP);
      if (cached) {
        return cached;
      }

      // Try providers in order until one succeeds
      for (const provider of this.providers) {
        if (!provider.isAvailable()) continue;

        try {
          const location = await provider.getLocation(cleanIP);
          if (location) {
            // Cache the result
            this.cacheLocation(cleanIP, location);
            return location;
          }
        } catch (error) {
          console.warn(
            `⚠️ [GeolocationService] Provider ${provider.name} failed:`,
            error,
          );
          continue;
        }
      }

      // All providers failed, return local fallback
      return this.getLocalLocation();
    } catch (error) {
      console.error("❌ [GeolocationService] Error getting location:", error);
      return this.getLocalLocation();
    }
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /**
   * Get cached location if available and not expired
   */
  private static getCachedLocation(ipAddress: string): LocationInfo | null {
    const cached = this.cache[ipAddress];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[ipAddress];
      return null;
    }

    return cached.location;
  }

  /**
   * Cache location information
   */
  private static cacheLocation(
    ipAddress: string,
    location: LocationInfo,
  ): void {
    // Clean old entries if cache is too large
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      this.cleanupCache();
    }

    this.cache[ipAddress] = {
      location,
      timestamp: Date.now(),
      ttl: this.cacheMaxAge,
    };
  }

  /**
   * Clean up old cache entries
   */
  private static cleanupCache(): void {
    const now = Date.now();
    const entries = Object.entries(this.cache);

    // Remove expired entries
    let removed = 0;
    for (const [ip, data] of entries) {
      if (now - data.timestamp > data.ttl) {
        delete this.cache[ip];
        removed++;
      }
    }

    // If still too large, remove oldest entries
    const remaining = Object.keys(this.cache).length;
    if (remaining >= this.maxCacheSize) {
      const sortedEntries = Object.entries(this.cache).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp,
      );

      const toRemove = Math.floor(this.maxCacheSize * 0.2); // Remove 20%
      for (let i = 0; i < toRemove; i++) {
        delete this.cache[sortedEntries[i][0]];
        removed++;
      }
    }

    if (removed > 0) {
      console.log(
        `🧹 [GeolocationService] Cleaned up ${removed} cache entries`,
      );
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Sanitize IP address
   */
  private static sanitizeIPAddress(ipAddress: string): string | null {
    if (!ipAddress) return null;

    // Handle IPv6 mapped IPv4
    if (ipAddress.startsWith("::ffff:")) {
      ipAddress = ipAddress.substring(7);
    }

    // Handle local addresses
    if (
      ipAddress === "::1" ||
      ipAddress === "127.0.0.1" ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.")
    ) {
      return null; // Local address
    }

    // Basic IP validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    if (ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress)) {
      return ipAddress;
    }

    return null;
  }

  /**
   * Get local/development location
   */
  private static getLocalLocation(): LocationInfo {
    return {
      country: "Local",
      region: "Development",
      city: "localhost",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      isp: "Local Network",
    };
  }

  /**
   * Get service statistics
   */
  static getStats(): {
    cacheSize: number;
    providers: string[];
    cacheHitRate: number;
  } {
    return {
      cacheSize: Object.keys(this.cache).length,
      providers: this.providers.map((p) => p.name),
      cacheHitRate: 0, // Would need to track hits/misses to calculate
    };
  }
}

// ============================================
// GEOLOCATION PROVIDERS
// ============================================

/**
 * IP-API.com provider (free tier)
 */
class IpApiProvider implements GeolocationProvider {
  name = "ip-api.com";

  async getLocation(ipAddress: string): Promise<LocationInfo | null> {
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,timezone,isp`,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "success") {
      return null;
    }

    return {
      country: data.country || "Unknown",
      region: data.regionName || "Unknown",
      city: data.city || "Unknown",
      timezone: data.timezone || "UTC",
      isp: data.isp || "Unknown",
    };
  }

  isAvailable(): boolean {
    return (
      process.env.NODE_ENV !== "production" || !process.env.GEOLOCATION_API_KEY
    ); // Free service
  }
}

/**
 * IPInfo.io provider (requires API key)
 */
class IpInfoProvider implements GeolocationProvider {
  name = "ipinfo.io";
  private apiKey = process.env.IPINFO_API_KEY;

  async getLocation(ipAddress: string): Promise<LocationInfo | null> {
    const url = this.apiKey
      ? `https://ipinfo.io/${ipAddress}?token=${this.apiKey}`
      : `https://ipinfo.io/${ipAddress}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.bogon) {
      return null; // Private/reserved IP
    }

    const [city, region] = (data.city || "")
      .split(",")
      .map((s: string) => s.trim());

    return {
      country: data.country || "Unknown",
      region: region || data.region || "Unknown",
      city: city || "Unknown",
      timezone: data.timezone || "UTC",
      isp: data.org || "Unknown",
    };
  }

  isAvailable(): boolean {
    return !!this.apiKey || process.env.NODE_ENV !== "production";
  }
}

/**
 * FreeGeoIP provider (backup)
 */
class FreeGeoIpProvider implements GeolocationProvider {
  name = "freegeoip.app";

  async getLocation(ipAddress: string): Promise<LocationInfo | null> {
    const response = await fetch(`https://freegeoip.app/json/${ipAddress}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      country: data.country_name || "Unknown",
      region: data.region_name || "Unknown",
      city: data.city || "Unknown",
      timezone: data.time_zone || "UTC",
      isp: "Unknown", // Not provided by this service
    };
  }

  isAvailable(): boolean {
    return true; // Free service
  }
}

/**
 * Local/development provider (fallback)
 */
class LocalProvider implements GeolocationProvider {
  name = "local";

  async getLocation(ipAddress: string): Promise<LocationInfo | null> {
    // Return mock location for development
    return {
      country: "Development",
      region: "Local",
      city: "localhost",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      isp: "Local Network",
    };
  }

  isAvailable(): boolean {
    return true;
  }
}

// Initialize on import
GeolocationService.initialize().catch(console.error);
