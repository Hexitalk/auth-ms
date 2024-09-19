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
import { ClearUserSocketDto } from './clear-user-socket-use-case.dto';

@Injectable()
export class ClearUserSocketUseCase {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly signTokenService: SignTokenService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    dto: ClearUserSocketDto,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ) {
    const { socketId } = dto;

    if (socketId) {
      try {
        const payloadClearSocket: NatsPayloadInterface<{
          socketId: string;
        }> = {
          ...config,
          data: { socketId },
        };

        try {
          await firstValueFrom(
            this.client.send(
              { cmd: 'users.clear-user-socket' },
              payloadClearSocket,
            ),
            { defaultValue: void 0 },
          );
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        if (error.name && error.name === 'TokenExpiredError') {
          throw new TokenExpiredRpcException();
        }

        throw new RpcException({
          status: 401,
          message: 'Fail clear Socket',
        });
      }
    }
  }
}
