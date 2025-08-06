import { Repository } from "typeorm";
import { Tanent } from "../entity/Tanent";
import { ITanentData, TenantQueryParams } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class TanentService {
    private tanentRepository: Repository<Tanent>;
    private logger: Logger;
    constructor(tanentRepository: Repository<Tanent>, logger: Logger) {
        this.tanentRepository = tanentRepository;
        this.logger = logger;
    }
    async create({ name, address }: ITanentData) {
        this.logger.info(
            `Creating tanent with name: ${name} and address: ${address}`,
        );
        const tanent = this.tanentRepository.create({ name, address });
        return this.tanentRepository.save(tanent);
    }

    async getAll(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tanentRepository.createQueryBuilder("tenant");

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                "CONCAT(tenant.name, ' ', tenant.address) ILike :q",
                { q: searchTerm },
            );
        }

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();
        return {
            data: result[0],
            count: result[1],
        };
    }
    async findById(id: number) {
        this.logger.info(`Getting tanent with id: ${id}`);
        return this.tanentRepository.findOneBy({ id });
    }
    async update(
        id: number,
        { name, address }: { name?: string; address?: string },
    ) {
        this.logger.info(`Updating tanent with id: ${id}`);
        const tanent = await this.findById(id);
        if (!tanent) {
            const error = createHttpError(404, "Tanent not exists");
            throw error;
        }
        tanent.name = name || tanent.name;
        tanent.address = address || tanent.address;
        return this.tanentRepository.save(tanent);
    }
    async delete(id: number) {
        this.logger.info(`Deleting tanent with id: ${id}`);
        const tanent = await this.findById(id);
        if (!tanent) {
            const error = createHttpError(404, "Tanent not exists");
            throw error;
        }
        return this.tanentRepository.remove(tanent);
    }
}
