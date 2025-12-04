#include <string>
#include <vector>
#include <random>
#include <sstream>
using namespace std;

class WordGenerator {
private:
    vector<string> words;

public:
    WordGenerator();
    string generateText(int wordCount);
};

WordGenerator::WordGenerator() {
    words = {
        "apple", "green", "river", "monkey", "blue", "fast", "car", "laptop",
        "computer", "keyboard", "mouse", "screen", "window", "door", "house",
        "tree", "flower", "bird", "dog", "cat", "fish", "water", "fire",
        "earth", "wind", "cloud", "sun", "moon", "star", "light", "dark",
        "happy", "sad", "angry", "calm", "quiet", "loud", "big", "small",
        "hot", "cold", "warm", "cool", "red", "yellow", "orange", "purple",
        "black", "white", "gray", "brown", "pink", "book", "paper", "pen",
        "pencil", "desk", "chair", "table", "phone", "music", "song", "dance",
        "run", "walk", "jump", "fly", "swim", "eat", "drink", "sleep", "wake",
        "think", "learn", "teach", "read", "write", "speak", "listen", "see",
        "look", "watch", "find", "search", "create", "build", "make", "do",
        "work", "play", "game", "fun", "time", "day", "night", "morning",
        "evening", "week", "month", "year", "today", "tomorrow", "yesterday",
        "king", "queen", "prince", "princess", "castle", "knight", "sword", "shield", "battle", "war",
        "peace", "hero", "villain", "dragon", "giant", "elf", "dwarf", "orc", "wizard", "witch",
        "magic", "spell", "potion", "forest", "mountain", "valley", "island", "beach", "ocean", "sea",
        "lake", "riverbank", "stream", "pond", "harbor", "ship", "boat", "raft", "sail", "anchor",
        "crew", "captain", "pirate", "treasure", "map", "compass", "journey", "quest", "adventure", "legend",
        "story", "tale", "myth", "fable", "heroine", "destiny", "fate", "fortune", "luck", "chance",
        "risk", "danger", "trap", "escape", "secret", "mystery", "clue", "evidence", "case", "detective",
        "crime", "law", "justice", "judge", "jury", "trial", "court", "sentence", "prison", "cell",
        "guard", "warden", "lock", "key", "gate", "wall", "tower", "bridge", "road", "path",
        "trail", "route", "track", "station", "train", "engine", "carriage", "ticket", "platform", "schedule",
        "bus", "stop", "route", "driver", "passenger", "seat", "window", "aisle", "flight", "airplane",
        "pilot", "crew", "attendant", "airport", "runway", "terminal", "baggage", "claim", "customs", "passport",
        "border", "nation", "country", "state", "city", "village", "town", "capital", "street", "road",
        "avenue", "boulevard", "alley", "lane", "block", "corner", "sign", "signal", "crosswalk", "intersection",
        "traffic", "jam", "highway", "freeway", "bridge", "tunnel", "overpass", "underpass", "exit", "entrance",
        "mall", "shop", "store", "market", "stall", "vendor", "buyer", "customer", "cash", "credit",
        "checkout", "counter", "register", "receipt", "bag", "cart", "basket", "goods", "product", "item",
        "label", "price", "sale", "discount", "offer", "coupon", "deal", "bargain", "brand", "model",
        "make", "type", "version", "option", "variant", "choice", "select", "pick", "prefer", "wish",
        "need", "want", "buy", "order", "purchase", "deliver", "ship", "mail", "package", "parcel",
        "box", "crate", "container", "storage", "warehouse", "factory", "plant", "machine", "tool", "equipment",
        "gear", "device", "gadget", "appliance", "furniture", "sofa", "couch", "bed", "pillow", "blanket",
        "sheet", "cover", "curtain", "rug", "mat", "lamp", "bulb", "fan", "heater", "air",
        "conditioner", "filter", "cleaner", "vacuum", "broom", "mop", "bucket", "dustpan", "trash", "bin",
        "basket", "can", "recycle", "waste", "garbage", "dump", "landfill", "environment", "nature", "wild",
        "animal", "insect", "bug", "bee", "ant", "spider", "snake", "frog", "lizard", "reptile",
        "mammal", "lion", "tiger", "bear", "zebra", "giraffe", "elephant", "rhino", "hippo", "buffalo",
        "wolf", "fox", "deer", "moose", "elk", "goat", "sheep", "cow", "bull", "horse",
        "donkey", "mule", "rabbit", "rat", "mouse", "hamster", "guinea", "pig", "bat", "owl",
        "eagle", "hawk", "falcon", "crow", "sparrow", "pigeon", "seagull", "duck", "goose", "turkey",
        "chicken", "rooster", "peacock", "penguin", "ostrich", "emu", "kiwi", "parrot", "canary", "finch",
        "swan", "crane", "stork", "heron", "flamingo", "ibis", "egret", "woodpecker", "kingfisher", "hummingbird",
        "swallow", "nightingale", "whale", "dolphin", "shark", "seal", "otter", "walrus", "manatee", "narwhal",
        "octopus", "squid", "crab", "lobster", "shrimp", "coral", "reef", "algae", "kelp", "plankton"
    };
}

string WordGenerator::generateText(int wordCount) {
    if (wordCount <= 0 || words.empty()) {
        return "";
    }

    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(0, words.size() - 1);

    ostringstream result;
    for (int i = 0; i < wordCount; i++) {
        if (i > 0) {
            result << " ";
        }
        int randomIndex = dis(gen);
        result << words[randomIndex];
    }

    return result.str();
}

