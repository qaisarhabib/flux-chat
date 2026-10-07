import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  conversationId?: string;
}
