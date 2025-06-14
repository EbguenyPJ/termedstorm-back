import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  createMembership(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.createMembership(createSubscriptionDto);
  }
  @Get('status/:clientId') //este Endpoint va protegido
  async getMembershipStatus(@Param('clientId') clientId: string) {
    const isActive =
      await this.subscriptionsService.isMembershipActive(clientId);
    return { clientId, isActive };
  }
}
