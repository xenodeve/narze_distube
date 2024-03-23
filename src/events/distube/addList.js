const { EmbedBuilder } = require('discord.js');
const config = require('../../../settings/config.json');
const chalk = require('chalk');

module.exports = {
    name: 'addList',
    async execute(queue, playlist) {

        let player = global.player;
        let userAvatar = global.userAvatar;
        let interaction = global.interactionPlayer;
        let voiceChannel = global.voiceChannel;

        global.playlist = playlist;

        player.set('playlist', true);

        console.log(`[${chalk.bold.greenBright('DISTUBE')}] ${chalk.greenBright('Add Playlist')} ${playlist.name} ${chalk.greenBright('มี')} ${playlist.songs.length} ${chalk.greenBright('เพลง')} ${chalk.greenBright('in Channel:')} ${global.channel.name} ${chalk.greenBright('Server:')} ${voiceChannel.guild.name}${chalk.greenBright('(')}${interaction.guild.id}${chalk.greenBright(')')}`);

        if (playlist.source === 'deezer') {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Playlist', iconURL: userAvatar, url: playlist.url })
                .setDescription(`> 🎵 **Playlist:** ${playlist.name} \n> **ห้อง:** ${global.channel.toString()}`)
                .setThumbnail(playlist.thumbnail)

            return interaction.editReply({ embeds: [embed] })
        } else {
            const embed = new EmbedBuilder()
                .setColor(config.embed_color)
                .setAuthor({ name: 'Go to Playlist', iconURL: userAvatar, url: playlist.url })
                .setDescription(`> 🎵 **Playlist:** ${playlist.name} \n> ⌛ **เวลา:** \` ${playlist.formattedDuration} \` \n> 📊 **มี:** \` ${playlist.songs.length} \` เพลง \n> **ห้อง:** ${global.channel.toString()}`)
                .setThumbnail(playlist.thumbnail)

            return interaction.editReply({ embeds: [embed] })
        }
    }
}