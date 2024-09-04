import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserControllerDto } from './register-user-controller.dto';
import { RegisterUserUseCase } from 'src/contexts/auth/application/use-cases';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller()
export class RegisterUserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @MessagePattern({ cmd: 'auth.register-user' })
  run(@Payload() payload: NatsPayloadInterface<RegisterUserControllerDto>) {
    const { data: registerUserDto, ...config } = payload;
    return this.registerUserUseCase.run(registerUserDto, config);
  }
}
