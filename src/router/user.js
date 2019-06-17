const {SuccessModel,ErrorModel}=require('../model/resModel')
const {login}=require('../controller/user')
const { set } = require('../db/redis')


const handleUserRouter=(req,res)=>{
    const method=req.method
    
    if(method==="POST"&&req.path==="/api/user/login"){
        const {username,password}=req.body
        const result=login(username,password)
        return result.then(data=>{
            if(data.username){
                req.session.username=data.username
                req.session.realname=data.realname

                // 同步到 redis
                set(req.sessionId, req.session)
                return new SuccessModel(data)
            }else{
                return new ErrorModel('登录失败')
            }
        })
        
    }
}

module.exports=handleUserRouter