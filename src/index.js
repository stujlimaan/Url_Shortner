const express=require("express")
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
const route=require("./routes/route")

const app=express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb+srv://Tujli:mst@cluster0.hlfbs.mongodb.net/BookManagement?retryWrites=true&w=majority",{
    useNewUrlParser:true
})
.then(()=>{console.log("mongodb is connected")})
.catch((err)=>{console.log(err.message)})

app.use("/",route);

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log(`server is running at ${port}`)
})