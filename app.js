const querystring =require('querystring')
const handleUserRouter=require("./src/router/user")
const handleBlogRouter=require("./src/router/blog")

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
        res.writeHead(200,{"content-type":"application/json"})
        // dev:process.env.NODE_ENV

        //获取psth
        const url=req.url
        req.path=url.split("?")[0]

        
        //解析query
        req.query=querystring.parse(url.split("?")[1])
        //处理postData
        getPostData(req).then(postData=>{
            req.body=postData
            const blogResult=handleBlogRouter(req,res)
            
            if(blogResult){
                blogResult.then(blogData=>{
                    res.end(JSON.stringify(blogData))
                })
                return
            }

            const userResult=handleUserRouter(req,res)
            if(userResult){
                userResult.then(userData=>{
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