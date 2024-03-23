const { EmbedBuilder } = require('discord.js');
const config = require('../../../settings/config.json');
const chalk = require('chalk');

module.exports = {
    name: 'addSong',
    async execute(queue, song) {

        let userAvatar = global.userAvatar;
        let interaction = global.interactionPlayer;
        let voiceChannel = global.voiceChannel
        let player = global.player;

        // if(global.com_play = true && player.get('trackFirst') === false) {
        //     global.com_play = false;
        // }

        // if(player.get('trackFirst') === true) return;

        // console.log('trackFirst addSong', player.get('trackFirst'))

        console.log(`[${chalk.bold.greenBright('DISTUBE')}] ${chalk.greenBright('Add')} ${song.name} ${chalk.greenBright('in Channel:')} ${global.channel.name} ${chalk.greenBright('Server:')} ${voiceChannel.guild.name}${chalk.greenBright('(')}${interaction.guild.id}${chalk.greenBright(')')}`);

        if (player.get('trackFirst') === false && queue.songs) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Page', iconURL: userAvatar, url: song.url })
                .setDescription(`📝┃**${song.name}** \n\`⌛: ${song.formattedDuration} \` \n ลำดับ: \` ${queue.songs.length - 1} \``)
                .setThumbnail(song.thumbnail)

            return interaction.editReply({ embeds: [embed] });
        } else if (player.get('trackFirst') === false) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Page', iconURL: userAvatar, url: song.url })
                .setDescription(`📝┃**${song.name}** \n\`⌛: ${song.formattedDuration} \` \n ลำดับ: \` ${queue.songs.length - 1} \``)
                .setThumbnail(song.thumbnail)

            return interaction.editReply({ embeds: [embed] });
        }
    }
}