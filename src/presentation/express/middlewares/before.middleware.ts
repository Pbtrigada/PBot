import { NextFunction, Request, Response } from "express";

export const beforeMiddleware = (req : Request ,res : Response, next : NextFunction) => {
    try {
        //console.log(`SERVER REQUEST ${req.method}: ${req.url}`);
        //return res.json({message : "PAUSED"});
        next();
    } catch(e) {
        next(e);
    }
}