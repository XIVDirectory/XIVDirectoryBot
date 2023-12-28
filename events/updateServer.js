const { Events } = require('discord.js');
const common = require('../common.js');

const watchedFields = [
  'name',
  'icon',
  'nsfwLevel'
];

// For when the bot is removed from a guild
module.exports = {
  name: Events.GuildUpdate,
  execute: async (client, args) => {
    let oldGuild = args[0];
    let newGuild = args[1]

    var updatedFields = [];

    for (const field of watchedFields) {
      if (oldGuild[field] != newGuild[field]) {
        updatedFields.push(field);
      }
    }
    
    // Update doesn't require further action
    if (updatedFields.length == 0) {
      return;
    }

    try {
      // Attempt the update first without marking the server as stale
      var patchObj = updatedFields.map(name => {
        return {
          op: "replace",
          path: name,
          value: name == "icon" ? common.guildIconUrl(newGuild) : newGuild[name]
        }
      });
      var response = await client.api.guild.patch(newGuild.id, patchObj)
      if (response.status == 200) {
        console.log(`Guild ${newGuild.id} updated without a data refresh`)
        return;
      }
      
      // Mark the server as stale so we can refresh it later
      await client.api.guild.post({}, `Refresh/${newGuild.id}`)
        .then(res => {
          if (res.status == 200) {
            console.log(`Guild ${newGuild.id} queued for a data refresh`)
          } else {
            console.error(`Failed to refresh guild ${newGuild.id}: ${res.statusText}`);
          }
        })
    } catch(err) {
      console.log(err);
      console.error(`Failed to refresh guild ${newGuild.id}: ${err}`);
    }
    
    return;
  }
}