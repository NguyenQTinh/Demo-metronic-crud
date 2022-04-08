import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateUdateComponent} from './create-udate/create-udate.component';
import {QuanlyService} from './_service/quanly.service';
import {Subscription} from 'rxjs';
import {QuanlyModel} from './_model/quanly.model';
import {GroupingState, PaginatorState, SortState} from '../../_metronic/shared/crud-table';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {PopupconformComponent} from './popupconform/popupconform.component';

@Component({
    selector: 'app-quanly',
    templateUrl: './quanly.component.html',
    styleUrls: ['./quanly.component.scss']
})
export class QuanlyComponent implements OnInit, OnDestroy {

    quanLy: QuanlyModel[] = [];
    private subscriptions: Subscription[] = [];

    paginator: PaginatorState;
    sorting: SortState;
    grouping: GroupingState;
    isLoading: boolean;
    filterGroup: FormGroup;
    searchGroup: FormGroup;
    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        public manageService: QuanlyService,
    ) {
    }

    ngOnInit(): void {
        this.loadData();

        // this.manageService.dftFetch();  // load dữ liệu
        // this.manageService.items$.subscribe(res => console.log(res));
        this.grouping = this.manageService.grouping;
        this.paginator = this.manageService.paginator;
        this.sorting = this.manageService.sorting;
        const sb = this.manageService.isLoading$.subscribe(res => this.isLoading = res);
        this.subscriptions.push(sb);
    }

    loadData() {
        const sb = this.manageService.getAll().subscribe(data => {
            console.log(data);
            this.quanLy = data;
        }, error => {
            this.manageService.handleError(error); // log error
        });
        this.subscriptions.push(sb);
    }


    create() {
        this.modalService.open(CreateUdateComponent, {size: 'lg'}); // open popup
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
                this.manageService.deleteManage(id).subscribe((res: any) => {
                    alert('Xóa thành công!');
                    this.loadData();
                });
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


    searchForm() {
        this.searchGroup = this.fb.group({
            searchTerm: [''],
        });
        const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
            .pipe(
                /*
              The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
              we are limiting the amount of server requests emitted to a maximum of one every 150ms
              */
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe((val) => this.search(val));
        this.subscriptions.push(searchEvent);
    }

    search(searchTerm: string) {
        this.manageService.patchState({searchTerm});
    }

    // pagination
    paginate(paginator: PaginatorState) {
        this.manageService.patchState({paginator});
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
    }
}
