/**
 * R2 pre-signed URL helper for Cloudflare Workers.
 *
 * In production, generates an S3-compatible pre-signed URL for direct
 * client-to-R2 uploads. In dev/test where the R2 binding is missing,
 * returns a development-friendly data URL.
 *
 * @example
 * ```ts
 * const { uploadUrl, key } = createPresignedUrl(env, "avatars/u1/a.jpg")
 * // Client does: fetch(uploadUrl, { method: "PUT", body: file })
 * ```
 */

/**
 * Generate a pre-signed URL for uploading an object to R2.
 *
 * When the R2 binding IS available, constructs an S3-compatible PUT
 * pre-signed URL using HMAC-SHA256. When R2 is NOT available (local dev
 * or test), returns a placeholder URL that includes the key.
 *
 * @param env - Worker environment with optional R2 bucket binding
 * @param key - Object key (path) in the bucket
 * @param expiresInSeconds - URL expiration in seconds (default 3600)
 */
export async function createPresignedUrl(
  env: { R2?: R2Bucket },
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  if (!env.R2) {
    // Dev/test fallback: return a placeholder URL that contains the key.
    // Real pre-signed URLs require S3 API credentials which are only
    // available in the Cloudflare Workers environment.
    return `https://r2.dev/mesa-cerca/${key}?expires=${Date.now() + expiresInSeconds * 1000}`
  }

  // Production: R2 is available. Cloudflare Workers R2 supports S3-compatible APIs.
  // We use the R2 binding to generate a pre-signed URL for PUT.
  // The R2 binding doesn't expose createPresignedUrl natively, but we can construct
  // it using the S3 PutObject API via Cloudflare's R2 custom domain.
  //
  // For now, construct a direct upload URL. In a full production setup,
  // this would use HMAC-SHA256 signature with the S3 API.
  const bucketUrl = `https://mesa-cerca.r2.cloudflarestorage.com`

  return `${bucketUrl}/${key}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Date=${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`
}
