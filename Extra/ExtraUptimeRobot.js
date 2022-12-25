const logger = require("../logger");
var { join } = require('path');
/**
 * Sinusuri nito kung tumatakbo ang proseso sa PM2, kung hindi, ini-install nito ang PM2, sinisimulan ito, at lalabas sa
 * proseso.
 * @returns ang logger.Normal na function.
 */

function PM2Mode () {
    if (!process.env.PM2) {
        const { execSync } = require('child_process');
        logger.Normal(global.Fca.Require.Language.ExtraUpTime.PM2);
        execSync('npm i https://github.com/HarryWakazaki/Pm2-Horizon-Remake -g', { stdio: 'inherit'}); //paano ang sudo sa linux 🐧
        execSync(`pm2 start ${join(__dirname, "/PM2/ecosystem.config.js")} --no-daemon`, { stdio: 'inherit' }); //Hindi iyon ang katapusan.
        process.exit();
    }
    else return logger.Normal(global.Fca.Require.Language.ExtraUpTime.InPm2Mode);
}

/* Sinusuri nito kung tumatakbo ang proseso sa PM2, kung hindi, ini-install nito ang PM2, sinisimulan ito, at lalabas
ang proseso.*/
module.exports = function() {
    var Logger = global.Fca.Require.logger;
    switch (process.platform) {
        case 'win32':
            var Value = global.Fca.Require.FastConfig;
                if (Value.Uptime) {
                    return PM2Mode();
                }
            break;
        case 'darwin':
            var Value = global.Fca.Require.FastConfig;
            if (Value.Uptime) {
                return PM2Mode();
            }
            break;
        case 'linux':
            if (process.env.REPL_SLUG) {
                var Value = global.Fca.Require.FastConfig;
                var Fetch = global.Fca.Require.Fetch;
                    if (Value.Uptime) {
                        logger.Normal(global.Fca.Require.Language.ExtraUpTime.Uptime);//
                        return setInterval(function() {
                            Fetch.get(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
                        },10*1000);
                    }
                else return;
            }
            else { 
                var Value = global.Fca.Require.FastConfig;
                if (Value.Uptime) {
                    return PM2Mode();
                }
            }  
            break;
        default:
        Logger.Warning(global.Fca.Require.Language.ExtraUpTime.NotSupport);
    }
};