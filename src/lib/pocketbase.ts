// /lib/pocketbase.ts
import PocketBase from "pocketbase";
//console.log("PocketBase instance created");
const pb = new PocketBase("https://base.loc-2.com");
pb.autoCancellation(false);
export { pb };
