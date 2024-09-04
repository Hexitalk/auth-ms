import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';
import { SignTokenService } from 'src/contexts/shared/services/sign-token.service';
import { TokenExpiredRpcException } from '../../exceptions/token-expired-rpc-exception';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';
import { NatsPayloadConfigInterface } from 'src/contexts/shared/nats/interfaces';

@Injectable()
export class VerifyTokenUseCase {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly signTokenService: SignTokenService,
  ) {}

  async run(
    token: string,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      if (sub && iat && exp) {
        // nothing
      }

      return {
        user: user,
        token: await this.signTokenService.sign(user),
      };
    } catch (error) {
      if (error.name && error.name === 'TokenExpiredError') {
        throw new TokenExpiredRpcException();
      }

      throw new RpcException({
        status: 401,
        message: 'Invalid token',
      });
    }
  }
}
