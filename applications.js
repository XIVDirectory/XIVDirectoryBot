const common = require('./common.js');

async function approve(interaction, applicationId) {
  await interaction.deferUpdate();
  var application = await interaction.client.meili.index('listing').getDocument(applicationId, { fields: ['name'] });
  await interaction.client.meili.index('listing').updateDocuments([{ id: applicationId, status: 2 }]);
  await interaction.editReply({ embeds: [common.styledEmbed(application.name, `Application for ${application.name} (${applicationId}) was approved by ${interaction.user.tag}`)], components:[]});
}

async function reject(interaction, applicationId) {
  await interaction.deferUpdate();
  var application = await interaction.client.meili.index('listing').getDocument(applicationId, { fields: ['name'] });
  await interaction.client.meili.index('listing').updateDocuments([{ id: applicationId, status: 40 }]);
  await interaction.editReply({ embeds: [common.styledEmbed(application.name, `Application for ${application.name} (${applicationId}) was rejected by ${interaction.user.tag}`)], components:[]});
}

module.exports = {
  approve: approve,
  reject: reject
};