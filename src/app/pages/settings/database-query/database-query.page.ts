import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '@app/services/database.service';
import { Toast } from '@ionic-native/toast/ngx';

@Component({
  selector: 'app-database-query',
  templateUrl: './database-query.page.html',
  styleUrls: ['./database-query.page.scss'],
})
export class DatabaseQueryPage implements OnInit {

  public query: string = null;
  public queryError: string = null;
  public queryResult: any = null;
  public lastQueries: Array<string> = [];

  constructor(private databaseService: DatabaseService, private toast: Toast) {
  }

  ngOnInit() {
  }

  executeQuery() {
    if (this.query) {
      this.databaseService.query(this.query)
        .then(result => {
          console.log(result);
          const output = [];

          for (let i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
          }

          this.queryResult = output;

          if (result.hasOwnProperty('error')) {
            this.queryError = result.error.message;
          } else {
            if (!this.lastQueries.includes(this.query)) {
              this.lastQueries.push(this.query);
              this.lastQueries.slice(-10);
            }

            this.queryError = null;
          }
        })
        .catch(err => {
          this.queryError = err;
        });
    }
  }

  setQuery(query) {
    this.query = query;
  }
}
