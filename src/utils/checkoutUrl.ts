/**
 * Deduplicates and cleans URL query parameters to avoid duplicate parameters
 * when integrating UTMify tracking, external checkouts, and custom tracking parameters.
 */

export function deduplicateUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  try {
    const hashIndex = rawUrl.indexOf('#');
    let hash = '';
    let urlWithoutHash = rawUrl;
    if (hashIndex !== -1) {
      hash = rawUrl.substring(hashIndex);
      urlWithoutHash = rawUrl.substring(0, hashIndex);
    }

    const questionIndex = urlWithoutHash.indexOf('?');
    if (questionIndex === -1) return rawUrl;

    const base = urlWithoutHash.substring(0, questionIndex);
    const queryString = urlWithoutHash.substring(questionIndex + 1);

    // Replace accidental extra '?' with '&' (common when multiple scripts append query strings)
    const normalizedQuery = queryString.replace(/\?/g, '&');
    const searchParams = new URLSearchParams(normalizedQuery);
    const uniqueParams = new Map<string, { key: string; val: string }>();

    for (const [key, val] of searchParams.entries()) {
      const cleanKey = key.trim();
      if (!cleanKey) continue;
      const lowerKey = cleanKey.toLowerCase();

      // If we haven't seen this key yet, or if previous had empty value and this one has content
      if (!uniqueParams.has(lowerKey) || (val && !uniqueParams.get(lowerKey)!.val)) {
        uniqueParams.set(lowerKey, { key: cleanKey, val: val.trim() });
      }
    }

    const finalParams = new URLSearchParams();
    for (const { key, val } of uniqueParams.values()) {
      if (key) {
        finalParams.set(key, val);
      }
    }

    const qs = finalParams.toString();
    return base + (qs ? '?' + qs : '') + hash;
  } catch (_) {
    return rawUrl;
  }
}

/**
 * Builds a clean, fully deduplicated checkout URL combining:
 * 1. Base checkout endpoint
 * 2. URL tracking parameters from current page (UTMs, src, sck, subids, fbclid, etc.)
 * 3. Any UTMify stored parameters in sessionStorage/localStorage
 * 4. Specific cart/order details (quantity, make, model, year, vehicle, title)
 */
export function buildCleanCheckoutUrl(
  baseUrl: string,
  extraParams: Record<string, string | number> = {}
): string {
  try {
    const combinedParams = new Map<string, { key: string; val: string }>();

    // 1. Ingest base URL query parameters if present
    const qIndex = baseUrl.indexOf('?');
    let pureBase = baseUrl;
    if (qIndex !== -1) {
      pureBase = baseUrl.substring(0, qIndex);
      const baseParams = new URLSearchParams(baseUrl.substring(qIndex + 1).replace(/\?/g, '&'));
      baseParams.forEach((val, key) => {
        const cleanKey = key.trim();
        if (cleanKey) {
          combinedParams.set(cleanKey.toLowerCase(), { key: cleanKey, val: val.trim() });
        }
      });
    }

    // 2. Ingest current page query params (UTMs, ads IDs)
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const incomingParams = new URLSearchParams(window.location.search.replace(/\?/g, '&'));
      incomingParams.forEach((val, key) => {
        const cleanKey = key.trim();
        if (cleanKey) {
          combinedParams.set(cleanKey.toLowerCase(), { key: cleanKey, val: val.trim() });
        }
      });
    }

    // 3. Ingest UTMify storage parameters if available
    if (typeof window !== 'undefined') {
      try {
        const storageKeys = ['utmify_params', 'lead', 'utmifyLead', 'utms', 'utmify'];
        for (const sKey of storageKeys) {
          const raw = sessionStorage.getItem(sKey) || localStorage.getItem(sKey);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object') {
                Object.entries(parsed).forEach(([k, v]) => {
                  if (k && typeof v === 'string' && v.trim()) {
                    const lk = k.trim().toLowerCase();
                    if (!combinedParams.has(lk)) {
                      combinedParams.set(lk, { key: k.trim(), val: v.trim() });
                    }
                  }
                });
              }
            } catch (_) {
              if (typeof raw === 'string' && raw.includes('=')) {
                const sp = new URLSearchParams(raw.replace(/^\?/, '').replace(/\?/g, '&'));
                sp.forEach((v, k) => {
                  const lk = k.trim().toLowerCase();
                  if (k && !combinedParams.has(lk)) {
                    combinedParams.set(lk, { key: k.trim(), val: v.trim() });
                  }
                });
              }
            }
          }
        }
      } catch (_) {}
    }

    // 4. Ingest and enforce order parameters (quantity, model, etc.)
    Object.entries(extraParams).forEach(([k, v]) => {
      if (k && v !== undefined && v !== null) {
        const cleanKey = k.trim();
        const strVal = String(v).trim();
        combinedParams.set(cleanKey.toLowerCase(), { key: cleanKey, val: strVal });
      }
    });

    // 5. Construct final search params
    const finalParams = new URLSearchParams();
    for (const { key, val } of combinedParams.values()) {
      if (key) {
        finalParams.set(key, val);
      }
    }

    const qs = finalParams.toString();
    const resultUrl = pureBase + (qs ? '?' + qs : '');
    return deduplicateUrl(resultUrl);
  } catch (_) {
    return deduplicateUrl(baseUrl);
  }
}
