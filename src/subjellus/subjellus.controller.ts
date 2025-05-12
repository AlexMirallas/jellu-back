import { Controller, Get, Query,ParseUUIDPipe } from '@nestjs/common';
import { SubjelluService } from './subjellus.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Subjellu } from './entities/subjellu.entity';
import { CreateSubjelluDto } from './dto/create-sub.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Body, Post, UseGuards, Request,Param,Patch,Delete } from '@nestjs/common/decorators';
import { UpdateSubjelluDto } from './dto/update-sub.dto';


@Controller('subjellus')
export class SubjelluController {
    constructor(private readonly subjelluService: SubjelluService) {}

    @UseGuards(JwtAuthGuard) // Require login to create
    @Post()
    create(@Body() createSubjelluDto: CreateSubjelluDto, @Request() req) {
        // req.user should be populated by JwtAuthGuard/Strategy
        return this.subjelluService.create(createSubjelluDto, req.user);
    }

    @Public()
    @Get()
    async findAll(@Query('limit') limit?:string, @Query('offset')offset?: string): Promise<Subjellu[] | null> {
        const take = limit ? parseInt(limit, 10) : 10;
        const skip = offset ? parseInt(offset, 10) : 0;
        return this.subjelluService.findAll(); 
    }

    @Public() // Allow public access
    @Get(':idOrName') // Can accept ID or name
    findOne(@Param('idOrName') idOrName: string) {
        return this.subjelluService.findOne(idOrName);
    }

    @UseGuards(JwtAuthGuard) // Require login to update
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string, // Validate ID is UUID if finding by ID only
        @Body() updateSubjelluDto: UpdateSubjelluDto,
        @Request() req
    ) {
        return this.subjelluService.update(id, updateSubjelluDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard) // Require login to delete
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.subjelluService.remove(id, req.user.id);
    }




}
