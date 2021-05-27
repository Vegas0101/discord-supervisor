const Discord = require("discord.js");
const qdb = require("quick.db");
const ayarlar = require("../ayarlar.json")

exports.run = async (client, message, args) => {
  if (!message.guild) return;
  const db = new qdb.table("Sunucuyaozel");

    if (message.author.id === message.guild.ownerID) {
        const approv = args[0]
        const appro = args[1]
        if (approv === "ekle") {
            var appr = await db.get(`Sunucuyaozel.yasaklitaglar`) || [];
            if (!await db.get(`Sunucuyaozel.yasaklitaglar`))
                appr = await db.set(`Sunucuyaozel.yasaklitaglar`, []);
            if (appro) {
                if (appr.includes(appro)) {
                    return message.reply(new Discord.MessageEmbed().setDescription(`Bu Tag Zaten Listede Bulunuyor.`)).then(x => x.delete({timeout: 10000}));
                } else {
                    await db.push(`Sunucuyaozel.yasaklitaglar`, appro)
                    let yasaktaglıüye = message.guild.members.cache.filter(u => u.user.username.includes(appro)).size;
                    message.channel.send(new Discord.MessageEmbed().setDescription(`**İşlem Başarılı **\n \`•\` ${appro} tagını yasakladınız. \n\`•\`Bu Tagdaki Üye Sayısı: ${yasaktaglıüye}`)).then(x => x.delete({timeout: 10000}));
                }
            } else {
                return message.react(ayarlar.carpi)
            }
        }
        if (approv === "sil") {
            var appr = await db.get(`Sunucuyaozel.yasaklitaglar`) || [];
            if (!await db.get(`Sunucuyaozel.yasaklitaglar`))
                appr = await db.set(`Sunucuyaozel.yasaklitaglar`, []);
            if (appro) {
                if (appr.includes(appro)) {
                    var arr = appr
                    tagkaldır(arr, appro)
                    await db.set(`Sunucuyaozel.yasaklitaglar`, arr);
                    let deni = message.guild.members.cache.filter(x => x.roles.cache.get('Yasaklı tag rol') && x.user.username.includes(appro))
                    deni.array().forEach(async (user, index) => {
                        setTimeout(async () => {
                        await user.roles.set(["kayıtsız rol id"]).catch(() => {}) // [] arasında 2 veya daha fazla kayıtsız rolunuz varsa "","" olarak yazın
                    }, index * 500)
                    })
                    return message.reply(new Discord.MessageEmbed().setDescription( `\`${appro}\` Tagını \`Yasaklı Tag\` listesinden çıkardın. \n \`${deni.size}\` kullanıcı kayıtsız rolüne aktarıldı.`)).then(x => x.delete({timeout: 10000}));
                } else {
                    return message.react(ayarlar.carpi)
                }
            } else {
                return message.react(ayarlar.carpi)
            }
        }
        if (approv === "liste") {
          let appr = await db.get(`Sunucuyaozel.yasaklitaglar`);
          if (!await db.get(`Sunucuyaozel.yasaklitaglar`))
              appr = await db.set(`Sunucuyaozel.yasaklitaglar`, []);
          message.channel.send(new Discord.MessageEmbed()
              .setColor("RANDOM")
              .addField('** Yasaklı Taglar **',` ${appr.map(x => {return {Id: x,Total: message.guild.members.cache.filter(u => u.user.username.includes(x)).size};}).sort((a, b) => b.Total - a.Total).splice(0, 15).map((user, index) => `\`${index + 1}.\` **${user.Id}** (\`${user.Total} kişi\`)`).join("\n") || "Yasaklı Tag Bulunamadı"}`))}
        if (!approv) {
            let appr = await db.get(`Sunucuyaozel.yasaklitaglar`);
            if (!await db.get(`Sunucuyaozel.yasaklitaglar`))
                appr = await db.set(`Sunucuyaozel.yasaklitaglar`, []);
            message.channel.send(new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setDescription(`
**Yasaklı Tag İşlemleri İçin**
**\`•\` ${ayarlar.prefix}yasaklı_tag ekle <tag>** 
\`•\` **${ayarlar.prefix}yasaklı_tag sil <tag>**
\`•\` **${ayarlar.prefix}yasaklı_tag liste **
`))
        }
    } else {
        return message.react(ayarlar.carpi)
    }
};
function tagkaldır(arr, value) { var index = arr.indexOf(value); if (index > -1) { arr.splice(index, 1); } return arr; }

exports.conf = {
    enabled: false,
    guildOnly: true,
    aliases: [],
    permLevel: 0
  };
  exports.help = {
    name: "yasaklı_tag",
    description: "",
    usage: ""
  };