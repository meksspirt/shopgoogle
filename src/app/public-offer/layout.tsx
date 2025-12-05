import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Публічна оферта',
    description: 'Договір публічної оферти CalmCraft. Умови продажу товарів та надання послуг.',
    openGraph: {
        title: 'Договір публічної оферти | CalmCraft',
        description: 'Договір публічної оферти CalmCraft. Умови продажу товарів та надання послуг.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Договір публічної оферти | CalmCraft',
        description: 'Договір публічної оферти CalmCraft',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PublicOfferLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
