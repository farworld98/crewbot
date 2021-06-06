const { WAConnection } = require("@adiwajshing/baileys")
const qrcode = require("qrcode-terminal")
const moment = require("moment-timezone")
const fs = require("fs")
const time = moment().tz('Asia/Jakarta').format("HH:mm:ss")

require('./denz.js')
nocache('./denz.js', module => console.log(`'${module}' Updated!`))
nocache('./welcome.js', module => console.log(`'${module}' Updated!`))

async function starts() {
    const denz = new WAConnection()
    denz.on('qr', qr => {
        qrcode.generate(qr, { small: true })
        console.log(`[ ${time} ] Scan Pack`)
    })

    denz.on('credentials-updated', () => {
        const authInfo = denz.base64EncodedAuthInfo()
        console.log(`credentials updated!`)
    
        fs.writeFileSync('./QRnya.json', JSON.stringify(authInfo, null, '\t'))
    })
    
    fs.existsSync('./QRnya.json') && denz.loadAuthInfo('./QRnya.json')
    
    denz.connect();
	
	denz.on('group-participants-update', async (anu) => {
        require('./welcome.js')(denz, anu)
    })
    
	denz.on('message-new', async (mek) => {
        require('./denz.js')(denz, mek)
    })
    }
    
/**
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional> 
 */
function nocache(module, cb = () => { }) {
    console.log('Module', `'${module}'`, 'is now being watched for changes')
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

/**
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}
starts()
