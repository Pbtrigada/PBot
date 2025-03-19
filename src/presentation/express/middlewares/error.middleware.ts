import { NextFunction, Request, Response } from "express";
import { ApiError } from "@app";




export const errorMiddleware = (err : any, req : Request, res : Response, next : NextFunction) => {
    if (err instanceof ApiError) {
        //console.log(`SERVER - ERROR ${err.status}  ${req.method} : ${req.url} ${err}`);
        res.status(Number(err.status)).json({
            messgae : err.message,
            errors : err.errors
        });
    } else {
        //console.log(`SERVER - ERROR 500  ${req.method} : ${req.url} ${err}`);
        res.status(500).json({
            message: "Server Error"
        });
    }
    return;
}