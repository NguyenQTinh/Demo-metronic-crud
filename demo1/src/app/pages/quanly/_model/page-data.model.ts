export interface PageData<T> {
    data: Array<T>;
    totalPages: number;
    totalElements: number;
    hasNext?: boolean;
}
