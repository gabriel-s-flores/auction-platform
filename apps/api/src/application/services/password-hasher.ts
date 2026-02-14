export interface PasswordHasher {
  hash: (_value: string) => Promise<string>;
  compare: (_value: string, _hash: string) => Promise<boolean>;
}
