import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './auth.decorator';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Auth, AuthResponse } from './entities/auth.entity';
import { LocalAuthGuard } from './guards';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiResponse({
    status: 201,
    description: 'Successfully registered a new user',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'The provided username is already in use',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<Auth> {
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in as an existing user',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'The provided login credentials are invalid',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('login')
  login(@Request() req: AuthenticatedRequest): Promise<Auth> {
    return this.authService.login(req.user);
  }
}
