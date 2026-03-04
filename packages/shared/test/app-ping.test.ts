import { describe, it, expect } from 'vitest';
import { AppPingSchema } from '../src/index';

describe('AppPingSchema', () => {
  it('accepts valid ping with all fields', () => {
    const ping = {
      ok: true,
      version: '1.0.0',
      platform: 'win32',
    };
    expect(() => AppPingSchema.parse(ping)).not.toThrow();
  });

  it('parses valid ping correctly', () => {
    const ping = {
      ok: true,
      version: '2.5.3',
      platform: 'darwin',
    };
    const parsed = AppPingSchema.parse(ping);
    expect(parsed.ok).toBe(true);
    expect(parsed.version).toBe('2.5.3');
    expect(parsed.platform).toBe('darwin');
  });

  it('rejects missing ok field', () => {
    expect(() => AppPingSchema.parse({
      version: '1.0.0',
      platform: 'linux',
    })).toThrow();
  });

  it('rejects missing version field', () => {
    expect(() => AppPingSchema.parse({
      ok: true,
      platform: 'win32',
    })).toThrow();
  });

  it('rejects missing platform field', () => {
    expect(() => AppPingSchema.parse({
      ok: true,
      version: '1.0.0',
    })).toThrow();
  });

  it('accepts win32 platform', () => {
    const ping = AppPingSchema.parse({
      ok: true,
      version: '1.0.0',
      platform: 'win32',
    });
    expect(ping.platform).toBe('win32');
  });

  it('accepts darwin platform', () => {
    const ping = AppPingSchema.parse({
      ok: true,
      version: '1.0.0',
      platform: 'darwin',
    });
    expect(ping.platform).toBe('darwin');
  });

  it('accepts linux platform', () => {
    const ping = AppPingSchema.parse({
      ok: true,
      version: '1.0.0',
      platform: 'linux',
    });
    expect(ping.platform).toBe('linux');
  });

  it('accepts arbitrary platform strings', () => {
    const ping = AppPingSchema.parse({
      ok: true,
      version: '1.0.0',
      platform: 'custom-platform',
    });
    expect(ping.platform).toBe('custom-platform');
  });

  it('rejects non-boolean ok field', () => {
    expect(() => AppPingSchema.parse({
      ok: 'true',
      version: '1.0.0',
      platform: 'linux',
    })).toThrow();
  });

  it('rejects ok as number', () => {
    expect(() => AppPingSchema.parse({
      ok: 1,
      version: '1.0.0',
      platform: 'linux',
    })).toThrow();
  });

  it('rejects non-string version field', () => {
    expect(() => AppPingSchema.parse({
      ok: true,
      version: 1.0,
      platform: 'linux',
    })).toThrow();
  });

  it('rejects non-string platform field', () => {
    expect(() => AppPingSchema.parse({
      ok: true,
      version: '1.0.0',
      platform: 123,
    })).toThrow();
  });

  it('accepts version with semantic versioning', () => {
    const ping = AppPingSchema.parse({
      ok: true,
      version: '1.2.3-alpha.1+build.123',
      platform: 'darwin',
    });
    expect(ping.version).toBe('1.2.3-alpha.1+build.123');
  });

  it('accepts ok as false', () => {
    const ping = AppPingSchema.parse({
      ok: false,
      version: '1.0.0',
      platform: 'linux',
    });
    expect(ping.ok).toBe(false);
  });
});
