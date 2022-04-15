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
    serviceOption: any = [
        {hasDirty: false},
        {resolution: '480p'},
        {resolution: '720p'},
        {resolution: '1080p'},
        {resolution: '2k'},
        {resolution: '4k'}
    ]; // create

    private subscriptions: Subscription[] = [];

    constructor(
        public modal: NgbActiveModal,
        private fb: FormBuilder,
        private mangeService: QuanlyService
    ) {
    }

    ngOnInit(): void {
        this.isLoading$ = this.mangeService.isLoading$; // chạy sever - bất đồng b
        this.initForm();

        if (this.id) {
            this.fetchFormData();
        }
    }

    fetchFormData() {
        const sb = this.mangeService.getItemById(this.id).pipe(
            first(),
            catchError((err) => {
                // Nếu mà lỗi sẽ trả ra thông báo lỗi
                this.mangeService.handleTbError(err);
                this.modal.dismiss(err.message);
                alert('lỗi tùm lum luôn');
                return of(EMPTY_ALARM);
            })
        ).subscribe((res: QuanlyModel) => {
            this.serviceOption = res; // cap nhat 1 object
            this.patchFormValue(res);
        });
        this.subscriptions.push(sb);
    }

    patchFormValue(data: QuanlyModel) {
        const resolutionArr = [];
        data.clServiceOptionDtos.forEach(service => {
            switch (service.resolution) {
                case '480p':
                    resolutionArr.push({p480: service.price});
                    break;
                case '720p':
                    resolutionArr.push({'p720': service.price});
                    break;
                case '1080p':
                    resolutionArr.push({'p1080': service.price});
                    break;
                case '2k':
                    resolutionArr.push({'k2': service.price});
                    break;
                case '4k':
                    resolutionArr.push({'k4': service.price});
                    break;
                default:
                    break;
            }
        });
        console.log(resolutionArr);
        let patchObject = {};
        resolutionArr.forEach(res => {
            patchObject = { ...patchObject, ...res };
        });
        this.formGroup.patchValue({
            name: data.name,
            maxDayStorage: data.maxDayStorage,
            clServiceOptionDtos: data.clServiceOptionDtos,
            active: data.active,
            note: data.note,
            ...patchObject
        });
    }

    initForm() {
        this.formGroup = this.fb.group({
            name: [''],
            maxDayStorage: [''],
            // clServiceOptionDtos: this.fb.array([]),
            active: true,
            note: [''],
            p480: [''],
            p720: [''],
            p1080: [''],
            k2: [''],
            k4: [''],
        });
    }

    save() {
        this.prepareReqData();
        this.createOrUpdate();
        // if (this.ql.id) {
        //     this.edit();
        // } else {
        //     this.create();
        // }
    }

    // Creat or Update deu vao day nhu nhau
    private prepareReqData() {
        const formData = this.formGroup.value; // Xác định xem form có giá trị ko
                // nếu có => là Update
                // nếu ko => là Create
        console.log(formData);
        const resolutionPriceArr = []; // để hứng giá trị

        const serviceOptionList = this.serviceOption[0]?.hasDirty === false ? this.serviceOption : this.serviceOption.clServiceOptionDtos;
        serviceOptionList.forEach(service => {
            switch (service.resolution) {
                case '480p':
                    resolutionPriceArr.push({id: service.id, resolution: '480p', price: +formData.p480});
                    break;
                case '720p':
                    resolutionPriceArr.push({id: service.id, resolution: '720p', price: +formData.p720});
                    break;
                case '1080p':
                    resolutionPriceArr.push({id: service.id, resolution: '1080p', price: +formData.p1080});
                    break;
                case '2k':
                    resolutionPriceArr.push({id: service.id, resolution: '2k', price: +formData.k2});
                    break;
                case '4k':
                    resolutionPriceArr.push({id: service.id, resolution: '4k', price: +formData['k4']});
                // tslint:disable-next-line:no-switch-case-fall-through
                default:
                    break;
            }
        });
        console.log(resolutionPriceArr); // mảng các object

        this.ql = {
            id: this.id,
            name: formData.name,
            maxDayStorage: formData.maxDayStorage,
            clServiceOptionDtos: resolutionPriceArr,
            active: formData.active,
            note: formData.note,
        };
        console.log(this.ql);  // <== trả đúng về kiểu sever muốn nhận
    }

    edit() {
        const sbUpdate = this.mangeService.updateManage(this.ql).pipe(
            tap(() => {
                alert(this.id + 'Cập nhật thành công');
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
        const sbCreate = this.mangeService.creatManage().pipe(
            tap(() => {
                alert(this.id + 'Thêm mới thành công');
                this.modal.close();
            }),
            catchError((errorMessage) => {
                this.modal.dismiss(errorMessage);
                return of(this.mangeService);
            }),
        ).subscribe((res: QuanlyModel) => this.ql = res);
        this.subscriptions.push(sbCreate);
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

