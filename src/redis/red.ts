import Redis from "ioredis";

class Red{
    private constructor(){
        
    }

    static redis: Redis | null = null
    static getInstance(){
        if(Red.redis){
            return Red.redis;
        }
        Red.redis = new Redis();
        return Red.redis;
    }
}

export default Red;