const querystring =require('querystring')
const { get, set } = require('./src/db/redis')
const handleUserRouter=require("./src/router/user")
const handleBlogRouter=require("./src/router/blog")

// dev:process.env.NODE_ENV

//创建cookie的时候设置cookie 的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

//用于处理postdata
const getPostData=(req)=>{
    const promise=new Promise((resolve,reject)=>{
        if(req.method!=="POST"){
            resolve({})
            return
        }
        if(req.headers["content-type"]!=="application/json"){
            resolve({})
            return 
        }
        let postData=''
        req.on('data',chunk=>{
            postData+=chunk.toString()
        })
        req.on('end',()=>{
            if(!postData){
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return  promise
}

const serverHandle=(req,res)=>{
        // 设置返回格式 JSON
        res.setHeader("content-type","application/json")

        //获取psth
        const url=req.url
        req.path=url.split("?")[0]
        
        // 解析 cookie
        req.cookie = {}
        const cookieStr = req.headers.cookie || ''  // k1=v1;k2=v2;k3=v3
        cookieStr.split(';').forEach(item => {
            if (!item) {
                return
            }
            const arr = item.split('=')
            const key = arr[0].trim()
            const val = arr[1].trim()
            req.cookie[key] = val
        })

        // // 解析 session
        // let needSetCookie = false
        // let userId = req.cookie.userId
        // if (userId) {
        //     if (!SESSION_DATA[userId]) {
        //         SESSION_DATA[userId]={}
        //     }
        // }else{
        //     needSetCookie=true
        //     userId = `${Date.now()}_${Math.random()}`
        //     SESSION_DATA[userId]={}
        // }
        // req.session=SESSION_DATA[userId]
        // console.log(req.session)

        

        //解析query
        req.query=querystring.parse(url.split("?")[1])

        //解析session
        let needSetCookie = false
        let userId = req.cookie.userId
        if (!userId) {
            needSetCookie = true
            userId = `${Date.now()}_${Math.random()}`
            // 初始化 redis 中的 session 值
            set(userId, {})
        }
        // 获取 session
        req.sessionId = userId
        get(req.sessionId).then(sessionData => {
            if (sessionData == null) {
                // 初始化 redis 中的 session 值
                set(req.sessionId, {})
                // 设置 session
                req.session = {}
            } else {
                // 设置 session
                req.session = sessionData
            }
            console.log('req.session ', req.session)

            // 处理 post data
            return getPostData(req)
        }).then(postData=>{
            req.body=postData
            const blogResult=handleBlogRouter(req,res)
            
            if(blogResult){
                blogResult.then(blogData=>{
                    if(needSetCookie){
                        res.setHeader('Set-Cookie',`userId=${userId};path=/;httpOnly;expres=${getCookieExpires()}`) 
                    }
                    res.end(JSON.stringify(blogData))
                })
                return
            }

            const userResult=handleUserRouter(req,res)
            if(userResult){
                userResult.then(userData=>{
                    if(needSetCookie){
                        res.setHeader('Set-Cookie',`userId=${userId};path=/;httpOnly;expres=${getCookieExpires()}`) 
                    }
                    res.end(JSON.stringify(userData))
                })
                return
            }
            
            res.writeHead(404,{"Contengt-type":"text/plain"})
            res.write('404 Not Found\n')
            res.end()
        })
        
}

module.exports=serverHandle