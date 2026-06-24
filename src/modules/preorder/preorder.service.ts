import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePreorderDto } from './dto/create-preorder.dto';
import { UpdatePreorderDto } from './dto/update-preorder.dto';
import {
  DEFAULT_PREORDER_LIMIT,
  DEFAULT_PREORDER_PAGE,
  FindPreordersQueryDto,
  PreorderSortBy,
  PreorderStatusFilter,
  SortOrder,
} from './dto/find-preorders-query.dto';

export type PreorderResponse = {
  id: string;
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FindPreordersResponse = {
  data: PreorderResponse[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    totalItems: number;
    totalPages: number;
    from: number;
    to: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable()
export class PreorderService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPreorderDto: CreatePreorderDto): Promise<PreorderResponse> {
    return this.prisma.preorder.create({
      data: {
        name: createPreorderDto.name,
        products: createPreorderDto.products,
        preorderWhen: createPreorderDto.preorderWhen,
        startsAt: new Date(createPreorderDto.startsAt),
        endsAt: createPreorderDto.endsAt
          ? new Date(createPreorderDto.endsAt)
          : null,
        isActive: createPreorderDto.isActive ?? true,
      },
    });
  }

  async findAll(query: FindPreordersQueryDto): Promise<FindPreordersResponse> {
    const page = query.page ?? DEFAULT_PREORDER_PAGE;
    const limit = query.limit ?? DEFAULT_PREORDER_LIMIT;
    const status = query.status ?? PreorderStatusFilter.All;
    const sortBy = query.sortBy ?? PreorderSortBy.CreatedAt;
    const sortOrder = query.sortOrder ?? SortOrder.Desc;

    const where =
      status === PreorderStatusFilter.All
        ? {}
        : { isActive: status === PreorderStatusFilter.Active };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.preorder.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.preorder.count({ where }),
    ]);

    const itemCount = data.length;
    const totalPages = Math.ceil(totalItems / limit);
    const from = itemCount === 0 ? 0 : (page - 1) * limit + 1;
    const to = from === 0 ? 0 : from + itemCount - 1;

    return {
      data,
      meta: {
        page,
        limit,
        itemCount,
        totalItems,
        totalPages,
        from,
        to,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<PreorderResponse> {
    const preorder = await this.prisma.preorder.findUnique({
      where: { id },
    });

    if (!preorder) {
      throw new NotFoundException('Preorder not found.');
    }

    return preorder;
  }

  async update(
    id: string,
    updatePreorderDto: UpdatePreorderDto,
  ): Promise<PreorderResponse> {
    await this.findOne(id);

    return this.prisma.preorder.update({
      where: { id },
      data: {
        ...(updatePreorderDto.name === undefined
          ? {}
          : { name: updatePreorderDto.name }),
        ...(updatePreorderDto.products === undefined
          ? {}
          : { products: updatePreorderDto.products }),
        ...(updatePreorderDto.preorderWhen === undefined
          ? {}
          : { preorderWhen: updatePreorderDto.preorderWhen }),
        ...(updatePreorderDto.startsAt === undefined
          ? {}
          : { startsAt: new Date(updatePreorderDto.startsAt) }),
        ...(updatePreorderDto.endsAt === undefined
          ? {}
          : {
              endsAt: updatePreorderDto.endsAt
                ? new Date(updatePreorderDto.endsAt)
                : null,
            }),
        ...(updatePreorderDto.isActive === undefined
          ? {}
          : { isActive: updatePreorderDto.isActive }),
      },
    });
  }
}
