import 'dotenv/config'
import { PrismaClient } from '.prisma/client/default'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

function getCurrentQuarter(): string {
    const now = new Date()
    const q = Math.ceil((now.getMonth() + 1) / 3)
    return `${now.getFullYear()}-Q${q}`
}

function getNextQuarter(): string {
    const now = new Date()
    const q = Math.ceil((now.getMonth() + 1) / 3)
    if (q === 4) {
        return `${now.getFullYear() + 1}-Q1`
    }
    return `${now.getFullYear()}-Q${q + 1}`
}

async function main() {
    console.log('🌱 Seeding database...')

    // Clean existing data
    await prisma.announcementEmailLog.deleteMany()
    await prisma.reportToIntercom.deleteMany()
    await prisma.vote.deleteMany()
    await prisma.roadmapItem.deleteMany()
    await prisma.announcement.deleteMany()
    await prisma.featureRequest.deleteMany()
    await prisma.authCode.deleteMany()
    await prisma.user.deleteMany()

    // ─── Users ───────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            isAdmin: true,
            lastLoginAt: new Date(),
        },
    })

    const users = await Promise.all(
        ['alice@example.com', 'bob@example.com', 'carol@example.com', 'dave@example.com', 'eve@example.com'].map(
            (email) =>
                prisma.user.create({
                    data: { email, lastLoginAt: new Date() },
                })
        )
    )

    const allUsers = [admin, ...users]
    console.log(`  ✅ ${allUsers.length} Users`)

    // ─── Feature Requests ────────────────────────────────
    const requestsData = [
        { title: 'Dark Mode Support', description: 'Add a dark mode toggle for the entire application. Should respect system preferences.', type: 'FEATURE', status: 'PLANNED', tags: 'ui,design' },
        { title: 'Export Data as CSV', description: 'Allow users to export their data in CSV format for reporting purposes.', type: 'FEATURE', status: 'IN_PROGRESS', tags: 'data,export' },
        { title: 'Login fails on Safari', description: 'When using Safari 17+ on macOS, the login form does not submit properly. Console shows CORS error.', type: 'BUG', status: 'IN_PROGRESS', tags: 'auth,browser' },
        { title: 'Multi-language Support', description: 'Support for German, English, and French as interface languages.', type: 'FEATURE', status: 'UNDER_REVIEW', tags: 'i18n' },
        { title: 'API Rate Limiting Dashboard', description: 'Show users their current API usage and remaining rate limits in the dashboard.', type: 'FEATURE', status: 'PLANNED', tags: 'api,dashboard' },
        { title: 'Broken image upload for PNG > 5MB', description: 'Uploading PNG files larger than 5MB results in a 500 error. JPEGs work fine.', type: 'BUG', status: 'DONE', tags: 'upload,bug' },
        { title: 'Webhook Integration', description: 'Allow users to configure webhooks that trigger on specific events.', type: 'FEATURE', status: 'UNDER_REVIEW', tags: 'integrations,api' },
        { title: 'Mobile App Push Notifications', description: 'Send push notifications to mobile app users for important updates.', type: 'FEATURE', status: 'NOT_PLANNED', tags: 'mobile,notifications' },
        { title: 'Search not finding partial matches', description: 'The search only works for exact matches. Should support fuzzy/partial matching.', type: 'BUG', status: 'UNDER_REVIEW', tags: 'search' },
        { title: 'Team Management', description: 'Allow organizations to create teams and assign roles with different permission levels.', type: 'FEATURE', status: 'PLANNED', tags: 'teams,permissions' },
        { title: 'Audit Log', description: 'Track all administrative actions in an audit log for compliance purposes.', type: 'FEATURE', status: 'UNDER_REVIEW', tags: 'security,compliance' },
        { title: '404 page shows raw error', description: 'The 404 page displays raw JSON error instead of a styled error page.', type: 'BUG', status: 'DONE', tags: 'ui,bug' },
    ]

    const requests = await Promise.all(
        requestsData.map((data, i) =>
            prisma.featureRequest.create({
                data: {
                    ...data,
                    createdById: allUsers[i % allUsers.length].id,
                },
            })
        )
    )
    console.log(`  ✅ ${requests.length} Feature Requests`)

    // ─── Votes (distributed for Trending) ────────────────
    const votePromises: Promise<unknown>[] = []
    // Give first request many votes (trending)
    for (const user of allUsers) {
        votePromises.push(
            prisma.vote.create({
                data: { userId: user.id, featureRequestId: requests[0].id },
            })
        )
    }
    // Give second request some votes
    for (const user of allUsers.slice(0, 4)) {
        votePromises.push(
            prisma.vote.create({
                data: { userId: user.id, featureRequestId: requests[1].id },
            })
        )
    }
    // Give third request votes
    for (const user of allUsers.slice(0, 3)) {
        votePromises.push(
            prisma.vote.create({
                data: { userId: user.id, featureRequestId: requests[2].id },
            })
        )
    }
    // Scatter some individual votes
    votePromises.push(
        prisma.vote.create({ data: { userId: users[0].id, featureRequestId: requests[4].id } }),
        prisma.vote.create({ data: { userId: users[1].id, featureRequestId: requests[4].id } }),
        prisma.vote.create({ data: { userId: users[2].id, featureRequestId: requests[6].id } }),
        prisma.vote.create({ data: { userId: users[3].id, featureRequestId: requests[9].id } }),
        prisma.vote.create({ data: { userId: users[0].id, featureRequestId: requests[10].id } }),
    )
    await Promise.all(votePromises)
    console.log(`  ✅ ${votePromises.length} Votes`)

    // ─── Roadmap Items ───────────────────────────────────
    const currentQ = getCurrentQuarter()
    const nextQ = getNextQuarter()

    await Promise.all([
        // 3 items for current quarter (max!)
        prisma.roadmapItem.create({ data: { featureRequestId: requests[0].id, quarter: currentQ, priority: 1 } }),
        prisma.roadmapItem.create({ data: { featureRequestId: requests[1].id, quarter: currentQ, priority: 2 } }),
        prisma.roadmapItem.create({ data: { featureRequestId: requests[4].id, quarter: currentQ, priority: 3 } }),
        // 2 items for next quarter
        prisma.roadmapItem.create({ data: { featureRequestId: requests[9].id, quarter: nextQ, priority: 1 } }),
        prisma.roadmapItem.create({ data: { featureRequestId: requests[6].id, quarter: nextQ, priority: 2 } }),
    ])
    console.log(`  ✅ 5 Roadmap Items (${currentQ}: 3, ${nextQ}: 2)`)

    // ─── Announcements ──────────────────────────────────
    await Promise.all([
        prisma.announcement.create({
            data: {
                title: 'Welcome to our Feedback Hub!',
                body: '# Welcome! 🎉\n\nWe are excited to launch our feedback platform. Here you can:\n\n- **Submit feature requests** and bug reports\n- **Vote** on ideas you care about\n- **Track** our roadmap progress\n\nYour voice matters — every suggestion helps us build a better product.',
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                pinned: true,
                createdById: admin.id,
            },
        }),
        prisma.announcement.create({
            data: {
                title: 'CSV Export is now live!',
                body: '## CSV Export 📊\n\nYou asked, we delivered! You can now export your data as CSV files.\n\n### How to use\n1. Go to your dashboard\n2. Click **Export** in the top right\n3. Select CSV format\n\nMore export formats coming soon.',
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                pinned: false,
                createdById: admin.id,
            },
        }),
        prisma.announcement.create({
            data: {
                title: 'Dark Mode coming in Q2',
                body: '# Dark Mode 🌙\n\nBased on overwhelming community votes, Dark Mode is now **planned for Q2**.\n\nWe will support:\n- System preference detection\n- Manual toggle\n- Custom accent colors\n\nStay tuned for updates!',
                publishedAt: null, // draft
                createdById: admin.id,
            },
        }),
        prisma.announcement.create({
            data: {
                title: 'API v2 Preview',
                body: '## API v2 Preview 🚀\n\nWe are working on a major API overhaul:\n\n- GraphQL support\n- Better rate limiting\n- Webhook improvements\n\n**Note:** This is a draft and not yet published.',
                publishedAt: null, // draft
                createdById: admin.id,
            },
        }),
    ])
    console.log('  ✅ 4 Announcements (2 published, 2 draft)')

    console.log('\n🎉 Seed complete!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
