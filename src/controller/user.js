const { exec} = require('../db/mysql')
const loginCheck=(username,password)=>{
    const sql = `
        select username, realname from users where  password='${password}' and username='${username}'
    `
    console.log(sql)
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}


module.exports={
    loginCheck
}