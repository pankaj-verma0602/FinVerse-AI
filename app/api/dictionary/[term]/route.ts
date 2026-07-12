import { NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function GET(
  request: Request,
  { params }: { params: { term: string } }
) {
  const termName = decodeURIComponent(params.term).trim();
  if (!termName) {
    return NextResponse.json({ error: "Term parameter is required" }, { status: 400 });
  }

  // Fallback seeds if DB is empty or offline
  const fallbackDatabase: Record<string, any> = {
    "APR": {
      term: "APR",
      category: "Loans",
      difficulty: "Beginner",
      definition: "Annual Percentage Rate shows the yearly cost of borrowing money.",
      example: "A credit card with 36% APR can become expensive if unpaid.",
      importance: "Helps users compare loan costs.",
      commonMistakes: ["Ignoring APR while taking loans"],
      relatedTerms: ["Interest Rate", "EMI", "Credit Score"]
    },
    "Compound Interest": {
      term: "Compound Interest",
      category: "Investment",
      difficulty: "Beginner",
      definition: "Interest calculated on the initial principal and also on the accumulated interest of previous periods.",
      example: "₹10,000 earns ₹1,000 year 1. Year 2 earns interest on ₹11,000, yielding ₹1,210.",
      importance: "Helps wealth grow exponentially over long periods.",
      commonMistakes: ["Removing investments too early"],
      relatedTerms: ["SIP", "Investment", "Return"]
    },
    "EMI": {
      term: "EMI",
      category: "Loans",
      difficulty: "Beginner",
      definition: "Equated Monthly Installment is a fixed payment made by a borrower to a lender.",
      example: "Paying ₹15,000 every month on a home loan until the debt is cleared.",
      importance: "Helps plan monthly cash outlays.",
      commonMistakes: ["Opting for longer terms which increases total interest cost"],
      relatedTerms: ["APR", "Collateral", "Interest Rate"]
    },
    "SIP": {
      term: "SIP",
      category: "Investment",
      difficulty: "Beginner",
      definition: "Systematic Investment Plan allows regular monthly contributions to mutual funds.",
      example: "Investing ₹1,000 every month into an equity mutual fund.",
      importance: "Allows dollar-cost averaging and builds financial discipline.",
      commonMistakes: ["Stopping SIPs during market corrections"],
      relatedTerms: ["Compound Interest", "Mutual Fund", "Stock"]
    }
  };

  let termData: any = null;

  try {
    const q = query(
      collection(db, "financial_terms"),
      where("term", "==", termName)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const doc = snap.docs[0];
      termData = { id: doc.id, ...doc.data() };
    } else {
      // Try querying by title
      const q2 = query(
        collection(db, "financial_terms"),
        where("title", "==", termName)
      );
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const doc = snap2.docs[0];
        termData = { id: doc.id, ...doc.data() };
      }
    }
  } catch (error: any) {
    console.warn("Firestore query failed, trying static fallback match:", error);
  }

  // If Firestore didn't find the term, check fallback database
  if (!termData) {
    const matchedKey = Object.keys(fallbackDatabase).find(
      (k) => k.toLowerCase() === termName.toLowerCase()
    );
    if (matchedKey) {
      termData = fallbackDatabase[matchedKey];
    }
  }

  if (!termData) {
    return NextResponse.json({ error: "Term not found" }, { status: 404 });
  }

  return NextResponse.json({
    term: termData.term || termData.title || termName,
    category: termData.category || "General",
    difficulty: termData.difficulty || "Beginner",
    definition: termData.definition || termData.meaning || "",
    example: termData.example || "",
    importance: termData.importance || termData.simpleExplanation || "",
    mistakes: termData.commonMistakes || termData.mistakes || [],
    relatedTerms: termData.relatedTerms || []
  });
}
