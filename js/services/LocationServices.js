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
                quests: ['Help the town crier', 'Find the lost child', 'Organize the seasonal festival']
            },
            'Market': {
                description: 'A vibrant marketplace where merchants hawk their wares. Colorful awnings shade stalls offering everything from exotic spices to finely crafted jewelry.',
                quests: ['Bargain with the merchants', 'Deliver goods to the inn', 'Track down the pickpocket']
            },
            'Inn': {
                description: 'The Sleeping Dragon Inn offers rest and refreshment to weary travelers. The warm interior smells of hearth fire, fresh bread, and spilled ale.',
                quests: ['Help the innkeeper', 'Listen for rumors', 'Break up the tavern brawl']
            },
            'Stables': {
                description: 'The stables house the city\'s horses and other animals. The earthy scent of hay and leather fills the air as grooms tend to their charges.',
                quests: ['Feed the horses', 'Repair the stable roof', 'Find the missing prized stallion']
            },
            'Library': {
                description: 'Everlyn\'s grand library houses countless tomes of knowledge. Ornate wooden shelves stretch to the vaulted ceiling, and magical glowing orbs provide reading light.',
                quests: ['Research ancient texts', 'Help the librarian organize shelves', 'Recover a stolen manuscript']
            },
            'Temple': {
                description: 'A serene sanctuary dedicated to the city\'s patron deities. Sunlight streams through stained glass windows, casting colored patterns across the stone floor.',
                quests: ['Assist with daily ceremonies', 'Cleanse the shrine', 'Investigate strange occurrences in the crypt']
            },
            'City Wall': {
                description: 'The sturdy walls protect the city from outside threats. Made of massive stone blocks, they stand thirty feet high and are wide enough for four guards to walk abreast.',
                quests: ['Patrol the wall', 'Repair damaged sections', 'Investigate suspicious activity']
            },
            'Blacksmith': {
                description: 'The forge of the city, where weapons and armor are crafted. The air shimmers with heat as hammers ring against metal day and night.',
                quests: ['Collect ore', 'Test new weapons', 'Deliver a special order to the guard captain']
            },
            'River Port': {
                description: 'A bustling dock where trade goods flow in and out of Everlyn. Wooden piers extend into the blue waters where riverboats and small merchant vessels are moored. The air smells of fish, rope, and opportunity.',
                quests: ['Help unload cargo', 'Catch a smuggler', 'Repair a damaged boat']
            },
            'North Gate': {
                description: 'The imposing North Gate faces the mountains and trade routes to distant kingdoms. Its twin towers stand like sentinels, and the massive iron-bound wooden doors are reinforced with mythril bands.',
                quests: ['Inspect incoming caravans', 'Deliver message to the night watch', 'Investigate smuggling rumors']
            },
            'South Gate': {
                description: 'The South Gate opens to farmlands and the river port. Smaller than the North Gate but more ornate, its archway is carved with scenes of harvest and bounty.',
                quests: ['Help farmers bring goods to market', 'Clear the road of bandits', 'Repair the portcullis mechanism']
            },
            'East Gate': {
                description: 'The East Gate faces the ancient forest. Its weathered stone is engraved with protective runes, and torches in iron brackets burn with an unusually bright flame.',
                quests: ['Escort herbalists gathering ingredients', 'Clear monster nests near the road', 'Strengthen the magical wards']
            },
            'West Gate': {
                description: 'The West Gate leads to the mines and mountain passes. The sturdiest of all gates, it features additional reinforcements and a double portcullis system.',
                quests: ['Guide miners safely to work', 'Clear rock slides from the path', 'Test the new alarm system']
            },
            'Mines': {
                description: 'The mines are rich with resources but also fraught with danger. Iron tracks lead into dark tunnels, and the rhythmic sound of pickaxes echoes from within.',
                quests: ['Mine for gems', 'Clear out rock worms', 'Find the lost mining crew']
            },
            'Forest': {
                description: 'A dense forest east of the city. Ancient trees tower overhead, their canopy filtering sunlight into dappled patterns. Strange whispers seem to follow visitors who stray from the path.',
                quests: ['Gather rare herbs', 'Hunt for food', 'Investigate mysterious lights seen at night']
            },
            'River': {
                description: 'The river flows swiftly past the city, its waters clear and cold. Fishermen cast their lines from the banks, and children play along the shores.',
                quests: ['Catch fish for the inn', 'Repair the fishing nets', 'Investigate strange currents']
            },
            'Farmlands': {
                description: 'The fertile fields surrounding Everlyn are dotted with farms. Crops sway in the breeze, and farmers work tirelessly to bring in the harvest.',
                quests: ['Help with the harvest', 'Protect crops from pests', 'Investigate missing livestock']
            },
        };
    }
}