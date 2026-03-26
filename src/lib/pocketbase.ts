// /lib/pocketbase.ts
import PocketBase from "pocketbase";
//console.log("PocketBase instance created");
const pb = new PocketBase("https://base.miftachuda.my.id");
pb.autoCancellation(false);
export { pb };
