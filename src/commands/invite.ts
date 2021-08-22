// DEV  https://discord.com/api/oauth2/authorize?client_id=878842220755697756&permissions=8&scope=bot
// LIVE https://discord.com/api/oauth2/authorize?client_id=878841453328085032&permissions=8&scope=bot
import { devMode } from '../config.json';
import Command from '../interfaces/Command';
import { Message } from 'discord.js';

const invite: Command = {
    execute: async ({ message }: { message: Message }) => {
        message.channel.send(
            devMode
                ? '<https://discord.com/api/oauth2/authorize?client_id=878842220755697756&permissions=18432&scope=bot>'
                : '<https://discord.com/api/oauth2/authorize?client_id=878841453328085032&permissions=18432&scope=bot>'
        );
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Sends the bot invite link in the channel.`);
    },
};

export default invite;
