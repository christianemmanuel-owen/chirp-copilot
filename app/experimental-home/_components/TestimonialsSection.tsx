import { SectionHeader } from "@/app/experimental-home/_components/SectionHeader"
import { Star } from "lucide-react"

const TESTIMONIALS = [
    {
        name: "SOPHIE RENARD",
        role: "Interior Designer",
        content: "The attention to detail in CHIRP's products is unparalleled. It's rare to find such high-end quality at these prices.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "MARCUS CHEN",
        role: "Architect",
        content: "I've integrated CHIRP pieces into several projects, and they always become the focal point. Truly exceptional craftsmanship.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "ELENA ROSSI",
        role: "Collector",
        content: "Each piece feels like a work of art. The delivery was seamless and the products exceeded my highest expectations.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
    }
]

export default function TestimonialsSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <SectionHeader
                    title="Voices of Excellence"
                    subtitle="WHAT OUR <br /> CLIENTS SAY."
                    center
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial, i) => (
                        <div
                            key={testimonial.name}
                            className="p-10 rounded-[3rem] bg-muted/30 border border-border/50 hover:border-primary/20 transition-all hover:bg-white hover:shadow-2xl group duration-500 animate-in fade-in slide-in-from-bottom-8"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex gap-1 mb-6 text-primary">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-4 fill-current" />)}
                            </div>
                            <p className="text-xl font-medium text-foreground mb-8 leading-relaxed italic italic-font-serif text-muted-foreground group-hover:text-foreground transition-colors">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl overflow-hidden bg-muted group-hover:scale-110 transition-transform duration-500">
                                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-black text-foreground tracking-tighter uppercase">{testimonial.name}</div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
