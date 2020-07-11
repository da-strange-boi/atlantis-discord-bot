const _ = require('lodash')
const huntCoolDown = 15000
const huntTimeouts = {}

// Reminder for `owo hunt`
exports.reminder = async (bot, message, messageContent, customPrefix, userdata) => {
  if (messageContent.match(new RegExp(customPrefix.source + (/(hunt|h$|catch)/g).source))) {
    if (userdata) {
      if (!_.has(huntTimeouts, message.author.id)) {
        huntTimeouts[message.author.id] = {}
      }
      if (_.has(huntTimeouts[message.author.id], 'hunt')) {
        if (huntTimeouts[message.author.id].hunt) return
      }
      huntTimeouts[message.author.id].hunt = true

      // stats
      await bot.database.Userdata.findOneAndUpdate({ userID: message.author.id }, { $set: { 'stats.huntCount': userdata.stats.huntCount + 1 } })
      await bot.database.Userdata.findOneAndUpdate({ userID: message.author.id }, { $set: { 'stats.dailyHuntCount': userdata.stats.dailyHuntCount + 1 } })
      if (userdata.stats.guilds[message.channel.guild.id]) {
        await bot.database.Userdata.findOneAndUpdate({ userID: message.author.id }, { $set: { [`stats.guilds.${message.channel.guild.id}.huntCount`]: userdata.stats.guilds[message.channel.guild.id].huntCount + 1 } })
        await bot.database.Userdata.findOneAndUpdate({ userID: message.author.id }, { $set: { [`stats.guilds.${message.channel.guild.id}.dailyHuntCount`]: userdata.stats.guilds[message.channel.guild.id].dailyHuntCount + 1 } })
      }

      setTimeout(async () => {
        huntTimeouts[message.author.id].hunt = false

        // custom messages
        let huntReminderMessage = `<@${message.author.id}>, \`hunt\` cooldown has passed! ${bot.emojis.native.hunt}`
        if (message.author.id === '144052828678127616' /* Kazen */) huntReminderMessage = `<@${message.author.id}>, \`hunt\` dulu kesayangan! ${bot.emojis.custom.kazen}`
        if (message.author.id === '648741213154836500' /* lanre */) huntReminderMessage = `Kanna will help you hunt! ${bot.emojis.custom.lanre.hunt}`

        if (userdata.hunt) {
          bot.createMessage(message.channel.id, huntReminderMessage).then(sentMessage => {
            setTimeout(() => { sentMessage.delete(`Deleted hunt reminder for ${message.author.tag}`) }, 5000)
          })
        }
      }, huntCoolDown)
    }
  }
}
