import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './register-user.dto';
import { SignTokenService } from 'src/contexts/shared/services/sign-token.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import {
  NatsPayloadConfigInterface,
  NatsPayloadInterface,
} from 'src/contexts/shared/nats/interfaces';
import { NatsPayloadConfig } from 'src/contexts/shared/decorators';

@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly signTokenService: SignTokenService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async run(
    registerUserDto: RegisterUserDto,
    @NatsPayloadConfig() config?: NatsPayloadConfigInterface,
  ) {
    const { email, password } = registerUserDto;

    try {
      const userTransfer = {
        email,
        password: bcrypt.hashSync(password, 10),
      };

      const payloadCreateUser: NatsPayloadInterface<typeof userTransfer> = {
        ...config,
        data: userTransfer,
      };

      const createUserNatsResponse = await firstValueFrom(
        this.client.send({ cmd: 'users.create-user' }, payloadCreateUser),
      );

      if (!createUserNatsResponse) {
        throw new RpcException({
          status: 400,
          message: 'User create fail from Auth-RegisterUserUseCase',
        });
      }

      const { user: createdUser } = createUserNatsResponse;

      const profileTransfer = {
        user_id: createdUser.id,
        nick: registerUserDto.nick,
        image: registerUserDto.image ?? '',
        date_birth: registerUserDto.date_birth,
        gender: registerUserDto.gender,
        province_id: registerUserDto.province_id,
        country_id: registerUserDto.country_id,
      };

      const payloadCreateProfile: NatsPayloadInterface<typeof profileTransfer> =
        {
          ...config,
          authUserId: createdUser.id,
          data: profileTransfer,
        };

      const createProfileNatsResponse = await firstValueFrom(
        this.client.send(
          { cmd: 'profiles.create-profile' },
          payloadCreateProfile,
        ),
      );

      if (!createProfileNatsResponse) {
        throw new RpcException({
          status: 400,
          message: 'Profile create fail from Auth-RegisterUserUseCase',
        });
      }

      const { profile: createdProfile } = createProfileNatsResponse;

      // //////////////

      const payloadSetProfileIdUser: NatsPayloadInterface<{
        profile_id: string;
      }> = {
        ...config,
        authUserId: createdUser.id,
        data: { profile_id: createdProfile.id },
      };

      const setProfileIdUserResponse = await firstValueFrom(
        this.client.send(
          { cmd: 'users.set-profile-id-user' },
          payloadSetProfileIdUser,
        ),
      );

      if (!setProfileIdUserResponse) {
        throw new RpcException({
          status: 400,
          message: 'User create fail from Auth-RegisterUserUseCase',
        });
      }

      const { user: updatedUser } = setProfileIdUserResponse;

      // const { password: passwordExclude, ...safeUser } = updatedUser;
      delete updatedUser.password;

      // //////////////

      const payloadCreateHub: NatsPayloadInterface<{
        originProfileId: string;
      }> = {
        ...config,
        authUserId: createdUser.id,
        data: { originProfileId: createdProfile.id },
      };

      const createHubNatsResponse = await firstValueFrom(
        this.client.send({ cmd: 'hub.create-hub' }, payloadCreateHub),
      );

      if (!createHubNatsResponse) {
        throw new RpcException({
          status: 400,
          message: 'Hub create fail from Auth-RegisterUserUseCase',
        });
      }

      return {
        user: updatedUser,
        profile: createdProfile,
        token: await this.signTokenService.sign({ id: updatedUser.id }),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
