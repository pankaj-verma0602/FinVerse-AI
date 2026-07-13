"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/auth-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Network,
  Award,
  Share2,
  Check
} from "lucide-react";

interface FinancialTerm {
  id: string;
  term: string;
  category: string;
  difficulty: string;
  definition: string;
  simpleExplanation: string;
  example: string;
  importance: string;
  commonMistakes: string[];
  relatedTerms: string[];
  hindiExplanation: string;
  audioAvailable: boolean;
}

const CATEGORIES = [
  { id: "Banking", icon: "🏦", label: "Banking" },
  { id: "Loans", icon: "💰", label: "Loans" },
  { id: "Investment", icon: "📈", label: "Investment" },
  { id: "Insurance", icon: "🛡", label: "Insurance" },
  { id: "Taxes", icon: "📄", label: "Taxes" },
  { id: "Credit", icon: "💳", label: "Credit" }
];

const SEED_TERMS: Omit<FinancialTerm, "id">[] = [
  {
    term: "Savings Account",
    category: "Banking",
    difficulty: "Beginner",
    definition: "A deposit account held at a bank that provides principal security and a modest interest rate.",
    simpleExplanation: "A safe place to keep cash while earning a small interest payout.",
    example: "Depositing your monthly salary surplus and earning 3% annual interest.",
    importance: "Secures emergency cash with high liquidity.",
    commonMistakes: ["Keeping all long-term savings here instead of investing"],
    relatedTerms: ["FD", "UPI", "NEFT"],
    hindiExplanation: "बैंक में जमा खाता जो मूलधन की सुरक्षा और थोड़ा ब्याज देता है। यह आपातकालीन पैसे सुरक्षित रखने के लिए सही है।",
    audioAvailable: true
  },
  {
    term: "FD",
    category: "Banking",
    difficulty: "Beginner",
    definition: "Fixed Deposit is a financial instrument where you lock cash for a fixed tenure at a guaranteed interest rate.",
    simpleExplanation: "Lending money to the bank for a set time (e.g., 1 year) in exchange for higher interest than savings.",
    example: "Locking ₹50,000 for 3 years at a guaranteed 7.5% annual interest rate.",
    importance: "Provides risk-free, predictable returns.",
    commonMistakes: ["Withdrawing prematurely which incurs penalty charges"],
    relatedTerms: ["Savings Account", "Investment", "Return"],
    hindiExplanation: "निश्चित अवधि (Fixed Deposit) के लिए एक निश्चित ब्याज दर पर पैसा लॉक करना। इसमें बचत खाते से ज्यादा ब्याज मिलता है।",
    audioAvailable: true
  },
  {
    term: "UPI",
    category: "Banking",
    difficulty: "Beginner",
    definition: "Unified Payments Interface is an instant real-time payment system that merges bank accounts into a single app.",
    simpleExplanation: "Sending money directly from your bank account to another person instantly using a mobile app.",
    example: "Scanning a QR code at a grocery store to transfer ₹150 instantly.",
    importance: "Enables cashless, zero-fee instant transactions.",
    commonMistakes: ["Sharing UPI PIN with strangers or during scam phone calls"],
    relatedTerms: ["NEFT", "Savings Account", "Credit Limit"],
    hindiExplanation: "यूनिफाइड पेमेंट्स इंटरफेस (UPI) एक मोबाइल ऐप के जरिए सीधे आपके बैंक खाते से तुरंत पैसा ट्रांसफर करने का सुरक्षित तरीका है।",
    audioAvailable: true
  },
  {
    term: "NEFT",
    category: "Banking",
    difficulty: "Intermediate",
    definition: "National Electronic Funds Transfer is a nationwide centralized payment system for batch-wise electronic transfers.",
    simpleExplanation: "Transferring larger sums of money between bank accounts in hourly clearance batches.",
    example: "Transferring ₹1,00,000 rent directly to your landlord's account.",
    importance: "Safe and secure transfer method for high-value transactions.",
    commonMistakes: ["Entering wrong account numbers since transfers are processed in batches"],
    relatedTerms: ["UPI", "Savings Account", "EMI"],
    hindiExplanation: "राष्ट्रीय इलेक्ट्रॉनिक फंड ट्रांसफर (NEFT) के जरिए बड़े फंड्स को बैच-वाइज़ इलेक्ट्रॉनिक रूप से सुरक्षित ट्रांसफर किया जाता है।",
    audioAvailable: true
  },
  {
    term: "EMI",
    category: "Loans",
    difficulty: "Beginner",
    definition: "Equated Monthly Installment is a fixed payment amount made by a borrower to a lender at a specified date each month.",
    simpleExplanation: "Equal monthly payments consisting of principal and interest to pay off a loan over time.",
    example: "Paying ₹15,000 every month on a home loan until the debt is cleared.",
    importance: "Helps plan monthly cash outlays.",
    commonMistakes: ["Opting for longer tenures which increases total interest costs"],
    relatedTerms: ["APR", "Interest Rate", "Collateral"],
    hindiExplanation: "समान मासिक किस्त (EMI) हर महीने कर्ज चुकाने के लिए दी जाने वाली निश्चित राशि है, जिसमें मूलधन और ब्याज दोनों शामिल होते हैं।",
    audioAvailable: true
  },
  {
    term: "APR",
    category: "Loans",
    difficulty: "Beginner",
    definition: "Annual Percentage Rate shows the yearly cost of borrowing money, including fees and interest charges.",
    simpleExplanation: "The total yearly cost of a loan expressed as a percentage.",
    example: "A credit card with 36% APR can become extremely expensive if unpaid.",
    importance: "Helps users compare different loan costs.",
    commonMistakes: ["Ignoring APR while comparing interest rates"],
    relatedTerms: ["Interest Rate", "EMI", "Credit Score"],
    hindiExplanation: "वार्षिक प्रतिशत दर (APR) ऋण लेने की वार्षिक कुल लागत (ब्याज + फीस) को दर्शाती है।",
    audioAvailable: true
  },
  {
    term: "Interest Rate",
    category: "Loans",
    difficulty: "Beginner",
    definition: "The proportion of a loan that is charged as interest to the borrower, typically expressed as an annual percentage.",
    simpleExplanation: "The fee you pay to borrow money, or the earnings you receive from saving cash.",
    example: "Paying 8.5% annual interest on a vehicle loan balance.",
    importance: "Determines the basic cost of capital.",
    commonMistakes: ["Focusing only on the monthly EMI rather than the overall interest rate"],
    relatedTerms: ["APR", "EMI", "Compound Interest"],
    hindiExplanation: "ब्याज दर (Interest Rate) ऋणदाता द्वारा ली जाने वाली प्रतिशत राशि है।",
    audioAvailable: true
  },
  {
    term: "Collateral",
    category: "Loans",
    difficulty: "Intermediate",
    definition: "An asset that a borrower offers to a lender as security for securing a loan.",
    simpleExplanation: "Something of value (like a home or gold) that the bank can claim if you fail to repay your loan.",
    example: "Pledging property documents to obtain a secure business expansion loan.",
    importance: "Reduces loan interest rates by lowering bank risk.",
    commonMistakes: ["Pledging critical livelihood assets for high-risk speculative debts"],
    relatedTerms: ["EMI", "Interest Rate", "Credit History"],
    hindiExplanation: "संपार्श्विक (Collateral) ऋण सुरक्षित करने के लिए बैंक के पास बंधक रखी जाने वाली संपत्ति (जैसे सोना या घर) है।",
    audioAvailable: true
  },
  {
    term: "Stock",
    category: "Investment",
    difficulty: "Beginner",
    definition: "A security that represents ownership fraction of a corporation.",
    simpleExplanation: "Buying a tiny piece of ownership in a company, hoping its value grows as the company succeeds.",
    example: "Purchasing 10 shares of Apple Inc. and owning a slice of their company.",
    importance: "Provides capital appreciation potential over time.",
    commonMistakes: ["Trading stock positions based on short-term news rumors without research"],
    relatedTerms: ["Mutual Fund", "SIP", "Compound Interest"],
    hindiExplanation: "स्टॉक (Stock) या शेयर किसी कंपनी में हिस्सेदारी खरीदने का साधन है। कंपनी के बढ़ने पर शेयर की वैल्यू भी बढ़ती है।",
    audioAvailable: true
  },
  {
    term: "Mutual Fund",
    category: "Investment",
    difficulty: "Beginner",
    definition: "An investment program funded by shareholders that trades in diversified holdings and is professionally managed.",
    simpleExplanation: "Pooling money from many investors to buy a basket of different stocks or bonds managed by a pro.",
    example: "Investing in a Large Cap Index Fund that holds slices of the top 50 national companies.",
    importance: "Enables instant diversification to lower investment risks.",
    commonMistakes: ["Focusing on past performance records without looking at expense ratios"],
    relatedTerms: ["SIP", "Stock", "Return"],
    hindiExplanation: "म्यूचुअल फंड (Mutual Fund) कई निवेशकों के पैसे को एक साथ मिलाकर एक डाइवर्सिफाइड पोर्टफोलियो में निवेश करने का साधन है।",
    audioAvailable: true
  },
  {
    term: "SIP",
    category: "Investment",
    difficulty: "Beginner",
    definition: "Systematic Investment Plan allows regular fixed contributions to mutual funds over regular intervals.",
    simpleExplanation: "Investing a fixed amount monthly (e.g., ₹1,000) to average market highs and lows.",
    example: "Automating ₹2,000 monthly SIP debits to buy equity index funds.",
    importance: "Builds regular financial discipline and averages purchase costs.",
    commonMistakes: ["Stopping SIPs during market corrections instead of buying at discount rates"],
    relatedTerms: ["Compound Interest", "Mutual Fund", "Investment"],
    hindiExplanation: "सिस्टमैटिक इन्वेस्टमेंट प्लान (SIP) म्यूचुअल फंड में हर महीने एक निश्चित राशि नियमित रूप से निवेश करने का बेहतरीन तरीका है।",
    audioAvailable: true
  },
  {
    term: "Compound Interest",
    category: "Investment",
    difficulty: "Beginner",
    definition: "Interest calculated on the initial principal and also on the accumulated interest of previous periods.",
    simpleExplanation: "Earning interest on your interest, creating a snowball wealth effect.",
    example: "₹10,000 earns ₹1,000 in Year 1. Year 2 earns interest on ₹11,000, yielding ₹1,210.",
    importance: "Exponentially compounds wealth over long investment horizons.",
    commonMistakes: ["Withdrawing savings prematurely, stopping the compounding loop"],
    relatedTerms: ["SIP", "Investment", "Return"],
    hindiExplanation: "चक्रवृद्धि ब्याज (Compound Interest) में मूलधन के साथ-साथ पहले मिले ब्याज पर भी ब्याज मिलता है, जिससे पैसा तेजी से बढ़ता है।",
    audioAvailable: true
  },
  {
    term: "Premium",
    category: "Insurance",
    difficulty: "Beginner",
    definition: "The amount of money an individual or business pays for an insurance policy.",
    simpleExplanation: "The regular fee you pay to an insurance company to keep your coverage active.",
    example: "Paying ₹1,200 monthly premium for a ₹50 Lakh term life protection plan.",
    importance: "Transfers catastrophic financial risks to an insurance pool.",
    commonMistakes: ["Letting policy premium dates lapse, losing cover when needed"],
    relatedTerms: ["Policy", "Deductible", "GST"],
    hindiExplanation: "प्रीमियम (Premium) बीमा सुरक्षा (Insurance Cover) चालू रखने के लिए बीमा कंपनी को दी जाने वाली मासिक या वार्षिक फीस है।",
    audioAvailable: true
  },
  {
    term: "Policy",
    category: "Insurance",
    difficulty: "Beginner",
    definition: "A contract between the insurer and the insured which determines the claims that the insurer is legally required to pay.",
    simpleExplanation: "The legal insurance contract detailing what risks are covered and what is excluded.",
    example: "Reading your health policy document to confirm that dental checks are excluded.",
    importance: "Defines legal obligations and coverage limits.",
    commonMistakes: ["Signing policy contracts without reviewing hidden exclusions"],
    relatedTerms: ["Premium", "Deductible", "UPI"],
    hindiExplanation: "पॉलिसी (Policy) बीमा कंपनी और आपके बीच का कानूनी अनुबंध है, जिसमें नियम, शर्तें और एक्सक्लूशन्स लिखे होते हैं।",
    audioAvailable: true
  },
  {
    term: "Deductible",
    category: "Insurance",
    difficulty: "Intermediate",
    definition: "A specified amount of money that the insured must pay before an insurance company will pay any claim.",
    simpleExplanation: "The out-of-pocket money you must pay first before insurance covers the rest of the bill.",
    example: "Paying first ₹10,000 on medical bills before health cover activates.",
    importance: "Lowers policy premiums by sharing minor claims costs with the user.",
    commonMistakes: ["Assuming 100% of hospital bills are covered from day one without a deductible"],
    relatedTerms: ["Premium", "Policy", "Savings Account"],
    hindiExplanation: "डिडक्टिबल (Deductible) वह प्रारंभिक राशि है जो क्लेम मिलने से पहले पॉलिसीधारक को खुद चुकानी होती है।",
    audioAvailable: true
  },
  {
    term: "GST",
    category: "Taxes",
    difficulty: "Beginner",
    definition: "Goods and Services Tax is an indirect tax used on the supply of goods and services.",
    simpleExplanation: "A consumption tax added to the price of products and services you purchase.",
    example: "Paying 18% GST on a restaurant food bill.",
    importance: "Simplifies tax structures by consolidating multiple indirect levies.",
    commonMistakes: ["Failing to claim input tax credits in business purchase logs"],
    relatedTerms: ["Income Tax", "UPI", "Savings Account"],
    hindiExplanation: "वस्तु एवं सेवा कर (GST) देश में वस्तुओं और सेवाओं की खरीद पर लगने वाला अप्रत्यक्ष कर (Indirect Tax) है।",
    audioAvailable: true
  },
  {
    term: "Income Tax",
    category: "Taxes",
    difficulty: "Intermediate",
    definition: "A direct tax that governments impose on financial income generated by businesses and individuals.",
    simpleExplanation: "The tax you pay directly to the government based on how much money you earn annually.",
    example: "Paying 20% tax on annual salary earnings falling within the taxable bracket.",
    importance: "Funds public infrastructure, security forces, and governance programs.",
    commonMistakes: ["Failing to declare tax-exempt savings like PPF or ELSS under section 80C"],
    relatedTerms: ["GST", "Savings Account", "FD"],
    hindiExplanation: "आयकर (Income Tax) आपकी वार्षिक कमाई पर सरकार द्वारा लिया जाने वाला प्रत्यक्ष कर है। इसमें टैक्स छूट के विकल्प भी होते हैं।",
    audioAvailable: true
  },
  {
    term: "Credit Score",
    category: "Credit",
    difficulty: "Beginner",
    definition: "A numerical expression based on a level analysis of a person's credit files, representing creditworthiness.",
    simpleExplanation: "A score (300-900) that shows banks how reliably you repay borrowed money.",
    example: "Maintaining a 780 credit score to secure a low-interest housing loan.",
    importance: "Determines whether you get loan approvals and at what interest rates.",
    commonMistakes: ["Failing to check credit logs annually for billing errors"],
    relatedTerms: ["Credit Limit", "Credit History", "APR"],
    hindiExplanation: "क्रेडिट स्कोर (Credit Score) आपकी साख (300-900) को दर्शाता है। यह बैंकों को बताता है कि आप समय पर कर्ज चुकाते हैं या नहीं।",
    audioAvailable: true
  },
  {
    term: "Credit Limit",
    category: "Credit",
    difficulty: "Beginner",
    definition: "The maximum amount of credit a financial institution extends to a client.",
    simpleExplanation: "The maximum amount of money you can spend on your credit card.",
    example: "Having a credit limit of ₹1,00,000 on your credit card.",
    importance: "Controls exposure and shields users from over-borrowing traps.",
    commonMistakes: ["Exceeding 30% credit utilization, which lowers credit scores"],
    relatedTerms: ["Credit Score", "Credit History", "Savings Account"],
    hindiExplanation: "क्रेडिट सीमा (Credit Limit) वह अधिकतम राशि है जो बैंक आपको क्रेडिट कार्ड पर खर्च करने की अनुमति देता है।",
    audioAvailable: true
  },
  {
    term: "Credit History",
    category: "Credit",
    difficulty: "Intermediate",
    definition: "A record of a borrower's responsible repayment of debts.",
    simpleExplanation: "Your lifetime track record of borrowing and repaying loans on time.",
    example: "Having 5 years of zero defaults on home loans establishing excellent repayment history.",
    importance: "Acts as a primary credential when seeking credit upgrades.",
    commonMistakes: ["Closing old credit card accounts which shortens history length"],
    relatedTerms: ["Credit Score", "Credit Limit", "Collateral"],
    hindiExplanation: "क्रेडिट इतिहास (Credit History) ऋणों को चुकाने का आपका पुराना रिकॉर्ड है। अच्छा इतिहास ऋण मिलना आसान बनाता है।",
    audioAvailable: true
  }
];

