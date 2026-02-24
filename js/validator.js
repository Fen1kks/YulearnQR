const ALLOWED_HOSTS = [
  'yulearn.yeditepe.edu.tr'
];

const ALLOWED_PROTOCOLS = ['https:', 'http:'];

export function validateUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, url: null, reason: 'empty' };
  }

  const trimmed = raw.trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, url: trimmed, reason: 'invalid_url' };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, url: trimmed, reason: 'invalid_protocol' };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.includes(hostname)) {
    return { valid: false, url: trimmed, reason: 'invalid_domain' };
  }

  if (parsed.protocol === 'http:') {
    parsed.protocol = 'https:';
  }

  return { valid: true, url: parsed.href, reason: null };
}

export function getDisplayUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname + parsed.search;
    if (path.length > 60) {
      return path.substring(0, 57) + '...';
    }
    return path || '/';
  } catch {
    return url;
  }
}
