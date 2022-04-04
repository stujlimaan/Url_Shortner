const mongoose=require("mongoose");


const urlSchema=new mongoose.Schema({
    urlCode:{
        type:String,
        required:[true,"url code is required"],
        lowercase:true,
        trim:true,
        unique:true
    },
    longUrl:{
        type:String,
        required:[true,"longurl is required"],
        
    },
    shortUrl:{
        type:String,
        unique:true
    }


},{timestamps:true})

module.exports = mongoose.model("Url",urlSchema)