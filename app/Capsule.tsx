'use client';

export default function Capsule({
    leftContent,
    rightContent,
    className,
}: {
    leftContent: React.ReactNode,
    rightContent: React.ReactNode,
    className?: string,
}) {
    return (
        <div className={`flex rounded-3xl overflow-hidden ${className || ''}`}>
            <div className={`flex-1 flex flex-col justify-around text-left bg-slate-700`}>
                {leftContent}
            </div>
            <div className={`flex-1 flex flex-col justify-around text-left bg-slate-900`}>
                {rightContent}
            </div>
        </div>
    );
}