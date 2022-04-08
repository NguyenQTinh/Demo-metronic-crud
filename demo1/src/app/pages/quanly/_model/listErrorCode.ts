// @ts-ignore

export interface TbErrorResp {
    status?: number;
    message?: string;
    errorCode?: number;
    timestamp?: string;
}

// @ts-ignore
export enum TbErrorCode {
    UNKNOWN = 0,
    GENERAL = 2,
    AUTHENTICATION = 10, // 401 - Lỗi xác thực
    JWT_TOKEN_EXPIRED = 11, // 401 - Token hết hạn
    CREDENTIALS_EXPIRED = 15, // 401 - Quá thời gian xác thực
    PERMISSION_DENIED = 20, // 403 - Từ chối truy cập vào api
    INVALID_ARGUMENTS = 30, // 400 - Body không hợp lệ
    BAD_REQUEST_PARAMS = 31, // 400 - Param header không hợp lệ
    ITEM_NOT_FOUND = 32, // 404 - Không tìm thấy item
    TOO_MANY_REQUESTS = 33, // 429 - Quá nhiều request
    TOO_MANY_UPDATES = 34, // 429 - Quá nhiều update
    SUBSCRIPTION_VIOLATION = 40, // 403 - Lỗi kết nối (web socket)
    NEWPASSWORD_SAME_OLDPASSWROD = 41 // Lỗi  new password trùng old password
}

// tslint:disable-next-line:one-variable-per-declaration
export const UNKNOWN_ERROR: TbErrorResp = {
    status: 0, message: 'Hệ thống gặp lỗi không xác định',
    errorCode: TbErrorCode.UNKNOWN, timestamp: 'unknow'
};




