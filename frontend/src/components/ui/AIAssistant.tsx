import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import chatbotIcon from '../../assets/chatbot.png'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type Language = 'en' | 'ar' | null

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [language, setLanguage] = useState<Language>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInitialMessage, setShowInitialMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
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

  const resetChat = () => {
    setLanguage(null)
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
    if (language === 'ar') {
      return 'مرحبًا! أنا مساعد يونيفاي. انقر على الأيقونة للدردشة.'
    }

    if (language === 'en') {
      return "Hi, I'm your Unify assistant! Click the icon below to chat."
    }

    return 'Hi, I\'m your Unify assistant! Click the icon below to chat. | مرحبًا! أنا مساعد يونيفاي. انقر على الأيقونة للدردشة.'
  }

  const getSystemPrompt = (lang: 'en' | 'ar') => {
    if (lang === 'ar') {
      return `أنت مساعد مفيد لمنصة يونيفاي للأشخاص المفقودين. تساعد المستخدمين في:
- كيفية البحث عن شخص مفقود (انتقل إلى صفحة البحث)
- كيفية إنشاء تقرير عن شخص مفقود أو تم العثور عليه (انتقل إلى إنشاء منشور في شريط التنقل)
- كيفية عرض مواقع التقارير على الخريطة (انتقل إلى صفحة الخريطة من شريط التنقل على سطح المكتب، أو من القائمة الجانبية على الجوال/التابلت)
- الأسئلة العامة حول المنصة
- إذا أراد المستخدم التحدث مع شخص حقيقي، أخبره بزيارة صفحة التواصل (اجعل "صفحة التواصل" رابطًا قابلاً للنقر ينتقل إلى /contact)

كن دائمًا دافئًا وموجزًا ومفيدًا. استخدم اللغة العربية في جميع ردودك.`
    }
    return `You are a helpful guide for the Unify missing persons platform. You help users with:
- How to search for a missing person (go to Search page)
- How to create a missing or found person report (go to Create Post in navbar)
- How to view report locations on a map (go to the Map page from the navbar on desktop, or from the sidebar menu on mobile/tablet)
- General questions about the platform
- If the user wants to speak with a real person, tell them to visit the Contact Page (render "Contact Page" as a clickable link that navigates to /contact)

Always be warm, concise, and helpful. Use English in all your responses.`
  }

  const handleLanguageSelect = (selectedLang: 'en' | 'ar') => {
    setLanguage(selectedLang)
    const welcomeMessage = selectedLang === 'ar' 
      ? 'مرحبًا! أنا هنا لمساعدتك في منصة يونيفاي. كيف يمكنني مساعدتك اليوم؟'
      : 'Hello! I\'m here to help you with the Unify platform. How can I assist you today?'
    setMessages([{ role: 'assistant', content: welcomeMessage }])
  }

  const formatMessage = (content: string) => {
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    formatted = formatted.replace(
      /Contact Page/gi,
      '<a href="/contact" class="text-blue-600 hover:text-blue-800 underline">Contact Page</a>'
    )
    
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    
    return formatted
  }

  const handleContactLinkClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLAnchorElement && e.target.getAttribute('href') === '/contact') {
      e.preventDefault()
      navigate('/contact')
      setIsOpen(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !language || isLoading) return

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
              { role: 'system', content: getSystemPrompt(language) },
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
      const errorMessage = language === 'ar'
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
          <img src={chatbotIcon} alt="AI Assistant" className="w-14 h-14" />
        </button>
      )}

      {/* Chat popup */}
      {(isOpen || isClosing) && (
        <div
          className={`fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 delay-100 modal-pop ${
            language === 'ar' ? 'rtl' : 'ltr'
          }`}
          data-state={isClosing ? 'closed' : 'open'}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
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
            {!language ? (
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
          {language && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
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