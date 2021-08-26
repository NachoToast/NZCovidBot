import { Client, Message } from 'discord.js';
import Command from '../interfaces/Command';

const ping: Command = {
    execute: async ({ message, args, client }: { message: Message; args: string[]; client: Client }) => {
        message.channel.send(
            `Pongers! (${Math.abs(Date.now() - message.createdTimestamp)}ms)\nAPI Latency: ${Math.round(client.ws.ping)}ms`
        );
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Ping the bot to see if it's online.\nUsage: \`covid ping\``);
    },
};

export default ping;
