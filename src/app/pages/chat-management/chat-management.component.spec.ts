import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatManagementComponent } from './chat-management.component';

describe('ChatManagementComponent', () => {
  let component: ChatManagementComponent;
  let fixture: ComponentFixture<ChatManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
