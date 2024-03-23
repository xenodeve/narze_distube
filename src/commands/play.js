const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../settings/config.json');
const chalk = require('chalk');
const yt = require('youtube-sr').default;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('เล่นเพลง')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('ชื่อเพลง')
                .setRequired(true)
                .setAutocomplete(true),
        ),

    async autocomplete(interaction) {

        // let query = interaction.options.getString('query');

        if(interaction.options.getString('query').includes('?si=')) {
            let query_ex = await interaction.options.getString('query');
            query = await query_ex.split('?si=')[0];
        } else {
            query = interaction.options.getString('query')
        }

        const old_player = await interaction.client.manager.get(interaction.guild.id);

        let player = old_player || await interaction.client.manager.create({
            guild: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
        });

        let choice = [];

        if (!query) {
            choice.push({ name: 'กรุณาระบุเพลง', value: 'no_song' });
        } else if (query.startsWith('https://')) {
            if (query.includes('youtu.be') || query.includes('youtube')) {
                if (query.includes('list=')) {
                    let result = await yt.getPlaylist(query).catch(error => {
                        return title = `(ข้อผิดพลาด) กรุณาใส่ URL ที่ถูกต้อง`;
                    })
                    if (title) {
                        choice.push({ name: title, value: 'error' });
                    } else {
                        let title = `(${result.videoCount} เพลง) ${result.title}`;
                        choice.push({ name: title, value: query });
                    }

                } else {
                    let result = await yt.searchOne(query)

                    if (result === null) {
                        let title = `(ข้อผิดพลาด) กรุณาใส่ URL ที่ถูกต้อง`;
                        choice.push({ name: title, value: 'error' });
                    } else if(result.channel) {
                        let title = `(${result.channel.name}) ${result.title}`
                        choice.push({ name: title, value: query });
                    }
                }

            } else if (query.includes('spotify') || query.includes('deezer') || query.includes('soundcloud')) {
                choice.push({ name: query, value: query });
            } else {
                choice.push({ name: 'ไม่รองรับ Platform นี้', value: 'ไม่รองรับ Platform นี้' });
            }
        } else {
            // console.log('10')
            await player.search(query, interaction.author).catch(error => {
                {
                    // จัดการกับ error ที่เกิดขึ้น
                    console.error(error);
                }
            }).then(results => {
                for (let i = 0; i < 7; i++) {
                    const title = `(${results.tracks[i].author}) ${results.tracks[i].title}`;
                    let url = results.tracks[i].uri;
                    choice.push({ name: title, value: url });
                }
            }).catch(() => { });
        }
        interaction.respond(choice).catch(() => { });
    },
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const query = interaction.options.getString('query');
        const queue = await interaction.client.distube.getQueue(interaction); /* ดึงคิวเพลงปัจจุบันจากเครื่องเล่นเพลงของบอท Discord (อาจใช้ไฟล์ไลบรารี Discord.js พร้อมส่วนขยาย Distube). */
        const userAvatar = interaction.user.displayAvatarURL();
        const { channel } = interaction.member.voice;

        global.voiceChannel = voiceChannel;
        global.userAvatar = userAvatar;
        global.interactionPlayer = interaction;
        global.channel = channel;


        if (!query || query === 'no_song') {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`กรุณาระบุเพลง`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (query === 'error') {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`กรุณาระบุเพลงที่ถูกต้อง`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (query === 'ไม่รองรับ Platform นี้') {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`ไม่รองรับ Platform นี้`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`กรุณาเข้าห้องเสียงด้วย`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const old_player = await interaction.client.manager.get(interaction.guild.id);

        let player = old_player || await interaction.client.manager.create({
            guild: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
            selfDeafen: true,
        });


        if (!player.voiceChannel) {
            await player.destroy();
            let player = await interaction.client.manager.create({
                guild: interaction.guild.id,
                voiceChannel: interaction.member.voice.channel.id,
                textChannel: interaction.channel.id,
            });
        }

        global.player = player;


        const permissions = voiceChannel.permissionsFor(interaction.client.user);

        if (interaction.member.voice.channel.id !== player.voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`คุณต้องอยู่ในห้องเดียวกับบอท`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            player.destroy();
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`บอทไม่มีอำนาจเปิดเพลงในห้อง ${voiceChannel.toString()}`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });

        function song_error(error) {
            console.log(error)
            console.log(`[${chalk.bold.greenBright('DISTUBE')}] ${chalk.greenBright('Fail to Play Playlist')} ${query} ${chalk.greenBright('in Channel:')} ${global.channel.name} ${chalk.greenBright('Server:')} ${voiceChannel.guild.name}${chalk.greenBright('(')}${interaction.guild.id}${chalk.greenBright(')')}`);
            const embed = new EmbedBuilder()
                .setColor(config.embed_fail)
                .setDescription(`> \`❌\`ไม่สามารถเข้าถึงเพลย์ลิสได้`);

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        player.set('trackFirst', false);
        global.com_play = true;
        player.set('firstSong', false);
        player.set('playlist', false);

        if (!queue) {
            player.set('firstSong', true)
            if (query.startsWith('https://') &&
                (
                    query.includes('list=') ||
                    query.includes('playlist') ||
                    query.includes('album') ||
                    query.includes('sets') ||
                    query.includes('artist')
                )
            ) {
                // player.set('playlist', true);
                player.set('trackFirst', true);
                await interaction.client.distube.play(voiceChannel, config.wait_load, {
                    textChannel: interaction.channel,
                    member: interaction.member
                }).catch(error => {
                    song_error(error);
                });

                console.log('10')
            }
        }

        if (query.startsWith('https://')) {
            if (query.includes('youtube') || query.includes('youtu.be')) {
                if (query.startsWith('https://') &&
                    (
                        query.includes('list=') ||
                        query.includes('playlist') ||
                        query.includes('album') ||
                        query.includes('sets') ||
                        query.includes('artist')
                    )
                ) {
                    // player.set('playlist', true);
                    console.log('11')
                    await interaction.client.distube.play(voiceChannel, query, {
                        textChannel: interaction.channel,
                        member: interaction.member
                    }).catch(error => {
                        song_error(error);
                    });

                    if (player.get('trackFirst') === true) {
                        interaction.client.distube.skip(interaction).catch(() => { });
                    }

                } else {
                    await interaction.client.distube.play(voiceChannel, query, {
                        textChannel: interaction.channel,
                        member: interaction.member
                    }).catch(error => {
                        song_error(error);
                    });
                }
            }
            if (query.includes('spotify') || query.includes('deezer') || query.includes('soundcloud')) {
                await interaction.client.distube.play(voiceChannel, query, {
                    textChannel: interaction.channel,
                    member: interaction.member
                }).catch(error => {
                    song_error(error);
                });
            }
        } else {
            const res = await interaction.client.manager.search(
                query,
                interaction.author,
            );

            await interaction.client.distube.play(voiceChannel, res.tracks[0].uri, {
                textChannel: interaction.channel,
                member: interaction.member
            }).catch(error => {
                song_error(error);
            });
        }
        player.set('trackFirst', false);
    }
}
