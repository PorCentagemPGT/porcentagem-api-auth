import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ApiBearerAuthWithDocs } from './decorators/api-bearer-auth.decorator';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login do usuário',
    description: `
      Endpoint para autenticação do usuário.
      Retorna um par de tokens (access e refresh) para acesso aos recursos.
      
      O access token deve ser enviado no header Authorization de todas as requisições.
      O refresh token deve ser armazenado de forma segura e usado apenas para
      obter um novo par de tokens quando o access token expirar.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens gerados com sucesso',
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.debug(`Login request received for user ${loginDto.userId}`);
    const result = await this.authService.generateTokens(loginDto.userId);
    this.logger.debug('Login successful, tokens generated');
    return result;
  }

  @Get('validate')
  @ApiBearerAuthWithDocs()
  @ApiOperation({
    summary: 'Valida um token JWT',
    description: `
      Endpoint para validar um token JWT.
      Retorna informações sobre a validade do token, incluindo:
      - ID do usuário dono do token
      - Se o token é válido
      - Tempo restante de validade em segundos
      
      Útil para verificar se um token ainda é válido antes de
      fazer uma requisição que o utilize.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Token validado com sucesso',
    type: ValidateTokenDto,
  })
  async validate(
    @Headers('authorization') authHeader: string,
  ): Promise<ValidateTokenDto> {
    this.logger.debug(`Received authorization header: ${authHeader}`);

    if (!authHeader) {
      this.logger.debug('No authorization header provided');
      throw new UnauthorizedException(
        'Token não fornecido ou formato inválido',
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.debug('Authorization header does not start with Bearer');
      throw new UnauthorizedException(
        'Token não fornecido ou formato inválido',
      );
    }

    const token = authHeader.substring(7); // Remove o prefixo 'Bearer '
    this.logger.debug(`Extracted token: ${token}`);

    const result = await this.authService.validateToken(token);
    this.logger.debug(`Token validation result: ${JSON.stringify(result)}`);

    return result;
  }
}
