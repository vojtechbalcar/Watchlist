import React from 'react';
import Image from "next/image";

export function formatLocalTime(): string {
    const date = new Date();
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const tz = date
        .toLocaleString("en-US", { timeZoneName: "short" })
        .split(" ")
        .at(-1)!;

    return `${month} ${day} · ${hours}:${minutes} ${tz}`;
}



export const Header = () => {

    console.log(formatLocalTime())


    return (


        <div className="header">

            <Image src="./assets/logo-watermark.svg" className="header-logo" alt="logo" width={100} height={60} />
            <div className="header-nav">
                <p className="header-nav-item-active">Overview</p>
                <p className="header-nav-item">Watchlist</p>
                <p className="header-nav-item">Compare</p>
                <p className="header-nav-item">Explore</p>
            </div>
            <div className="header-time-wrapper">
                <p className="header-stamp h-[1.5] w-[1.5];"> {formatLocalTime()}</p>
                <div className="header-date-pfp">
                    JR
                </div>
            </div>

        </div>
    );
};