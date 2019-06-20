const { exec }=require("../db/mysql")
const xss = require('xss')
//获取博客列表
const getList=(author,keyword)=>{
    let sql = `select * from blogs where 1=1 `
    if (author) {
        sql += `and author='${author}' `
    }
    if (keyword) {
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`

    // 返回 promise
    return exec(sql)
}

//获取博客详情
const getDetail=(id)=>{
    const sql = `select * from blogs where id='${id}'`
    return exec(sql).then(rows => {
        return rows[0]
    })
}

//新建博客
const newBlog=(blogData={})=>{
    const title = xss(blogData.title)
    const content = xss(blogData.content)
    const author = blogData.author
    const createTime = Date.now()

    // const sql = `
    //     insert into blogs (title, content, createtime, author)
    //     values ('${title}', '${content}', ${createTime}, '${author}');
    // `
    const sql = `
        insert into blogs (title, content, createtime, author)
        values ('${title}', '${content}', ${createTime}, '${author}');
    `

    return exec(sql).then(insertData => {
        return {
            id: insertData.insertId
        }
    })
}

//更新博客
const updateBlog=(id,blogData={})=>{
    const title = blogData.title
    const content = xss(blogData.content)

    const sql = `
        update blogs set title='${title}', content='${content}' where id=${id}
    `

    return exec(sql).then(updateData => {
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

//删除博客
const delBlog=(id,author)=>{
    //优化不删除数据，改变数据的状态 0代表没有删除 1代表已经删除
    // const sql = `delete from blogs where id='${id}' and author='${author}';`
    const sql = `delete from blogs where id='${id}';`
    return exec(sql).then(delData => {
        if (delData.affectedRows > 0) {
            return true
        }
        return false
    })
}
module.exports={
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}