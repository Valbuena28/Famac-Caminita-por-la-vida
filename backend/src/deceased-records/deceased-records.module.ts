import { Module } from '@nestjs/common';
import { DeceasedRecordsService } from './deceased-records.service';
import { DeceasedRecordsController } from './deceased-records.controller';

@Module({
  providers: [DeceasedRecordsService],
  controllers: [DeceasedRecordsController]
})
export class DeceasedRecordsModule {}
