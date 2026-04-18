import { useLanguage } from '../../context/LanguageContext';
import { type ProfileData } from './PersonCard';
import FoundPersonCard from '../search/FoundPersonCard';
import MissingPersonCard from '../search/MissingPersonCard';
import { en } from '../../data/english';
import { ar } from '../../data/arabic';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowDownLeft } from 'lucide-react';

const recentProfiles: ProfileData[] = [
  {
    id: '8821',
    name: 'Ahmed Mansour',
    type: 'found',
    status: 'Safe',
    location: 'Maadi, Cairo',
    timeAgo: '2 days ago',
    details: 'Male, 28 years old',
    age: '28 years old',
    physicalDescription: 'Black hair, Brown eyes, Medium skin tone',
    clothingDescription: 'Blue shirt, dark jeans, black shoes',
    foundLocationDetails: 'Near Maadi Metro Station, Cairo',
    city: 'Cairo',
    postedBy: 'Maadi District Unit',
    reportDate: '04/12/2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7n1uWiSEueENl4tMFJmMdBwUopwS2AP_7f7d56aK8v0DzAsHUgPWICRmQm3L29acCvv4wzikHc9Lk5oP_-GXJBiZ4NvMWODkwXQ31f-9yNqEXhAdQf8-IfXkSgW6gke-Xd46P2Bs0tifvwCQr1T194CCuqFKlG9o8PfsiDOZOctjkYewCBp6BmxBxD03pHtMRn-ojndOTzt88jRy5Iqd7mOB3Xj8YAbXA_olluPg58vafLfzxYPbGoEvPzHS_FzQW3_HHOflE7R_4'
  },
  {
    id: '8822',
    name: 'Sarah Jenkins',
    type: 'found',
    status: 'At Hospital',
    location: 'Alexandria',
    timeAgo: '5 hours ago',
    details: 'Female, 24 years old',
    age: '24 years old',
    physicalDescription: 'Blonde hair, Green eyes, Fair skin tone',
    clothingDescription: 'School uniform, backpack',
    foundLocationDetails: 'Outside Central Station, Alexandria',
    city: 'Alexandria',
    postedBy: 'Alexandria General Hospital',
    reportDate: '04/14/2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRFWq-zWXPf77DHNZEhXhkhl9naa-RWCxmKIePY17BVk-XFFRjV7WnxD2k34LdQKbdcEDVPZyj8ymo_klYeoGJiOJ6_D9Ai6Uy60D4-NRowIX5LmOumM0wq5cs28ZIdwm4t3PdXaci2bWm7ApdULRmDBZ97DXPr7fA2e9MyZ53Bf6NmwUHO2H2Io8neUPjz3AJVUsgL7T5XuXyT-eL_IMM03MIYxoBBrMYABZavZ_FPRKYederogZi63wcfpwsqb_kg34G-xiyjUw'
  },
  {
    id: '8823',
    name: 'Omar Hassan',
    type: 'missing',
    status: 'New Alert',
    location: 'Giza',
    timeAgo: '1 day ago',
    details: 'Male, 8 years old',
    age: '8 years old',
    physicalDescription: 'Black hair, Brown eyes, Medium skin tone',
    clothingDescription: 'School uniform, white sneakers',
    lastSeenLocationDetails: 'Near school, Giza',
    city: 'Giza',
    postedBy: 'Giza Police Unit',
    reportDate: '04/17/2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnhH0u1eryEHbN8R_jWVqwgToamhmVCEeSs5QXMLgRYUjquGarA1AQIxaqL_m18G4GmxoXEjNDkBLaNh_slI84bwTNXuvLkqTV-STaUATODmZ95N8eZ_2ksBgtzDahqzyzHcZrias9CIqaqEua5QOkQplgn8I9SGTh1deFH-gZpJJlIKrSB3zfzAkw0xRmXmhT8c7nF0WjZYsXlfnc-PyCf__z4QJ0_2Wu2i7O48X2u2SahSANUFtRRefS-Lxl4gCPTGNmcj2zIoI-'
  },
  {
    id: '8824',
    name: 'Layla Mansour',
    type: 'missing',
    status: 'High Priority',
    location: 'Mansoura',
    timeAgo: '3 days ago',
    details: 'Female, 16 years old',
    age: '16 years old',
    physicalDescription: 'Brown hair, Black eyes, Fair skin tone',
    clothingDescription: 'Pink jacket, jeans, brown shoes',
    lastSeenLocationDetails: 'Downtown Mansoura, near market',
    city: 'Mansoura',
    postedBy: 'Mansoura City Police',
    reportDate: '04/15/2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMRvtSFBN7-X6hhu8w-12Ygaqpv-gyqC92kTjK7uAtwJamac0x_5PFmOFpcHK7tfCbNWUT2RHWw6fIIK5-R00XWeGhnQictj8Zyuxbckh17PiTWP0YJnwa0wAm3lOgT9qzHO1MujT3_ULi1zBPnUKaOa4GBCdzBc5fLtsggGGCBC4HH1DZUHWe4K_25s5LQA8Oa3LA7Bkn6MrTuffwIcoa04hoXCsr2oZMF-aB94jzTLfEGE3lConDVOajuSzjT3jfhXM00iR1CGS2'
  }
];

export default function RecentUpdates() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = isRTL ? ar.recentUpdates : en.recentUpdates;

  return (
    <section className="w-full bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-400 mx-auto px-6 lg:px-12 py-12">
        
        {/* Header */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 flex flex-col items-start gap-1"
        >
            <div className="flex items-center gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-tertiary tracking-widest rtl:tracking-normal uppercase">
                    {t.title}
                </h2>
                {language === 'en' ? (
                    <ArrowDownRight className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:translate-x-1 hover:translate-y-1" />
                ) : (
                    <ArrowDownLeft className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:-translate-x-1 hover:translate-y-1" />
                )}
            </div>
            <p className="text-gray-500 mt-1 text-sm">
                {t.subtitle}
            </p>
        </motion.div>

        {/* Scrollable Cards Container */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.85 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {recentProfiles.map((profile, idx) => (
            profile.type === 'found' ? (
              <FoundPersonCard key={profile.id} profile={profile} idx={idx} isRTL={isRTL} />
            ) : (
              <MissingPersonCard key={profile.id} profile={profile} idx={idx} isRTL={isRTL} />
            )
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button className="px-8 sm:px-10 py-3 rounded-full bg-primary text-slate-900 font-bold hover:bg-[#e6dcaf] transition-colors duration-300 text-sm sm:text-base cursor-pointer">
            {t.loadMore}
          </button>
        </motion.div>
      </div>
    </section>
  );
}