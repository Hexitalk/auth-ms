import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { SignTokenService } from 'src/contexts/shared/services/sign-token.service';
import { LoginUserDto } from './login-user.dto';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import {
  NatsPayloadConfigInterface,
  NatsPayloadInterface,
} from 'src/contexts/shared/nats/interfaces';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';

@Injectable()
export class LoginUserUseCase {
  private readonly logger = new Logger('LoginUserUseCase');

  constructor(
    private readonly jwtService: JwtService,
    private readonly signTokenService: SignTokenService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  async run(
    loginUserDto: LoginUserDto,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ) {
    const { email, password } = loginUserDto;

    const payloadFindUser: NatsPayloadInterface<string> = {
      ...config,
      data: email,
    };

    try {
      const userNatsResponse = await firstValueFrom(
        this.client.send({ cmd: 'users.find-user-by-email' }, payloadFindUser),
      );

      if (!userNatsResponse) {
        throw new RpcException({
          status: 400,
          message: 'User not found by email from Auth-LoginUserUseCase',
        });
      }

      const isPasswordValid = bcrypt.compareSync(
        password,
        userNatsResponse.user.password,
      );

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const { user } = userNatsResponse;
      delete user.password;

      const payloadFindProfile: NatsPayloadInterface<string> = {
        ...config,
        data: user.id,
      };

      const profileNatsResponse = await firstValueFrom(
        this.client.send(
          { cmd: 'profiles.find-profile-by-user-id' },
          payloadFindProfile,
        ),
      );

      if (!profileNatsResponse) {
        throw new RpcException({
          status: 400,
          message: 'Profile not found',
        });
      }

      const { profile } = profileNatsResponse;

      return {
        user,
        profile,
        token: await this.signTokenService.sign({ id: user.id }),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
