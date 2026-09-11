import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redisClient } from '../../config/redisClient';
import { getVersion, initializeVersion, incrementVersion, ensureVersion } from '../../cache/cacheVersionService';

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

        it('should return error when non-numeric version', async () =>{
            vi.mocked(redisClient.get).mockResolvedValue('invalid version');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'error' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
        });

        it('should return error when fractional version', async () =>{
            vi.mocked(redisClient.get).mockResolvedValue('5.873');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'error' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
        });

        it('should return when redis failure', async () =>{
            vi.mocked(redisClient.get).mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await getVersion(listVersionKey);
            expect(result).toStrictEqual({ status: 'error' });
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('initializeVersion', () => {
        it('should initiliaze version when non-existent', async () =>{
            vi.mocked(redisClient.set).mockResolvedValue('OK');
            const consoleSpy = vi.spyOn(console, 'error');
            await initializeVersion(listVersionKey);
            expect(redisClient.set).toHaveBeenCalledWith(listVersionKey, '1', { NX: true });
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should not treat an NX no-op as an error', async () =>{
            vi.mocked(redisClient.set).mockResolvedValue(null);
            const consoleSpy = vi.spyOn(console, 'error');
            await initializeVersion(listVersionKey);
            expect(redisClient.set).toHaveBeenCalledWith(listVersionKey, '1', { NX: true });
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should catch and log when redis failure', async () =>{
            vi.mocked(redisClient.set).mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            await initializeVersion(listVersionKey);
            expect(redisClient.set).toHaveBeenCalledWith(listVersionKey, '1', { NX: true });
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('incrementVersion', () => {
        it('should return incremented version', async () =>{
            vi.mocked(redisClient.incr).mockResolvedValue(2);
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await incrementVersion(listVersionKey);
            expect(redisClient.incr).toHaveBeenCalledWith(listVersionKey);
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(result).toStrictEqual(2);
        });

        it('should return 1 when Redis reports the first increment', async () =>{
            vi.mocked(redisClient.incr).mockResolvedValue(1);
            const result = await incrementVersion(listVersionKey);
            expect(redisClient.incr).toHaveBeenCalledWith(listVersionKey);
            expect(result).toStrictEqual(1);
        });

        it('should return null when failure', async () =>{
            vi.mocked(redisClient.incr).mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await incrementVersion(listVersionKey);
            expect(redisClient.incr).toHaveBeenCalledWith(listVersionKey);
            expect(consoleSpy).toHaveBeenCalled();
            expect(result).toStrictEqual(null);
        });
    });

    describe('ensureVersion', () => {
        it('should return valid version', async () =>{
            vi.mocked(redisClient.get).mockResolvedValue('1');
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await ensureVersion(listVersionKey);
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(redisClient.set).not.toHaveBeenCalled();
            expect(result).toStrictEqual(1);
        });

        it('should initialize a missing version', async () =>{
            vi.mocked(redisClient.get)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce('2');
            vi.mocked(redisClient.set).mockResolvedValue('OK');
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await ensureVersion(listVersionKey);
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(redisClient.set).toHaveBeenCalledWith(listVersionKey, '1', { NX: true });
            expect(redisClient.get).toHaveBeenCalledTimes(2);
            expect(redisClient.set).toHaveBeenCalledTimes(1);
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(result).toStrictEqual(2);
        });

        it('should return null when fail to get version', async () =>{
            vi.mocked(redisClient.get)
            .mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await ensureVersion(listVersionKey);
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(redisClient.set).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalled();
            expect(result).toStrictEqual(null);
        });

        it('should return null when fail to initialize version', async () =>{
            vi.mocked(redisClient.get)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);
            vi.mocked(redisClient.set).mockRejectedValue(new Error);
            const consoleSpy = vi.spyOn(console, 'error');
            const result = await ensureVersion(listVersionKey);
            expect(redisClient.get).toHaveBeenCalledWith(listVersionKey);
            expect(redisClient.set).toHaveBeenCalledWith(listVersionKey, '1', { NX: true });
            expect(consoleSpy).toHaveBeenCalled();
            expect(result).toStrictEqual(null);
        });
    });
})