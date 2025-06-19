import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Employee } from 'src/modules/users/entities/employee.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Employee => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
