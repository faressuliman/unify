import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon, title, desc, className = '' }: { icon: ReactNode, title: string, desc: string, className?: string }) {
   return (
       <motion.div 
           className={`flex items-start gap-6 relative group ${className}`}
       >
           <div className="shrink-0 z-10 w-14 h-14 rounded-full bg-slate-900/50 backdrop-blur-md flex items-center justify-center text-secondary border border-secondary/30 ring-4 ring-slate-900/40 shadow-[0_0_20px_rgba(184,149,0,0.15)] group-hover:scale-105 group-hover:bg-secondary/10 group-hover:border-secondary/50 transition-all duration-500">
               {icon}
           </div>
           <div className="text-start pt-1 md:pt-1.5 flex-1">
               <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{title}</h3>
               <p className="text-slate-300 text-sm leading-relaxed max-w-sm">{desc}</p>
           </div>
       </motion.div>
   )
}
