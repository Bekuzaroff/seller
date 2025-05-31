import Redis from "ioredis";

class RedisSingleton{
    private constructor(){
        
    }

    static redis: Redis | null = null
    static getInstance(){
        if(RedisSingleton.redis){
            return RedisSingleton.redis;
        }
        RedisSingleton.redis = new Redis();
        return RedisSingleton.redis;
    }
}

export default RedisSingleton;