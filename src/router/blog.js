const {SuccessModel,ErrorModel}=require('../model/resModel')
const {getList,getDetail,newBlog,updateBlog,delBlog}=require('../controller/blog')

// 统一的登录验证函数
const loginCheck = (req) => {
    if (!req.session.username) {
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}

const handleBlogRouter=(req,res)=>{
    const method=req.method
    const id = req.query.id
    //获取博客列表
    if(method==="GET"&&req.path==="/api/blog/list"){
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            return loginCheckResult
        }
        const author=req.query.author||''
        const keyword=req.query.keyword||''
        const result =getList(author,keyword)
        return result.then(listData=>{
            return new SuccessModel(listData)
        })
    }

    //获取博客详情
    if(method==="GET"&&req.path==="/api/blog/detail"){
        
        const result=getDetail(id)
        return result.then(data=>{
            return new SuccessModel(data)
        })
    }

    //新建一个博客
    if(method==="POST"&&req.path==="/api/blog/new"){
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            return loginCheckResult
        }

        const result=newBlog(req.body)
        return result.then(data=>{
            return new SuccessModel(data)
        })
        
    }

    //更新一个博客
    if(method==="POST"&&req.path==="/api/blog/update"){
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            // 未登录
            return loginCheckResult
        }

        const result=updateBlog(id,req.body)
        return result.then(val=>{
            if(val){
                return new SuccessModel(val)
            }else{
                return new ErrorModel('更新博客失败！')
            }
        })
        
    }

    //删除博客
    if(method==="POST"&&req.path==="/api/blog/del"){
        const author=req.session.username
        const result = delBlog(id,author)
        return result.then(val => {
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('删除博客失败')
            }
        })
    }
}
module.exports=handleBlogRouter