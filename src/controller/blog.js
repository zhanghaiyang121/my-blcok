//获取博客列表
const getList=(author,key)=>{
    return[
        {
            id:1,
            title:'标题A',
            content:'内容A',
            createTime:15444444444,
            author:'zhangsan'
        },
        {
            id:1,
            title:'标题A',
            content:'内容A',
            createTime:15444444444,
            author:'zhangsan'
        }
    ]
}

//获取博客详情
const getDetail=(id)=>{
    return {
        title:'博客a',
        content:"abcdef",
        date:'2019-6-7'
    }
}

//新建博客
const newBlog=(blogData={})=>{
    return {
        id:3
    }
}

//更新博客
const updateBlog=(id,blogData={})=>{
    return true
}

//删除博客
const delBlog=(id)=>{
    return true
}
module.exports={
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}