import { ChannelType, Client, ColorResolvable, EmbedBuilder, Message, MessageType, WebhookClient } from "discord.js";
import ms from "ms";
import { botModel, collaboratorsModel, promoLevelModel, ticketsModel, alliancesModel, carcelModel, invitesModel, personalModel, rafflesModel, suggestionsModel, surveysModel } from "../models";
import { botDB } from "../db";
import { helpCommand } from "../commands/text/help";
import { commandsCommand } from "../commands/text/commands";
import { addReactionCommand } from "../commands/text/addReaction";
import { rolesCommand } from "../commands/text/roles";
import { ticketCommand } from "../commands/text/ticket";
import { informationCommand } from "../commands/text/information";
import { autoModeracion, estadisticas } from "..";
import { promotionLevelNotificationReset, sendMessageText } from "../utils/functions";
import { evalCommand } from "../commands/text/eval";


export const messageEvent = async (msg: Message<boolean>, client: Client) => {
  const { prefix, emoji, color } = botDB

  if(msg.guildId == botDB.serverId){
    estadisticas.mensajes++

    //TODO: Sistema de tickets
    let dataTs = await ticketsModel.findById(botDB.serverId), arrayTs = dataTs?.tickets, servidor2 = client.guilds.cache.get('949860813915705354')
    if(arrayTs){
      arrayTs.forEach(async (objeto) =>{
        if(objeto.id == msg.channelId){
          if(objeto.publico && msg.member?.roles.cache.has('887444598715219999') && msg.channel.type == ChannelType.GuildText){
            objeto.publico = false
            objeto.personalID = msg.author.id
            await ticketsModel.findByIdAndUpdate(botDB.serverId, {tickets: arrayTs})

            msg.channel.permissionOverwrites.edit(msg.author.id, {'ViewChannel': true, 'SendMessages': true})
            msg.channel.permissionOverwrites.delete('773271945894035486')
            msg.channel.permissionOverwrites.delete('831669132607881236')
          }
  
          if(msg.content.length == 0 && msg.embeds.length == 0 && msg.components.length == 0 && msg.attachments.size == 0) return;
          const channelServer2 = servidor2?.channels.cache.get(objeto.copiaID)
          if(channelServer2?.type == ChannelType.GuildText){
            let webhook = (await channelServer2.fetchWebhooks()).map(w=>w.url)
            const webhookCl = new WebhookClient({url: webhook[0]})
            const contentWebhook = {
              username: msg.author.username, 
              avatarURL: msg.author.displayAvatarURL(), 
              content: msg.content || undefined, 
              embeds: msg.embeds, 
              components: msg.components, 
              files: msg.attachments.map(a=>a)
            }
            webhookCl.send(contentWebhook)
          }
        }
      })
    }
    if(msg.author.bot) return

    //TODO: Colaboradores
    let dataCol = await collaboratorsModel.findById(botDB.serverId), arrayCo = dataCol?.colaboradores
    if(dataCol?.colaboradores.filter(f=>f.colaborador).some(s=>s.canalID == msg.channelId)){
      let miembroCo = arrayCo?.find(f=>f.canalID == msg.channelId)
      if(msg.mentions.everyone && miembroCo?.id == msg.author.id && msg.channel.type == ChannelType.GuildText){
        msg.channel.permissionOverwrites.edit(msg.author.id, {'MentionEveryone': false,})
        miembroCo.tiempo = Date.now()+ms("1d")
        miembroCo.notificado = false
        await collaboratorsModel.findByIdAndUpdate(botDB.serverId, {colaboradores: arrayCo})
      }
    }

    //TODO: Sistema VIP
    if(msg.channelId == '826193847943037018' && msg.channel.type == ChannelType.GuildText && msg.mentions.everyone && msg.member?.roles.cache.has('826197551904325712') && !msg.member?.permissions.has('Administrator')){
      msg.channel.permissionOverwrites.edit(msg.author.id, {'MentionEveryone': false,})
    }

    //TODO: PromoNvl
    if(msg.channelId == '977427047343325284' && msg.channel.type == ChannelType.GuildText){
      if(botDB.levelRoles.some(s=> msg.member?.roles.cache.has(s))){
        let dataPrl = await promoLevelModel.findById(botDB.serverId), arrayPl = dataPrl?.miembros
        msg.channel.permissionOverwrites.edit(msg.author.id, {'SendMessages': false,})
        
        let rolIndex = 0
        for(let i=8; i>0; i--){
          if(msg.member?.roles.cache.has(botDB.levelRoles[rolIndex])){
            promotionLevelNotificationReset(msg, arrayPl, i+'d')
          }
          rolIndex++
        }
        
        if(msg.member?.roles.cache.has(botDB.levelRoles.find((f, i)=> i==8) || '')){
          promotionLevelNotificationReset(msg, arrayPl, '12h')
        }
        if(botDB.levelRoles.slice(9).some(s=> msg.member?.roles.cache.has(s))){
          promotionLevelNotificationReset(msg, arrayPl, '6h')
        }
      }
    }

    //TODO: Auto emojis memes
    if(msg.channelId == '845396662930112533'){
      let mci = msg.content
      if(msg.attachments.size >= 1 || mci.includes(".png") || mci.includes(".jpg") || mci.includes(".mp4")){
        msg.react('😂')
        msg.react('938907043014770780')
        msg.react('939974041593319486')
      }
    }

    //TODO: General channel
    if(msg.channelId == "773404850972524615"){
      //? Boost/mejoras
      const newBoostEb = new EmbedBuilder()
      .setTitle(`${botDB.emoji.animateBoost} Nueva mejora`)
      .setColor(msg.member?.displayHexColor || 'White')

      if(msg.type == MessageType.GuildBoost){
        msg.channel.sendTyping()
        newBoostEb
        .setDescription(`**Gracias** ${msg.author} por la mejora, reclama tus recompensas abriendo un ticket en <#830165896743223327>.`)
        setTimeout(()=>{
          msg.channel.send({embeds: [newBoostEb], content: `<@${msg.author.id}>`}).then(mb=> {
            mb.pin(`${msg.author.tag} ha boosteado el servidor.`)
          })
        }, 500)
      }
      if(msg.type == MessageType.GuildBoostTier1){
        msg.channel.sendTyping()
        newBoostEb
        .setDescription(`**Gracias** ${msg.author} por la mejora, por tu mejora el servidor alcanzo el nivel **1**, reclama tus recompensas abriendo un ticket en <#830165896743223327>.`)
        setTimeout(()=>{
          msg.channel.send({embeds: [newBoostEb], content: `<@${msg.author.id}>`}).then(mb=> {
            mb.pin(`${msg.author.tag} ha boosteado el servidor y por su boost llegamos al nivel 1.`)
          })
        }, 500)
      }
      if(msg.type == MessageType.GuildBoostTier2){
        msg.channel.sendTyping()
        newBoostEb
        .setDescription(`**Gracias** ${msg.author} por la mejora, por tu mejora el servidor alcanzo el nivel **2** reclama tus recompensas abriendo un ticket en <#830165896743223327>.`)
        setTimeout(()=>{
          msg.channel.send({embeds: [newBoostEb], content: `<@${msg.author.id}>`}).then(mb=> {
            mb.pin(`${msg.author.tag} ha boosteado el servidor y por su boost llegamos al nivel 2.`)
          })
        }, 500)
      }
      if(msg.type == MessageType.GuildBoostTier3){
        msg.channel.sendTyping()
        newBoostEb
        .setDescription(`**Gracias** ${msg.author} por la mejora, por tu mejora el servidor alcanzo el nivel **3** reclama tus recompensas abriendo un ticket en <#830165896743223327>.`)
        setTimeout(()=>{
          msg.channel.send({embeds: [newBoostEb], content: `<@${msg.author.id}>`}).then(mb=> {
            mb.pin(`${msg.author.tag} ha boosteado el servidor y por su boost llegamos al nivel 3.`)
          })
        }, 500)
      }

      //? Respuestas aleatorias
      let cantidad = Math.floor(Math.random()*(100-1)+1)
      if(msg.content.toLowerCase() == "hola" && cantidad >= 30 && cantidad <= 60){
        msg.channel.sendTyping()
        setTimeout(()=>{
          msg.reply("Hola")
        }, 600)
      }
      let xds = ["xd","jaja","jajaja","sjsjs","jsjs","jiji","XD","Xd","xD"]
      if(xds.some(s=> s == msg.content.toLowerCase()) && cantidad >= 30 && cantidad <= 60){
        msg.channel.sendTyping()
        setTimeout(()=>{
          msg.channel.send(xds[Math.floor(Math.random()*xds.length)])
        }, 600)
      }
    }

    //TODO: Mensaje por mención
    if(msg.content.match(`^<@!?${client.user?.id}>( |)$`)){
      msg.channel.sendTyping()
      const embedMen = new EmbedBuilder()
      .setAuthor({name: `Hola ${msg.author.username}`, iconURL: msg.author.displayAvatarURL()})
      .setThumbnail(client.user?.displayAvatarURL() || null)
      .setTitle(`Soy ${client.user?.username}`)
      .setDescription(`**El bot de ${msg.guild?.name}**, ¿necesitas información o ayuda?`)
      .addFields(
        {name: `${emoji.information} **Información**`, value: "Puedes obtener información sobre los canales y roles del servidor en el canal <#840364744228995092>."},
        {name: `${emoji.staff} **Soporte**`, value: "Puedes obtener soporte sobre cualquier duda que tengas con relación al servidor, su configuración, obtener información mas detallada de algún rol, canal, sistema o reportar a un usuario en el canal <#830165896743223327> solo abre un ticket pregunta y espera el equipo de soporte te atenderá en un momento."}
      )
      .setColor(msg.guild?.members.me?.displayHexColor || 'White')
      .setFooter({text: msg.guild?.name || 'undefined', iconURL: msg.guild?.iconURL() || undefined})
      .setTimestamp()
      sendMessageText(msg, {embeds: [embedMen]})
    }


    //* Auto moderación -----------------------------
    if(!msg.member?.roles.cache.has('887444598715219999') && !msg.member?.permissions.has('Administrator')){
      const dataBot = await botModel.findById(client.user?.id)
      const canalesPerIDs = msg.guild?.channels.cache.filter(fc => dataBot?.datos.autoModeracion.categoriasIgnorar.includes(fc.parentId)).map(mc => mc.id)
      const otrosIDCha = dataBot?.datos.autoModeracion.canalesIgnorar
      canalesPerIDs?.push(...otrosIDCha)

      if(msg.content == "p.canalesModerados"){
        if(msg.guild?.ownerId == msg.author.id && canalesPerIDs){
          let tabla = []
          for(let i=0; i<canalesPerIDs.length; i++){
            tabla.push(`**${i+1} .** <#${msg.guild?.channels.cache.get(canalesPerIDs[i])?.id}>`)
          }

          const embChaMod = new EmbedBuilder()
          .setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
          .setDescription(`Hay un total de **${canalesPerIDs.length}** canales que tienen des activada la auto moderación de enlaces.\n\n${tabla.join("\n")}`)
          .setColor(msg.guild?.members.me?.displayHexColor || 'White')
          .setTimestamp()
          msg.reply({allowedMentions: {repliedUser: false}, embeds: [embChaMod]})
        }
      }

      if(!canalesPerIDs?.some(s=> s == msg.channelId)){
        let enlaces = [{urls: ["discord.gg/","discord.com/invite/"]},{urls: ["youtube.com","youtu.be"]},{urls: ["twitch.tv"]},{urls: ["tiktok.com","vm.tiktok.com"]},{urls: ["twitter.com"]},{urls: ["instagram.com"]},{urls: ["https:","http:",".com"]}]
        let titulos = ["<a:DiscordLogo:973995348974505984> Auto moderación de enlaces de Discord","<:youtubelogo:855166340780130354> Auto moderación de enlaces de YouTube","<:TwitchEmblema:855167274193125396> Auto moderación de enlaces de Twitch","<:Mamadatok:855167926875979837> Auto moderación de enlaces de TikTok",`<:TwitterLogo:855168545566490664> Auto moderación de enlaces de Twitter`,"<:instagram:855169028376494080> Auto moderación de enlaces de Instagram","🔗 Auto moderación de enlaces"]
        let descripciones = [` de **Discord**, el canal correcto para publicar un enlace de **Discord** es <#823381769750577163> o <#836315643070251008>`,` de **YouTube**, el canal correcto para publicar un enlace de **YouTube** es <#823961526297165845> o <#836315643070251008>`,` de **Twitch**, el canal correcto para publicar un enlace de **Twitch** es <#823381980389310464> o <#836315643070251008>`,` de **TikTok**, el canal correcto para publicar un enlace de **TikTok** es <#827295990360965153> o <#836315643070251008>`,` de **Twitter**, el canal correcto para publicar un enlace de **Twitter** es <#823381924344758313> o <#836315643070251008>`,` de **Instagram**, el canal correcto para publicar un enlace de **Instagram** es <#823382007391584276> o <#836315643070251008>`,`, si quiere hacer promoción hágalo en los canales de la categoría **<#785729364288339978>** como <#836315643070251008>.\nSi esta perdido y necesita ayuda mencione a un <@&831669132607881236>.`]
        let colores: ColorResolvable[] = ["#5965F1","#FE0100","#6441a5","#030303","#1CA1F3","#ED0D6E", color.negative]

        for(const m in enlaces){
          let count = 0
          if(enlaces[m].urls.some(s=> msg.content.includes(s)) && count == 0){
            count++
            const embWarn = new EmbedBuilder()
            .setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
            .setTitle(titulos[m])
            .setDescription(`Lo ciento ${msg.author} en este canal no esta permitido publicar enlaces${descripciones[m]}`)
            .setColor(colores[m])
            .setFooter({text: `🛑 Advertencia por ${client.user?.tag}`, iconURL: client.user?.displayAvatarURL()})
            .setTimestamp()
            setTimeout(()=>{
              msg.delete().catch(c=>console.log(c))
              msg.channel.send({embeds: [embWarn], content: `<@${msg.author.id}>`}).then(tw=>{
                setTimeout(()=>{
                  tw.delete().catch(c=>console.log(c))
                },24000)
              })
            }, 800)

            if(autoModeracion.some(s=> s.miembroID == msg.author.id)){
              const autoModMember = autoModeracion.find(f=> f.miembroID==msg.author.id)
              if(autoModMember){
                autoModMember.advertencias++
                if(autoModMember.advertencias >= 2){
                  const embAdvertenciaMD = new EmbedBuilder()
                  .setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
                  .setTitle(`🔗 Auto moderación de enlaces`)
                  .setDescription(`Esta prohibido publicar enlaces en en canal <#${msg.channelId}>, evita hacerlo de nuevo para no sancionarte.`)
                  .setColor(color.negative)
                  msg.author.send({embeds: [embAdvertenciaMD]}).catch(()=> '')
                }

                if(autoModMember.advertencias == 3){
                  msg.member?.timeout(4*60*60000, `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                }
                if(autoModMember.advertencias == 4){
                  msg.member?.timeout(8*60*60000, `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                }
                if(autoModMember.advertencias == 5){
                  msg.member?.timeout(10*60*60000, `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                }
                if(autoModMember.advertencias == 6){
                  msg.member?.kick(`Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                }
                if(autoModMember.advertencias == 7){
                  msg.member?.ban({reason: `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`})
                }
              }
            }else{
              autoModeracion.push({miembroID: msg.author.id, advertencias: 1})
            } 
          }else{
            break
          }
        }
      }

      interface ChannelsAutomod {
        id: string
        color: ColorResolvable
        urls: string[]
        titulo: string
        descripcion: string
      }

      let canales: ChannelsAutomod[] = [
        {id: "823381769750577163", color: "#5965F1", urls: ["discord.gg/","discord.com/invite/"], titulo: `${emoji.discord} Auto moderación de enlaces de Discord`, descripcion: `Este canal no es el correcto para publicar enlaces de **Discord**, puedes publicar enlaces de Discord en su canal <#823381769750577163> o <#836315643070251008>.`},
        {id: "823961526297165845", color: "#FE0100", urls: ["youtube.com","youtu.be"], titulo: `${emoji.youTube} Auto moderación de enlaces de YouTube`, descripcion: `Este canal no es el correcto para publicar enlaces de **YouTube**, puedes publicar enlaces de YouTube en su canal <#823961526297165845> o <#836315643070251008>.`},
        {id: "823381980389310464", color: "#6441a5", urls: ["twitch.tv"], titulo: `${emoji.twitch} Auto moderación de enlaces de Twitch`, descripcion: `Este canal no es el correcto para publicar enlaces de **Twitch**, puedes publicar enlaces de Twitch en su canal <#823381980389310464> o <#836315643070251008>.`},
        {id: "823382007391584276", color: "#ED0D6E", urls: ["instagram.com"], titulo: `${emoji.instagram} Auto moderación de enlaces de Instagram`, descripcion: `Este canal no es el correcto para publicar enlaces de **Instagram**, puedes publicar enlaces de Instagram en su canal <#823382007391584276> o <#836315643070251008>.`},
        {id: "827295990360965153", color: "#030303", urls: ["tiktok.com","vm.tiktok.com"], titulo: `${emoji.tickTock} Auto moderación de enlaces de TikTok`, descripcion: `Este canal no es el correcto para publicar enlaces de **TikTok**, puedes publicar enlaces de TikTok en su canal <#827295990360965153> o <#836315643070251008>.`},
        {id: "823381924344758313", color: "#1CA1F3", urls: ["twitter.com"], titulo: `${emoji.twitter} Auto moderación de enlaces de Twitter`, descripcion: `Este canal no es el correcto para publicar enlaces de **Twitter**, puedes publicar enlaces de Twitter en su canal <#823381924344758313> o <#836315643070251008>.`}, 
      ]

      if(canales.some(s=> s.id == msg.channelId) && ["https://", "www", ".com"].some(s=> msg.content.includes(s))){
        let canal = canales.find(f=>f.id == msg.channelId)
        if(!canal?.urls.some(s=> msg.content.includes(s))){
          canales.forEach((valorCh, psCh)=> {
            if(valorCh.urls.some(s=> msg.content.includes(s))){
              const embAdvertencia = new EmbedBuilder()
              .setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
              .setTitle(valorCh.titulo)
              .setDescription(valorCh.descripcion)
              .setColor(valorCh.color)
              .setFooter({text: msg.guild?.name || 'undefined', iconURL: msg.guild?.iconURL() || undefined})
    
              setTimeout(()=>{
                msg.delete().catch(c=>console.log(c))
                msg.channel.send({embeds: [embAdvertencia], content: `<@${msg.author.id}>`}).then(tw=>{
                  setTimeout(()=>{
                    tw.delete().catch(c=>console.log(c))
                  },20000)
                })
              }, 800)

              if(autoModeracion.some(s=> s.miembroID == msg.author.id)){
                const autoModMember = autoModeracion.find(f=> f.miembroID==msg.author.id)
                if(autoModMember) {
                  autoModMember.advertencias++
                  if(autoModMember.advertencias >= 2){
                    const embAdvertenciaMD = new EmbedBuilder()
                    .setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
                    .setTitle(`🔗 Auto moderación de enlaces`)
                    .setDescription(`Esta prohibido publicar enlaces en en canal <#${msg.channelId}>, evita hacerlo de nuevo para no sancionarte.`)
                    .setColor(color.negative)
                    msg.author.send({embeds: [embAdvertenciaMD]}).catch(c=>console.log(c))
                  }

                  if(autoModMember.advertencias == 3){
                    msg.member?.timeout(4*60*60000, `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                  }
                  if(autoModMember.advertencias == 4){
                    msg.member?.timeout(8*60*60000, `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                  }
                  if(autoModMember.advertencias == 5){
                    msg.member?.timeout(10*60*60000, `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                  }
                  if(autoModMember.advertencias == 6){
                    msg.member?.kick(`Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`)
                  }
                  if(autoModMember.advertencias == 7){
                    msg.member?.ban({reason: `Por auto moderación de enlaces, el miembro ha enviado ${autoModMember.advertencias} enlaces en canales los cuales no esta permitido.`})
                  }
                }
              }else{
                autoModeracion.push({miembroID: msg.author.id, advertencias: 1})
              } 
            }
          })
        }
      }
    }
  }

  if(msg.author.bot || !msg.content.toLowerCase().startsWith(prefix)) return
  const args = msg.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift()?.toLowerCase()

  if(command == 'ayuda') helpCommand(msg, client)

  if(['comandos', 'cmds'].some(s=> s==command)) commandsCommand(msg, client, args)

  if(msg.member?.permissions.has('Administrator')){
    if(['addreaction', 'addrc'].some(s=> s==command)) addReactionCommand(msg, client, args)
    if(command == 'roles') rolesCommand(msg, client)
    if(command == 'ticket') ticketCommand(msg)
    if(command == 'informacion') informationCommand(msg)
  }

  if(botDB.owners.some(s=> s==msg.author.id)){
    if(['eval', 'ev'].some(s=> s==command)) evalCommand(msg, client, args.join(' '))
  }
}