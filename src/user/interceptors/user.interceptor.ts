import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDTO } from '../dto/user.dto';

@Injectable()
export class CastToUserDTO implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map((data => data.user != null ? { ...data, user: plainToClass(UserDTO, data.user) } : data)));
    }
}