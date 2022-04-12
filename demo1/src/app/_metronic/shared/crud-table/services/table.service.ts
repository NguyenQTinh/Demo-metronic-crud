// tslint:disable:variable-name
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subscription, throwError} from 'rxjs';
import {catchError, finalize, tap} from 'rxjs/operators';
import {PaginatorState} from '../models/paginator.model';
import {ITableState, TableResponseModel} from '../models/table.model';
import {BaseModel} from '../models/base.model';
import {SortState} from '../models/sort.model';
import {GroupingState} from '../models/grouping.model';
import {environment} from '../../../../../environments/environment';
import {TbErrorCode, TbErrorResp, UNKNOWN_ERROR} from '../../../../pages/quanly/_model/listErrorCode';

const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined
};

export abstract class TableService<T> {
  // Private fields
  private _items$ = new BehaviorSubject<T[]>([]);
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
  private _tableState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  private _errorMessage = new BehaviorSubject<string>('');
  private _subscriptions: Subscription[] = [];

  // Getters
  get items$() {
    return this._items$.asObservable();
  }

  get isLoading$() {
    return this._isLoading$.asObservable();
  }

  get isFirstLoading$() {
    return this._isFirstLoading$.asObservable();
  }

  get errorMessage$() {
    return this._errorMessage.asObservable();
  }

  get subscriptions() {
    return this._subscriptions;
  }

  // State getters
  get paginator() {
    return this._tableState$.value.paginator;
  }

  get filter() {
    return this._tableState$.value.filter;
  }

  get sorting() {
    return this._tableState$.value.sorting;
  }

  get searchTerm() {
    return this._tableState$.value.searchTerm;
  }

  get grouping() {
    return this._tableState$.value.grouping;
  }

  protected http: HttpClient;

  // API URL has to be overrided
  // API_URL = `${environment.apiUrl}/endpoint`;
  // API_URL = `${environment.apiUrl}/mange/group-service`;

  API_URL = 'http://123.30.214.139:17104/api/mange/group-service';

  token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzeXNhZG1pbkB0aGluZ3Nib2FyZC5vcmciLCJzY29wZXMiOlsiU1lTX0FETUlOIl0sInVzZXJJZCI6ImRkOWM5ZmMwLTU3NjctMTFlYy1hMTQxLWExZjM4MTFhMjQ2ZCIsImZpcnN0TmFtZSI6IiIsImxhc3ROYW1lIjoiU1lTVEVNIEFETUlOIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAiLCJpc3MiOiJ0aGluZ3Nib2FyZC5pbyIsImlhdCI6MTY0OTc0OTk4NiwiZXhwIjoxNjQ5NzU4OTg2fQ.X3-mdxpkSmtSHL7Gbq9yRyJOdD-5OBbnslb1Pl74Ezpb0tYMybT8niTzmvyqu53d3HPjtlfDwgjajZ-Xp7pKzw';

  constructor(http: HttpClient) {
    this.http = http;
  }

  // dft custom
  getQuery(tableState: ITableState): string {
    const paginator = tableState.paginator;
    const textSearch = tableState.searchTerm;
    const sorting = tableState.sorting;
    const filter = tableState.filter;
    let query = `?pageSize=${paginator.pageSize}&page=${paginator.page - 1}`;
    if (textSearch && textSearch.length) {
      query += `&textSearch=${textSearch}`;
    }
    if (sorting) {
      if (sorting.column){
        query += `&sortProperty=${sorting.column}`;
      }
      if (sorting.direction) {
        query += `&sortOrder=${sorting.direction}`;
      }
    }
    if (filter) {
      for (const key of Object.keys(filter)) {
        query += `&${key}=${filter[key]}`;
      }
    }
    return query;
  }

