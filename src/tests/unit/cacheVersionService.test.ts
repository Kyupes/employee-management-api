import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redisClient } from '../../config/redisClient';
import { getVersion, initializeVersion, incrementVersion, ensureVersion } from '../../cache/cacheVersionService';
import { RedisClient } from 'redis';

vi.mock('../../config/redisClient');

describe('Redis version cache', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    });

    const listVersionKey = `employees:list:version`;

    describe('getVersion', () => {
        it('should return found with version when valid', async () =>{
            vi.mocked(redisClient.get).mockResolvedValue('1');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'found' , version: 1});
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
        });

        it('should return missing', async () =>{
            vi.mocked(redisClient.get).mockResolvedValue(null);
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'missing' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
        });

        it('should return error when invalid version', async () =>{
            vi.mocked(redisClient.get).mockRejectedValue('invalid version');
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'error' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(consoleSpy).toHaveBeenCalled;
        });

        it('should return error when invalid version', async () =>{
            vi.mocked(redisClient.get).mockRejectedValue('5.873');
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'error' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(consoleSpy).toHaveBeenCalled;
        });

        it('should return when redis failure', async () =>{
            vi.mocked(redisClient.get).mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'error' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(consoleSpy).toHaveBeenCalled;
        });
    });

    describe('initializeVersion', () => {
        it('should initiliaze version when non-existent', async () =>{
            vi.mocked(redisClient.set).mockResolvedValue('OK');
            const consoleSpy = vi.spyOn(console, 'error');
            await initializeVersion(listVersionKey);
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should not change when existent version', async () =>{ // not sure how to test properly
            vi.mocked(redisClient.set).mockResolvedValue(null);
            const consoleSpy = vi.spyOn(console, 'error');
            await initializeVersion(listVersionKey);
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should catch and log when redis failure', async () =>{
            vi.mocked(redisClient.set).mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            await initializeVersion(listVersionKey);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('incrementVersion', () => {
        it('should ', async () =>{

        });
    });

    describe('ensureVersion', () => {
        it('should ', async () =>{

        });
    });
})