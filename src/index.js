/* This code snippet is setting up a Discord bot using the Discord.js library. Here's a breakdown of
what it does: */
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js')
const config = require('../settings/config.json')
const fs = require('node:fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.cooldowns = new Collection();

//ทำการโหลดไฟล์ Event เข้าบอท
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
//ทำการโหลดไฟล์ Event เข้าบอท

//ทำการโหลดไฟล์คำสั่งเข้าบอท
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}
//ทำการโหลดไฟล์คำสั่งเข้าบอท


const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { DeezerPlugin } = require('@distube/deezer');

client.distube = new DisTube(client, {
    leaveOnFinish: false,
    searchCooldown: 2,
    leaveOnEmpty: false,
    leaveOnStop: false,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    // saveCurrentSong: true,
    // searchSongs: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true,
            api: {
                clientId: config.clientId_spotify,
                clientSecret: config.clientSecret_spotify,
                topTracksCountry: 'TH',
            }
        }),
        new SoundCloudPlugin(),
        new DeezerPlugin({
            parallel: true,
            emitEventsAfterFetching: false,
          }),
        new YtDlpPlugin({
            update: true,
        })
    ]
});


//ทำการโหลดไฟล์ Event Distube เข้าบอท
const distubeFiles = fs.readdirSync('./events/distube').filter(file => file.endsWith('.js'));

for (const file of distubeFiles) {
    const event = require(`./events/distube/${file}`);
    client.distube.on(event.name, (...args) => event.execute(...args));
}
//ทำการโหลดไฟล์ Event Distube เข้าบอท


// erelajs
const { Manager } = require('erela.js');

client.manager = new Manager({
	nodes: config.nodes,
	source: [
		"spotify",
		"apple music"
	],
	// forceSearchLinkQueries: true,
	defaultSearchPlatform: config.search_plat,
	position_update_interval: 100,
	send: (id, payload) => {
		const guild = client.guilds.cache.get(id);
		if (guild) guild.shard.send(payload);
	}
});

//ทำการโหลดไฟล์ Event erela เข้าบอท
const erelaFiles = fs.readdirSync('./events/erelajs').filter(file => file.endsWith('.js'));

for (const file of erelaFiles) {
	const event = require(`./events/erelajs/${file}`);
	client.manager.on(event.name, (...args) => event.execute(...args));
}
//ทำการโหลดไฟล์ Event erela เข้าบอท

client.login(config.token);