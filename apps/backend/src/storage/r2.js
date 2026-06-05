/**
 * Generate a pre-signed URL for direct client-to-R2 uploads via HTTP PUT.
 *
 * Uses AWS Signature V4 to sign the request. The client receives the URL
 * and uploads the file directly to R2, bypassing the Worker.
 *
 * No external SDKs required — uses Bun.CryptoHasher (sync, also works in Workers
 * when polyfilled or replaced with crypto.subtle.digest).
 *
 * @param {object} env - Worker environment bindings
 * @param {string} env.ACCOUNT_ID - Cloudflare account ID
 * @param {string} env.ACCESS_KEY_ID - R2 access key ID
 * @param {string} env.SECRET_ACCESS_KEY - R2 secret access key
 * @param {object} env.STORAGE - R2 bucket binding (used for bucket name)
 * @param {string} key - Object key (path) in the bucket
 * @param {number} [expiresIn=3600] - URL expiration in seconds
 * @returns {string} Pre-signed PUT URL
 */
export function createPresignedUrl(env, key, expiresIn = 3600) {
  const accountId = env.ACCOUNT_ID;
  const accessKey = env.ACCESS_KEY_ID;
  const secretKey = env.SECRET_ACCESS_KEY;
  const bucketName = env.STORAGE?.bucketName ?? 'map-storage';
  const region = 'auto';
  const service = 's3';
  const method = 'PUT';

  // Timestamps
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  // Credential scope
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  // Canonical URI (keep slashes as-is after encoding)
  const canonicalUri = `/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  const canonicalQueryString = [
    `X-Amz-Algorithm=AWS4-HMAC-SHA256`,
    `X-Amz-Credential=${encodeURIComponent(`${accessKey}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresIn}`,
    `X-Amz-SignedHeaders=host`,
  ].join('&');

  const canonicalHeaders = `host:${accountId}.r2.cloudflarestorage.com\n`;
  const signedHeaders = 'host';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  // Calculate signing key via HMAC chain
  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);

  // Calculate signature
  const signature = hmacSha256(signingKey, stringToSign);

  // Build final URL
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const url = [
    `https://${host}/${bucketName}${canonicalUri}`,
    canonicalQueryString,
    `X-Amz-Signature=${signature}`,
  ].join('?') + (canonicalQueryString ? '&' : '') + `X-Amz-Signature=${signature}`;

  // Rebuild URL correctly
  const finalUrl = `https://${host}/${bucketName}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  return finalUrl;
}

// ─── Crypto helpers ───

function sha256(data) {
  return new Bun.CryptoHasher('sha256').update(data).digest('hex');
}

/**
 * Compute AWS SigV4 signing key.
 * Returns raw bytes for further HMAC chaining.
 */
function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = hmacSha256Raw('AWS4' + secretKey, dateStamp);
  const kRegion = hmacSha256Raw(kDate, region);
  const kService = hmacSha256Raw(kRegion, service);
  return hmacSha256Raw(kService, 'aws4_request');
}

/**
 * HMAC-SHA256 returning hex string (for final signature).
 */
function hmacSha256(key, data) {
  const keyInput = typeof key === 'string' ? key : key;
  return new Bun.CryptoHasher('sha256', keyInput).update(data).digest('hex');
}

/**
 * HMAC-SHA256 returning raw Uint8Array bytes (for chaining signing key).
 */
function hmacSha256Raw(key, data) {
  const keyInput = typeof key === 'string' ? key : key;
  const hex = new Bun.CryptoHasher('sha256', keyInput).update(data).digest('hex');
  return hexToBytes(hex);
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
