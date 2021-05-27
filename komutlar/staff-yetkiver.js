const { MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json');
const moment = require('moment');

exports.run = async function(client, message, args) { 

if(!message.member.hasPermission("ADMINISTRATOR")) return message.react(ayarlar.carpi)

let embed = new MessageEmbed() .setColor("RANDOM") .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))

let kullanıcı = message.mentions.members.first() || message.guild.members.cache.get(args[0])

if(!kullanıcı) return message.channel.send(embed.setDescription(`Geçerli bir kullanıcı giriniz.`)).then(qwe => qwe.delete({ timeout: 5000}))

let verilecekrol = args[1]

if(!args[1]) { 
    message.channel.send(embed.setDescription(`
    Belirttiğiniz rol geçerli değil! Lütfen aşağıdaki verilere göre komutu uygulayınız.
    
    Rütbeler;
    \`admin\` - <@&834693445712609319>, <@&834693445712609318>
    \`teyitci\` - <@&834693445712609317>, <@&834693445712609316>

    Örnek kullanım;
    \`e!yetkiver <@Orchi/ID> admin\`
    \`e!yetkiver <@Orchi/ID> teyitci\`
    `))
}

if(verilecekrol === "admin") { 

kullanıcı.roles.add("834693445712609319")
kullanıcı.roles.add("834693445712609318")
message.channel.send(embed.setDescription(`<@${kullanıcı.id}> adlı üye, ${message.author} tarafından \`${verilecekrol}\` rütbesine yükseltildi!`))

}

if(verilecekrol === "teyitci") { 
   
    kullanıcı.roles.add("834693445712609317")
    kullanıcı.roles.add("834693445712609316")

    message.channel.send(embed.setDescription(`<@${kullanıcı.id}> adlı üye, ${message.author} tarafından \`${verilecekrol}\` rütbesine yükseltildi!`))

}

};

exports.conf = {
    aliases:[]
};

exports.help = {
    name:'yetkiver'
}