import { motion } from 'framer-motion';
import { HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DonateFloatingButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={() => navigate('/donate')}
      className="fixed bottom-24 right-8 z-40 p-0 w-12 h-12 rounded-full bg-primary hover:bg-primary-600 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer border-none animate-bounce"
      aria-label="Donate"
      title="Support Us"
    >
      <HeartHandshake className="h-6 w-6 text-tertiary" strokeWidth={2} />
    </motion.button>
  );
}
