const UrlModel = require("../models/urlModel")
const validator = require("../validator/validator")
const shortid = require("shortid");
const validUrl = require("valid-url")
const redis = require("redis")
//import redis

const { promisify} = require("util");

//Connect to redis
const redisClient = redis.createClient(
    14646,
    "redis-14646.c212.ap-south-1-1.ec2.cloud.redislabs.com", {
        no_ready_check: true
    }
);
redisClient.auth("aNuaBnKDY5KPy2oyB36j7G7mnmcrJoLj", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const shortUrlFun = async (req, res) => {
    try {
        const data = req.body
        const baseUrl = req.headers.host
        if (!validUrl.isUri(baseUrl)) {
            return res.status(401).send("invalid baseurl")
        };
        console.log(baseUrl)

        if (!validator.isRequestBody(data)) {
            return res.status(400).send({
                status: false,
                message: "please provide data in request body "
            })
        };

        const {longUrl}=data

        if (!longUrl) {
            return res.status(400).send({
                status: false,
                message: "please provide long url in body"
            })
        };

        if (!validUrl.isUri(longUrl.trim())) {
            return res.status(400).send({
                status: false,
                message: "please valid long url"
            })
        };

        const cache = await GET_ASYNC(`${longUrl}`)
        const newCache = JSON.parse(cache)

        if (newCache) {
            console.log("cache");
            return res.status(201).send({
                status: true,
                data: newCache
            })
        };
      
          
        // final create a post request;
        let urlCode = shortid.generate().toLocaleLowerCase();
        const ExistUrlcode = await UrlModel.findOne({
            urlCode: urlCode
        })
        if (ExistUrlcode) {
            return res.status(400).send({
                status: false,
                message: `Urlcode already exist`
            })
        }
        let shortUrl = "http://" + baseUrl + "/" + urlCode;

        let obj = {
            longUrl,
            shortUrl,
            urlCode
        }
        let saveData = await UrlModel.create(obj)
        let urlRes = await UrlModel.findOne(saveData).select({
            longUrl: 1,
            shortUrl: 1,
            urlCode: 1,
            _id: 0
        })
        await SET_ASYNC (`${longUrl}`,JSON.stringify(urlRes))
        // await SET_ASYNC(`${urlCode}`,JSON.stringify(longUrl))
        //     await SET_ASYNC(`${longUrl}`,JSON.stringify(longUrl))

        return res.status(201).send({
            status: true,
            message: `Succesfully url is created`,
            data: urlRes
        });

    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        })
    }
};

const getShortUrl = async (req, res) => {
    try {
        let urlCode = req.params.urlCode

        if (!urlCode) {
            return res.status(400).send({
                status: false,
                message: "please provide urlcode"
            })
        }
        let shortCode = urlCode.trim().toLowerCase()
        //start caching storage
        let cahcedProfileData = await GET_ASYNC(shortCode)
        let parseLongUrl = JSON.parse(cahcedProfileData)

        if (parseLongUrl) {
            return res.status(302).redirect(parse.longUrl)
        } else {

            let urlData = await UrlModel.findOne({
                urlCode: urlCode
            }).select({
                longUrl: 1,
                shortUrl: 1,
                urlCode: 1
            })
            if (!urlData) {
                return res.status(404).send({
                    status: false,
                    message: "not found"
                })
            }
            res.status(302).redirect(urlData.longUrl)

        }
    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

module.exports = {
    shortUrlFun,
    getShortUrl
}