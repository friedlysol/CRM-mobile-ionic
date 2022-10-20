import { Injectable } from '@angular/core';
import { SupplyInterface } from '@app/interfaces/supply.interface';
import { DatabaseService } from '../database.service';
import * as sqlBuilder from 'sql-bricks';
import * as _ from 'underscore';

@Injectable({
    providedIn: 'root'
})
export class SupplyDatabase {
    constructor(
        private databaseService: DatabaseService,
    ) {}

    async getByUuid(uuid: string): Promise<SupplyInterface> {
        return this.databaseService.findOrNull(
            `select *
            from supplies
            where uuid = ?`, [
          uuid
        ]);
    };

    async getAll(): Promise<SupplyInterface[]> {
        return this.databaseService.findAsArray(
            `select *
            from supplies`
        );
    };

    async getAllByDeliveryStatus(statusKey: string): Promise<SupplyInterface[]> {
        return this.databaseService.findAsArray(
            `select *
            from supplies
            where delivery_status = ?`, [
                statusKey
            ]
        );
    };

    async getAllByAcknowledgment(acknowledgment: number): Promise<SupplyInterface[]> {
        return this.databaseService.findAsArray(
            `select *
            from supplies
            where acknowledgment = ?`, [
                acknowledgment
            ]
        );
    };

    /**
     * Create request in db
     *
     * @param request
     */
    async createRequest(request: SupplyInterface): Promise<SupplyInterface> {
        const uuid = this.databaseService.getUuid();

        const query = sqlBuilder.insert('supplies', Object.assign({
                uuid,
                job_type_id: request.job_type_id,
                type: request.type,
                quantity: request.quantity,
                created_at: this.databaseService.getTimeStamp(),
                sync: 0,
            })
        );

        return this.databaseService.query(query.toString(), query.toParams())
            .then(() => this.getByUuid(uuid));
    }

    /**
     * Update request in db
     *
     * @param request
     */
     async updateRequest(request: SupplyInterface): Promise<SupplyInterface> {
        const query = sqlBuilder
            .update('supplies', Object.assign({
                sync: 0,
                updated_at: this.databaseService.getTimeStamp()
            }, _.pick(request, ['delivery_status', 'comment']))
            )
            .where('uuid', request.uuid);

        return this.databaseService.query(query.toString(), query.toParams());
    }
}
