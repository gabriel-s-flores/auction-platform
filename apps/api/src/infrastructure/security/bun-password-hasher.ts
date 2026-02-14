import type { PasswordHasher } from "#application/services/password-hasher";

export class BunPasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return Bun.password.hash(value);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return Bun.password.verify(value, hash);
  }
}
