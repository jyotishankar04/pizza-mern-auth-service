import { Repository } from "typeorm";
import { Tanent } from "../entity/Tanent";
import { ITanentData } from "../types";
import { Logger } from "winston";

export class TanentService {
    private tanentRepository: Repository<Tanent>;
    private logger: Logger
    constructor(tanentRepository: Repository<Tanent>, logger: Logger) {
        this.tanentRepository = tanentRepository
        this.logger = logger
    }
    async create({name, address}: ITanentData) {
        this.logger.info(`Creating tanent with name: ${name} and address: ${address}`);
        const tanent = this.tanentRepository.create({name, address});
        return this.tanentRepository.save(tanent);
    }
}