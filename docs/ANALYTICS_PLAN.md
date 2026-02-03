# SOTC.app Analytics Implementation Plan

> Saved for future implementation

## Overview
Add comprehensive analytics to understand user behavior, conversion rates, and product usage using **PostHog** (product analytics) + **Cloudflare Web Analytics** (traffic baseline).

| Aspect | Details |
|--------|---------|
| **Cost** | $0 (both have generous free tiers) |
| **Privacy** | Cookie-less, GDPR-compliant, no consent banner needed |
| **Complexity** | Client-side only (server-side can be added later) |

---

## What We'll Track

### User Funnel
```
page_view → upload_started → analysis_complete → download_complete
                ↓
           analysis_error → retry_clicked
```

### Key Metrics
- **Conversion rate:** % of visitors who upload → % who download
- **Error rate:** By type (rate_limit, no_watches, api_error, file_error)
- **Collection insights:** Avg watch count, popular series, confidence distribution
- **Performance:** Processing time from upload to result

---

## Events to Implement

| Event | Trigger | Data Payload |
|-------|---------|--------------|
| `page_view` | App mounts | `{ referrer, utm_source }` |
| `upload_started` | File selected | `{ file_size_mb, file_type, source: 'drag' \| 'click' }` |
| `upload_error` | Validation fails | `{ error_type, file_type }` |
| `analysis_complete` | Result received | `{ watch_count, series_breakdown, confidence_dist, processing_time_ms }` |
| `analysis_error` | Error state | `{ error_type, retryable }` |
| `retry_clicked` | Retry button | `{ error_type }` |
| `download_started` | Download clicked | `{ watch_count }` |
| `download_complete` | PNG generated | `{ generation_time_ms }` |
| `download_error` | html2canvas fails | `{ error_message }` |
| `new_upload_clicked` | Start over | `{ previous_watch_count }` |

---

## Files to Create/Modify

### 1. NEW: `src/services/analytics.ts`
Analytics service with type-safe event tracking wrapper around PostHog.

```typescript
import posthog from 'posthog-js';

interface AnalyticsEvents {
  page_view: { referrer?: string; utm_source?: string };
  upload_started: { file_size_mb: number; file_type: string; source: 'drag' | 'click' };
  upload_error: { error_type: string; file_type?: string };
  analysis_complete: {
    watch_count: number;
    series_breakdown: Record<string, number>;
    confidence_distribution: Record<string, number>;
    processing_time_ms: number;
  };
  analysis_error: { error_type: string; retryable: boolean };
  retry_clicked: { error_type: string };
  download_started: { watch_count: number };
  download_complete: { generation_time_ms: number };
  download_error: { error_message: string };
  new_upload_clicked: { previous_watch_count: number };
}

class Analytics {
  private initialized = false;

  init() {
    if (this.initialized || typeof window === 'undefined') return;

    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      autocapture: false,
      capture_pageview: false,
      persistence: 'memory', // Cookie-less
    });

    this.initialized = true;
  }

  track<K extends keyof AnalyticsEvents>(event: K, properties: AnalyticsEvents[K]) {
    if (!this.initialized) return;
    posthog.capture(event, properties);
  }
}

export const analytics = new Analytics();
```

### 2. `src/main.tsx`
Initialize analytics and track page_view on app mount.

```typescript
import { analytics } from './services/analytics';

analytics.init();
analytics.track('page_view', {
  referrer: document.referrer || undefined,
  utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
});
```

### 3. `src/App.tsx`
Instrument state transitions:
- `handleFileSelect` → upload_started + timing start
- State → 'result' → analysis_complete with timing
- State → 'error' → analysis_error
- `handleRetry` → retry_clicked
- `handleNewUpload` → new_upload_clicked

### 4. `src/components/UploadZone.tsx`
Track validation errors (upload_error).

### 5. `src/components/DownloadButton.tsx`
Track download_started, download_complete (with timing), download_error.

---

## Implementation Steps

1. **Install PostHog**
   ```bash
   npm install posthog-js
   ```

2. **Create PostHog account**
   - Go to https://posthog.com
   - Create free account
   - Get project API key from Settings → Project → Project API Key

3. **Add environment variable**
   - Create `.env` file (if not exists):
     ```
     VITE_POSTHOG_KEY=phc_your_key_here
     ```
   - Add to `.gitignore` if not already there

4. **Create analytics service**
   - Create `src/services/analytics.ts` with code above

5. **Initialize in main.tsx**
   - Import and call `analytics.init()`

6. **Instrument App.tsx**
   - Add tracking calls at state transitions

7. **Instrument components**
   - UploadZone.tsx for validation errors
   - DownloadButton.tsx for download tracking

8. **Enable Cloudflare Web Analytics**
   - Cloudflare Dashboard → sotc-app → Web Analytics → Enable
   - Zero code changes needed

9. **Deploy and verify**

---

## Verification Checklist

- [ ] DevTools Network tab shows PostHog requests
- [ ] `page_view` fires on load
- [ ] `upload_started` fires when file selected
- [ ] `analysis_complete` fires after processing
- [ ] `download_complete` fires when downloading
- [ ] Events appear in PostHog dashboard
- [ ] Cloudflare Web Analytics shows traffic

---

## PostHog Dashboard Setup

After implementation, create these insights:

1. **Funnel: Upload to Download**
   - Steps: page_view → upload_started → analysis_complete → download_complete
   - Conversion window: 30 minutes

2. **Trend: Daily Activity**
   - Uploads and downloads over time

3. **Breakdown: Error Types**
   - Pie chart of error_type from analysis_error events

4. **Trend: Collection Size**
   - Average watch_count over time

5. **Table: Popular Series**
   - Aggregated from series_breakdown data

---

## Future Enhancements (Not in Scope)

- Server-side tracking from Cloudflare Functions
- Session recordings (PostHog feature)
- A/B testing with feature flags
- User identification (if adding accounts)
