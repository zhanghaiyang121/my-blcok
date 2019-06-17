const { exec,escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')
const login=(username,password)=>{
    username=escape(username)
    password=genPassword(password)
    password=escape(password)
    const sql = `
        select username, realname from users where  password=${password} and username=${username}
    `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}


module.exports={
    login
}