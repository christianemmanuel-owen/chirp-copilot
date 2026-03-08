interface SectionHeaderProps {
    title?: string
    subtitle?: string
    center?: boolean
}

export function SectionHeader({ title, subtitle, center }: SectionHeaderProps) {
    return (
        <div className={`mb-16 ${center ? "text-center" : ""}`}>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">{title}</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">{subtitle}</h3>
        </div>
    )
}
