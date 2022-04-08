import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

const ICON_TYPES = {
  warning: { icon: 'warning', class: 'icon-warning'},
  infomation: { icon: 'info', class: 'icon-info'},
  error: { icon: 'dangerous', class: 'icon-danger'},
  dangerquestion: { icon: 'dangerous', class: 'icon-danger'},
  question: { icon: 'help', class: 'icon-primary'},
};

export class ConfirmationSetting {
  type: 'warning' | 'infomation' | 'error' | 'question' | 'dangerquestion' = 'infomation';
  title?: string;
  message?: string;
  buttonOK?: string | undefined = 'Đồng ý';
  buttonCancel?: string | undefined = 'Từ chối';
}

@Component({
  selector: 'app-popupconform',
  templateUrl: './popupconform.component.html',
  styleUrls: ['./popupconform.component.scss']
})
export class PopupconformComponent implements OnInit {
  @Input() setting?: ConfirmationSetting;
  innerSetting: ConfirmationSetting = new ConfirmationSetting();
  iconType: any = {};

  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
    this.innerSetting = Object.assign(this.innerSetting, this.setting);
    if (this.innerSetting) {
      this.iconType = ICON_TYPES[this.innerSetting.type];
    }
  }

  onButtonOK() {
    this.modal.close(true);
  }
}
