import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { GenderEnum } from 'src/contexts/auth/domain/enums';

export class RegisterUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  nick: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsDate()
  @Type(() => Date) // Necesario para transformar el string de la fecha en un objeto Date
  @IsNotEmpty()
  date_birth: Date;

  @IsString()
  @IsEnum(GenderEnum)
  @IsNotEmpty()
  gender: string;

  @IsMongoId()
  @IsNotEmpty()
  province_id: string;

  @IsMongoId()
  @IsNotEmpty()
  country_id: string;
}
