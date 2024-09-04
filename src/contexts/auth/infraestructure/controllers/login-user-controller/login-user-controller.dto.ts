import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class LoginUserControllerDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
