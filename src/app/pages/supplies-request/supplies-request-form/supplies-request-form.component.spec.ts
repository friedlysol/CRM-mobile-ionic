import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SuppliesRequestFormComponent } from './supplies-request-form.component';

describe('SuppliesRequestFormComponent', () => {
  let component: SuppliesRequestFormComponent;
  let fixture: ComponentFixture<SuppliesRequestFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SuppliesRequestFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliesRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
