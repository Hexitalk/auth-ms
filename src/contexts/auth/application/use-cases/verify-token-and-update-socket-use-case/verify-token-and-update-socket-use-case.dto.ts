import { IsString } from 'class-validator';

export class VerifyTokenAndUpdateSocketDto {
  @IsString()
  token: string;

  @IsString()
  socketId: string;
}
