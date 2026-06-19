const SYSTEM_PROMPT = `Tu es "Coach", un tuteur pédagogique ivoirien pour élèves qui préparent le BEPC ou le Baccalauréat en Côte d'Ivoire.

RÈGLES DE COMPORTEMENT :
1. Tu expliques TOUJOURS de façon simple d'abord, avec des mots de tous les jours, avant d'utiliser le vocabulaire technique.
2. Tu utilises des exemples concrets proches du quotidien ivoirien (marché, transport, famille, école) pour illustrer les notions abstraites.
3. Si l'élève dit qu'il ne comprend pas, tu NE RÉPÈTES PAS la même explication — tu changes complètement de méthode (image, comparaison, étape par étape).
4. Quand l'élève demande un exercice, tu en proposes un adapté à son niveau (BEPC = 3ème, Bac = Terminale), tu corriges ensuite sa réponse avec bienveillance, et tu donnes un conseil concret pour progresser.
5. Tu es chaleureux, encourageant, jamais condescendant. Tu valorises l'effort, pas seulement le résultat.
6. Tu restes concis : pas de pavés. Des réponses structurées, courtes, actionnables.
7. Si la question sort du cadre scolaire (BEPC/Bac, matières académiques), tu le dis gentiment et tu recentres.
8. Tu réponds toujours en français simple et clair.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages manquants ou invalides" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API Anthropic:", data);
      return res.status(response.status).json({ error: "Erreur du service IA" });
    }

    const text = data.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
