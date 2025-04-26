import { Controller, Request, Post, UseGuards, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard'; 
import { JwtAuthGuard } from './guards/jwt-auth.guard';  
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from './decorators/public.decorator'; 

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user login using the LocalStrategy.
   * POST /auth/login
   * Expects { username: '...', password: '...' } in the request body.
   */
  @Public() // Mark this route as public (doesn't require JWT)
  @UseGuards(LocalAuthGuard) // Apply the LocalAuthGuard (which uses LocalStrategy)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Set response code to 200 OK on success
  async login(@Request() req) {
    // If LocalAuthGuard succeeds, req.user contains the user object returned by LocalStrategy.validate()
    console.log('Login request user:', req.user); // Add logging
    return this.authService.login(req.user); // Generate and return the JWT
  }

  /**
   * Handles user registration.
   * POST /auth/register
   * Expects user details (like username, email, password) in the request body.
   */
  @Public() // Mark this route as public
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) { // Use a DTO for validation
    // Note: The register method in AuthService needs to handle password hashing
    // and user creation via UsersService.
    console.log('Register request DTO:', createUserDto); // Add logging
    // You might want to return only specific fields or the result of login() after registration
    const registeredUser = await this.authService.register(createUserDto);
    // Optionally log the user in immediately after registration:
    // return this.authService.login(registeredUser);
    // Or just return a success message or the created user (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = registeredUser;
    return result;
  }

  /**
   * Example of a protected route. Requires a valid JWT.
   * GET /auth/profile
   */
  @UseGuards(JwtAuthGuard) // Apply the JwtAuthGuard (which uses JwtStrategy)
  @Get('profile')
  getProfile(@Request() req) {
    // If JwtAuthGuard succeeds, req.user contains the payload returned by JwtStrategy.validate()
    console.log('Profile request user:', req.user); // Add logging
    return req.user; // Return the user info from the JWT payload
  }

   /**
   * Example of a logout route (optional, depends on requirements).
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard) // Requires user to be logged in to log out
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
      console.log('Logout request user:', req.user); // Add logging
      // For stateless JWT, server-side logout often just means the client discards the token.
      // You might implement token blocklisting here if needed.
      return { message: 'Logout successful' };
      // return this.authService.logout(req.user); // If you have specific server-side logout logic
  }
}