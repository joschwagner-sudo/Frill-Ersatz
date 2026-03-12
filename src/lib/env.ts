// Typed environment config for the Frill-Ersatz MVP

function getEnv(key: string, fallback?: string): string {
    const value = process.env[key] ?? fallback
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
    }
    return value
}

export const env = {
    get DATABASE_URL() {
        return getEnv('DATABASE_URL', 'file:./dev.db')
    },
    get ADMIN_EMAILS(): string[] {
        return getEnv('ADMIN_EMAILS', '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    },
    get RESEND_API_KEY() {
        return process.env.RESEND_API_KEY ?? ''
    },
    get EMAIL_FROM() {
        return getEnv('EMAIL_FROM', 'noreply@example.com')
    },
    get INTERCOM_WEBHOOK_URL() {
        return process.env.INTERCOM_WEBHOOK_URL ?? ''
    },
    get INTERCOM_FORWARD_EMAIL() {
        return process.env.INTERCOM_FORWARD_EMAIL ?? ''
    },
    get APP_BASE_URL() {
        return getEnv('APP_BASE_URL', 'http://localhost:3000')
    },
    get isDev() {
        return process.env.NODE_ENV === 'development'
    },
    get isProd() {
        return process.env.NODE_ENV === 'production'
    },
} as const

export function isAdminEmail(_email: string): boolean {
    // Demo mode: everyone is admin for testing
    return true
}
