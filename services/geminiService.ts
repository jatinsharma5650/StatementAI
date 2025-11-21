import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Transaction, TransactionType } from "../types";

const MODEL_NAME = "gemini-3-pro-preview"; // Best for complex extraction tasks

export const analyzeBankStatement = async (
  imageParts: { mimeType: string; data: string }[]
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert financial data analyst. 
    Analyze the provided images of a bank statement.
    Extract every single transaction row found in the document.
    
    For each transaction, extract:
    1. Date (YYYY-MM-DD format). If the year is missing, assume the current year or infer from context headers.
    2. Description (Clean up the text, remove excessive whitespace or codes).
    3. Amount (Number. Ensure withdrawals/debits are negative and deposits/credits are positive).
    4. Type (Strictly "Credit" or "Debit").
    5. Notes (Any extra reference numbers, categories inferred, or details).

    Return ONLY a JSON object containing an array of transactions.
  `;

  // We define the schema to ensure type safety and reliable parsing
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        ...imageParts.map(part => ({
          inlineData: {
            mimeType: part.mimeType,
            data: part.data
          }
        })),
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["Credit", "Debit"] },
                notes: { type: Type.STRING }
              },
              required: ["date", "description", "amount", "type"]
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    const data = JSON.parse(text);
    const transactions: Transaction[] = data.transactions.map((t: any) => ({
      ...t,
      // Ensure enum correctness just in case
      type: t.type === 'Credit' ? TransactionType.CREDIT : TransactionType.DEBIT,
      amount: Number(t.amount),
      notes: t.notes || ''
    }));

    // Calculate summary
    const summary = transactions.reduce(
      (acc, curr) => {
        if (curr.amount > 0) {
          acc.totalIncome += curr.amount;
        } else {
          acc.totalExpense += Math.abs(curr.amount);
        }
        acc.net += curr.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, net: 0 }
    );

    return { transactions, summary };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse the analysis results.");
  }
};