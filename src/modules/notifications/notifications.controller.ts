import { Controller, Get } from '@nestjs/common';
import { NotificationsCronService } from './notifications-cron.service';

@Controller('notifications')
export class NotificationsTestController {
  constructor(private readonly notificationsCronService: NotificationsCronService) {}

  @Get('test-low-stock')
  testLowStock() {
    return this.notificationsCronService.notifyLowStock();
  }
}
