/**
 * R2 pre-signed URL helper for Cloudflare Workers.
 *
 * In production, generates an S3-compatible pre-signed URL for direct
 * client-to-R2 uploads using the AWS SDK. In dev/test where the R2
 * binding or S3 credentials are missing, returns a development-friendly
 * placeholder URL.
 *
 * @example
 * ```ts
 * const { uploadUrl, key } = createPresignedUrl(env, "avatars/u1/a.jpg")
 * ```
 */

import type { R2UploadEnv } from '../types'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Public R2 base URL for serving stored objects.
 * Used both in presigned URL dev fallback and in the users route
 * to build image URLs stored in the database.
 */
export const R2_PUBLIC_BASE_URL = 'https://r2.dev/mesa-cerca'

/**
 * Generate a pre-signed URL for uploading an object to R2.
 *
 * When the S3 credentials ARE available, uses the AWS SDK to create a
 * properly SigV4-signed URL. When only the R2 binding is present but no
 * S3 credentials, returns a placeholder. When neither is available, also
 * returns a dev-friendly placeholder.
 *
 * @param env - Environment with optional R2 bucket binding and S3 config
 * @param key - Object key (path) in the bucket
 * @param expiresInSeconds - URL expiration in seconds (default 3600)
 */
export async function createPresignedUrl(
  env: R2UploadEnv,
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { s3AccessKeyId, s3SecretAccessKey, s3BucketName, s3AccountId } = env

  // When full S3 credentials are configured, use proper SigV4 signing
  if (s3AccessKeyId && s3SecretAccessKey && s3BucketName && s3AccountId) {
    const endpoint = `https://${s3AccountId}.r2.cloudflarestorage.com`
    const s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    })

    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: key,
    })

    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds })
  }

  // Dev/test fallback: return a placeholder URL that contains the key.
  // Real pre-signed URLs require S3 API credentials which are only
  // available in the Cloudflare Workers environment via secrets.
  return `${R2_PUBLIC_BASE_URL}/${key}?expires=${Date.now() + expiresInSeconds * 1000}`
}
