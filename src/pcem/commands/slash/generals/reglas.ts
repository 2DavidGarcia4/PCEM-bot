import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType, Client } from "discord.js";
import { sendMessageSlash } from "../../../../utils/functions";

export const reglasScb = new SlashCommandBuilder()
.setName("reglas")
.setDescription(`馃摐 Te muestra las reglas del servidor.`).toJSON()

export const reglasSlashCommand = async (int: ChatInputCommandInteraction<CacheType>, client: Client) => {
  await int.deferReply()
  
  const embReglas = new EmbedBuilder()
  .setAuthor({name: "馃摐 Reglas"})
  // .setDescription(`> **1. Respetarse, no insultarse, aqu铆 todos estamos para ayudarnos entre nosotros.**\n\n> **2. No usar palabras obscenas u ofensivas o seras advertido o directamente Baneado.**\n\n> 3. **Respetar la categor铆a de los canales** *(Ejemplo si son para promocionar solo se podr谩 promocionar o si son para hablar solo se usaran para hablar).*\n\n> **4. No hacer menciones como @user, @everyone, @here, a menos que se les permita por un rol, canal o un admin.**\n\n> **5.No mencionar a los admins, mods, helpers y usuario si no es por una buena raz贸n y solo es por diversi贸n.**\n\n> **6. No enviar spam al MD de las personas sin antes la persona lo aya permitido** *(ejemplo: primero preguntarle y si acepta ya mandarle el spam de lo contrario es sancionable).*\n\n> **7. No enviar su promoci贸n *(spam)***, en un canal y salir del servidor si lo haces tu promocion sera eliminada.**\n\n> **8. Esta prohibido el contenido NSFW o +18 en canales los cuales no est谩n creados para ese fin.**`)
  .setDescription(`> **1. __Flood__**\n> Inundaci贸n de mensajes o mejor conocido como *flood* esta acci贸n esta prohibida, se considera flood cuando env铆as el mismo mensaje mas de 3 veces en un corto lapso de tiempo.\n\n> **2. __Spam al MD__**\n> Se considera *spam al MD* a la acci贸n de enviar por mensaje directo un mensaje de promoci贸n no deseado al miembro, esta acci贸n esta prohibida.\n\n> **3. __Respeto mutuo__**\n> Respetarse entre ustedes, no hay necesidad de conflictos si alg煤n usuario le molesta no haga conflicto haga un reporte al usuario creando un ticket en el canal <#830165896743223327>.\n\n> **4. __Contenido NSFW__**\n> El contenido explicito o contenido NSFW esta prohibido en la mayor铆a de canales.\n\n> **5. __Informaci贸n personal__**\n> Tu informaci贸n personal es valiosa para ti, por ello en el servidor no esta permitido actos de revelaci贸n de datos personales o de otro miembro.\n\n> **6. __Promoci贸n en grupo__**\n> Esta acci贸n es cuando **2** o mas miembro del servidor publican el mismo contenido ya sea un servidor, YT, etc, esa acci贸n es sancionable. \n\n> **7. __Publicar y salir del servidor__**\n> En el caso de que entres al servidor, publiques tu promoci贸n y salgas del servidor tu publicaci贸n ser谩 eliminada.\n\n> **8. __Respetar la funci贸n de cada canal.__**\n> Respetar si el canal es solo para publicar contenido de YouYube o si es solo para usar un bot en concreto, normalmente en la descripci贸n del canal te informa la finalidad del canal.\n\n> **9. __Menciones en masa o menciones masivas__**\n>  Consiste en mencionar repetidas veces a un miembro o rol, esa acci贸n esta prohibida. \n\n> **10. __Usar el sentido com煤n__**\n> Comp贸rtate adecuadamente, no hagas cosas que aunque no est茅n en las reglas est谩n mal, en todo caso si el equipo de soporte se ve en la necesidad de sancionarte lo har谩.\n\n> **11. __T茅rminos y condiciones de Discord__**\n> No incumplir el [**ToS**](https://discord.com/terms) de Discord.`)
  .setColor(int.guild?.members.me?.displayHexColor || 'White')
  .setFooter({text: int.guild?.name || 'undefined', iconURL: int.guild?.iconURL() || undefined})
  .setTimestamp()

  sendMessageSlash(int, {embeds: [embReglas]})
}