class ApiError extends Error{

    public statusCode: number;
    public message: string;
    public data: any = null;
    public success: boolean;
    public errors: Error[];

    constructor(
        statusCode: number,
        message= "Something went wrong",
        errors= [],
        stack = ""
    ){
        super(message)
        this.statusCode=statusCode
        this.message=message
        this.success=false;
        this.errors=errors

        if(stack){
            this.stack=this.stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export {ApiError}
