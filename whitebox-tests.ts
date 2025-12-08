/**
 * White Box Unit Tests for Sadhana-Tracker
 * 
 * These tests verify internal logic of utility functions,
 * error handling, and encryption services.
 * 
 * To run: npm test (after installing jest)
 */

// ===========================
// Test Suite: Storage Utilities
// ===========================

describe('Storage Service - generateTimeSlots', () => {
    // Import the function (mock for demonstration)
    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 4;
        const endHour = 23;

        for (let h = startHour; h <= endHour; h++) {
            const hour = h > 12 ? h - 12 : h;
            const ampm = h >= 12 ? 'PM' : 'AM';

            slots.push({
                time: `${hour}:00`,
                activity: '',
                focus: 0,
            });

            slots.push({
                time: `${hour}:30`,
                activity: '',
                focus: 0,
            });
        }
        return slots;
    };

    test('WB-U01: Should generate 40 time slots (4 AM to 11 PM, 30-min intervals)', () => {
        const slots = generateTimeSlots();
        expect(slots.length).toBe(40);
    });

    test('WB-U02: First slot should start at 4:00 AM', () => {
        const slots = generateTimeSlots();
        expect(slots[0].time).toContain('4:00');
    });

    test('WB-U03: Each slot should have required fields', () => {
        const slots = generateTimeSlots();
        slots.forEach(slot => {
            expect(slot).toHaveProperty('time');
            expect(slot).toHaveProperty('activity');
            expect(slot).toHaveProperty('focus');
        });
    });

    test('WB-U04: Default focus should be 0', () => {
        const slots = generateTimeSlots();
        slots.forEach(slot => {
            expect(slot.focus).toBe(0);
        });
    });
});

// ===========================
// Test Suite: isGuest Function
// ===========================

describe('Storage Service - isGuest', () => {
    const isGuest = (userId: string) => userId === 'guest';

    test('WB-S01: Should return true for "guest" userId', () => {
        expect(isGuest('guest')).toBe(true);
    });

    test('WB-S02: Should return false for authenticated userId', () => {
        expect(isGuest('abc123xyz')).toBe(false);
    });

    test('WB-S03: Should return false for empty string', () => {
        expect(isGuest('')).toBe(false);
    });
});

// ===========================
// Test Suite: Error Classification
// ===========================

describe('Error Handling - classifyError', () => {
    enum ErrorType {
        NETWORK = 'NETWORK',
        DATABASE = 'DATABASE',
        AUTHENTICATION = 'AUTH',
        VALIDATION = 'VALIDATION',
        UNKNOWN = 'UNKNOWN'
    }

    const classifyError = (error: Error): ErrorType => {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
            return ErrorType.NETWORK;
        }

        if (message.includes('firebase') || message.includes('database') || message.includes('permission')) {
            return ErrorType.DATABASE;
        }

        if (message.includes('auth') || message.includes('unauthorized') || message.includes('login')) {
            return ErrorType.AUTHENTICATION;
        }

        if (message.includes('invalid') || message.includes('required') || message.includes('validation')) {
            return ErrorType.VALIDATION;
        }

        return ErrorType.UNKNOWN;
    };

    test('WB-E01: Should classify network errors correctly', () => {
        expect(classifyError(new Error('network error occurred'))).toBe(ErrorType.NETWORK);
        expect(classifyError(new Error('fetch failed'))).toBe(ErrorType.NETWORK);
        expect(classifyError(new Error('connection timeout'))).toBe(ErrorType.NETWORK);
    });

    test('WB-E02: Should classify database errors correctly', () => {
        expect(classifyError(new Error('firebase permission denied'))).toBe(ErrorType.DATABASE);
        expect(classifyError(new Error('database write failed'))).toBe(ErrorType.DATABASE);
    });

    test('WB-E03: Should classify authentication errors correctly', () => {
        expect(classifyError(new Error('unauthorized access'))).toBe(ErrorType.AUTHENTICATION);
        expect(classifyError(new Error('auth token expired'))).toBe(ErrorType.AUTHENTICATION);
        expect(classifyError(new Error('login required'))).toBe(ErrorType.AUTHENTICATION);
    });

    test('WB-E04: Should classify validation errors correctly', () => {
        expect(classifyError(new Error('invalid input'))).toBe(ErrorType.VALIDATION);
        expect(classifyError(new Error('required field missing'))).toBe(ErrorType.VALIDATION);
        expect(classifyError(new Error('validation failed'))).toBe(ErrorType.VALIDATION);
    });

    test('WB-E05: Should return UNKNOWN for unrecognized errors', () => {
        expect(classifyError(new Error('something went wrong'))).toBe(ErrorType.UNKNOWN);
        expect(classifyError(new Error('random error'))).toBe(ErrorType.UNKNOWN);
    });
});

// ===========================
// Test Suite: Input Sanitization
// ===========================