export default function FinancialDictionaryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [terms, setTerms] = useState<FinancialTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTerm, setActiveTerm] = useState<FinancialTerm | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [learnedTerms, setLearnedTerms] = useState<string[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load term from URL query parameter once terms are populated
  useEffect(() => {
    if (typeof window === "undefined" || terms.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get("term");
    if (queryTerm) {
      const found = terms.find(t => t.term.toLowerCase() === queryTerm.toLowerCase() || t.id.toLowerCase() === queryTerm.toLowerCase());
      if (found) {
        setActiveTerm(found);
      }
    }
  }, [terms]);

  const handleShare = () => {
    if (typeof window === "undefined" || !activeTerm) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?term=${encodeURIComponent(activeTerm.term)}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  // Sync state
  useEffect(() => {
    setMounted(true);
    
    // Read learned terms list
    const storedLearned = localStorage.getItem("finverse_learned_dictionary_terms");
    if (storedLearned) {
      try {
        setLearnedTerms(JSON.parse(storedLearned));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Listen to Firestore financial_terms
  useEffect(() => {
    let active = true;

    const unsub = onSnapshot(collection(db, "financial_terms"), async (snap) => {
      if (!active) return;
      const list: FinancialTerm[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FinancialTerm);
      });

      if (list.length === 0) {
        // Seed terms automatically if empty
        console.log("Seeding initial financial terms into Firestore...");
        try {
          for (const item of SEED_TERMS) {
            const cleanId = item.term.replace(/\s+/g, "_");
            await setDoc(doc(db, "financial_terms", cleanId), {
              ...item,
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Failed to seed financial terms:", err);
        }
      } else {
        list.sort((a, b) => a.term.localeCompare(b.term));
        setTerms(list);
        
        // Select first term by default if none selected
        if (list.length > 0 && !activeTerm) {
          setActiveTerm(list[0]);
        }
      }
      setDbLoading(false);
    }, (err) => {
      console.warn("Firestore onSnapshot failed, loading local fallback dictionary:", err);
      if (active) loadLocalFallback();
    });

    // Timeout fallback if snapshot doesn't respond in 1.5s
    const timeoutId = setTimeout(() => {
      if (active && terms.length === 0) {
        console.warn("Firestore snapshot timed out, loading local fallback dictionary.");
        loadLocalFallback();
      }
    }, 1500);

    function loadLocalFallback() {
      const stored = localStorage.getItem("finverse_local_financial_terms");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTerms(parsed);
          if (parsed.length > 0 && !activeTerm) {
            setActiveTerm(parsed[0]);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const listWithIds = SEED_TERMS.map((item, idx) => ({
          id: `local_${idx}`,
          ...item
        })) as FinancialTerm[];
        setTerms(listWithIds);
        localStorage.setItem("finverse_local_financial_terms", JSON.stringify(listWithIds));
        if (listWithIds.length > 0 && !activeTerm) {
          setActiveTerm(listWithIds[0]);
        }
      }
      setDbLoading(false);
    }

    return () => {
      active = false;
      unsub();
      clearTimeout(timeoutId);
    };
  }, [activeTerm, terms.length]);

  // Auth Guard check
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Initializing Knowledge Hub...</p>
        </div>
      </div>
    );
  }

  // Text to Speech
  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !activeTerm) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = language === "hi" 
      ? activeTerm.hindiExplanation 
      : `${activeTerm.term}. Definition: ${activeTerm.definition}. Simple explanation: ${activeTerm.simpleExplanation}. Example: ${activeTerm.example}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.cancel(); // Stop active speaking
    window.speechSynthesis.speak(utterance);
  };

  // Mark term as learned
  const markAsLearned = (termName: string) => {
    if (learnedTerms.includes(termName)) return;

    const updated = [...learnedTerms, termName];
    setLearnedTerms(updated);
    localStorage.setItem("finverse_learned_dictionary_terms", JSON.stringify(updated));

    // Gamification reward +10 XP
    const currentXp = Number(localStorage.getItem("finverse_user_xp") || "50");
    localStorage.setItem("finverse_user_xp", String(currentXp + 10));
  };

  // Filter Terms
  const filteredTerms = terms.filter((item) => {
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const progressCount = learnedTerms.length;
  const progressPercent = Math.min(100, (progressCount / 32) * 100);

  // Switch Active Term
  const selectTerm = (item: FinancialTerm) => {
    setActiveTerm(item);
    markAsLearned(item.term);
    // Cancel speaking if active
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    // Update URL query param without reload
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}?term=${encodeURIComponent(item.term)}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }
  };

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-1 gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              Financial Knowledge Hub <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-xs">
              AI-powered bilingual glossary to demystify loans, investments, taxes, and inflation.
            </p>
          </div>

          {/* Gamification Progress */}
          <Card className="glass-card border border-border p-4 rounded-xl flex items-center gap-4 shrink-0 max-w-xs w-full md:w-auto">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex-grow space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span>Knowledge Level</span>
                <span className="text-amber-400">Money Explorer ⭐⭐</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {progressCount} / 32 terms completed (+10 XP each)
              </div>
              <Progress value={progressPercent} className="h-1.5 w-full mt-1.5" />
            </div>
          </Card>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => setSelectedCategory("All")}
            className="text-xs h-9 rounded-xl border-border"
          >
            🔍 All Concepts
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="text-xs h-9 rounded-xl border-border flex items-center gap-1"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar Terms Selector */}
          <Card className="glass-card border border-border/50 p-4 rounded-2xl space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search financial terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-background/50 border-border/60"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
              {dbLoading ? (
                <div className="text-center text-xs text-muted-foreground py-8">Loading terms...</div>
              ) : filteredTerms.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-8">No terms found.</div>
              ) : (
                filteredTerms.map((termItem) => (
                  <button
                    key={termItem.id}
                    onClick={() => selectTerm(termItem)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border flex justify-between items-center ${
                      activeTerm?.id === termItem.id
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-border/20 bg-transparent text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{termItem.term}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{termItem.category}</div>
                    </div>
                    {learnedTerms.includes(termItem.term) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        Read
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Active Term Learning Panel */}
          <div className="lg:col-span-2 space-y-6">
            {activeTerm ? (
              <Card className="glass-card border border-border/50 p-6 md:p-8 rounded-3xl space-y-6">
                
                {/* Active Term Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-extrabold tracking-tight text-primary">{activeTerm.term}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
                        {activeTerm.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Difficulty: {activeTerm.difficulty}</p>
                  </div>

                  {/* Options: Speech & Language Toggle */}
                  <div className="flex items-center gap-2">
                    {/* Listen Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSpeak}
                      className={`h-9 px-3 rounded-xl border-border flex items-center gap-1.5 text-xs font-semibold ${
                        isSpeaking ? "bg-red-500/10 border-red-500/20 text-red-400" : ""
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 animate-bounce" />}
                      <span>{isSpeaking ? "Stop" : "Listen"}</span>
                    </Button>

                    {/* Share Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShare}
                      className={`h-9 px-3 rounded-xl border-border flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
                        copied ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : ""
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-primary" />}
                      <span>{copied ? "Copied!" : "Share"}</span>
                    </Button>

                    {/* Language Selector Toggle */}
                    <div className="flex rounded-xl bg-zinc-900 border border-border/40 p-0.5">
                      <Button
                        variant={language === "en" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setLanguage("en")}
                        className="h-8 text-[10px] font-bold px-2.5 rounded-lg"
                      >
                        English
                      </Button>
                      <Button
                        variant={language === "hi" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setLanguage("hi")}
                        className="h-8 text-[10px] font-bold px-2.5 rounded-lg"
                      >
                        हिन्दी
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Explanation Details */}
                <div className="space-y-6">
                  {language === "hi" ? (
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-2">
                      <h4 className="font-extrabold text-[10px] text-purple-400 uppercase tracking-widest">हिन्दी व्याख्या (Hindi Context)</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{activeTerm.hindiExplanation}</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-widest">Definition</h4>
                        <p className="text-sm leading-relaxed">{activeTerm.definition}</p>
                      </div>

                      <div className="space-y-1 border-t border-border/10 pt-4">
                        <h4 className="font-extrabold text-[10px] text-purple-400 uppercase tracking-widest">Simple Explanation</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl">
                          {activeTerm.simpleExplanation}
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-border/10 pt-4">
                        <h4 className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest">Real Life Example</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed italic border border-border/30 bg-muted/10 p-4 rounded-xl whitespace-pre-wrap">
                          {activeTerm.example}
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-border/10 pt-4">
                        <h4 className="font-extrabold text-[10px] text-blue-400 uppercase tracking-widest">Why It Matters</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activeTerm.importance}
                        </p>
                      </div>

                      {activeTerm.commonMistakes && activeTerm.commonMistakes.length > 0 && (
                        <div className="space-y-1 border-t border-border/10 pt-4">
                          <h4 className="font-extrabold text-[10px] text-red-400 uppercase tracking-widest">Common Mistakes</h4>
                          <div className="space-y-1.5 pt-1">
                            {activeTerm.commonMistakes.map((mistake, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="shrink-0">❌</span>
                                <span>{mistake}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Related Terms Node Graph Diagram */}
                {activeTerm.relatedTerms && activeTerm.relatedTerms.length > 0 && (
                  <div className="border-t border-border/20 pt-6 space-y-4">
                    <h4 className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Network className="h-4 w-4 text-primary animate-pulse" />
                      <span>Interactive Concept Relationship Graph</span>
                    </h4>

                    {/* SVG/CSS Knowledge Tree */}
                    <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 border border-border/40 rounded-2xl space-y-6 relative overflow-hidden">
                      {/* Active Center Node */}
                      <div className="px-4 py-2 bg-primary/20 border-2 border-primary text-primary font-black rounded-xl text-xs z-10 shadow-lg shadow-primary/10">
                        {activeTerm.term}
                      </div>

                      {/* Line connectors */}
                      <div className="flex justify-center items-center gap-8 w-full flex-wrap pt-2">
                        {activeTerm.relatedTerms.map((relTerm) => {
                          const matchedRel = terms.find(t => t.term.toLowerCase() === relTerm.toLowerCase());
                          return (
                            <button
                              key={relTerm}
                              onClick={() => {
                                if (matchedRel) selectTerm(matchedRel);
                              }}
                              className="px-3 py-1.5 bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-primary/5 text-[10px] font-bold rounded-lg transition-all"
                            >
                              {relTerm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ask AI Mentor Portal */}
                <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5 border border-primary/10 p-5 rounded-2xl">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" /> Consult AI Money Mentor
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Send this term directly to your voice mentor to get a customized, simple step-by-step breakdown.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/mentor?term=${encodeURIComponent(activeTerm.term)}`)}
                    className="h-10 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shrink-0 flex items-center gap-1.5"
                  >
                    Ask AI Mentor
                  </Button>
                </div>

              </Card>
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center border border-dashed border-border/40 rounded-2xl text-xs text-muted-foreground">
                Select a financial term from the left sidebar to start learning.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
