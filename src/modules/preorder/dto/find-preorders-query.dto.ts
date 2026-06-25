import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const DEFAULT_PREORDER_PAGE = 1;
export const DEFAULT_PREORDER_LIMIT = 10;
export const MAX_PREORDER_LIMIT = 100;

export enum PreorderStatusFilter {
  All = 'all',
  Active = 'active',
  Inactive = 'inactive',
}

export enum PreorderSortBy {
  Name = 'name',
  CreatedAt = 'createdAt',
  StartsAt = 'startsAt',
  EndsAt = 'endsAt',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class FindPreordersQueryDto {
  @ApiPropertyOptional({
    example: 'summer',
    description: 'Search by preorder name or preorder timing text.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: PreorderStatusFilter,
    default: PreorderStatusFilter.All,
  })
  @IsOptional()
  @IsEnum(PreorderStatusFilter)
  status?: PreorderStatusFilter = PreorderStatusFilter.All;

  @ApiPropertyOptional({
    enum: PreorderSortBy,
    default: PreorderSortBy.CreatedAt,
  })
  @IsOptional()
  @IsEnum(PreorderSortBy)
  sortBy?: PreorderSortBy = PreorderSortBy.CreatedAt;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.Desc,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.Desc;

  @ApiPropertyOptional({
    example: 1,
    default: DEFAULT_PREORDER_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PREORDER_PAGE;

  @ApiPropertyOptional({
    example: 10,
    default: DEFAULT_PREORDER_LIMIT,
    minimum: 1,
    maximum: MAX_PREORDER_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PREORDER_LIMIT)
  limit?: number = DEFAULT_PREORDER_LIMIT;
}
