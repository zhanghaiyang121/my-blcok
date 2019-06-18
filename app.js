const querystring =require('querystring')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')
const handleUserRouter=require("./src/router/user")//处理user路由
const handleBlogRouter=require("./src/router/blog")//处理blog路由

//设置cookie 的过期时间的方法
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (2 * 60 * 60 * 1000))
    return d.toGMTString()
}

//处理postdata的方法
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
    //记录access_log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

    // 设置返回格式 JSON
        res.setHeader("content-type","application/json")

        //获取psth
        const url=req.url
        req.path=url.split("?")[0]

        //解析query
        req.query=querystring.parse(url.split("?")[1])
        
        // 解析 cookie
        req.cookie = {}
        const cookieStr = req.headers.cookie || ''  // k1=v1;k2=v2;k3=v3
        // console.log(req.headers.cookie.getMaxAge())
        cookieStr.split(';').forEach(item => {
            if (!item) {
                return
            }
            const arr = item.split('=')
            const key = arr[0].trim()
            const val = arr[1].trim()
            req.cookie[key] = val
        })

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

            // 处理 post data
            return getPostData(req)
        }).then(postData=>{
            req.body=postData

            const blogResult=handleBlogRouter(req,res)
            console.log(blogResult)
            if(blogResult){
                blogResult.then(blogData=>{
                    console.log(blogData)
                    if(needSetCookie){
                        res.setHeader('Set-Cookie',`userId=${userId};path=/;httpOnly;expires=${getCookieExpires()}`) 
                    }
                    res.end(JSON.stringify(blogData))
                })
                return
            }

            const userResult=handleUserRouter(req,res)
            if(userResult){
                userResult.then(userData=>{
                    if(needSetCookie){
                        res.setHeader('Set-Cookie',`userId=${userId};path=/;httpOnly;expires=${getCookieExpires()}`) 
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