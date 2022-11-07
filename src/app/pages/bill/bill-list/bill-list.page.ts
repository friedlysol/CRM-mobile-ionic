import { Component, OnDestroy, OnInit } from '@angular/core';
import { BillService } from '@app/services/bill.service';
import { BillEntryFiltersInterface, BillEntryInterface } from '@app/interfaces/bill-entry.interface';
import { PaginationInterface } from '@app/interfaces/pagination.interface';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { UtilsService } from '@app/services/utils.service';

import * as _ from 'underscore';
import { EventService } from '@app/services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.page.html',
  styleUrls: ['./bill-list.page.scss'],
})
export class BillListPage implements OnInit, OnDestroy {
  public bills: BillEntryInterface[];
  public pagination: PaginationInterface;

  private filters: BillEntryFiltersInterface = {
    query: null,
    reimbursement: null,
    date_from: null,
    date_to: null,
    is_approved: null,
    is_photo: null
  }

  private subscriptions = new Subscription();

  constructor(private billService: BillService, private router: Router, public utilsService: UtilsService) { }

  ngOnInit() {
    this.subscriptions.add(EventService.endSync.subscribe(status => {
      if (status) {
        this.loadList();
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async ionViewDidEnter() {
    await this.loadList()
  }

  async nextPage(event) {
    console.log('nextPage', this.pagination.next, this.pagination.page);

    if(this.pagination.next) {
      await this.loadList(this.pagination.page + 1, false);
    }

    event.target.complete();

    if(this.pagination.next) {
      event.target.disabled = true;
    }
  }

  private async loadList(page = 1, resetList = true) {
    const bill = await this.billService.getBillsWithPagination(this.filters, page);

    if(resetList) {
      this.bills = bill.bills;
    } else {
      this.bills = _.union(this.bills, bill.bills);
    }

    this.pagination = bill.pagination;
  }


  getFilePath(bill: BillEntryInterface) {
    const source = bill.file_thumbnail ? bill.file_thumbnail : bill.file_path;

    return Capacitor.convertFileSrc(source);
  }

  onAddClick() {
    return this.router.navigate(['/bill/form']);
  }

  onEditClick(bill: BillEntryInterface) {
    return this.router.navigate(['/bill/form', bill.uuid]);
  }
}
