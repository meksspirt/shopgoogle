import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Політика конфіденційності',
    description: 'Політика конфіденційності та захисту персональних даних CalmCraft. Дізнайтеся, як ми захищаємо ваші дані.',
    openGraph: {
        title: 'Політика конфіденційності | CalmCraft',
        description: 'Політика конфіденційності та захисту персональних даних CalmCraft',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Політика конфіденційності | CalmCraft',
        description: 'Політика конфіденційності та захисту персональних даних CalmCraft',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