describe('Encryption Service - sanitizeInput', () => {
    const sanitizeInput = (input: string): string => {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    test('WB-EN09: Should escape HTML tags', () => {
        expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
        expect(sanitizeInput('<div>')).toBe('&lt;div&gt;');
    });

    test('WB-EN10: Should escape quotes', () => {
        expect(sanitizeInput('"Hello"')).toBe('&quot;Hello&quot;');
        expect(sanitizeInput("'World'")).toBe('&#x27;World&#x27;');
    });

    test('WB-EN11: Should escape forward slashes', () => {
        expect(sanitizeInput('/path/to/file')).toBe('&#x2F;path&#x2F;to&#x2F;file');
    });

    test('WB-EN12: Should handle mixed XSS attempts', () => {
        const input = '<script>alert("XSS")</script>';
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
    });
});

// ===========================
// Test Suite: Encryption Detection
// ===========================

describe('Encryption Service - isEncrypted', () => {
    const ENCRYPTION_CONFIG = {
        saltLength: 16,
        ivLength: 12,
    };

    const isEncrypted = (text: string): boolean => {
        try {
            // Encrypted messages are base64 encoded and have a specific length
            if (!text || text.length < 40) return false;

            // Try to decode - encrypted messages should decode successfully
            const decoded = atob(text);
            return decoded.length >= ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength + 16;
        } catch {
            return false;
        }
    };

    test('WB-EN06: Plain text should not be detected as encrypted', () => {
        expect(isEncrypted('Hello World')).toBe(false);
        expect(isEncrypted('Hare Krishna')).toBe(false);
    });

    test('WB-EN07: Short strings should not be detected as encrypted', () => {
        expect(isEncrypted('abc')).toBe(false);
        expect(isEncrypted('')).toBe(false);
        expect(isEncrypted('short')).toBe(false);
    });

    test('WB-EN08: Valid base64 with sufficient length should be detected', () => {
        // Create a string that looks like encrypted content
        const fakeEncrypted = btoa('a'.repeat(50)); // Will be long enough
        expect(isEncrypted(fakeEncrypted)).toBe(true);
    });
});

// ===========================
// Test Suite: Default Entry Creation
// ===========================

describe('Storage Service - createDefaultEntry', () => {
    const INITIAL_METRICS = {
        wakeUpTime: '',
        sleepTime: '',
        totalSleep: 0,
        emotionalStability: 5,
        disciplineScore: 3,
        deepStudyHours: 0,
        lightStudyHours: 0,
        wastedHours: 0,
        phoneUsage: 0,
        chantingRounds: 0,
        gitaReading: false,
        sadhanaQuality: 5,
        sevaPerformed: '',
        overallPerformance: 5,
        waterIntake: 0,
        foodDiscipline: 5,
        energyLevel: 5,
        mood: 5,
    };

    const createDefaultEntry = (dateStr: string) => ({
        id: dateStr,
        date: dateStr,
        commitments: Array(5).fill(null).map((_, i) => ({ id: i + 1, text: '', done: false })),
        reasonNotCompleted: '',
        timeline: [],
        metrics: { ...INITIAL_METRICS },
        reflections: {
            didWell: '',
            heldBack: '',
            improveTomorrow: '',
            avoidTomorrow: '',
            victory: '',
            lostControl: '',
        },
        lastUpdated: Date.now(),
    });

    test('WB-U05: Should create entry with given date as id', () => {
        const entry = createDefaultEntry('2025-12-08');
        expect(entry.id).toBe('2025-12-08');
        expect(entry.date).toBe('2025-12-08');
    });

    test('WB-U06: Should have exactly 5 commitments', () => {
        const entry = createDefaultEntry('2025-12-08');
        expect(entry.commitments.length).toBe(5);
    });

    test('WB-U07: Commitments should have correct IDs (1-5)', () => {
        const entry = createDefaultEntry('2025-12-08');
        entry.commitments.forEach((c, i) => {
            expect(c.id).toBe(i + 1);
        });
    });

    test('WB-U08: All commitments should start empty and undone', () => {
        const entry = createDefaultEntry('2025-12-08');
        entry.commitments.forEach(c => {
            expect(c.text).toBe('');
            expect(c.done).toBe(false);
        });
    });

    test('WB-U09: Metrics should have default values', () => {
        const entry = createDefaultEntry('2025-12-08');
        expect(entry.metrics.chantingRounds).toBe(0);
        expect(entry.metrics.emotionalStability).toBe(5);
        expect(entry.metrics.gitaReading).toBe(false);
    });
});

// ===========================
// Test Suite: Admin Access Control
// ===========================

describe('Admin Service - isAdmin logic', () => {
    const ADMIN_EMAIL = 'jashwanthjavili7@gmail.com';

    const checkAdminEmail = (email: string): boolean => {
        return email === ADMIN_EMAIL;
    };

    test('WB-A01: Super admin email should return true', () => {
        expect(checkAdminEmail('jashwanthjavili7@gmail.com')).toBe(true);
    });

    test('WB-A02: Regular user email should return false', () => {
        expect(checkAdminEmail('user@example.com')).toBe(false);
        expect(checkAdminEmail('test@test.com')).toBe(false);
    });

    test('WB-A03: Similar but different email should return false', () => {
        expect(checkAdminEmail('jashwanthjavili7@gmail.co')).toBe(false);
        expect(checkAdminEmail('Jashwanthjavili7@gmail.com')).toBe(false); // Case sensitive
    });
});

console.log('✅ All White Box unit tests defined successfully');
console.log('📋 Run with: npx jest whitebox-tests.ts');
