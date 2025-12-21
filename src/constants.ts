export const JUSTICE_GOV_HOSTNAME = "www.justice.gov"
export const JUSTICE_GOV_URL = `https://${JUSTICE_GOV_HOSTNAME}`
export const EPSTEIN_FILES_PATH = "/epstein"
export const EPSTEIN_FILES_URL = `${JUSTICE_GOV_URL}${EPSTEIN_FILES_PATH}`
export const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
export const VERIFY_URL = `${JUSTICE_GOV_URL}/_sec/verify?provider=interstitial`
export const LIVE_PATH = "./files/live"
export const ARCHIVE_PATH = "./files/archive"
export const REQUEST_COOLDOWN_MS = 100