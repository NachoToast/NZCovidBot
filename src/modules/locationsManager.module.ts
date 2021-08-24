import Location from '../interfaces/Location';
import fs from 'fs';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';

const fetch = require('node-fetch');

interface LocationMeta {
    number: number;
    lastUpdated: string;
}

class LocationsManager {
    private static currentMonth = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
    ];

    public locations: Location[];
    public locationsMeta: LocationMeta;

    constructor() {
        try {
            this.locations = JSON.parse(fs.readFileSync('covidData/locations.json', 'utf8'));
            this.locationsMeta = {
                number: this.locations.length,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.log(error);
            process.exit();
        }
    }

    public async checkNewLocations(): Promise<Location[] | string> {
        // checks if the number of locations online differs from local number
        // returns array of new locations, or a string on error
        try {
            // get json data
            const { features: newLocations }: { features: Location[] } = await fetch(
                `https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/${
                    LocationsManager.currentMonth[new Date().getMonth()]
                }-2021/locations-of-interest.geojson`
            ).then((res: any) => res.json());

            // calcualting added locations, i.e. locations in new but not local
            const actuallyNew: Location[] = [];
            const localIDs = this.locations.map((e) => e.properties.id);
            for (const location of newLocations) {
                const indexInOld = localIDs.indexOf(location.properties.id);
                if (indexInOld === -1) {
                    actuallyNew.push(location);
                } else {
                    localIDs.splice(indexInOld, 1);
                }
            }

            // mark new updated time
            this.locationsMeta.lastUpdated = new Date().toISOString();

            return actuallyNew;
        } catch (error) {
            console.log(error);
            return 'Error occured checking new locations.';
        }
    }

    public async updateLocalLocations(): Promise<boolean | string> {
        // updates local locations with ones from online
        // return true on success, a string on error
        try {
            // get json data
            const { features: newLocations }: { features: Location[] } = await fetch(
                `https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/${
                    LocationsManager.currentMonth[new Date().getMonth()]
                }-2021/locations-of-interest.geojson`
            ).then((res: any) => res.json());

            // make new meta object
            const metaObj: LocationMeta = {
                number: newLocations.length,
                lastUpdated: new Date().toISOString(),
            };

            this.locations = newLocations;
            this.locationsMeta = metaObj;

            // update files
            fs.writeFileSync('covidData/locations.json', JSON.stringify(newLocations, null, 4));

            return true;
        } catch (error) {
            console.log(error);
            return 'Error occured updating locations.';
        }
    }

    // public static dateChecker = new RegExp(/[0-9]{1,2}[./][0-9]{1,2}/, 'g'); // matches dd/mm, d.m.y, etc...
    public static addedKeywords = ['today', 'yesterday', 'week', 'month', '24hrs'];
    public static validSearchFields = ['Added', 'City', 'Event', 'Location', 'All', 'Id'];

    public async queryLocations(searchKey: string, searchValue: string | string[]): Promise<Location[] | string> {
        // returns an array of locations specifying a search condition
        // or a string if an error occured or search was invalid
        try {
            // enforce uppercase search key
            searchKey = searchKey[0].toUpperCase() + searchKey.slice(1).toLowerCase();

            // also avoid arrays with 1 element
            if (Array.isArray(searchValue) && searchValue.length === 1) searchValue = searchValue[0];

            // do ID first because we don't want to enforce lowercase on searchValue when searching by ID
            if (searchKey === 'Id') {
                // so does id
                if (typeof searchValue !== 'string' /*  || searchValue.length != 15 */) return 'Invalid ID';
                return this.locations.filter(({ properties: { id } }) => id === searchValue);
            }

            // now we can safely enforce case
            // enforce lowercase search value
            if (typeof searchValue === 'string') searchValue = searchValue.toLowerCase();
            else searchValue = searchValue.map((e) => e.toLowerCase());

            if (!LocationsManager.validSearchFields.includes(searchKey)) {
                return `Please search by one of the following ${LocationsManager.validSearchFields.join(', ').toLowerCase()}.`;
            }

            // added is date and so behaves differently from others
            if (searchKey === 'Added') {
                if (typeof searchValue !== 'string') return 'Please only specify 1 argument when searching by added.';

                if (!LocationsManager.addedKeywords.includes(searchValue) && !searchValue.endsWith('hrs'))
                    return `Please enter any of the following keywords to filter by date: ${LocationsManager.addedKeywords.join(
                        ', '
                    )}.`;
                // ensure input date is either in d/m/y related format or a keyword like 'today' or 'week'
                let dateValueToSearch: number;
                const thisDay = new Date().getDate();
                const thisMonth = new Date().getMonth();
                const thisYear = new Date().getFullYear();
                switch (searchValue) {
                    case 'month':
                        dateValueToSearch = new Date(thisYear, thisMonth - 1, thisDay).getTime();
                        break;
                    case 'yesterday':
                        dateValueToSearch = new Date(thisYear, thisMonth, thisDay - 1).getTime();
                        break;
                    case 'week':
                        dateValueToSearch = new Date(thisYear, thisMonth, thisDay - 7).getTime();
                        break;
                    case 'today':
                        dateValueToSearch = new Date().getTime();
                        break;
                    default:
                        if (searchValue.endsWith('hrs') && !Number.isNaN(Number(searchValue.replace('hrs', '')))) {
                            const hrs = Number(searchValue.replace('hrs', ''));
                            dateValueToSearch = new Date().getTime() - hrs * 3600000;
                        } else if (searchValue.endsWith('hrs')) {
                            return 'Invalid amount of hours.';
                        } else
                            return `Please enter any of the following keywords to filter by date: ${LocationsManager.addedKeywords.join(
                                ', '
                            )}.`;
                }

                return this.locations.filter(({ properties: { Added, Start } }) => {
                    const dateArray: number[] = [];
                    if (Added !== '') dateArray.push(LocationsManager.stringToDate(Added).getTime());
                    if (Start !== '') dateArray.push(LocationsManager.stringToDate(Start).getTime());
                    const max = Math.max(...dateArray);
                    return max >= dateValueToSearch;
                });
            }

            // if key isn't 'added', behave normally
            if (searchKey !== 'All') {
                if (typeof searchValue === 'string') {
                    const valueToSearch = searchValue; // putting searchValue in directly gives me an error :/
                    return this.locations.filter(({ properties }) =>
                        properties[searchKey]?.toLowerCase()?.includes(valueToSearch)
                    );
                }
                // searching specific key by array = OR operation
                return this.locations.filter(({ properties }) =>
                    properties[searchKey]
                        ?.toLowerCase()
                        ?.split(' ')
                        ?.some((e) => searchValue.includes(e))
                );
            }

            // if we got here, a searchKey is 'All', meaning we should search Event, Location, and City
            if (typeof searchValue === 'string') {
                //
                const valueToSearch = searchValue; // putting searchValue in directly gives me an error :/
                return this.locations.filter(
                    ({ properties: { Event, Location, City, id } }) =>
                        Event?.toLowerCase()?.includes(valueToSearch) ||
                        Location?.toLowerCase()?.includes(valueToSearch) ||
                        City?.toLowerCase()?.includes(valueToSearch) ||
                        id?.toLowerCase()?.includes(valueToSearch)
                );
            }

            // otherwise if multiple search words are specified, return locations containing ALL of them
            const searchValues = searchValue;
            return this.locations.filter(({ properties: { Event, Location, City } }) => {
                const wordArray = `${Event?.toLowerCase()} ${Location?.toLowerCase()} ${City?.toLowerCase()}`.split(' ');
                return searchValues.every((e) => wordArray.includes(e));
            });
        } catch (error) {
            console.log(error);
            return 'Error occured searching through locations.';
        }
    }

    private static stringToDate(input: string): Date {
        // Added: yyyy-mm-dd hh:mm:ss, dd/mm/yy h:mm
        // Stard|End: dd/mm/yy, h:mm am|pm

        if (input.includes(',')) {
            // Stard|End
            const [date, time, half] = input.split(/[, ]+/);
            const [day, month, year] = date.split('/').map((e) => Number(e));
            const [hour, minute] = time.split(':').map((e) => Number(e));
            const hour24 = this.convertTo24Hour(hour, half);
            // return `${day}/${month}/${year} - ${hour24}:${minute} (was ${input})`;
            return new Date(year, month - 1, day, hour24, minute);
        }
        // Added
        const [date, time] = input.split(' ');
        const [day, month, year] = (date.includes('/') ? date.split('/') : date.split('-').reverse()).map((e) => Number(e));
        const [hour24, minute, second] = time.split(':').map((e) => Number(e));
        // return `${day}/${month}/${year} - ${hour24}:${minute}:${second} (was ${input})`;
        return new Date(year, month - 1, day, hour24, minute, second ?? 0);
    }

    private static convertTo24Hour(hour: number, timehalf: string) {
        if (timehalf === 'pm' && hour < 12) return hour + 12;
        if (timehalf === 'am' && hour === 12) return 0;
        return hour;
    }

    private static stringToMoment(input: string, includesHour?: true): string {
        let [day, month, year] = input
            .slice(0, 10)
            .split(/[/-]/)
            .map((e) => Number(e));
        if (input.slice(0, 10).includes('-')) {
            let temp = day;
            day = year;
            year = temp;
        }
        let date;
        if (includesHour === true) {
            let [hour, minute, second] = input
                .split(' ')[1]
                .split(':')
                .map((e) => Number(e));
            date = new Date(year, month - 1, day, hour, minute, second ?? 0);
        } else date = new Date(year, month - 1, day);
        return moment(date).fromNow();
    }

    public static makeMassLocationEmbed(locations: Location[], maxLength?: number): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setDescription(`Search by ID for location-specific information and other details.`)
            .setFooter(
                'Locations of Interest',
                'https://cdn.discordapp.com/attachments/879001616265650207/879001636100534382/iconT.png'
            )
            .setTimestamp();

        if (maxLength !== undefined && locations.length !== maxLength) {
            embed.setTitle(`Showing ${locations.length}/${maxLength} Locations`);
        } else embed.setTitle(`${locations.length} Locations`);

        for (const {
            properties: { Event, id, Location },
        } of locations) {
            embed.addField(`${Event ?? 'Unknown Event'}`, `${Location ?? 'Unknown Location'}\nID: ${id ?? 'Unknown'}`);
        }
        return embed;
    }

    public static makeLocationEmbed({ properties: data }: Location): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor('#ffcc00')
            .setTitle(data?.Event ?? 'Unknown Event')
            .setDescription(data?.Location.replace(', ', '\n') ?? 'Unknown Location')
            .setTimestamp();
        if (data.Start !== '') {
            embed.addField('Started', `${data.Start}`, true);
        } else embed.addField('Started', 'Unknown', true);

        if (data.End !== '') {
            embed.addField('Ended', `${data.End}`, true);
        } else embed.addField('Ended', 'Unknown', true);

        const footer = data?.Added === '' ? 'Unknown Added Date' : `Added ${moment(this.stringToDate(data.Added)).fromNow()}`;
        embed.setFooter(
            `${footer} / ID: ${data?.id ?? 'Unknown'}`,
            'https://cdn.discordapp.com/attachments/879001616265650207/879001636100534382/iconT.png'
        );
        embed.addField('Advice', data?.Advice ?? 'None');

        return embed;
    }
}

export default LocationsManager;
