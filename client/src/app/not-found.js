import { NotFoundPage } from "@/components/not-found";
import Header from "@/components/Header";

export const metadata = {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist. Browse tech jobs in Kerala instead.",
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return (
        <>
            <Header />
            <NotFoundPage />
        </>
    );
}