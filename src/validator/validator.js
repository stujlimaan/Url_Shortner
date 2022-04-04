const isRequestBody=(value)=>{
    return Object.keys(value).length>0
}

module.exports.isRequestBody=isRequestBody