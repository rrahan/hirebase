import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Job Opening";
    const company = searchParams.get("company") || "Company";
    const salary = searchParams.get("salary") || "";
    const location = searchParams.get("location") || "";

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    backgroundColor: "#191919",
                    padding: "60px",
                }}
            >
                {/* Top section - Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <rect width="24" height="24" rx="6" fill="#149F65" />
                        <path
                            d="M7 12L10.5 15.5L17 9"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span
                        style={{
                            fontSize: "32px",
                            fontWeight: "600",
                            color: "#e6e6e5",
                        }}
                    >
                        hirebase
                    </span>
                </div>

                {/* Middle section - Job info */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        maxWidth: "900px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "24px",
                            color: "#9b9b9b",
                        }}
                    >
                        {company}
                    </div>
                    <div
                        style={{
                            fontSize: "52px",
                            fontWeight: "600",
                            color: "#e6e6e5",
                            lineHeight: "1.2",
                        }}
                    >
                        {title.length > 60 ? `${title.slice(0, 60)}...` : title}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            marginTop: "8px",
                        }}
                    >
                        {salary && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 20px",
                                    backgroundColor: "rgba(20, 159, 101, 0.15)",
                                    borderRadius: "8px",
                                    color: "#149F65",
                                    fontSize: "22px",
                                    fontWeight: "500",
                                }}
                            >
                                {salary}
                            </div>
                        )}
                        {location && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 20px",
                                    backgroundColor: "#2f2f2f",
                                    borderRadius: "8px",
                                    color: "#e6e6e5",
                                    fontSize: "22px",
                                }}
                            >
                                📍 {location}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom section - CTA */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <div
                        style={{
                            fontSize: "20px",
                            color: "#9b9b9b",
                        }}
                    >
                        View full job details at hirebase.xyz
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 24px",
                            backgroundColor: "#149F65",
                            borderRadius: "10px",
                            color: "white",
                            fontSize: "20px",
                            fontWeight: "500",
                        }}
                    >
                        Apply Now →
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