  createOrUpdate(item: BaseModel): Observable<BaseModel> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);

    this._isLoading$.next(true);
    // this._errorMessage.next('');
    return this.http.post<BaseModel>(this.API_URL, item, {headers}).pipe(
        catchError(err => {
          // map err về chung 1 dạng TbErrorResp, error nào k rõ => UNKNOWN_ERROR
          // this._errorMessage.next(err);
          console.error('CREATE OR UPDATE ITEM', item, err);
          return this.getTbErrorRespFromErr(err);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  // end of dft custom

  // CREATE
  // server should return the object with ID
  create(item: BaseModel): Observable<BaseModel> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);

    this._isLoading$.next(true);
    // this._errorMessage.next('');
    return this.http.post<BaseModel>(this.API_URL, item, {headers}).pipe(
        catchError(err => {
          // this._errorMessage.next(err);
          console.error('CREATE ITEM', err);
          return this.getTbErrorRespFromErr(err);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  // READ (Returning filtered list of entities)
  find(tableState: ITableState): Observable<TableResponseModel<T>> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);

    const url = `${this.API_URL}${this.getQuery(tableState)}`;
    this._errorMessage.next('');
    return this.http.get<TableResponseModel<T>>(url, {headers}).pipe(
        catchError(err => {
          this._errorMessage.next(err);
          console.error('FIND ITEMS', err);
          return of({items: [], total: 0});
        })
    );
  }

  getItemById(id: any): Observable<BaseModel> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);

    this._isLoading$.next(true);
    // this._errorMessage.next('');
    const url = `${this.API_URL}/${id}`;
    return this.http.get<BaseModel>(url, {headers}).pipe(
        catchError(err => {
          // this._errorMessage.next(err);
          console.error('GET ITEM BY IT', id, err);
          return this.getTbErrorRespFromErr(err);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  // UPDATE
  update(item: BaseModel): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${this.token}`);

    const url = `${this.API_URL}/${item.id}`;
    this._isLoading$.next(true);
    // this._errorMessage.next('');
    return this.http.put(url, item, {headers}).pipe(
        catchError(err => {
          // this._errorMessage.next(err);
          console.error('UPDATE ITEM', item, err);
          return this.getTbErrorRespFromErr(err);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  // UPDATE Status
  updateStatusForItems(ids: number[], status: number): Observable<any> {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const body = {ids, status};
    const url = this.API_URL + '/updateStatus';
    return this.http.put(url, body).pipe(
        catchError(err => {
          this._errorMessage.next(err);
          console.error('UPDATE STATUS FOR SELECTED ITEMS', ids, status, err);
          return of([]);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  // DELETE
  delete(id: any): Observable<any> {
    this._isLoading$.next(true);
    // this._errorMessage.next('');
    const url = `${this.API_URL}/${id}`;
    return this.http.delete(url).pipe(
        catchError(err => {
          // this._errorMessage.next(err);
          console.error('DELETE ITEM', id, err);
          return this.getTbErrorRespFromErr(err);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  // delete list of items
  deleteItems(ids: number[] = []): Observable<any> {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const url = this.API_URL + '/deleteItems';
    const body = {ids};
    return this.http.put(url, body).pipe(
        catchError(err => {
          this._errorMessage.next(err);
          console.error('DELETE SELECTED ITEMS', ids, err);
          return of([]);
        }),
        finalize(() => this._isLoading$.next(false))
    );
  }

  public fetch() {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const request = this.find(this._tableState$.value)
        .pipe(
            tap((res: TableResponseModel<T>) => {
              this._items$.next(res.items);
              this.patchStateWithoutFetch({
                paginator: this._tableState$.value.paginator.recalculatePaginator(
                    res.total
                ),
              });
            }),
            catchError((err) => {
              this._errorMessage.next(err);
              return of({
                items: [],
                total: 0
              });
            }),
            finalize(() => {
              this._isLoading$.next(false);
              const itemIds = this._items$.value.map((el: T) => {
                const item = (el as unknown) as BaseModel;
                return item.id;
              });
              this.patchStateWithoutFetch({
                grouping: this._tableState$.value.grouping.clearRows(itemIds),
              });
            })
        )
        .subscribe();
    this._subscriptions.push(request);
  }

  // begin::dft custom
  public dftFetch() {
    this._isLoading$.next(true);
    const request = this.find(this._tableState$.value)
        .pipe(
            tap((res: TableResponseModel<T>) => {
              this._items$.next(res.items);
              this.patchStateWithoutFetch({
                paginator: this._tableState$.value.paginator.recalculatePaginator(
                    res.total
                ),
              });
            }),
            catchError((err) => {
              // err phải đc convert sang TbErrorResp từ trc
              this.handleTbError(err);
              return of({
                items: [],
                total: 0
              });
            }),
            finalize(() => {
              this._isLoading$.next(false);
              const itemIds = this._items$.value.map((el: T) => {
                const item = (el as unknown) as BaseModel;
                return item.id;
              });
              this.patchStateWithoutFetch({
                grouping: this._tableState$.value.grouping.clearRows(itemIds),
              });
            })
        )
        .subscribe();
    this._subscriptions.push(request);
  }
  // end::dft custom

  public setDefaults() {
    this.patchStateWithoutFetch({filter: {}});
    this.patchStateWithoutFetch({sorting: new SortState()});
    this.patchStateWithoutFetch({grouping: new GroupingState()});
    this.patchStateWithoutFetch({searchTerm: ''});
    this.patchStateWithoutFetch({
      paginator: new PaginatorState()
    });
    this._isFirstLoading$.next(true);
    this._isLoading$.next(true);
    this._tableState$.next(DEFAULT_STATE);
    this._errorMessage.next('');
  }

  // Base Methods
  public patchState(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch();
  }

  public patchStateWithoutFetch(patch: Partial<ITableState>) {
    const newState = Object.assign(this._tableState$.value, patch);
    this._tableState$.next(newState);
  }

  // dft custom
  handleTbError(err: TbErrorResp) {
    switch (err.errorCode) {
      case TbErrorCode.UNKNOWN:
        alert('Lỗi không xác định');
        break;
      case TbErrorCode.GENERAL:
        alert('Hệ thống gặp lỗi trong quá trình xử lý');
        break;
      case TbErrorCode.AUTHENTICATION:
        alert('Lỗi xác thực');
        break;
      case TbErrorCode.JWT_TOKEN_EXPIRED:
        alert('Lỗi xác thực');
        break;
      case TbErrorCode.CREDENTIALS_EXPIRED:
        alert('Lỗi xác thực');
        break;
      case TbErrorCode.PERMISSION_DENIED:
        alert('Không đủ quyền truy cập');
        break;
      case TbErrorCode.INVALID_ARGUMENTS:
        alert('Dữ liệu gửi lên hệ thống không hợp lệ');
        break;
      case TbErrorCode.BAD_REQUEST_PARAMS:
        alert('Dữ liệu gửi lên hệ thống không hợp lệ');
        break;
      case TbErrorCode.ITEM_NOT_FOUND:
        alert('Không tìm thấy dữ liệu yêu cầu');
        break;
      case TbErrorCode.TOO_MANY_REQUESTS:
        alert('Lỗi quá nhiều request');
        break;
      case TbErrorCode.TOO_MANY_UPDATES:
        alert('Lỗi quá nhiều update');
        break;
      case TbErrorCode.SUBSCRIPTION_VIOLATION:
        alert('Lỗi kết nối socket');
        break;
      case TbErrorCode.NEWPASSWORD_SAME_OLDPASSWROD:
        alert('Lỗi mật khẩu cũ trùng mật khẩu mới');
        break;
      default:
        alert('Lỗi không xác định');
    }
  }

  getTbErrorRespFromErr(err: any) {
    let result: TbErrorResp;
    if (err.status === 0) {
      // client side or network err occur
      result = UNKNOWN_ERROR;
    } else {
      // backend err resp
      try {
        result = err.error;
      } catch (err) {
        result = UNKNOWN_ERROR;
      }
    }
    return throwError(result);
  }


}
