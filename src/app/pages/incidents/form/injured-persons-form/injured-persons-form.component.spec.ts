import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InjuredPersonsFormComponent } from './injured-persons-form.component';

describe('InjuriedPersonsFormComponent', () => {
  let component: InjuredPersonsFormComponent;
  let fixture: ComponentFixture<InjuredPersonsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InjuredPersonsFormComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InjuredPersonsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
