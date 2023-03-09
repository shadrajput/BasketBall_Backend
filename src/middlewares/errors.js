const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Wrong mongodb id error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400)
    }

    // Wrong JWT error
    if(err.name === "JsonWebTokenError"){
        const message = `Invalid token, try again`;
        err = new ErrorHandler(message,400)
    }

    // JWT EXPIRE error
    if(err.name === "TokenExpiredError"){
        const message = `Token is Expired, login and try again`;
        err = new ErrorHandler(message,400)
    }

    // PostgreSQL permission denied error
    if(err.statusCode == '42501'){
        const message = `Permission Denied`;
        err = new ErrorHandler(message, 400)
    }
    
    //Postgre connection failure
    if(err.statusCode == '08006' || err.statusCode == '08001' || err.statusCode == '58000' || err.statusCode == 'P0000' || err.statusCode == 'XX000'){
        const message = `Interner Serverl Error`;
        err = new ErrorHandler(message, 500)
    }
    
    //Datetime field overflow
    if(err.statusCode == '22008'){
        const message = `Interner Serverl Error`;
        err = new ErrorHandler(message, 500)
    }

    //Invalid DateTime format
    if(err.statusCode == '22007'){
        const message = `Invalid DateTime format`;
        err = new ErrorHandler(message, 500)
    }

    //Null value error
    if(err.statusCode == '39004'){
        const message = `Null value not allowed`;
        err = new ErrorHandler(message, 500)
    }    
                                
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}