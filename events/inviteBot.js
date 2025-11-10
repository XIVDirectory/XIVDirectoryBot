const { Events } = require('discord.js');
const common = require('../common.js');

// For when the bot is added to a new guild
module.exports = {
  name: Events.GuildCreate,
  execute: async (client, args) => {
    let guild = args[0];
    
    if (guild.available === false) {
      // Guild experienced an outage, ignore this message
      return;
    }
  
    var myInvite = await common.createInvite(guild);
    
    var newGuild = {
      ServerId: guild.id,
      Owner: guild.ownerId,
      InviteLink: myInvite.url,
      IsStale: !myInvite.url
    }
    
    try {
      await client.api.register.put(newGuild, `ApproveServer/${guild.id}`)
        .then(res => { 
          if (res.status == 200) {
            console.log(`Joined guild ${guild.id}`)
          } else {
            console.error(`Failed to register guild ${guild.id}: ${res.statusText}`);
          }
        })
    } catch(err) {
      console.error(`Failed to register guild ${guild.id}: ${err}`);
    }
  }
}