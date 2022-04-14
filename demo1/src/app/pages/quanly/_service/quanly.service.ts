import {Injectable, OnDestroy} from '@angular/core';
import {ITableState, TableResponseModel, TableService} from '../../../_metronic/shared/crud-table';
import {QuanlyModel} from '../_model/quanly.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {PageData} from '../_model/page-data.model';
import {catchError, map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

// hoặc dùng đường dẫn ở file eviroment.apiUrl
// ở dưới đang chỉ thẳng đến nhanh hơn,
// const DOMAIN = environment.apiUrl; // ko dùng = cách này

export class QuanlyService extends TableService<QuanlyModel> implements OnDestroy {

    // @ts-ignore
    constructor(public http: HttpClient) {
        super(http);
    }

    token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzeXNhZG1pbkB0aGluZ3Nib2FyZC5vcmciLCJzY29wZXMiOlsiU1lTX0FETUlOIl0sInVzZXJJZCI6ImRkOWM5ZmMwLTU3NjctMTFlYy1hMTQxLWExZjM4MTFhMjQ2ZCIsImZpcnN0TmFtZSI6IiIsImxhc3ROYW1lIjoiU1lTVEVNIEFETUlOIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAiLCJpc3MiOiJ0aGluZ3Nib2FyZC5pbyIsImlhdCI6MTY0OTkyMTIyNywiZXhwIjoxNjQ5OTMwMjI3fQ.P3L_W90ivg4Vv42m2CP7LMTttWhZCl95hWyIBxaTgDjS_ph1V1HyyU_1phXLjp2kTEGFGkUShTJYwXcGtlxyow';

    apiCommon = 'http://123.30.214.139:17104/api/mange/group-service';

    // Phân trang
    public getPage(tableState: ITableState): Observable<TableResponseModel<QuanlyModel>> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        const url = `${this.apiCommon}?${this.getQuery(tableState)}`;
        console.log(url);
        // @ts-ignore
        return this.http.get<PageData<QuanlyModel>>(url, {headers}).pipe(
            map((resp: PageData<QuanlyModel>) => {
                const result: TableResponseModel<QuanlyModel> = {
                    items: resp.data,
                    total: resp.totalElements
                };
                return result;
            }),
            catchError(err => {
                console.error('ERROR', err);
                return err;
            })
        );
    }

    // custom find
    find(tableState: ITableState): Observable<TableResponseModel<QuanlyModel>> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);

        const url = `${this.API_URL}${this.getQuery(tableState)}`;
        return this.http.get<any>(url, {headers}).pipe(
            map((res) => {
                const result: TableResponseModel<QuanlyModel> = {
                    items: res.data,
                    total: res.totalElements
                };
                return result;
            }),
            catchError(err => {
                console.error('FIND ITEMS', err);
                return of({items: [], total: 0});
            })
        );
    }

    // creatManage(id: any): Observable<QuanlyModel> {
    //     let headers = new HttpHeaders();
    //     headers = headers.set('Authorization', `Bearer ${this.token}`);
    //     // @ts-ignore
    //     return this.http.post<any>(`${this.apiCommon}`, {headers});
    // }

    creatManage(data: QuanlyModel): Observable<QuanlyModel> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        // @ts-ignore
        // return this.http.post<QuanlyModel>(`${this.apiCommon}`, data, {headers});
        return this.http.post(`${this.apiCommon}`, data, {headers});
    }

    // updateManage(id: any): Observable<QuanlyModel> {
    //     let headers = new HttpHeaders();
    //     headers = headers.set('Authorization', `Bearer ${this.token}`);
    //     // @ts-ignore
    //     return this.http.put<QuanlyModel>(`${this.apiCommon}/${id}`, {headers});
    // }

    updateManage(quanlyModel: QuanlyModel): Observable<QuanlyModel> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        // @ts-ignore
        return this.http.put(`${this.apiCommon}/${quanlyModel.id}`, quanlyModel, {headers});
    }

    deleteManage(id: any): Observable<QuanlyModel> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        // @ts-ignore
        return this.http.delete<QuanlyModel>(`${this.apiCommon}/${id}`, {headers});
    }

    getById(id: any): Observable<QuanlyModel> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        // @ts-ignore
        return this.http.get<QuanlyModel>(`${this.apiCommon}/${id}`, {headers});
    }

    // lấy tất cả
    public getAll(): Observable<QuanlyModel[]> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        // @ts-ignore
        return this.http.get<any>(this.apiCommon + '/all', {headers});
    }

    // lấy All Max Day Storage
    public getAllMaxDayStorage(): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.set('Authorization', `Bearer ${this.token}`);
        // @ts-ignore
        return this.http.get<any>(this.apiCommon + '/max-day-storage', {headers});
    }

    handleError(err) {
        if (err.error instanceof Error) {
            console.log(`Client-side error: ${err.error.message}`);
        } else {
            console.log(`Sever-side error: ${err.status} - ${err.error}`);
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sb => sb.unsubscribe());
    }
}


