const Discord = require('discord.js');
const ayalar = require('../ayarlar.json');

exports.run = async (client, message, args) => { 

    const guild = message.member.guild

if (!message.member.hasPermission('ADMINISTRATOR')) return message.react(ayarlar.carpi)

if(!message.member.voice || message.member.voice.channelID != "katıldı rolü vericek kanal id") return; 
let üyeler = message.guild.members.cache.filter(member => member.roles.cache.has("silinecek id") && member.voice.channelID != "794636699190689843");
üyeler.array().forEach((member, index) => {
  setTimeout(() => {
    member.roles.remove("Silincek id").catch();
  }, index * 1250)
});

let katıldıverildi = message.member.voice.channel.members.filter(member => !member.roles.cache.has("katıldı id") && !member.user.bot)
katıldıverildi.array().forEach((member, index) => {
  setTimeout(() => {
    member.roles.add("katıldı id").catch();
  }, index * 1250)
});
message.channel.send(new Discord.MessageEmbed()
.setColor("RANDOM")
.setDescription(`**${katıldıverildi.size}** kadar kullanıcıya katıldı verdim, **${üyeler.size}** kadar kullanıcıdan ise aldım.`)).catch();
  
}
exports.conf = {
  aliases: ["katıldıver"]
}
exports.help = {
  name: "katıldı"
}