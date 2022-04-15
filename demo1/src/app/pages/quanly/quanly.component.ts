import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateUdateComponent} from './create-udate/create-udate.component';
import {QuanlyService} from './_service/quanly.service';
import {of, Subscription} from 'rxjs';
import {QuanlyModel} from './_model/quanly.model';
import {GroupingState, PaginatorState, SortState} from '../../_metronic/shared/crud-table';
import {catchError, debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {PopupconformComponent} from './popupconform/popupconform.component';

@Component({
    selector: 'app-quanly',
    templateUrl: './quanly.component.html',
    styleUrls: ['./quanly.component.scss']
})
export class QuanlyComponent implements OnInit, OnDestroy {

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public manageService: QuanlyService,
    ) {
    }

    quanLy: QuanlyModel[] = [];
    private subscriptions: Subscription[] = [];

    paginator: PaginatorState;
    sorting: SortState;
    grouping: GroupingState;
    isLoading: boolean;
    filterGroup: FormGroup;
    searchGroup: FormGroup;

    allDays: any[];

    ngOnInit(): void {
        this.manageService.fetch();  // load dữ liệu
        // this.manageService.items$.subscribe(res => console.log(res));
        this.grouping = this.manageService.grouping;
        this.paginator = this.manageService.paginator;
        this.sorting = this.manageService.sorting;
        const sb = this.manageService.isLoading$.subscribe(res => this.isLoading = res);
        this.subscriptions.push(sb);

        this.getMaxDaysStorage();
        this.searchForm();
        this.filterForm();
    }

    filterForm() {
        this.filterGroup = this.fb.group({
            maxDayStorage: [''],
            active: [''],
            searchTerm: [''],
        });
        this.subscriptions.push(
            this.filterGroup.controls.maxDayStorage.valueChanges.subscribe(() =>
                this.filter()
            )
        );
        this.subscriptions.push(
            this.filterGroup.controls.active.valueChanges.subscribe(() => this.filter())
        );
    }

    filter() {
        const filter = {};
        const maxDayStorage = this.filterGroup.get('maxDayStorage').value;
        if (maxDayStorage) {
            /* tslint:disable:no-string-literal */
            filter['maxDayStorage'] = maxDayStorage;
        }

        const active = this.filterGroup.get('active').value;
        if (active) {
            filter['active'] = active;
        }
        this.manageService.patchState({ filter });
    }

    searchForm() {
        this.searchGroup = this.fb.group({
            searchTerm: [''],
        });
        const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
            .pipe(
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe((val) => this.search(val));
        this.subscriptions.push(searchEvent);
    }

    search(searchTerm: string) {
        this.manageService.patchState({searchTerm});
    }

    create() {
        // this.modalService.open(CreateUdateComponent, {size: 'lg'}); // open popup
        this.edit(undefined);
    }

    edit(id: number) {
        const modalRef = this.modalService.open(CreateUdateComponent, {size: 'lg'});
        modalRef.componentInstance.id = id;
        modalRef.result.then(
            () => {
                this.manageService.fetch();
            },
            () => {
            }
        );
    }

    delete(id: string, name: string) {
        const modalRef = this.modalService.open(PopupconformComponent);
        modalRef.componentInstance.setting = {
            type: 'dangerquestion',
            title: `Bạn muốn xóa nhóm dịch vụ <b>${name}</b> ngày`,
            message: '',
        };
        modalRef.result.then(
            (rs) => {
                // on close : Call API to delete the record here
                this.manageService.deleteManage(id).subscribe(
                    (res: any) => {
                        alert('Xóa thành công!'); // sau khi xóa được sẽ update lại bảng
                        this.manageService.fetch();  // load dữ liệu
                    },
                    error => {
                        alert('Xóa ko thành công, do đã được sử dụng');
                    }
                );
            },
            (rs) => {
                // on dismiss
            });
    }

    sort(column: string) {
        const sorting = this.sorting;
        const isActiveColumn = sorting.column === column;
        if (!isActiveColumn) {
            sorting.column = column;
            sorting.direction = 'asc';
        } else {
            sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
        }
        this.manageService.patchState({sorting});
    }

    // pagination
    paginate(paginator: PaginatorState) {
        this.manageService.patchState({paginator});
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
    }

    getMaxDaysStorage() {
        const sbGetMaxDay = this.manageService.getAllMaxDayStorage().subscribe({
            next: (data) => {
                console.log(data);
                this.allDays = data;
            },
            error: (err) => {
                this.manageService.handleError(err); // log error
            }
        });
        this.subscriptions.push(sbGetMaxDay);
    }
}
