module.exports = class ApiError extends Error{
    constructor(message, status, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
    static ElasticError(message, status= 400, errors = [{externalService: 'elastic search'}]){
        return new ApiError(message, status, errors)
    }
    static BadRequest(message, status= 400, errors = []){
            return new ApiError(message,status, errors)
    }
}