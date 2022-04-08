import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CLServiceOption, QuanlyModel} from '../_model/quanly.model';
import {of, Subscription} from 'rxjs';
import {QuanlyService} from '../_service/quanly.service';
import {catchError, tap} from 'rxjs/operators';
import {TbErrorCode, TbErrorResp} from '../_model/listErrorCode';

const EMPTY_FORM: QuanlyModel = {
  id: undefined,
  name: '',
  maxDayStorage: 0,
  // clServiceOptions: [],
  note: '',
  active: true
};

@Component({
  selector: 'app-create-udate',
  templateUrl: './create-udate.component.html',
  styleUrls: ['./create-udate.component.scss']
})
export class CreateUdateComponent implements OnInit, OnDestroy {
  @Input() id: string;
  isLoading$;
  ql: QuanlyModel;

  // Các value resolution
  clServiceOption = {
    p480: '480p',
    p720: '720p',
    p1080: '1080p',
    p2160: '2K',
    p4320: '4K',
  };

  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];

  // Dùng để lấy maxDayStorage
  maxDayS: any[];

  // getMaxDayStorage
  fetchMaxDay() {
    const sbFMD = this.mangeService.getAllMaxDayStorage().subscribe(data => {
      console.log(data);
      this.maxDayS = data;
    }, error => {
      this.mangeService.handleError(error); // log error
    });
    this.subscriptions.push(sbFMD);
  }

  constructor(
      public modal: NgbActiveModal,
      private fb: FormBuilder,
      private mangeService: QuanlyService

  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.mangeService.isLoading$;
    this.initForm(EMPTY_FORM);

    this.fetchMaxDay();
    // tslint:disable-next-line:no-unused-expression

    if (this.id !== undefined && this.id !== null){
      this.fetchFormData();
    }
  }

  initForm(data: any) {
    this.formGroup = this.fb.group({
      name: [data.name],
      maxDayStorage: [data.maxDayStorage],
      active: [data.active],
      note: [data.note]
    });
  }

  closeModal(){
    this.modal.close();
  }

  // tim xem id co
  fetchFormData() {
    const sb = this.mangeService.getById(this.id).pipe(
        tap((resp: QuanlyModel ) => {
          console.log(resp);
          this.patchFormData(resp);
        }),
        catchError( err => {
          return of({});
        })
    );
    // @ts-ignore
    this.subscriptions.push(sb);
  }

  // Cap nhat form
  patchFormData(data: QuanlyModel) {
    // this.formGroup.patchValue({
    //   name: data.name,
    //   maxDayStorage: data.maxDayStorage,
    //   active: data.active,
    //   note: data.note
    // })
  }

  submitForm() {
    console.log(this.formGroup.value);
  }

  save(){
    this.createOrUpdate();
    this.prepareReqData();
  }

  createOrUpdate() {
    const sbCU = this.mangeService.creatManage(this.ql).pipe(
        tap(() => {
          if (this.id === null && this.id === undefined ) {
            alert('Thêm mới thành công!');
          } else {
            alert('Cập nhật thành công !');
          }
          this.modal.close();
        }),
         catchError((err: TbErrorResp) => {
           if (err.errorCode === TbErrorCode.BAD_REQUEST_PARAMS && err.message === 'Manage Service already exist') {
             console.log('Tên thông báo đã tồn tại');
           } else {
             console.log('Lỗi ko xác định');
           }
           return of(this.ql);
         }),
    ).subscribe(res => this.ql = res);
    this.subscriptions.push(sbCU);
  }

  prepareReqData() {
    const formData = this.formGroup.value;
    this.ql = {
      id: this.id,
      name: formData.name,
      maxDayStorage: formData.maxDayStorage,
      active: formData.active,
      note: formData.note
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb: Subscription) => sb.unsubscribe());
  }
}


// Nên dùng post cho CREAT - put cho Update . Put check id ko có thì tạo mới
// Theo tiêu chuẩn RFC 2616, POST method được dùng để gửi các request kèm
// theo một entity đến server yêu cầu tạo một tài nguyên mới dựa trên entity được cung cấp.
// Mặt khác, PUT method nên kèm theo một định danh (thường là ID) cùng với một entity.
// Nếu một tài nguyên được tìm thấy bởi mã định danh kèm theo thì
// tài nguyên này sẽ được thay thế bởi các giá trị trong entity kèm theo. Ngược lại,
// PUT method sẽ tạo một tài nguyên dựa trên entity đã cung cấp.
