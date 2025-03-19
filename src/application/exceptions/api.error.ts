


export class ApiError extends Error {
    status : number | string;
    errors : any[];

    constructor(status? : number | string, message? : string, errors? : any[] | any) {
        super(message);
        this.status = status;
        if (errors) {
            this.errors = new Array<any>(errors)
        }
    }

    static Unathorized(message? : string) : ApiError {
        let mess : string = " ";
        if (!message) {
            mess = "Unathorized error" 
        } else {
            mess = message;
        } 
        return new ApiError(401,mess);
    }

    static BadRequest(message? : string, errors? : any[]) : ApiError {
        return new ApiError(400, message, errors);
    }

    static InternalError(message? : string ,errors? : any[]) : ApiError {
        return new ApiError(500, "Internal Server Error\n "+message, errors);
    }

    static Forbidden(errors? : any[]) : ApiError {
        return new ApiError(403,"No access", errors);
    }

    static NotFound (message? : string, errors? : any[]) : ApiError {
        let mess : string = " ";
        if (!message) {
            mess = "Not found" 
        } else {
            mess = message;
        } 
        return new ApiError(404, mess, errors);
    }

    static RateLimitExecced (message? : string, errors? : any[]) : ApiError {
        let mess : string = " ";
        if (!message) {
            mess = "Too many requests"; 
        } else {
            mess = message;
        } 
        return new ApiError(429, mess, errors);
    }
}
