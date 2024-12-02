import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SendCrmDto } from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('send-crm')
  async sendCRM(@Body() data: SendCrmDto): Promise<string> {
    return this.appService.sendToCrm(data);
  }
}
