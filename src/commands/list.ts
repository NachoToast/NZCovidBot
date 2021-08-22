import { Message } from 'discord.js';
import Command from '../interfaces/Command';

const commands: string[] = ['ping', 'list', 'help', 'invite'];
const adminCommands: string[] = ['config', 'setNew', 'prefix'];

const list: Command = {
    execute: async ({ message }: { message: Message }) => {
        message.channel.send(`Basic commands:\n${commands.join(', ')}\nAdmin Commands:\n${adminCommands.join(', ')}`);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Lists all commands of the bot.`);
    },
};

export default list;
