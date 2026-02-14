import type { TokenPayload, TokenService } from "#application/services/token-service";

type Signer = (payload: TokenPayload) => Promise<string>;

export class FastifyTokenService implements TokenService {
  constructor(private readonly signer: Signer) { }

  async sign(payload: TokenPayload): Promise<string> {
    return this.signer(payload);
  }
}
