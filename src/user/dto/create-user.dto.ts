import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  @MinLength(3, { message: 'Username phải chứa ít nhất 3 ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  email: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
