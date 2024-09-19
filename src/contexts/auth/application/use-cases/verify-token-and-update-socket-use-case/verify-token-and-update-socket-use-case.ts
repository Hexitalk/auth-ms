import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { JwtService } from '@nestjs/jwt';
import { envs, NATS_SERVICE } from 'src/config';
import { SignTokenService } from 'src/contexts/shared/services/sign-token.service';
import { TokenExpiredRpcException } from '../../exceptions/token-expired-rpc-exception';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';
import {
  NatsPayloadConfigInterface,
  NatsPayloadInterface,
} from 'src/contexts/shared/nats/interfaces';
import { firstValueFrom } from 'rxjs';
import { VerifyTokenAndUpdateSocketDto } from './verify-token-and-update-socket-use-case.dto';

@Injectable()
export class VerifyTokenAndUpdateSocketUseCase {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly signTokenService: SignTokenService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    dto: VerifyTokenAndUpdateSocketDto,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ) {
    // console.log({ dto });

    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(dto.token, {
        secret: envs.jwtSecret,
      });

      if (user && user.id) {
        const payloadFindUser: NatsPayloadInterface<{
          id: string;
          socketId: string;
        }> = {
          ...config,
          data: { id: user.id, socketId: dto.socketId },
        };

        try {
          await firstValueFrom(
            this.client.send(
              { cmd: 'users.update-user-socket' },
              payloadFindUser,
            ),
            { defaultValue: void 0 },
          );
        } catch (error) {
          console.log(error);
        }
      }

      return {
        user,
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
