import NodeCache from "node-cache";

const EXPIRE_TIME = 60;
const cache = new NodeCache({ stdTTL: EXPIRE_TIME });

export default cache;
