import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SuppliesRequestEditStatusFormComponent } from './supplies-request-edit-status-form.component';

describe('SuppliesRequestEditStatusFormComponent', () => {
  let component: SuppliesRequestEditStatusFormComponent;
  let fixture: ComponentFixture<SuppliesRequestEditStatusFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SuppliesRequestEditStatusFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliesRequestEditStatusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
