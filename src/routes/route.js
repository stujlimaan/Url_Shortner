const express =require("express")
const router=express.Router()
const urlController=require("../controllers/urlController")

router.post("/url/shorten",urlController.shortUrlFun)
router.get("/:urlCode",urlController.getShortUrl)


module.exports=router