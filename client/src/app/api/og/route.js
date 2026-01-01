import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Job Opening";
    const company = searchParams.get("company") || "Company";
    const location = searchParams.get("location") || "";
    const level = searchParams.get("level") || "";
    const logo = searchParams.get("logo") || "";

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Load fonts from public folder
    const [outfitFont, geistFont] = await Promise.all([
        fetch(`${baseUrl}/fonts/Outfit-Regular.otf`).then((res) => res.arrayBuffer()),
        fetch(`${baseUrl}/fonts/Geist-Regular.otf`).then((res) => res.arrayBuffer()),
    ]);

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#191919",
                    padding: "60px",
                }}
            >
                {/* Company logo - top center */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "80px",
                        height: "80px",
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        marginBottom: "40px",
                        overflow: "hidden",
                    }}
                >
                    {logo ? (
                        <img
                            src={logo}
                            width={60}
                            height={60}
                            style={{
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <span
                            style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                color: "#191919",
                                fontFamily: "Outfit",
                            }}
                        >
                            {company.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Job Title - Large centered */}
                <div
                    style={{
                        fontSize: "56px",
                        fontWeight: "600",
                        color: "#e6e6e5",
                        fontFamily: "Outfit",
                        textAlign: "center",
                        lineHeight: "1.2",
                        maxWidth: "900px",
                        marginBottom: "24px",
                    }}
                >
                    {title.length > 50 ? `${title.slice(0, 50)}...` : title}
                </div>

                {/* Subtitle - Company • Level • Location */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "24px",
                        color: "#9b9b9b",
                        fontFamily: "Geist",
                    }}
                >
                    <span>At {company}</span>
                    {level && (
                        <>
                            <span style={{ color: "#149F65", padding: "0 4px" }}>•</span>
                            <span>{level}</span>
                        </>
                    )}
                    {location && (
                        <>
                            <span style={{ color: "#149F65", padding: "0 4px" }}>•</span>
                            <span>{location}</span>
                        </>
                    )}
                </div>

                {/* Bottom - hirebase logo and URL */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        position: "absolute",
                        bottom: "60px",
                    }}
                >
                    {/* Hirebase Logo */}
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 108.76 103.9"
                    >
                        <path
                            fill="#149F65"
                            d="M81.01,0H27.75C12.43,0,0,12.42,0,27.75v48.4c0,15.33,12.43,27.75,27.75,27.75h53.26c15.33,0,27.75-12.42,27.75-27.75V27.75c0-15.33-12.42-27.75-27.75-27.75ZM71.92,70.48c-23.66,22.24-50.1,32.54-59.07,23-8.96-9.54,2.95-35.3,26.6-57.54C63.11,13.7,89.55,3.4,98.51,12.94c8.97,9.53-2.94,35.29-26.59,57.53Z"
                        />
                    </svg>
                    <span
                        style={{
                            fontSize: "20px",
                            color: "#9b9b9b",
                            fontFamily: "Geist",
                        }}
                    >
                        hirebase.xyz/jobs
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: "Outfit",
                    data: outfitFont,
                    style: "normal",
                    weight: 600,
                },
                {
                    name: "Geist",
                    data: geistFont,
                    style: "normal",
                    weight: 400,
                },
            ],
        }
    );
}
