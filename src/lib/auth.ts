import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key-change-this-in-env';
const key = new TextEncoder().encode(SECRET_KEY);

export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    // Direct string comparison for plain text passwords
    return password === storedPassword;
}

export async function createSession(payload: any) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(key);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function verifySession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value;

    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
}
