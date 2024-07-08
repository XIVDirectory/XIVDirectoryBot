const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const common = require('../common.js');

module.exports = {
  name: 'debuginvite',
  description: "Displays debug information about the Bot's invite permissions in a given server",
  guilds: [{ guild: "1122673195825246318", permittedRoles: [ "1122673255145279558" ] },
    { guild: "589466032662642689", permittedRoles: [ "589474925958660140" ] }],
  options: [
    { type: ApplicationCommandOptionType.String, name: "serverid", description: "The ID of the discord server we want to check", required: true },
  ],
  
  executeInteraction: async(interaction, client) => {
    await interaction.deferReply();
    var serverId = interaction.options.getString('serverid')
    
    var embed = common.styledEmbed(`Debugging Invite permissions for Server: ${serverId}`, '');
    var guild = client.guilds.resolve(serverId)
    
    if (!guild) {
      embed.description = ":x: Bot has access to the server"
      interaction.editReply({ embeds: [embed] });
      return;
    }
    else {
      embed.description = ":white_check_mark: Bot has access to the server";
    }
    
    var meiliDoc = await client.meili.index('listing').search(guild.id, { attributesToRetrieve: ['id','serverId','defaultInviteChannel'] })
      .then(match => match.hits.length === 1 ? match.hits[0] : {});
    
    var me = await guild.members.fetch(client.user.id)
    var serverPermissions = me.permissions;
    var targetChannel = guild.rulesChannel ?? guild.channels.cache.find(x => x.isTextBased() && x.viewable)
    if (meiliDoc.defaultInviteChannel) {
      targetChannel = await guild.channels.fetch(meiliDoc.defaultInviteChannel) ?? targetChannel;
    }

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
- ${ !everyoneChannelPermissions || !everyoneChannelPermissions.deny.has(PermissionsBitField.Flags.CreateInstantInvite) ? ":white_check_mark:" : ":x:"} Permission given to everyone
- ${ botChannelPermissions && botChannelPermissions.allow.has(PermissionsBitField.Flags.CreateInstantInvite) ? ":white_check_mark:" : ":x:"} Permission given to bot
### Overall Summary
${allValid ? ":white_check_mark: Bot can create invites" : ":x: Bot cannot create invites"}
`

    // Try and force an invite refresh
    if (allValid) {
     var invite = await common.createInvite(guild, targetChannel);
     if (invite.url) {
       await client.meili.index('listing').updateDocuments([{ id: meiliDoc.id, isStale: false, inviteLink: invite.url }]);
     }
    }

    interaction.editReply({ embeds: [embed] });
  }
};