import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Int "mo:base/Int";

module {
    public type Users = HashMap.HashMap<Principal, User>;
    public type Journal = HashMap.HashMap<Principal, [JournalEntry]>;

    public type User = {
        id : Principal;
        username : Text;
        name : ?Text;
        createdAt : Int;
        profilePicture : ?Text;
    };

    public type UserUpdateData = {
        username : ?Text;
        name : ?Text;
        profilePicture : ?Text;
    };

    public type JournalEntry = {
        id : Text;
        title : Text;
        content : Text;
        createdAt : Int;
        updatedAt : Int;
        mood : Text;
        reflection : Text;
    };
};
