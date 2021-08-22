export default interface Location {
    type: string;
    properties: {
        [index: string]: string;
        id: string;
        Event: string;
        Location: string;
        City: string;
        Start: string;
        End: string;
        Advice: string;
        Added: string;
    };
    geometry: {
        type: string;
        coordinates: Number[];
    };
}
