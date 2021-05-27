const Discord = require('discord.js')
const ayarlar = require('../ayarlar.json')
 
exports.run = async(client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR")) return message.react(ayarlar.carpi)
  
  if(!args[0]) return message.reply(`:x: Rol verilecek kullanıcıların, adında bulunması gereken etiket giriniz! => \`${ayarlar.prefix}tagyetki @rol/rol id\``)
  let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1])
  if(!role) return message.reply(`:x: Kullanıcı adında etikete bulunan kullanıcılara verilecek rolü belirtiniz! => \`${ayarlar.prefix}tagyetki @rol/rol id\``)
  
  try {
    let rolveriliyor = await message.channel.send(`Kullanıcı adında etiket olup, belirtilen role sahip olmayan kişi sayısı: ${message.guild.members.cache.filter(x => (x.user.username).includes(args[0]) && !x.roles.cache.has(role.id)).size} \nRolleri veriliyor...`);
    await message.guild.members.cache.filter(x => (x.user.username).includes(args[0]) && !x.roles.cache.has(role.id)).forEach(a => a.roles.add(role.id));
    await rolveriliyor.edit(`Belirtilen etikete sahip kullanıcılara **(${message.guild.members.cache.filter(x => (x.user.username).includes(args[0]) && !x.roles.cache.has(role.id)).size} kişiye)**  \`${message.guild.roles.cache.get(role.id).name}\`  rolünü başarıyla verdim!`);
  } catch(err) { 
      message.reply("İşlem başarısız. Yetkilerimi kontrol ediniz.")
  }
}
 
exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
};
 
exports.help = {
  name: 'tagyetki',
  description: 'Belirtilen taga sahip kullanıcılara belirtilen rolü verir.',
  usage: 'tagyetki [tag] [rol]'
};