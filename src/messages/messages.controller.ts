import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/decorators/user.param-decorater';
import { UserEntity } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { MessagesService } from './messages.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get('/unread-count/')
    getUnreadMessagesCount(
        @User() user: UserEntity,
    ) {
        return this.messagesService.getUnreadMessagesCount(user.id);
    }

    @Post('/mark-as-seen')
    markMessagesAsSeen(
        @Body('messageIds') messageIds: string[],
        @User() user: UserEntity,
    ) {
        return this.messagesService.markMessagesAsSeen(messageIds, user);
    }

    @Get(':chatId/?:take/?:page')
    findAll(
        @Param('chatId') id: string,
        @Param('take') take: number = 10,
        @Param('page') page: number = 1,
    ) {
        return this.messagesService.findAll(id, +take, +page);
    }
}
