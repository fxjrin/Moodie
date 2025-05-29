import Text "mo:base/Text";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Types "types/Types";
import UserService "services/UserService";
import LLM "mo:llm";

actor {
    private var users : Types.Users = HashMap.HashMap(0, Principal.equal, Principal.hash);
    private var journals : HashMap.HashMap<Principal, [Types.JournalEntry]> = HashMap.HashMap(0, Principal.equal, Principal.hash);
    private stable var stableUsers : [(Principal, Types.User)] = [];
    private stable var stableJournals : [(Principal, [Types.JournalEntry])] = [];

    system func preupgrade() {
        stableUsers := Iter.toArray(users.entries());
        stableJournals := Iter.toArray(journals.entries());
    };

    system func postupgrade() {
        users := HashMap.fromIter<Principal, Types.User>(stableUsers.vals(), 0, Principal.equal, Principal.hash);
        journals := HashMap.fromIter<Principal, [Types.JournalEntry]>(stableJournals.vals(), 0, Principal.equal, Principal.hash);
        stableUsers := [];
        stableJournals := [];
    };

    ///////////////////////
    // AUTHENTICATE USER //
    ///////////////////////

    public shared (message) func authenticateUser(username : Text) : async Result.Result<Types.User, Text> {
        return UserService.authenticateUser(users, message.caller, username);
    };

    public shared (message) func updateUserProfile(updateData : Types.UserUpdateData) : async Result.Result<Types.User, Text> {
        return UserService.updateUserProfile(users, message.caller, updateData);
    };

    public query func getUserByUsername(username : Text) : async ?Types.User {
        return UserService.getUserByUsername(users, username);
    };

    public query func getUserByPrincipal(userId : Principal) : async ?Types.User {
        return users.get(userId);
    };

    //////////////////
    // FOOD SCANNER //
    //////////////////

    let llm = actor ("pum7a-lyaaa-aaaag-aubya-cai") : actor {
        analyzeFood : (Text) -> async Text;
    };

    public func scanImage(imageBase64 : Text) : async Text {
        let result = await llm.analyzeFood(imageBase64);
        return result;
    };

    /////////////////////
    // CHAT & JOURNALS //
    /////////////////////

    let systemPrompt = "You are Moodie, a helpful assistant that answers user questions in a friendly and concise way.";
    let moodPrompt = "You are Moodie, a helpful assistant that analyzes the mood of a journal entry and replies with exactly one word: HAPPY, SAD, ANGRY, RELAXED, or NEUTRAL.";
    let reflectionPrompt = "You are Moodie, a friendly assistant that helps users feel calm and reflects kindly on their journal entry.";

    public func prompt(prompt : Text) : async Text {
        await LLM.prompt(#Llama3_1_8B, systemPrompt # " " # prompt);
    };

    public func analyzeMood(content : Text) : async Text {
        return await LLM.prompt(#Llama3_1_8B, moodPrompt # " Journal entry: " # content);
    };

    public func generateReflection(content : Text) : async Text {
        return await LLM.prompt(#Llama3_1_8B, reflectionPrompt # " Journal entry: " # content);
    };

    // Get a journals
    public query func getJournals(userId : Principal) : async ?[Types.JournalEntry] {
        return journals.get(userId);
    };

    // Add a journal entry
    public shared (message) func addJournalEntry(entry : Types.JournalEntry) : async Result.Result<Text, Text> {
        let userId = message.caller;
        if (Principal.isAnonymous(userId)) {
            return #err("Anonymous users cannot add journal entries");
        };

        let mood = await analyzeMood(entry.content);
        let reflection = await generateReflection(entry.content);

        let entryWithMood : Types.JournalEntry = {
            id = entry.id;
            title = entry.title;
            content = entry.content;
            createdAt = entry.createdAt;
            updatedAt = entry.updatedAt;
            mood = mood;
            reflection = reflection;
        };

        var userJournals = journals.get(userId);
        switch (userJournals) {
            case (null) {
                journals.put(userId, [entryWithMood]);
            };
            case (?entries) {
                journals.put(userId, Array.append(entries, [entryWithMood]));
            };
        };
        return #ok("Journal added");
    };

    // Update a journal entry by id
    public shared (message) func updateJournalEntry(entry : Types.JournalEntry) : async Result.Result<Text, Text> {
        let userId = message.caller;
        if (Principal.isAnonymous(userId)) {
            return #err("Anonymous users cannot update journal entries");
        };
        var userJournals = journals.get(userId);
        switch (userJournals) {
            case (null) { return #err("No journals found for user") };
            case (?entries) {
                var updated = false;
                let newEntries = Array.map<Types.JournalEntry, Types.JournalEntry>(
                    entries,
                    func(e : Types.JournalEntry) : Types.JournalEntry {
                        if (e.id == entry.id) {
                            updated := true;
                            return entry;
                        } else {
                            return e;
                        };
                    },
                );
                if (not updated) {
                    return #err("Journal entry not found");
                };
                journals.put(userId, newEntries);
                return #ok("Journal updated");
            };
        };
    };

    // Delete journal entry by id
    public shared (message) func deleteJournalEntry(entryId : Text) : async Result.Result<Text, Text> {
        let userId = message.caller;
        if (Principal.isAnonymous(userId)) {
            return #err("Anonymous users cannot delete journal entries");
        };
        var userJournals = journals.get(userId);
        switch (userJournals) {
            case (null) { return #err("No journals found for user") };
            case (?entries) {
                let filtered = Array.filter<Types.JournalEntry>(
                    entries,
                    func(e : Types.JournalEntry) : Bool {
                        e.id != entryId;
                    },
                );
                journals.put(userId, filtered);
                return #ok("Journal deleted");
            };
        };
    };
};
