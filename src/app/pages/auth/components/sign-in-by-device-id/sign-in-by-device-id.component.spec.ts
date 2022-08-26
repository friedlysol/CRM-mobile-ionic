import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignInByDeviceIdComponent } from './sign-in-by-device-id.component';

describe('SignInByDeviceIdComponent', () => {
  let component: SignInByDeviceIdComponent;
  let fixture: ComponentFixture<SignInByDeviceIdComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInByDeviceIdComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInByDeviceIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
