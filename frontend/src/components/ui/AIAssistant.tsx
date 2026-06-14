import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import chatbotIcon from '../../assets/chatbot.png'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type Language = 'en' | 'ar' | null

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [assistantLanguage, setAssistantLanguage] = useState<Language>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInitialMessage, setShowInitialMessage] = useState(false)
  const [botAnimState, setBotAnimState] = useState<'idle' | 'spin' | 'scale' | 'normal'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { language: appLanguage, t } = useLanguage()
  const previousAuth = useRef(isAuthenticated)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('unifyAiAssistantIntroShown')
    if (!hasSeenIntro) {
      setShowInitialMessage(true)
      sessionStorage.setItem('unifyAiAssistantIntroShown', 'true')
    }
  }, [])

  useEffect(() => {
    const startAnimation = () => {
      setBotAnimState('spin')
      const scaleTimer = setTimeout(() => setBotAnimState('normal'), 4400)
      const spinTimer = setTimeout(() => setBotAnimState('scale'), 1400)
      return () => {
        clearTimeout(scaleTimer)
        clearTimeout(spinTimer)
      }
    }

    if ((window as any).__unifyLoadingComplete) {
      return startAnimation()
    } else {
      let cleanup: (() => void) | undefined
      const handleLoad = () => {
        cleanup = startAnimation()
      }
      window.addEventListener('loadingComplete', handleLoad)
      return () => {
        window.removeEventListener('loadingComplete', handleLoad)
        if (cleanup) cleanup()
      }
    }
  }, [])

  const resetChat = () => {
    setAssistantLanguage(null)
    setMessages([])
    setInput('')
    setIsLoading(false)
    setIsClosing(false)
  }

  useEffect(() => {
    if (!showInitialMessage) return

    const timer = setTimeout(() => {
      setShowInitialMessage(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [showInitialMessage])

  useEffect(() => {
    if (previousAuth.current && !isAuthenticated) {
      resetChat()
    }
    previousAuth.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => {
    if (!isClosing) return

    const timer = setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [isClosing])

  const getIntroBubbleText = () => {
    return t('assistant.introBubble')
  }

  const getSystemPrompt = (lang: 'en' | 'ar') => {
    if (lang === 'ar') {
      return `أنت مساعد مفيد لمنصة يونيفاي (Unify) للأشخاص المفقودين.
أنت ملم بكافة ميزات المنصة وصفحاتها وإجراءاتها وتوجه المستخدمين إليها بدقة كالتالي:
1. إنشاء حساب جديد / التسجيل: التسجيل عن طريق الذهاب إلى صفحة التسجيل ([صفحة التسجيل](/register)) أو من خلال القائمة الجانبية (الـ Sidebar). 
   - شروط التسجيل: يجب على المستخدم تحميل صورة الهوية الشخصية (ID) وتكون صورة حقيقية وليست مولدة بالذكاء الاصطناعي.
   - تفعيل الحساب: بعد إتمام التسجيل، يتعين على المستخدم الانتظار لحين قيام المسؤول (الأدمن) بمراجعة الهوية والموافقة على الحساب قبل أن يتمكن من تسجيل الدخول.
2. تسجيل الدخول: تسجيل الدخول عبر صفحة تسجيل الدخول ([صفحة تسجيل الدخول](/login)).
3. الإبلاغ عن شخص مفقود أو معثور عليه: إنشاء بلاغ عبر صفحة إنشاء منشور ([صفحة إنشاء منشور](/create-post)).
4. البحث عن شخص مفقود: البحث الذكي عبر صفحة البحث ([صفحة البحث](/search)).
5. إنشاء ملصق شخص مفقود (PDF): تصميم ملصقات بجودة عالية للطباعة عبر صفحة صانع الملصقات ([صفحة صانع الملصقات](/poster-builder)).
6. عرض الخريطة التفاعلية: مشاهدة مواقع البلاغات على الخريطة عبر صفحة الخريطة ([صفحة الخريطة](/map)).
7. تقديم المطالبات (Claims): يمكن للمستخدم تقديم طلب مطالبة لإثبات صلة قرابته بشخص مفقود منشور عنه في المنصة. بعد إرسال المطالبة، يتعين على المستخدم الانتظار حتى يقوم المسؤول (الأدمن) بمراجعتها والموافقة عليها.
8. تقارير المشاهدة (Sighting Reports): يمكن للمستخدمين تقديم بلاغ مشاهدة في حال رؤية شخص مفقود، مع تزويد المنصة بالإحداثيات الجغرافية وتفاصيل المشاهدة لمساعدة العائلة في العثور عليه.
9. التواصل مع الدعم أو التحدث لشخص حقيقي: زيارة صفحة التواصل ([صفحة التواصل](/contact)).

إرشادات هامة:
- اعرض دائمًا الروابط الداخلية بتنسيق ماركداون (Markdown) تماماً هكذا: [نص الرابط](الرابط_النسبي) (مثل: [صفحة التسجيل](/register)).
- لا تخترع صفحات أو روابط غير موجودة.
- كن دائمًا ودودًا، موجزًا ومفيدًا. استخدم اللغة العربية في جميع ردودك.`
    }
    return `You are a helpful guide for the Unify missing persons platform.
You are fully educated on the platform's features, pages, and workflows and direct users to them accurately:
1. Creating an Account / Registering: Register by going to the Register page ([Register Page](/register)) or through the sidebar menu.
   - Requirements: The user must upload a real, non-AI-generated ID image during registration.
   - Account Activation: After registering, the user must wait for an admin to review and approve their account before they can log in.
2. Logging In: Log in on the Login page ([Login Page](/login)).
3. Reporting a Missing/Found Person: Create a post/report on the Create Post page ([Create Post Page](/create-post)).
4. Searching for a Person: Search using AI-powered search on the Search page ([Search Page](/search)).
5. Generating a PDF Poster: Build standardized missing person posters on the Poster Builder page ([Poster Builder Page](/poster-builder)).
6. Viewing the Map: View locations of reports on the Map page ([Map Page](/map)).
7. Submitting Claims: A user can submit a claim to state that a missing person is their family member. Tell users that once they submit a claim, they will have to wait for an admin to review and approve the claim.
8. Sighting Reports: Users can submit a sighting report if they have seen a missing person, providing location coordinates and descriptions to help families find their loved ones.
9. Contacting Support / Real Person: Visit the Contact Page ([Contact Page](/contact)).

Important Guidelines:
- Always render internal links exactly in markdown format: [Link Text](relative_path) (e.g. [Register Page](/register)).
- Do not make up pages or routes that do not exist.
- Always be warm, concise, and helpful. Use English in all your responses.`
  }

  const handleLanguageSelect = (selectedLang: 'en' | 'ar') => {
    setAssistantLanguage(selectedLang)
    const welcomeMessage = selectedLang === 'ar' 
      ? 'مرحبًا! أنا هنا لمساعدتك في منصة يونيفاي. كيف يمكنني مساعدتك اليوم؟'
      : 'Hello! I\'m here to help you with the Unify platform. How can I assist you today?'
    setMessages([{ role: 'assistant', content: welcomeMessage }])
  }

  const formatMessage = (content: string) => {
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert markdown links: if relative path starts with '/', render internal SPA link.
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, p1, p2) => {
        const isInternal = p2.startsWith('/');
        return `<a href="${p2}" class="text-blue-600 hover:text-blue-800 underline font-medium"${isInternal ? '' : ' target="_blank" rel="noopener noreferrer"'}>${p1}</a>`;
      }
    )
    
    // Legacy support for Contact Page plain text replacements
    formatted = formatted.replace(
      /Contact Page/gi,
      '<a href="/contact" class="text-blue-600 hover:text-blue-800 underline font-medium">Contact Page</a>'
    )
    
    return formatted
  }

  const handleContactLinkClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLAnchorElement) {
      const href = e.target.getAttribute('href')
      if (href && href.startsWith('/')) {
        e.preventDefault()
        navigate(href)
        setIsOpen(false)
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !assistantLanguage || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY

      const response = await fetch(
        'https://router.huggingface.co/novita/v3/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [
              { role: 'system', content: getSystemPrompt(assistantLanguage) },
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              { role: 'user', content: userMessage }
            ],
            max_tokens: 500
          })
        }
      )

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${JSON.stringify(data)}`)
      }

      if (data.choices && data.choices[0]) {
        const assistantMessage = data.choices[0].message.content
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
      } else {
        throw new Error('No choices in response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = assistantLanguage === 'ar'
        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
        : 'Sorry, an error occurred. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Initial floating message */}
      {showInitialMessage && !isOpen && (
        <div className="fixed bottom-24 left-6 z-50 max-w-xs rounded-3xl border border-gray-200 bg-white/95 px-4 py-3 shadow-[0_15px_35px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm transition-opacity duration-300">
          <p className="text-sm font-medium text-slate-800">{getIntroBubbleText()}</p>
        </div>
      )}

      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setIsClosing(false)
          }}
          className="fixed bottom-6 left-6 z-50 inline-flex items-center justify-center bg-primary hover:bg-primary-300 text-primary-foreground p-2 rounded-full shadow-lg transition-all duration-300 delay-100 hover:scale-110 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <img 
            src={chatbotIcon} 
            alt="AI Assistant" 
            className={`w-14 h-14 transition-transform duration-500 ease-out ${
              botAnimState === 'spin' ? 'animate-[spin_0.7s_ease-in-out_2]' : 
              botAnimState === 'scale' ? 'scale-[1.2]' : 'scale-100'
            }`} 
          />
        </button>
      )}

      {/* Chat popup */}
      {(isOpen || isClosing) && (
        <div
          className={`fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 delay-100 modal-pop ${
            (assistantLanguage ?? appLanguage) === 'ar' ? 'rtl' : 'ltr'
          }`}
          data-state={isClosing ? 'closed' : 'open'}
          dir={(assistantLanguage ?? appLanguage) === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="modal-panel">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={chatbotIcon} alt="AI Assistant" className="w-10 h-10" />
              <h3 className="font-semibold">Unify Assistant</h3>
            </div>
            <button
              onClick={() => {
                if (!isClosing) {
                  setIsClosing(true)
                }
              }}
              className="p-1 rounded transition-colors duration-200 delay-75 text-tertiary cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {!assistantLanguage ? (
              <div className="flex flex-col gap-4">
                <p className="text-gray-800 text-sm">
                  Welcome to Unify! Would you like to continue in English or Arabic?
                </p>
                <p className="text-gray-800 text-sm">
                  أهلاً بك في يونيفاي! هل ترغب في المتابعة باللغة الإنجليزية أم العربية؟
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => handleLanguageSelect('en')}
                    className="w-full bg-secondary hover:bg-primary hover:text-tertiary text-white font-bold px-4 py-2 rounded-lg transition-colors duration-200 delay-75 cursor-pointer"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageSelect('ar')}
                    className="w-full bg-secondary hover:bg-primary hover:text-tertiary text-white font-bold px-4 py-2 rounded-lg transition-colors duration-200 delay-75 cursor-pointer"
                  >
                    العربية
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                      onClick={handleContactLinkClick}
                    >
                      <div
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 px-3 py-2 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          {assistantLanguage && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={assistantLanguage === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary-300 disabled:bg-gray-300 disabled:cursor-not-allowed text-primary-foreground p-2 rounded-lg transition-colors duration-200 delay-75 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </>
  )
}