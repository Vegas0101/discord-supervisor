const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const snekfetch = require('snekfetch');

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`[KOMUT]: '${props.help.name}' adlı komut yüklendi!`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

fs.readdir("./events/", (err, files) => {
  if (err) console.error(err);
  files.forEach(f => {
    let props = require(`./events/${f}`);
    log(`[EVENT]: '${f}' adlı event yüklendi!`);
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
if (!message.guild) {
return;
}
let permlvl = 0;
if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
if (message.author.id === ayarlar.sahip) permlvl = 4;
return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
client.on('warn', e => {
console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});
client.on('error', e => {
console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

Date.prototype.toTurkishFormatDate = function (format) {
  let date = this,
    day = date.getDate(),
    weekDay = date.getDay(),
    month = date.getMonth(),
    year = date.getFullYear(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();

  let monthNames = new Array("Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık");
  let dayNames = new Array("Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi");

  if (!format) {
    format = "dd MM yyyy | hh:ii:ss";
  };
  format = format.replace("mm", month.toString().padStart(2, "0"));
  format = format.replace("MM", monthNames[month]);
  
  if (format.indexOf("yyyy") > -1) {
    format = format.replace("yyyy", year.toString());
  } else if (format.indexOf("yy") > -1) {
    format = format.replace("yy", year.toString().substr(2, 2));
  };
  
  format = format.replace("dd", day.toString().padStart(2, "0"));
  format = format.replace("DD", dayNames[weekDay]);

  if (format.indexOf("HH") > -1) format = format.replace("HH", hours.toString().replace(/^(\d)$/, '0$1'));
  if (format.indexOf("hh") > -1) {
    if (hours > 24) hours -= 24;
    if (hours === 0) hours = 24;
    format = format.replace("hh", hours.toString().replace(/^(\d)$/, '0$1'));
  };
  if (format.indexOf("ii") > -1) format = format.replace("ii", minutes.toString().replace(/^(\d)$/, '0$1'));
  if (format.indexOf("ss") > -1) format = format.replace("ss", seconds.toString().replace(/^(\d)$/, '0$1'));
  return format;
};

const invites = {};
const wait = require("util").promisify(setTimeout);
client.on('ready', () => {
    wait(1000);
    client.guilds.cache.forEach(g => {
        g.fetchInvites().then(guildInvites => {
            invites[g.id] = guildInvites;
        });
    });
})

client.on("guildMemberAdd", async member => {
  require('moment-duration-format');
  const user = client.users.cache.get(member.id);

    const kurulus = user.createdAt.getTime(); 
    moment.locale("tr"); 
   const gecen = moment.duration(new Date().getTime() - user.createdAt.getTime()).format(` YY **[Yıl,]** DD **[Gün,]** HH **[Saat,]** mm **[Dakika,]** ss **[Saniye]**`) 

  var kontrol;
  if (kurulus < 1036800000)
    kontrol = `Güvenilir Değil ${ayarlar.yukleniyor}`;
  if (kurulus > 1036800000)
    kontrol = `Güvenilir ${ayarlar.yeah}`;

   member.roles.add(ayarlar.kayıtsız)

    member.guild.fetchInvites().then(async guildInvites => {
        const ei = invites[member.guild.id];
        invites[member.guild.id] = guildInvites;
        const veri = await guildInvites.find(i => (ei.get(i.code) == null ? (i.uses - 1) : ei.get(i.code).uses) < i.uses);
        var daveteden;
        if (!veri) daveteden = "Bulunamadı"
        else daveteden = member.guild.members.cache.get(veri)
        var b = veri.guild.vanityURLCode
        if (!b) b = veri.code
        if (veri.code == b) daveteden = member.guild.members.cache.get(veri.inviter.id)
        else daveteden = member.guild;
        db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, +1);
        db.add(`toplam.${daveteden.id}.${member.guild.id}`, +1);
        db.add(`günlük.${daveteden.id}.${member.guild.id}`, +1)
        let zaman = require("moment").duration(new Date().getTime() - client.users.cache.get(member.id).createdAt.getTime())
        if (zaman < 1036800000) {
            db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, -1);
            db.add(`fake.${daveteden.id}_${member.guild.id}`, +1);
        }
        db.set(`veri.${member.id}.${member.guild.id}`, daveteden.id);
        let a = await db.fetch(`davetsayi.${daveteden.id}.${member.guild.id}`);
        let davetsayi;
        if (!a) { davetsayi = 0; } else { davetsayi = await db.fetch(`davetsayi.${daveteden.id}.${member.guild.id}`); }
        var y;
        if (daveteden.id == member.guild.id) y = "Özel URL"
        else y = daveteden

client.channels.cache.get("836133099855282196").send(`
${ayarlar.donenkalp} Sunucumuza hoşgeldin ${member}! (<@${y.id}> - \`${daveteden.id}\`) tarafından davet edildin.(\`${davetsayi} davet\` ${ayarlar.tik})

${ayarlar.yukleniyor2} Hesabın \`${new Date(kurulus).toTurkishFormatDate()}\` **(**${gecen}**)** tarihinde kurulmuş, **${kontrol}**.

${ayarlar.hyp} Kayıt olmak için **<@&${ayarlar.kayıtcı}>** rolündeki yetkililer seninle ilgilenecektir.

${ayarlar.stars} Sohbet etmeye başlamadan önce **<#834327007134744606>** kanalındaki kuralları okumanı tercih ederim.

Seninle beraber ${client.emojili(`${member.guild.memberCount}`)} kişiye ulaştık ${ayarlar.tadaa}.
`)

client.channels.cache.get("842671682891939860").send(new Discord.MessageEmbed()
.setColor("GREEN")
.setDescription(`${member} adlı kullanıcı ${y} tarafından davet edildi. **(**${davetsayi} davet ${ayarlar.tik}**)**`)
)

    })
})

client.on("guildMemberRemove", async member => {
  const user = client.users.cache.get(member.id);

  member.guild.fetchInvites().then(async guildInvites => {
      const veri = await db.fetch(`veri.${member.id}.${member.guild.id}`);
      var daveteden;
      if (!veri) daveteden = "Bulunamadı"
      else daveteden = member.guild.members.cache.get(veri)

      var y;
      if (daveteden.id == member.guild.id) y = "Özel URL"
      const davetsayi = await db.fetch(`davetsayi.${daveteden.id}.${member.guild.id}`);

      let zaman = require("moment").duration(new Date().getTime() - client.users.cache.get(member.id).createdAt.getTime())

        let ayrılan = db.fetch(`ayrılan.${daveteden.id}.${member.guild.id}`)
      
      if (zaman < 1296000000) {
          db.add(`fake.${daveteden.id}.${member.guild.id}`, -1);
          db.add(`günlük.${daveteden.id}.${member.guild.id}`, -1);
          client.channels.cache.get("842671682891939860").send(new Discord.MessageEmbed()
.setColor("GREEN")
.setDescription(`${member} adlı kullanıcı ayrıldı. ${daveteden || "Bilinmeyen kullanıcı"} tarafından davet edildi. **(**${davetsayi || "0"} davet ${ayarlar.carpi}**)**`)
)
          db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, -1);
          db.add(`ayrılan.${daveteden.id}.${member.guild.id}`, +1);
          if (veri) {
              db.delete(`veri.${member.id}.${member.guild.id}`);
          }
      } else {
          db.add(`davetsayi.${daveteden.id}.${member.guild.id}`, -1);
          client.channels.cache.get("842671682891939860").send(new Discord.MessageEmbed()
.setColor("GREEN")
.setDescription(`${member} adlı kullanıcı ayrıldı. ${daveteden || "Bilinmeyen kullanıcı"} tarafından davet edildi. **(**${davetsayi || "0"} davet ${ayarlar.carpi}**)**`)
)
          if (veri) {
            db.delete(`veri.${member.id}.${member.guild.id}`);
          }
      }
  })
});



client.on("messageDelete", async message => {
  const cdb = require("quick.db")
      if (message.author.bot) return;
      if (message.content.length > "200") {
          cdb.push(`snipe.${message.guild.id}`, {
              authors: message.author.username,
              contents: "Silinen mesaj 200 karakteri aşıyor!",
              tarih: Date.now()
          })
      } else {
          cdb.push(`snipe.${message.guild.id}`, {
              authors: message.author.username,
              contents: message.content,
              tarih: Date.now()
          })
      }
  })

  Promise.prototype.sil = function(time) {
    if (this) this.then(s => {
        if (s.deletable) s.delete({ timeout: time * 1000 });
    });
};

  function afkSil(message, afk, isim) {
    message.channel.send(`${message.author} Artık **AFK** değilsiniz.`);
    db.delete(`afkSebep_${afk.id}_${message.guild.id}`)
    db.delete(`afkid_${afk.id}_${message.guild.id}`)
    db.delete(`afkAd_${afk.id}_${message.guild.id}`)
    db.delete(`afk_süre_${afk.id}_${message.guild.id}`)
    message.member.setNickname(isim)
  };
  

  client.on("message" , async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    var fd = false
    var sdd = new Set();
    let afk = message.mentions.users
    if (afk.first()) {
      afk.forEach(async afk => {
        if (sdd.has(afk.id)) return;
        else sdd.add(afk.id)
        var kisi = db.fetch(`afkid_${afk.id}_${message.guild.id}`)
        var kisi2 = db.fetch(`afkid_${message.member.id}_${message.guild.id}`)
        if (kisi) {
          var isim = db.fetch(`afkAd_${afk.id}_${message.guild.id}`)
          if (kisi2) {
            fd = true
            afkSil(message, message.member, isim)
          }
          if (afk.id == message.member.id) {
            if (!fd) afkSil(message, afk, isim)
          }
          if (afk.id !== message.member.id) {
            var sebep = db.fetch(`afkSebep_${afk.id}_${message.guild.id}`)
            if (sebep) {
              let süre = await db.fetch(`afk_süre_${afk.id}_${message.guild.id}`);
              let ms = require('ms')
              let timeObj = ms(Date.now() - süre)
              .replace("s", "saniye")
              .replace("m", "dakika")
              .replace("h", "saat")
              .replace("d", "gün")
              message.channel.send(`${afk} kullanıcısı şu an da AFK! \`${timeObj}\`
Sebep: ${sebep}`);
            };
          }
        } else {
          afk = message.member
          kisi = db.fetch(`afkid_${message.member.id}_${message.guild.id}`)
          if (kisi) {
            var isim = db.fetch(`afkAd_${afk.id}_${message.guild.id}`)
            if (afk.id == message.member.id) {
              afkSil(message, afk, isim)
            }
            if (afk.id !== message.member.id) {
              var sebep = db.fetch(`afkSebep_${afk.id}_${message.guild.id}`)
              if (message.content.includes(kisi)) {
                if (sebep) {
                  let süre = await db.fetch(`afk_süre_${afk.id}_${message.guild.id}`);
                  let timeObj = ms(Date.now() - süre);
                  message.channel.send(`${afk} kullanıcısı şu an da AFK! \`${timeObj}\`
                  Sebep: ${sebep}`);
                };
              }
            }
          }
        }
      })
    } else {
      afk = message.member
      var kisi = db.fetch(`afkid_${afk.id}_${message.guild.id}`)
      if (!kisi) return;
      var isim = db.fetch(`afkAd_${afk.id}_${message.guild.id}`)
      afkSil(message, afk, isim)
    }
  });

  client.on('guildMemberAdd', async member => {
    const reklamisim = ["j4j","discord.gg/", "https://discord.gg", "invite", "join"]; 


     if (reklamisim.some(word => member.user.username.includes(word)) ) { 
        member.ban({ 
            reason: `İsminde reklam olduğundan dolayı banlandı.`, 
          }) 
   } 

  });

  client.on("message", async message => {
    if (message.member.hasPermission('MANAGE_GUILD')) return;
    let links = message.content.match(/(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi);
    if (!links) return;
    if (message.deletable) message.delete();
})

client.on("message", async message => {
  if(message.channel.type === "dm") return;
  if(message.member.hasPermission("ADMINISTRATOR")) return;
 let reklamlar = ["https://discord.gg/","gg/",".gg/","dc.gg/","discord.gg/","https://"]
 if(message.content.toLowerCase() === reklamlar)
 message.delete();
})


client.on("guildMemberAdd", member => {
  member.setNickname(`• İsim ' Yaş`) 
  });

client.on('userUpdate', async (oldUser, newUser) => {
  if(oldUser.username == newUser.username || oldUser.bot || newUser.bot) return;
  let Guild = client.guilds.cache.get("SUNUCU ID")
  let member = Guild.members.cache.get(oldUser.id);
  if(["tag", "tag"].some(isim => member.user.username.includes(isim)) && !member.roles.cache.has(ayarlar.TagRolu)){
  member.roles.add("TAG ID").catch();
  }
    if(["etiket tag", "etiket tag"].some(tag => member.user.discriminator.includes(tag)) && !member.roles.cache.has(ayarlar.TagRolu)){
  member.roles.add("TAG ID").catch();
}
});

client.on('userUpdate', async (oldUser, newUser) => {
  if(oldUser.username == newUser.username || oldUser.bot || newUser.bot) return;
  let Guild = client.guilds.cache.get("SUNUCU ID")
  let member = Guild.members.cache.get(oldUser.id);
  if(!["tag", "tag"].some(isim => member.user.username.includes(isim))){
  member.roles.remove("TAG ID").catch();
  }
  if(!["etiket tag", "etiket tag"].some(tag => member.user.discriminator.includes(tag)) && !member.roles.cache.has(ayarlar.TagRolu)){
  member.roles.remove("TAG ID").catch();
}
});

           const numbers = {
            "8":"<a:8_:838373413693030431>",
            "9":"<a:9_:838373413747163147>",
            "4":"<a:4_:838373413981650954>",
            "6":"<a:6_:838373413994627123>",
            "2":"<a:2_:838373413998559242>",
            "1":"<a:1_:838373414015729694>",
            "5":"<a:5_:838373414040764429>",
            "7":"<a:7_:838373414074449980>",
            "0":"<a:0_:838373414187040787>",
            "3":"<a:3_:838373414187302932>"
          };
          
          client.emojili = function(sayi) {
            var qwe = "";
            var arr = Array.from(sayi);
            for (var x = 0; x < arr.length; x++) {
              qwe += (numbers[arr[x]] === "" ? arr[x] : numbers[arr[x]]);
            }
            return qwe;
          };


             client.on("message", async message => {
              if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(ayarlar.prefix)) return;
              if (message.author.id !== ayarlar.sahip && message.author.id !== message.guild.owner.id) return;
              let args = message.content.split(' ').slice(1);
              let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
              let embed = new Discord.MessageEmbed().setColor("#00ffdd").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true, })).setFooter(`${client.users.cache.has(ayarlar.sahip) ? client.users.cache.get(ayarlar.sahip).tag : "Orchais"} was here.`).setTimestamp();
              
              // Eval qwe
              if (command === "eval" && message.author.id === ayarlar.sahip) {
                if (!args[0]) return message.channel.send(`Kod belirtilmedi`);
                  let code = args.join(' ');
                  function clean(text) {
                  if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
                  text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
                  return text;
                };
                try { 
                  var evaled = clean(await eval(code));
                  if(evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, "Yasaklı komut");
                  message.channel.send(`${evaled.replace(client.token, "Yasaklı komut")}`, {code: "js", split: true});
                } catch(err) { message.channel.send(err, {code: "js", split: true}) };
              };
            
            });
            
