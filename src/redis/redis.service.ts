import { Injectable } from '@nestjs/common';
import RedisSingleton from './instance/redis_singleton';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    static redis: Redis = RedisSingleton.getInstance()

    deleteCache(keys: string[], keys_range: string){
          Promise.all([
          RedisService.redis.del(...keys),
          RedisService.redis.del(keys_range),
        ]);
    }

    getKeysArray(key_array_name: string, from: number, to: number){
        return RedisService.redis.lrange(key_array_name, from, to);
    }

    getObjectsByKeys(...keys: string[]){
        return RedisService.redis.mget(...keys);
    }

    addObjectsAndKeys(key: string, value: string, key_array_name: string){
        Promise.all([
            RedisService.redis.set(key, value),
            RedisService.redis.rpush(key_array_name, key)
        ]);
    }
}
