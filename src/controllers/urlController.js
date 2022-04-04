const UrlModel=require("../models/urlModel")
const validator=require("../validator/validator")
const shortid=require("shortid");
const validUrl=require("valid-url")

const shortUrlFun=async (req,res)=>{
    try{
        const data=req.body
        const baseUrl = req.headers.host
        if(!validUrl.isUri(baseUrl)){
            return res.status(401).send("internal error")
        }
        console.log(baseUrl)
        if(!validator.isRequestBody(data)){
            return res.status(400).send({status:false,message:"please provide data in request body "})
        }
        const {longUrl}=data
        if(!longUrl){
            return res.status(400).send({status:false,message:"please provide long url in body"})
        }

        const urlCode=shortid.generate(longUrl)
        const shortUrl=baseUrl+"/"+urlCode
        console.log(urlCode)

        if(!validUrl.isUri(longUrl)){
            return res.status(400).send({status:false,message:"please valid long url"})
        }

        var url=await UrlModel.findOne({longUrl:longUrl}).select({longUrl:1,shortUrl:1,urlCode:1})
        if(url){
            return res.status(200).json(url)
        }
        else{
            let obj={longUrl,shortUrl,urlCode}
            let saveData=await UrlModel.create(obj)
            let urlRes=await UrlModel.find(saveData).select({longUrl:1,shortUrl:1,urlCode:1})
            return res.status(201).send({status:false,message:"successfully created",data:urlRes})
        }



    }catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}

const getShortUrl=async (req,res)=>{
    try{
        let urlCode=req.params.urlCode
        if(!urlCode){
            return res.status(400).send({status:false,message:"please provide urlcode"})
        }
        let urlData=await UrlModel.findOne({urlCode:urlCode}).select({longUrl:1,shortUrl:1,urlCode:1})
        if(!urlData){
            return res.status(404).send({status:false,message:"not found"})
        }
        res.redirect(urlData.longUrl)
        // res.status(200).send({status:true,message:"successfull data",data:urlData})
    }catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}

module.exports={shortUrlFun,getShortUrl}