import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function urlToBase64(url: string) {
  const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function runAudit(url: string) {
  if (!auth.currentUser) throw new Error("User must be logged in");

  const auditRef = await addDoc(collection(db, "audits"), {
    url,
    status: "processing",
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });

  try {
    // 1. Get website data from backend
    const backendResponse = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!backendResponse.ok) throw new Error("Failed to scrape website");
    const siteData = await backendResponse.json();

    // 2. Fetch screenshot and convert to base64 for Vision analysis
    let visualContextPart = {};
    try {
      const base64 = await urlToBase64(siteData.screenshotUrl);
      visualContextPart = {
        inlineData: {
          mimeType: "image/png",
          data: base64.split(",")[1],
        },
      };
    } catch (e) {
      console.warn("Could not capture screenshot for vision analysis", e);
    }

    // 3. Analyze with Gemini
    const result = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            ...(Object.keys(visualContextPart).length > 0 ? [visualContextPart] : []),
            {
              text: `You are an elite, world-class UI/UX and Digital Strategy Consultant for a premium design agency. 
              Your goal is to perform a high-stakes website audit that reveals deep conversion leaks and redesign opportunities for: ${url}

              CONTEXT PROVIDED:
              - Metadata: ${JSON.stringify(siteData.metadata)}
              - Key Text Content: ${siteData.rawText}
              - Structure Snippet: ${siteData.htmlSnippet}
              ${Object.keys(visualContextPart).length > 0 ? "- IMAGE PROVIDED: Use the attached screenshot to analyze the ACTUAL visual appearance, spacing, color harmonics, and branding quality." : ""}

              ANALYSIS INSTRUCTIONS:
              - Think beyond generic SEO. Analyze the "emotional resonance", "trust architecture", and "visual authority" of the site.
              - Identify "Design Debt": Outdated patterns, inconsistent scaling, poor whitespace usage, legibility issues.
              - Conversion Gaps: Where is the friction? Is the hero message compelling? Are the CTAs visible and persuasive?
              - Brand Perception: Does the site feel like a $10M business or a $10k business?
              - Tactical Recommendations: Provide actionable, high-impact changes that justify a premium redesign fee.

              Report Output MUST be a single JSON object.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                uiux: { type: Type.NUMBER },
                branding: { type: Type.NUMBER },
                mobile: { type: Type.NUMBER },
                seo: { type: Type.NUMBER },
                trust: { type: Type.NUMBER },
                conversion: { type: Type.NUMBER },
                overall: { type: Type.NUMBER },
                urgency: { type: Type.NUMBER },
                leadQuality: { type: Type.NUMBER },
                investmentPotential: { type: Type.NUMBER }
              }
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                uiux: { type: Type.STRING },
                branding: { type: Type.STRING },
                mobile: { type: Type.STRING },
                conversion: { type: Type.STRING },
                performance: { type: Type.STRING },
                seo: { type: Type.STRING },
                trust: { type: Type.STRING }
              }
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            redesignVision: {
              type: Type.OBJECT,
              properties: {
                direction: { type: Type.STRING },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                typography: { type: Type.STRING },
                animations: { type: Type.STRING }
              }
            },
            outreach: {
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                whatsapp: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                summary: { type: Type.STRING },
                missedOpportunity: { type: Type.STRING }
              }
            }
          }
        },
      },
    });

    const auditData = JSON.parse(result.text);

    // 4. Update Firestore
    await updateDoc(doc(db, "audits", auditRef.id), {
      ...auditData,
      status: "completed",
      screenshotUrl: siteData.screenshotUrl,
      mobileScreenshotUrl: siteData.mobileScreenshotUrl,
    });

    // 5. Create a Lead automatically
    if (auditData.scores.overall < 70) {
      await addDoc(collection(db, "leads"), {
        website: url,
        status: "new",
        agencyId: `AG-${auth.currentUser.uid.substring(0, 4)}`.toUpperCase(),
        auditId: auditRef.id,
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      });
    }

    return auditRef.id;
  } catch (error) {
    console.error("Audit failed:", error);
    await updateDoc(doc(db, "audits", auditRef.id), {
      status: "failed",
    });
    throw error;
  }
}

export async function generateMockup(auditId: string) {
  const auditDoc = await getDoc(doc(db, "audits", auditId));
  if (!auditDoc.exists()) throw new Error("Audit not found");
  const audit = auditDoc.data();

  const prompt = `A premium, world-class redesign of a website for ${audit.url}. 
  Style: ${audit.redesignVision.direction}. 
  Color Palette: ${audit.redesignVision.colors.join(", ")}. 
  Typography: ${audit.redesignVision.typography}. 
  The interface should be modern, high-conversion, and luxury-tier. 
  Photorealistic 3D render of a web browser showing this new website, sleek minimalist design, dark mode, high contrast, elegant spacing.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      // Note: Image generation via generateContent is specific to certain models or features
      // If the SDK doesn't support it directly, this illustrates the intent.
    }
  });

  let imageUrl = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (imageUrl) {
    await updateDoc(doc(db, "audits", auditId), {
      mockupUrl: imageUrl,
    });
  }

  return imageUrl;
}

export async function getRecentAudits() {
  if (!auth.currentUser) return [];
  const q = query(
    collection(db, "audits"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getLeads() {
  if (!auth.currentUser) return [];
  const q = query(
    collection(db, "leads"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateLeadStatus(leadId: string, status: string) {
  await updateDoc(doc(db, "leads", leadId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getAgencyInsights() {
  if (!auth.currentUser) return null;
  const audits = await getRecentAudits();
  const leads = await getLeads();

  const totalAudits = audits.length;
  const totalLeads = leads.length;
  const avgOverallScore = audits.length > 0 
    ? audits.reduce((acc: number, curr: any) => acc + (curr.scores?.overall || 0), 0) / audits.length 
    : 0;
  
  const leadConversionRate = totalAudits > 0 ? (totalLeads / totalAudits) * 100 : 0;
  
  // Potential revenue: sum of investmentPotential for all audits
  const potentialRevenue = audits.reduce((acc: number, curr: any) => acc + (curr.scores?.investmentPotential || 0) * 100, 0);

  return {
    totalAudits,
    totalLeads,
    avgOverallScore,
    leadConversionRate,
    potentialRevenue,
    recentAudits: audits.slice(0, 5),
    recentLeads: leads.slice(0, 5)
  };
}
