const startBoot = new Date();
console.log(`${startBoot.toLocaleString()}\nBooting NZ Covid Bot...\n--------------------`);

console.log(`Importing Dependencies`);
import * as config from './config.json';
import { Client, Message, Intents } from 'discord.js';
import Command from './interfaces/Command';
import LocationsManager from './modules/locationsManager.module';
import GuildConfigManager from './modules/guildConfigManager.module';
const cron = require('node-cron');

console.log(`Initialising Client`);
const client: Client = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILDS],
});

console.log(`Initialising Server-Specific Settings`);
const settings = new GuildConfigManager();

// locations handling
console.log(`Instantiating Locations`);
const locations: LocationsManager = new LocationsManager();

// commands
console.log(`Importing Commands`);
import help from './commands/help';
import ping from './commands/ping';
import list from './commands/list';
import invite from './commands/invite';
import setPrefix from './commands/config/setPrefix';
import setNew from './commands/config/setNewLocations';
import showConfig from './commands/config/showConfig';
import query from './commands/locations/query';

// indirect commands
import checkNew from './commands/locations/checkNew';
// TODO: instead of needing admin perms, just try send a message in set feed channel

client.on('ready', () => {
    const finishBoot = new Date();
    console.log(`--------------------`);
    console.log(`${client?.user?.tag} logged in.`);
    console.log(`Boot Time: ${((finishBoot.getTime() - startBoot.getTime()) / 1000).toFixed(2)}s`);
    console.log(`${config.devMode ? 'Development' : 'Live'} build.`);

    const devModeCheckInterval = `*/10 * * * * *`;
    const normalCheckInterval = `*/${config.checkInterval} * * * *`;
    const interval = config.devMode ? devModeCheckInterval : normalCheckInterval;
    cron.schedule(interval, () => {
        checkNew(locations, client, settings);
    });

    checkNew(locations, client, settings);
});

client.on('guildDelete', (guild) => {
    settings.removeConfig(guild.id);
});

client.on('guildCreate', async (guild) => {
    try {
        const myUser = guild.me;
        if (myUser === null) return;
        const channel = guild.channels.cache.find(
            (channel) =>
                channel.type === 'GUILD_TEXT' &&
                channel.permissionsFor(myUser).has('SEND_MESSAGES') &&
                channel.permissionsFor(myUser).has('VIEW_CHANNEL')
        );
        if (!channel?.isText()) return;

        channel.send(
            `Thanks for inviting NZ Covid Bot to your server! To get started, set up a channel for receiving updates on locations of interesting using \`covid setNew <channel>\`, e.g. "covid setNew <#${channel.id}>"`
        );
    } catch (error) {
        console.log(error);
    }
});

client.on('messageCreate', async (message: Message) => {
    if (!message.guild || message.author.bot) return;

    const inDevServer: boolean = config.devServer === message.guildId;
    if (config.devMode !== inDevServer) return;

    const [prefix, command, ...args] = message.content.split(' ');

    const guildPrefixes = settings.getPrefixes(message.guild.id);
    if (guildPrefixes.indexOf(prefix) === -1 && prefix !== 'covid') return;

    const helpMode = ['help', 'h', '?'].indexOf(command) !== -1;
    let commandToExecute: Command | undefined;

    switch (helpMode ? args[0]?.toLowerCase() ?? command.toLowerCase() : command.toLowerCase()) {
        case 'config':
        case 'conf':
            commandToExecute = showConfig;
            break;
        case 'prefix':
        case 'pref':
            commandToExecute = setPrefix;
            break;
        case 'ping':
        case 'p':
            commandToExecute = ping;
            break;
        case 'setnew':
            commandToExecute = setNew;
            break;
        case 'invite':
        case 'inv':
            commandToExecute = invite;
            break;
        case 'help':
        case 'h':
            commandToExecute = help;
            break;
        case 'list':
        case 'l':
            commandToExecute = list;
            break;
        case 'query':
        case 'q':
        case 'location':
            commandToExecute = query;
        default:
            break;
    }

    if (commandToExecute === undefined) return;
    if (helpMode && commandToExecute !== help) commandToExecute.help({ message, args });
    else commandToExecute.execute({ client, message, args, settings, locations });
});

console.log(`Logging In`);
client.login(config.devMode ? config.discordTokenDev : config.discordToken);
