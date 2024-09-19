import { IsString } from 'class-validator';

export class ClearUserSocketDto {
  @IsString()
  socketId: string;
}
