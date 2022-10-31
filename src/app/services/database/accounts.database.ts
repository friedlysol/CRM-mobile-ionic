import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { AccountInterface } from '@app/interfaces/account.interface';

import * as sqlBuilder from 'sql-bricks';

@Injectable({
  providedIn: 'root'
})
export class AccountsDatabase {
  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Get active account
   */
  getActive(): Promise<AccountInterface> {
    return this.databaseService.findOrNull(`select * from accounts where is_active = 1`);
  }

  /**
   * Get account by person id
   * @param personId
   */
  getById(personId: number): Promise<AccountInterface> {
    return this.databaseService.findOrNull(`select * from accounts where person_id = ?`, [personId]);
  }

  /**
   * Save account (create or update if account exists)
   *
   * @param accountData
   */
  saveAccount(accountData: AccountInterface): Promise<any> {
    return this.databaseService.findOrNull(`select * from accounts where person_id = ?`, [accountData.person_id])
      .then(async (account: AccountInterface) => {
        if (account) {
          account = await this.updateAccount(accountData);
        } else {
          account = await this.createAccount(accountData);
        }

        return this.setAsActive(account);
      });
  }

  /**
   * Create new account
   *
   * @param accountData
   * @private
   */
  private async createAccount(accountData: AccountInterface): Promise<AccountInterface> {
    accountData.uuid = this.databaseService.getUuid();
    accountData.created_at = this.databaseService.getTimeStamp();

    const query = sqlBuilder.insert('accounts', accountData);

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getById(accountData.person_id));
  }

  /**
   * Update account
   *
   * @param accountData
   * @private
   */
  private async updateAccount(accountData: AccountInterface): Promise<AccountInterface> {
    accountData.update_at = this.databaseService.getTimeStamp();

    const query = sqlBuilder
      .update('accounts', accountData)
      .where({person_id: accountData.person_id});

    return this.databaseService.query(query.toString(), query.toParams())
      .then(() => this.getById(accountData.person_id));
  }

  /**
   * Set the account as active (only one account can be active)
   *
   * @param account
   * @private
   */
  private async setAsActive(account: AccountInterface): Promise<any> {
    await this.databaseService.query(`update accounts set is_active = 0`);
    await this.databaseService.query(`update accounts set is_active = 1 where person_id = ?`, [account.person_id]);

    return account;
  }
}