client.on("ready", async() => { 
  client.channels.cache.get("834693445863079939").join().then(console.log("Bot ses kanalına bağlandı.")).catch((err) => client.channels.cache.get("835923617522384926").send(err))
})

client.on('channelDelete',async channel => {
  const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first())

let kisi = channel.guild.member(entry.executor);
kisi.roles.cache.forEach(x => kisi.roles.remove(x.id))
kisi.roles.set([ayarlar.jailRol])

let kategoriID = channel.parentID;
channel.clone(this.name, true, true).then(z => {
z.setParent(z.guild.channels.cache.find(channel => channel.id === kategoriID))
channel.guild.owner.send(`${entry.executor} Denilen ibne çok akıllı çıktı :D? Sunucuda kanal silmeye çalıştı ve yeniden kurdum :sunglasses::thumbsup:`)   
});

}); 


client.on("message", async msg => {
  
         const kufur = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
         if (kufur.some(word => msg.content.includes(word))) {
           try {

               if(msg.channel.type === "dm") return;

             if (!msg.member.hasPermission("BAN_MEMBERS")) {
                   msg.delete();
                           
                       return msg.channel.send(new Discord.MessageEmbed().setDescription(`${msg.author} Bu sunucuda küfür filtresi etkin.`).setColor('0x800d0d').setAuthor(msg.member.displayName, msg.author.avatarURL({ dynamic: true })).setTimestamp()).then(x => x.delete({timeout: 5000}));
             }              
           } catch(err) {
             console.log(err);
           }
         }
     
 });
 
 client.on("messageUpdate", (oldMessage, newMessage) => {
   
         const kufur = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq","amguard","seksüel","sekssüel"];
         if (kufur.some(word => newMessage.content.includes(word))) {
           try {
             if (!oldMessage.member.hasPermission("BAN_MEMBERS")) {
                   oldMessage.delete();
                           
                       return oldMessage.channel.send(new Discord.MessageEmbed().setDescription(`${oldMessage.author} Mesajını düzenleyerek küfür etmek? Akıllısın :wink:`).setColor('0x800d0d').setAuthor(oldMessage.member.displayName, oldMessage.author.avatarURL({ dynamic: true })).setTimestamp()).then(x => x.delete({timeout: 5000}));
   
             }              
           } catch(err) {
             console.log(err);
           }
         }
     
 });

 

client.login(ayarlar.botToken).then(c => console.log(`Bot başarılı bir şekilde aktif oldu.`).catch(err => console.log(`Bot giriş yaparken hata oluştu! ${err}`))
