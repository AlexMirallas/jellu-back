import { Controller,ParseUUIDPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Body, Post, Request, UseGuards,Param, Get} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { VotesService } from '../votes/votes.service';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly votesService: VotesService 
    ){}

    @UseGuards(JwtAuthGuard) // Require login to comment
    @Post()
    create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        // req.user is populated by JwtAuthGuard
        const author = req.user;
        return this.commentsService.create(createCommentDto, author);
    }

    @Public() 
    @Get('/:postId') 
    findAllByPost(@Param('postId', ParseUUIDPipe) postId: string) {
        return this.commentsService.findAllByPostId(postId);
    }

    @Post(':id/vote')
    @UseGuards(JwtAuthGuard)
    async voteOnComment(@Param('id') commentId: string, @Body('value') value: number, @Request() req) {
        const user = req.user;
        return this.votesService.voteOnComment(user, commentId, value);
}
}
