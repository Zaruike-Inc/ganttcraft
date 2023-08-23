import React from "react";

export default function Skeleton({className}: { className: string }) {
    return <div className={`bg-slate-200 motion-safe:animate-pulse rounded ${className}`}/>;
}
