import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserUseCase } from 'src/contexts/auth/application/use-cases';
import { LoginUserControllerDto } from './login-user-controller.dto';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller()
export class LoginUserController {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {}

  @MessagePattern({ cmd: 'auth.login-user' })
  loginUser(@Payload() payload: NatsPayloadInterface<LoginUserControllerDto>) {
    const { data: loginUserDto, ...config } = payload;
    return this.loginUserUseCase.run(loginUserDto, config);
  }
}
