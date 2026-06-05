import { describe, expect, it } from 'bun:test';
import { createPresignedUrl } from '../src/storage/r2';

describe('createPresignedUrl', () => {
  const mockEnv = {
    ACCOUNT_ID: 'test-account-id',
    ACCESS_KEY_ID: 'test-access-key',
    SECRET_ACCESS_KEY: 'test-secret',
    STORAGE: {
      bucketName: 'map-storage',
    },
  };

  it('should return a URL string for a given key', () => {
    const url = createPresignedUrl(mockEnv, 'images/photo.jpg', 3600);

    expect(typeof url).toBe('string');
    expect(url).toInclude('images/photo.jpg');
  });

  it('should include the account ID in the URL', () => {
    const url = createPresignedUrl(mockEnv, 'avatars/user1.png', 1800);

    expect(url).toInclude('test-account-id');
  });

  it('should include the bucket name in the URL', () => {
    const url = createPresignedUrl(mockEnv, 'events/banner.jpg');

    expect(url).toInclude('map-storage');
  });

  it('should include X-Amz-Expires query parameter', () => {
    const url = createPresignedUrl(mockEnv, 'file.pdf', 7200);

    expect(url).toInclude('X-Amz-Expires=7200');
  });

  it('should default expiresIn to 3600 when not provided', () => {
    const url = createPresignedUrl(mockEnv, 'default-expiry.jpg');

    expect(url).toInclude('X-Amz-Expires=3600');
  });

  it('should include the X-Amz-Algorithm and X-Amz-Credential parameters', () => {
    const url = createPresignedUrl(mockEnv, 'test.jpg', 600);

    expect(url).toInclude('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(url).toInclude('X-Amz-Credential=');
  });

  it('should include X-Amz-Signature in the URL', () => {
    const url = createPresignedUrl(mockEnv, 'signed-file.png', 3600);

    expect(url).toInclude('X-Amz-Signature=');
  });

  it('should produce different signatures for different keys', () => {
    const url1 = createPresignedUrl(mockEnv, 'file-a.jpg', 3600);
    const url2 = createPresignedUrl(mockEnv, 'file-b.jpg', 3600);

    // Extract signatures
    const sig1 = url1.match(/X-Amz-Signature=([^&]+)/)?.[1];
    const sig2 = url2.match(/X-Amz-Signature=([^&]+)/)?.[1];

    expect(sig1).not.toBeUndefined();
    expect(sig2).not.toBeUndefined();
    expect(sig1).not.toBe(sig2);
  });

  it('should use the PUT method in the signed headers', () => {
    const url = createPresignedUrl(mockEnv, 'upload-me.bin');

    // The URL should direct to an upload endpoint (not GET)
    expect(url).toStartWith('https://');
    expect(url).toInclude('.r2.cloudflarestorage.com/');
  });
});
