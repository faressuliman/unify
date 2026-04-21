import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, Activity, ArrowRight, Lock, Users, Sparkles, X, Copy, CheckCircle, Smartphone, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Donate() {
  const { t, language } = useLanguage();
  const [currency, setCurrency] = useState<'USD' | 'EGP'>('USD');
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Modal tracking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Use specific arrays to look cleaner rather than pure math multiplication
  const currencySymbol = currency === 'USD' ? '$' : 'EGP ';
  const amountsUSD = [5, 10, 25, 50];
  const amountsEGP = [250, 500, 1000, 2000];
  
  const amounts = currency === 'USD' ? amountsUSD : amountsEGP;
  
  // Auto set default when switching
  const handleCurrencySwitch = (newCurrency: 'USD' | 'EGP') => {
    setCurrency(newCurrency);
    if (!customAmount) {
      setAmount(newCurrency === 'USD' ? 25 : 1000);
    }
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = amount || Number(customAmount);
    if (!name || !email) {
      alert(t('donate.fillDetails') || 'Please fill in your name and email.');
      return;
    }
    if (finalAmount > 0) {
      setIsModalOpen(true);
      setPaymentSuccess(false);
    } else {
      alert(t('donate.selectAmount') || 'Please select or enter an amount to donate.');
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSentMoney = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setTimeout(() => setPaymentSuccess(false), 300); // Wait for modal close anim
      setAmount(null);
      setCustomAmount('');
      setName('');
      setEmail('');
    }, 3000);
  };

  const scrollToForm = () => {
    document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. Hero Section - Dark & Emotional */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center py-24 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950"></div>
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        <div className="relative z-10 w-full max-w-400 mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-blue-200">
              <Activity className="w-4 h-4" />
              <span>{t('donate.everySecond') || 'Every second counts'}</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              {t('donate.helpUsBring') || 'Help Us Bring'} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary to-secondary/50">{t('donate.themHome') || 'Them Home.'}</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              {t('donate.heroDescription') || 'Families are waiting. Your donation fuels the technology and ground efforts to reunite missing loved ones.'}
            </p>

            <div className="pt-8">
              <button 
                onClick={scrollToForm}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4  rounded-full bg-secondary text-white shadow-2xl shadow-secondary/20 text-sm sm:text-base md:text-lg font-bold transition-all hover:bg-secondary/90 disabled:opacity-50 cursor-pointer overflow-hidden  hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] hover:-translate-y-1"
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{t('donate.donateNowCTA') || 'Donate Now'}</span>
                <ArrowRight className={`w-5 h-5 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Split: Impact & Form */}
      <section id="donate-form" className="relative mt-32 z-20 w-full max-w-400 mx-auto px-6 lg:px-12 pb-24 scroll-mt-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
          
          {/* Impact Section (Now on the Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:col-span-6 xl:col-span-7 h-full flex flex-col justify-center p-8 lg:p-12 space-y-12 order-2 lg:order-1 bg-linear-to-br from-white via-blue-50/30 to-slate-50/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            {/* Subtle Alive Background Blobs */}
            <div className="absolute top-0 right-0 -m-20 w-72 h-72 bg-blue-200/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-10 left-0 -m-20 w-64 h-64 bg-indigo-200/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">{t('donate.impactTitle') || 'The Impact of Your Gift'}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t('donate.impactDesc') || 'When a child goes missing, the first 24 hours are critical. Your financial support allows our platform to act instantaneously—deploying alerts, analyzing data, and coordinating volunteers.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-5 items-start group">
                <div className="shrink-0 w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{t('donate.impact1Title') || '$10 spreads awareness'}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('donate.impact1Desc') || 'Allows us to boost missing posters and alerts across targeted social media grids in local areas instantly.'}</p>
                </div>
              </div>

              <div className="flex gap-5 items-start group">
                <div className="shrink-0 w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{t('donate.impact2Title') || '$50 powers our technology'}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('donate.impact2Desc') || 'Keeps our AI matching algorithms and real-time mapping servers running flawlessly during high-traffic spikes.'}</p>
                </div>
              </div>

              <div className="flex gap-5 items-start group">
                <div className="shrink-0 w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{t('donate.impact3Title') || '$100 equips search teams'}</h4>
                  <p className="text-slate-600 leading-relaxed">{t('donate.impact3Desc') || 'Funds coordination tools and verified data packets for on-the-ground volunteer search parties.'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Card (Now on the Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 xl:col-span-5 h-full flex flex-col justify-center bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 order-1 lg:order-2"
          >
            <div className="mb-8 space-y-5">
              <h2 className="text-2xl font-bold text-slate-800 text-center">{t('donate.secureDonation') || 'Secure Donation'}</h2>
              <div className="flex gap-3 w-full">
                <div className="bg-slate-100/80 p-1 rounded-xl flex flex-1">
                  <button 
                    type="button"
                    onClick={() => handleCurrencySwitch('USD')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'USD' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                  >
                    US$
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleCurrencySwitch('EGP')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'EGP' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                  >
                    EGP
                  </button>
                </div>
                <div className="bg-slate-100/80 p-1 rounded-xl flex flex-1">
                  <button 
                    type="button"
                    onClick={() => setDonationType('one-time')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${donationType === 'one-time' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                  >
                    {t('donate.oneTime') || 'One-time'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDonationType('monthly')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${donationType === 'monthly' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                  >
                    {t('donate.monthly') || 'Monthly'}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleDonate} className="space-y-8">
              {/* Amounts Grid */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('donate.selectAmount') || 'Select Amount'}</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {amounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setAmount(value);
                        setCustomAmount('');
                      }}
                      className={`py-3 px-2 rounded-xl border-2 hover:cursor-pointer font-bold text-lg transition-all duration-200 outline-none focus:ring-4 focus:ring-secondary/20 flex items-center justify-center gap-1 ${
                        amount === value
                          ? 'border-secondary bg-orange-50 text-secondary'
                          : 'border-slate-100 text-slate-600 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-sm opacity-60 font-semibold">{currencySymbol.trim()}</span>{value}
                    </button>
                  ))}
                </div>

                <div className="relative group pt-2">
                  <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} font-bold text-lg transition-colors ${customAmount ? 'text-secondary' : 'text-slate-400'}`}>{currencySymbol.trim()}</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(null);
                    }}
                    className={`w-full ${isRTL ? 'pr-16 pl-4' : 'pl-16 pr-4'} py-4 rounded-xl border-2 border-slate-100 bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 text-lg font-bold text-slate-800 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-200`}
                    placeholder={t('donate.customAmount') || "Custom Amount"}
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('donate.yourDetails') || 'Your Details'}</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('donate.placeholderName') || "Full Name"}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('donate.placeholderEmail') || "Email Address"}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-secondary hover:bg-secondary/90 cursor-pointer text-white text-lg font-bold rounded-xl overflow-hidden transition-all shadow-2xl shadow-secondary/20 focus:ring-4 focus:ring-secondary/20 active:scale-[0.98] hover:shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)]"
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{t('donate.donateCTA') || 'Donate'} {amount || customAmount ? `${currencySymbol}${amount || customAmount}` : ''}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 pt-2">
                <Lock className="w-3.5 h-3.5" />
                {t('donate.securePayments') || 'Payments are secure and encrypted'}
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="w-12 h-12 text-blue-200 mx-auto mb-8" />
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">{t('donate.storyTitle') || 'Hope is an Action.'}</h2>
          <div className="prose prose-lg text-slate-600 mx-auto">
            <p>
              {t('donate.storyDesc1') || '"There is no agony quite like the agonizing silence of not knowing where your child is. We built this platform because we believe technology should serve humanity\'s most desperate hours."'}
            </p>
            <p className="mt-6">
              {t('donate.storyDesc2') || 'Our mission isn\'t just about code or maps—it\'s about shortening the time between a tragic disappearance and a joyful reunion. We are entirely supported by people like you who refuse to let hope fade.'}
            </p>
          </div>
          <div className="mt-12 flex items-center justify-center gap-4 text-slate-500 font-medium">
            <span className="w-12 h-px bg-slate-200"></span>
            {t('donate.teamName') || 'The Unify Project Team'}
            <span className="w-12 h-px bg-slate-200"></span>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !paymentSuccess && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {!paymentSuccess ? (
                <>
                  {/* Header */}
                  <div className="px-6 py-5 sm:px-8 sm:py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                      Choose Payment Method
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
                    
                    {/* Vodafone Cash */}
                    <div className="group border-2 border-slate-100 hover:border-red-500/30 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 leading-tight">Vodafone Cash</h4>
                          <p className="text-sm text-slate-500 mt-0.5">Send money directly via Vodafone Cash</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleCopy('010XXXXXXXX', 'vodafone')}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-all cursor-pointer outline-none focus:ring-4 focus:ring-slate-100"
                        >
                          {copiedField === 'vodafone' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          {copiedField === 'vodafone' ? 'Copied!' : '010XXXXXXXX'}
                        </button>
                        <button
                          onClick={handleSentMoney}
                          className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-sm shadow-red-600/20 cursor-pointer active:scale-[0.98] outline-none focus:ring-4 focus:ring-red-600/20"
                        >
                          I have sent the money
                        </button>
                      </div>
                    </div>

                    {/* InstaPay */}
                    <div className="group border-2 border-slate-100 hover:border-purple-500/30 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 leading-tight">InstaPay</h4>
                          <p className="text-sm text-slate-500 mt-0.5">Send instantly via InstaPay</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleCopy('yourname@bank', 'instapay')}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-all cursor-pointer outline-none focus:ring-4 focus:ring-slate-100"
                        >
                          {copiedField === 'instapay' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          {copiedField === 'instapay' ? 'Copied!' : 'yourname@bank'}
                        </button>
                        <button
                          onClick={handleSentMoney}
                          className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-sm shadow-purple-600/20 cursor-pointer active:scale-[0.98] outline-none focus:ring-4 focus:ring-purple-600/20"
                        >
                          I have sent the money
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Manual verification required</span>
                  </div>
                </>
              ) : (
                /* Success View */
                <div className="p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.1 }}
                  >
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-slate-900"
                  >
                    Thank you!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-slate-600 max-w-sm mx-auto"
                  >
                    We will verify your donation shortly. <br className="hidden sm:block" /> Your support means the world to these families.
                  </motion.p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
