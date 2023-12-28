const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const common = require('../common.js');

module.exports = {
  name: 'checkinvite',
  description: "Displays information about the Bot's invite permissions in a given server",
  options: [],
  
  executeInteraction: async(interaction, client) => {
    await interaction.deferReply({ ephemeral: true });
    
    var guild = interaction.guild;
    var embed = common.styledEmbed(`Debugging Invite permissions for Server: ${guild.name}`, '');
    
    if (!guild) {
      embed.description = ":x: Bot has access to the server"
      interaction.editReply({ embeds: [embed] });
      return;
    }
    else {
      embed.description = ":white_check_mark: Bot has access to the server";
    }
    
    var me = await guild.members.fetch(client.user.id)
    var serverPermissions = me.permissions;
    var targetChannel = guild.rulesChannel ?? guild.channels.cache.find(x => x.isTextBased() && x.viewable);
    var channelPermissions = targetChannel.permissionOverwrites
    var botRole = guild.roles.botRoleFor(client.user);
    
    var hasServerPermission = serverPermissions.has(PermissionsBitField.Flags.CreateInstantInvite)
    var canSeeChannel = targetChannel.viewable
    var hasChannelPermission = targetChannel.permissionsFor(me).has(PermissionsBitField.Flags.CreateInstantInvite)

    var everyoneChannelPermissions = channelPermissions.cache.find(r => r.id == guild.roles.everyone.id)
    var botChannelPermissions = channelPermissions.cache.find(r => r.id == botRole.id)
    
    var allValid = hasServerPermission && canSeeChannel && hasChannelPermission
    
    embed.description += `\n### Server Permissions
${hasServerPermission ? ":white_check_mark:" : ":x:"} Bot has "Create Invite" permissions
### Channel Permissions
Attempting to create permissions on #${targetChannel.name} (${targetChannel.id})
${canSeeChannel ? ":white_check_mark:" : ":x:"} Bot can see channel
${hasChannelPermission ? ":white_check_mark:" : ":x:"} Bot can create invites in channel (one of the following must be true)
- ${ everyoneChannelPermissions && !everyoneChannelPermissions.deny.has(PermissionsBitField.Flags.CreateInstantInvite) ? ":white_check_mark:" : ":x:"} Permission given to everyone
- ${ botChannelPermissions && botChannelPermissions.allow.has(PermissionsBitField.Flags.CreateInstantInvite) ? ":white_check_mark:" : ":x:"} Permission given to bot
### Overall Summary
${allValid ? ":white_check_mark: Bot can create invites" : ":x: Bot cannot create invites"}
`

    interaction.editReply({ embeds: [embed] });
    
    // Try and force an invite refresh
    if (allValid) {
       var match = await client.meili.index('listing').search(guild.id, { attributesToRetrieve: ['id','serverId','isStale'] });
       if (match.hits.length != 1) {
         return;
       }
       
       // Check the server is stale
       var serverMatch = match.hits[0];
       if (!serverMatch.isStale) {
         return;
       }
       
       var invite = await common.createInvite(guild);
       if (invite.url) {
         await client.meili.index('listing').updateDocuments([{ id: serverMatch.id, status: 2, inviteLink: invite.url }]);
       }
    }
  }
};