import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { Category } from './category/category.entity';
import { Product } from './product/product.entity';
import { User } from './user/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'ecommerce_db',
      entities: [Category, Product, User],
      synchronize: false, // The schema should match database/ecommerce_db.sql
    }),
    ProductModule,
    UserModule,
  ],
})
export class AppModule {}
