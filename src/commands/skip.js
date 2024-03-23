const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../settings/config.json');

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip!'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const clientvoiceChannel = interaction.guild.members.me.voice.channel
        const userMention = interaction.user.toString();

        global.com_skip = true

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`กรุณาเข้าห้องเสียงด้วย`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (voiceChannel !== clientvoiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`คุณต้องอยู่ในห้องเดียวกับบอท`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const queue = interaction.client.distube.getQueue(interaction);
        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`ไม่มีเพลงที่เล่นอยู่`)
                // .setFooter({ text: 'ข้าม • เพิ่มคิวอัตโนมัติ' });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });

        await interaction.client.distube.skip(interaction).then(song => {
            const embed = new EmbedBuilder()
                .setDescription(`⏭️┃**${song.name}** \n\`⌛: ${song.formattedDuration} \` \n ข้ามโดย: ${userMention}`)
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Page', iconURL: userAvatar, url: song.url })
                .setThumbnail(song.thumbnail)
                .setFooter({ text: 'ข้าม • เพิ่มคิวอัตโนมัติ' });

            return interaction.editReply({ embeds: [embed] });
        })
            .catch(error => {
                if (error.code === 'NO_UP_NEXT') {
                    interaction.client.distube.stop(interaction)
                        .then(song => {
                            const embed = new EmbedBuilder()
                                .setColor(config.embed_color)
                                .setDescription(`⏭️ |  ไม่มีเพลงให้ข้าม`)
                                .setFooter({ text: 'ข้าม • เพิ่มคิวอัตโนมัติ' });

                            return interaction.editReply({ embeds: [embed] });
                        })
                        .catch(error => {
                            return interaction.channel.send(`${interaction.client.emoji.error} | An error occurred while skip the song.`);
                        });
                } else {
                    return interaction.channel.send(`${interaction.client.emoji.error} | An error occurred while skip the queue.`);
                }
            });

    },
};