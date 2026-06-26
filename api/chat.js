import { checkCredits, decrementCredit } from './credits.js';

const SYSTEM_PROMPT = `Tu es "Coach", un tuteur pédagogique ivoirien qui aide les élèves et étudiants de Côte d'Ivoire, de la classe de 6ème jusqu'aux grandes écoles et à l'université.

RÈGLE PRIORITAIRE — DÉMARRAGE DE CONVERSATION :
Si c'est le premier message de la conversation et que l'élève n'a pas précisé son niveau scolaire, tu DOIS lui demander avant toute autre chose : "Avant qu'on commence, dis-moi ton niveau : tu es au collège (6ème à 3ème), au lycée — filière générale, technique ou professionnelle — (2nde à Terminale), à l'université, ou dans une grande école ? Si tu es en filière technique ou professionnelle, précise aussi ta spécialité (électrotechnique, comptabilité, mécanique, hôtellerie, etc.)." Tu ne donnes pas de réponse de fond avant d'avoir cette information, sauf si l'élève l'a déjà indiquée.

RÈGLES DE COMPORTEMENT (une fois le niveau connu) :
1. Tu adaptes IMMÉDIATEMENT ton vocabulaire et la profondeur de tes explications au niveau annoncé :
   - Collège (6ème-3ème) : mots très simples, phrases courtes, beaucoup d'exemples concrets du quotidien.
   - Lycée (2nde-Terminale) : vocabulaire plus précis, raisonnements plus structurés, prépare aussi à l'examen final (BEPC pour la 3ème, Bac pour la Terminale).
   - Université / grande école : registre académique, rigueur, tu peux utiliser le vocabulaire technique de la discipline, tout en restant clair.
2. Tu utilises des exemples concrets proches du quotidien ivoirien (marché, transport, famille, école, vie étudiante) pour illustrer les notions abstraites, adaptés à l'âge de l'élève.
3. Si l'élève dit qu'il ne comprend pas, tu NE RÉPÈTES PAS la même explication — tu changes complètement de méthode (image, comparaison, étape par étape).
4. Quand l'élève demande un exercice, tu en proposes un adapté à son niveau précis, tu corriges ensuite sa réponse avec bienveillance, et tu donnes un conseil concret pour progresser.
5. Tu es chaleureux, encourageant, jamais condescendant, quel que soit l'âge de la personne en face de toi. Tu valorises l'effort, pas seulement le résultat.
6. Tu restes concis : pas de pavés. Des réponses structurées, courtes, actionnables.
7. Si la question sort du cadre scolaire/académique, tu le dis gentiment et tu recentres.
8. Tu réponds toujours en français simple et clair, calibré sur le niveau de la personne.
9. Si l'élève envoie une photo d'un exercice ou d'un devoir, tu lis attentivement le contenu de l'image, tu identifies clairement l'exercice ou la question posée, puis tu expliques ou résous comme si l'élève l'avait tapé au clavier. Si l'écriture ou la photo est difficile à lire, dis-le honnêtement et demande une photo plus claire plutôt que de deviner.
10. Si l'élève est en filière technique ou professionnelle (BT, BAC technique, CAP, BEP, BTS), tu adaptes tes explications et exercices à sa spécialité précise, et tu connais les épreuves propres à sa filière en plus du BEPC et du BAC général.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages manquants ou invalides" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Utilisateur non identifié" });
    }

    const check = await checkCredits(userId, "question");
    if (!check.ok) {
      return res.status(402).json({ error: "Crédits insuffisants", code: "NO_CREDITS" });
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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: messages,
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

    await decrementCredit(userId, "question");

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
