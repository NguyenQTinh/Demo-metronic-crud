import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {QuanlyModel} from '../_model/quanly.model';
import {of, Subscription} from 'rxjs';
import {QuanlyService} from '../_service/quanly.service';
import {catchError, first, tap} from 'rxjs/operators';
import {TbErrorCode, TbErrorResp} from '../_model/listErrorCode';
import {Customer} from '../../../modules/e-commerce/_models/customer.model';


const EMPTY_ALARM: QuanlyModel = {
    id: undefined,
    name: '',
    maxDayStorage: '',
    active: true,
    note: '',
    clServiceOptionDtos: []
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
    formGroup: FormGroup;
    private subscriptions: Subscription[] = [];

    listOptionDtos: any;

    constructor(
        public modal: NgbActiveModal,
        private fb: FormBuilder,
        private mangeService: QuanlyService
    ) {
    }

    ngOnInit(): void {
        this.isLoading$ = this.mangeService.isLoading$;
        this.listOptionDtos = [
            {resolution: '480p', price: '0'},
            {resolution: '720p', price: '0'},
            {resolution: '1080p', price: '0'},
            {resolution: '2K', price: '0'},
            {resolution: '4K', price: '0'},
        ];
        this.initForm();
        this.patchDtos();

        if (this.id) {
            this.fetchFormData();
        }
    }

    fetchFormData() {
        const sb = this.mangeService.getItemById(this.id).pipe(
            first(),
            catchError((err) => {
                this.mangeService.handleTbError(err);
                this.modal.dismiss(err.message);
                alert('lỗi tùm lum luôn');
                return of(EMPTY_ALARM);
            })
        ).subscribe((res: QuanlyModel) => {
            this.patchFormValue(res);
        });
        this.subscriptions.push(sb);
    }

    // PatchValue: cập nhật lại
    patchFormValue(data: QuanlyModel) {
        this.formGroup.patchValue({
            name: data.name,
            maxDayStorage: data.maxDayStorage,
            clServiceOptionDtos: data.clServiceOptionDtos,
            active: data.active,
            note: data.note,
        });
    }

    initForm() {
        this.formGroup = this.fb.group({
            name: [''],
            maxDayStorage: [''],
            clServiceOptionDtos: this.fb.array([]),
            active: true,
            note: [''],
        });
    }

    // pathDtos và patchValues: dùng cho thằng form clServiceOptionDtos
    patchDtos() {
        const control = this.formGroup.get('clServiceOptionDtos') as FormArray;
        this.listOptionDtos.forEach(x => {
            control.push(this.patchValues(x.resolution, x.price));
        });
    }

    patchValues(resolution, price) {
        return this.fb.group({
            resolution: [resolution],
            price: [price]
        });
    }

    save() {
        this.prepareReqData();
        // this.createOrUpdate();
        if (this.ql.id) {
            this.edit();
        } else {
            this.create();
        }
    }

    edit() {
        const sbUpdate = this.mangeService.updateManage(this.ql).pipe(
            tap(() => {
                alert('Cập nhật thành công');
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.ql);
            }),
        ).subscribe((res) => {
            this.ql = res;
        });
        this.subscriptions.push(sbUpdate);
    }

    create() {
        const sbCreate = this.mangeService.creatManage(this.ql).pipe(
            tap(() => {
                alert('Thêm mới thành công');
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.mangeService);
            }),
        ).subscribe((res: QuanlyModel) => this.ql = res);
        this.subscriptions.push(sbCreate);
    }

    private prepareReqData() {
        const formData = this.formGroup.value;
        console.log('formData: ' + formData);
        console.log(typeof formData.maxDayStorage);
        console.log(typeof formData.clServiceOptionDtos);
        this.ql = {
            id: this.id,
            name: formData.name,
            maxDayStorage: formData.maxDayStorage,
            clServiceOptionDtos: formData.clServiceOptionDtos,
            active: formData.active,
            note: formData.note,
        };
    }

    createOrUpdate() {
        const sbCreateUpdate = this.mangeService.createOrUpdate(this.ql).pipe(
            tap(() => {
                alert(this.id ? 'Cập nhật thành công' : 'Thêm mới thành công');
                this.modal.close();
            }),
            // catchError((err: TbErrorResp) => {
            //     if (err.errorCode === TbErrorCode.BAD_REQUEST_PARAMS && err.message === 'Mangane Service name already exist') {
            //         alert('Tên thông báo đã tồn tại');
            //     } else {
            //         // this.mangeService.handleTbError(err);
            //         alert('Lỗi quá trời lỗi');
            //     }
            //     return of(this.ql);
            // }
            catchError(err => {
                alert('Nhóm Dịch Vụ và Số Ngày Lưu Trữ đã tồn tại');
                return of(this.ql);
            })
        ).subscribe(res => this.ql = res);
        this.subscriptions.push(sbCreateUpdate);
    }

    closeModal() {
        this.modal.close();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb: Subscription) => sb.unsubscribe());
    }
}

