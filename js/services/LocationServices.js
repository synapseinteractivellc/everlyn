/**
 * LocationService - Manages location data for the game
 * Single source of truth for location information
 */
class LocationServiceClass {
    constructor() {
        // Initialize the location data
        this.locations = {
            'City Square': {
                description: 'The bustling heart of Everlyn where citizens gather. The cobblestone plaza is ringed with benches and a central fountain depicts the city\'s mythical founding.',
            },
            'Market': {
                description: 'A vibrant marketplace where merchants hawk their wares. Colorful awnings shade stalls offering everything from exotic spices to finely crafted jewelry.',
            },
            'Inn': {
                description: 'The Sleeping Dragon Inn offers rest and refreshment to weary travelers. The warm interior smells of hearth fire, fresh bread, and spilled ale.',
            },
            'Stables': {
                description: 'The stables house the city\'s horses and other animals. The earthy scent of hay and leather fills the air as grooms tend to their charges.',
            },
            'Library': {
                description: 'Everlyn\'s grand library houses countless tomes of knowledge. Ornate wooden shelves stretch to the vaulted ceiling, and magical glowing orbs provide reading light.',
            },
            'Temple': {
                description: 'A serene sanctuary dedicated to the city\'s patron deities. Sunlight streams through stained glass windows, casting colored patterns across the stone floor.',
            },
            'City Wall': {
                description: 'The sturdy walls protect the city from outside threats. Made of massive stone blocks, they stand thirty feet high and are wide enough for four guards to walk abreast.',
            },
            'Blacksmith': {
                description: 'The forge of the city, where weapons and armor are crafted. The air shimmers with heat as hammers ring against metal day and night.',
            },
            'River Port': {
                description: 'A bustling dock where trade goods flow in and out of Everlyn. Wooden piers extend into the blue waters where riverboats and small merchant vessels are moored. The air smells of fish, rope, and opportunity.',
            },
            'North Gate': {
                description: 'The imposing North Gate faces the mountains and trade routes to distant kingdoms. Its twin towers stand like sentinels, and the massive iron-bound wooden doors are reinforced with mythril bands.',
            },
            'South Gate': {
                description: 'The South Gate opens to farmlands and the river port. Smaller than the North Gate but more ornate, its archway is carved with scenes of harvest and bounty.',
            },
            'East Gate': {
                description: 'The East Gate faces the ancient forest. Its weathered stone is engraved with protective runes, and torches in iron brackets burn with an unusually bright flame.',
            },
            'West Gate': {
                description: 'The West Gate leads to the mines and mountain passes. The sturdiest of all gates, it features additional reinforcements and a double portcullis system.',
            },
            'Mines': {
                description: 'The mines are rich with resources but also fraught with danger. Iron tracks lead into dark tunnels, and the rhythmic sound of pickaxes echoes from within.',
            },
            'Forest': {
                description: 'A dense forest east of the city. Ancient trees tower overhead, their canopy filtering sunlight into dappled patterns. Strange whispers seem to follow visitors who stray from the path.',
            },
            'River': {
                description: 'The river flows swiftly past the city, its waters clear and cold. Fishermen cast their lines from the banks, and children play along the shores.',
            },
            'Farmlands': {
                description: 'The fertile fields surrounding Everlyn are dotted with farms. Crops sway in the breeze, and farmers work tirelessly to bring in the harvest.',
            },
        };
    }
}