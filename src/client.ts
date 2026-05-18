import { EarthwondersAPI } from "./api.js";

export function createEarthwondersClient(baseUrl: string, apiKey: string) {
  return new EarthwondersAPI({
    baseUrl,
    baseApiParams: {
      headers: { "X-API-Key": apiKey },
    },
  });
}
