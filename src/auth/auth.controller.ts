import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Gera tokens para um usuário autenticado',
    description: `
      Endpoint interno usado pelo API Gateway para gerar tokens após validar as credenciais do usuário.
      Retorna um access token JWT (curta duração) e um refresh token (longa duração).
      
      O access token deve ser enviado no header Authorization de todas as requisições:
      \`Authorization: Bearer {accessToken}\`
      
      Quando o access token expirar, use o refresh token no endpoint /auth/refresh para obter um novo.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens gerados com sucesso',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos (ex: userId não é um UUID válido)',
  })
  @ApiUnauthorizedResponse({
    description: 'Usuário não autorizado',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.generateTokens(loginDto.userId);
  }
}
