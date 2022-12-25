/**
 * Console History v1.5.1
 * console-history.js
 *
 * Licensed under the MIT License.
 * https://git.io/console
 */
'use strict'

/* Allow only one instance of console-history.js */
if (typeof console.history !== 'undefined') {
    throw new Error('Only one instance of console-history.js can run at a time.')
}

/* Store the original log functions. */
console._log = console.log
console._info = console.info
console._warn = console.warn
console._error = console.error
console._debug = console.debug

/* Declare our console history variable. */
console.history = []

/* Redirect all calls to the collector. */
console.log = function(dt) {
    return console._intercept('log', dt, arguments)
}
console.info = function(dt) {
    return console._intercept('info', dt, arguments)
}
console.warn = function(dt) {
    return console._intercept('warn', dt, arguments)
}
console.error = function(dt) {
    return console._intercept('error', dt, arguments)
}
console.debug = function(dt) {
    return console._intercept('debug', dt, arguments)
}

/* Bigyan ang developer ng kakayahang maharang ang mensahe bago hayaan
   console-history i-access ito. */
console._intercept = function(type, data, args) {
    // Ang iyong sariling code ay maaaring pumunta dito, ngunit ang ginustong paraan ay i-override ito
    // function sa sarili mong script, at idagdag ang linya sa ibaba sa dulo o
    // simulan ang iyong sariling function na 'console._intercept'.
    // TANDAAN: Gumamit lamang ng mga underscore na console command sa loob ng _intercept!
    console._collect(type, data,args)
}

/* Tukuyin ang pangunahing tagasalo ng log. */
console._collect = function(type, data, args) {
    // BABALA: Kapag nagde-debug sa function na ito, HUWAG tumawag ng binagong console.log
    // function, lahat ng impiyerno ay mawawala.
    // Sa halip ay gamitin ang orihinal na console._log function.

    // Ang lahat ng mga argumento ay ipinasa sa anumang function, kahit na hindi tinukoy
    // sa loob ng deklarasyon ng function, ay naka-imbak at lokal na magagamit sa
    // ang variable na tinatawag na 'argument'.
    //
    // Ang mga argumento ng orihinal na console.log function ay kinokolekta sa itaas,
    // at ipinasa sa function na ito bilang variable na 'args', dahil ang 'arguments' ay
    // nakalaan para sa kasalukuyang function.

    // Kolektahin ang timestamp ng console log.
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

    var time = new Date().toLocaleDateString('vi-VN', options)

    // Tiyaking nakatakda ang parameter na 'uri'. Kung walang nakatakdang uri, babagsak tayo
    // bumalik sa default na uri ng log.
    if (!type) type = 'log'

    // Upang matiyak na kumikilos kami tulad ng orihinal na mga function ng console log, hindi namin ginagawa
    // mag-output ng kahit ano kung walang ibinigay na argumento.
    if (!args || args.length === 0) return

    // Kumilos nang normal, at ipasa lang ang lahat ng orihinal na argumento sa
    // ang orihinal na function ng console :)
    console['_' + type].apply(console, args)

    // Kumuha ng impormasyon ng stack trace. Sa pamamagitan ng paghagis ng isang error, nakakakuha kami ng access sa
    // isang stack trace. Pagkatapos ay umakyat kami sa trace tree at salain
    // walang kaugnayang impormasyon.
    var stack = false
    try {
        throw Error('')
    } catch (error) {
        // Ang mga linyang naglalaman ng 'console-history.js' ay hindi nauugnay sa amin.
        var stackParts = error.stack.split('\n')
        stack = []
        for (var i = 0; i < stackParts.length; i++) {
            if (stackParts[i].indexOf('console-history.js') > -1 ||
                stackParts[i].indexOf('console-history.min.js') > -1 ||
                stackParts[i] === 'Error') {
                continue
            }
            stack.push(stackParts[i].trim())
        }
    }
    try {
        data = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,'')
    }
    catch (e) {
        data = data;
    }
    // Idagdag ang log sa aming kasaysayan.
    console.history.push({
        type: type,
        timestamp: time,
        message: data,
        stack: stack
    })
}