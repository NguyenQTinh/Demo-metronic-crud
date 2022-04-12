import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {QuanlyModel} from '../_model/quanly.model';
import {Subscription} from 'rxjs';
import {QuanlyService} from '../_service/quanly.service';

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

    // fields = [
    //     {resolution: '480p', price: '0'},
    //     {resolution: '720p', price: '0'},
    //     {resolution: '1080p', price: '0'},
    //     {resolution: '2K', price: '0'},
    //     {resolution: '4K', price: '0'},
    // ];

    fields = {
        clServiceOptionDtos: [
            {resolution: '480p', price: '0'},
            {resolution: '720p', price: '0'},
            {resolution: '1080p', price: '0'},
            {resolution: '2K', price: '0'},
            {resolution: '4K', price: '0'},
        ]
    };

    constructor(
        public modal: NgbActiveModal,
        private fb: FormBuilder,
        private mangeService: QuanlyService
    ) {
    }

    ngOnInit(): void {
        this.isLoading$ = this.mangeService.isLoading$; // chạy sever - bất đồng b
        this.fields();
        this.initForm();
        this.patch();
    }

    initForm() {
        this.formGroup = this.fb.group({
            name: [''],
            maxDayStorage: [''],
            // clServiceOptionDtos: this.fb.array([this.fields]), // create empty form array
            clServiceOptionDtos: this.fb.array([]), // create empty form array
            active: true,
            note: [''],
        });
    }

    // get clServiceOptionDtos(): FormArray {
    //     const control = this.formGroup.get('clServiceOptionDtos') as FormArray;
    //     this.fields.forEach(x => {
    //         // Duyệt qua mảng fields
    //         // control.push(this.patchValues(x.resolution, x.price));
    //     });
    // }

    patch() {
        // return this.formGroup.get('clServiceOptionDtos') as FormArray;
        const control = this.formGroup.get('clServiceOptionDtos') as FormArray;
        this.fields.clServiceOptionDtos.forEach(x => {
            // Duyệt qua mảng fields
            control.push(this.patchValues(x.resolution, x.price));
        });
    }

    patchValues(resolution, price) {
        return this.fb.group({
            resolution: [resolution],
            price: [price]
        });
    }

    submitForm() {
        console.log(this.formGroup.value);
        console.log(this.formGroup.getRawValue());

    }

    closeModal() {
        this.modal.close();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb: Subscription) => sb.unsubscribe());
    }
}


/*
* 1. Duyệt qua keys object 'Độ phân giải'.
*   forEach lấy được phần tử trong mảng key
*
*   find: tìm kiếm x.resolution === key?/value
*
* */
