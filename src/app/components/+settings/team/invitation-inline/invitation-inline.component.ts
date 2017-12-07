import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Invitation } from '../../../../models/invitation';
import { InvitationService } from '../../../../services/invitation/invitation.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import * as choices from '../team.constants';

@Component({
  selector: 'invitation-inline',
  host: {
    'class': 'row item'
  },
  templateUrl: './invitation-inline.component.html',
  styleUrls: ['./invitation-inline.component.scss'],
  providers: [InvitationService]
})
export class InvitationInlineComponent {
  @Input() invitation: Invitation;
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  private choices = choices;

  constructor(
    private invitationService: InvitationService,
    private flash: FlashMessageService,
  ) {}

  public cancel() {
    this.invitationService.cancel(this.invitation.signed_id)
      .subscribe((data) => {
          this.onDelete.emit(this.invitation);
          this.flash.success('Invitation was cancelled successfully.');
        },
        error => {
          this.flash.error('Error while canceling invitation.');
          console.error(error);
        }
      );
  }

  public resend() {
    this.invitationService.resend(this.invitation.signed_id)
      .subscribe((data) => {
          this.flash.success('The emails was resend.');
        },
        error => {
          this.flash.error('Error while resending email.');
          console.error(error);
        }
      );
  }
}
