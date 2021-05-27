const chalk = require("chalk");
const moment = require("moment");
const Discord = require("discord.js");
const ayarlar = require("../ayarlar.json");
var prefix = ayarlar.prefix;

module.exports = client => {

  client.user.setStatus("dnd");
 client.user.setStatus('idle')

console.log(`[READY]: Bot **${client.user.tag}** olarak giriş yaptı.`)
 client.user.setActivity(`Serendia ❤️ Øʀcaιs`,  { type: `WATCHING` }) // Durumu değiştirmezseniz mutlu olurum ^^

};

