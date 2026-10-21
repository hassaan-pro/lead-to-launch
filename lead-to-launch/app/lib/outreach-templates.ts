import type { OutreachChannel, OutreachLanguage, RankedLead } from "./types";

/**
 * Outreach draft templates, one set per supported language. Every set has the
 * same structure (first message and day-3 follow-up for WhatsApp, email and
 * Instagram) and the same placeholders, so a draft in any language carries the
 * same facts: the lead's name, city, rating, review count and biggest gap.
 *
 * Honest limit: the biggest-gap sentence is produced by the audit in English,
 * so it stays English inside every language's draft, exactly as it already did
 * inside the Roman Urdu drafts. Translating live audit text would need an AI
 * step in Phase 5, which these instant templates deliberately avoid.
 */

/** Mailto subject per language. The email drafts carry their own longer Subject line. */
export const EMAIL_SUBJECTS: Record<OutreachLanguage, string> = {
  english: "Built a website demo for your business",
  "roman-urdu": "Aap ke business ke liye ek website demo bana di hai",
  spanish: "Creé una demo web para tu negocio",
  arabic: "أعددت نموذج موقع إلكتروني لعملك",
  french: "J'ai créé une démo de site pour votre entreprise",
  portuguese: "Criei uma demonstração de site para o seu negócio",
  german: "Ich habe eine Website-Demo für Ihren Betrieb erstellt",
};

export function buildOutreach(l: RankedLead, channel: OutreachChannel, lang: OutreachLanguage): { first: string; followUp: string } {
  const ownerName = l.name.includes("Dr.") ? l.name.split(",")[0].replace(/['s].*/, "").trim() : "there";
  const niche = l.category.toLowerCase();
  const reviews = l.reviewsCount ?? 0;
  const rating = l.rating ?? 4.5;
  const demoUrl = `[your-demo-link]`;

  if (lang === "roman-urdu") {
    if (channel === "whatsapp") {
      return {
        first: `Hi ${ownerName} 👋

${l.city} mein ${niche} options dekh raha tha, aur ${l.name} top ratings mein nazar aayi, ${rating}★ aur ${reviews}+ reviews 🔥

Ek cheez notice ki: ${l.audit.biggestGap}

Iska solution bana diya hai, aap ke business ke liye ek FREE website demo taiyar ki hai. WhatsApp booking, Google reviews, services, sab ready hai.

Live demo dekh lein (30 second mein):
${demoUrl}

Pasand aaye to launch kar dete hain. Warna koi masla nahi, demo aap ke paas free hi rahega.

"YES" reply kar dein agar interested hain?`,
        followUp: `Hi ${ownerName}, pichle din jo demo bheja tha, dekha aap ne?

Quick recap: ${l.audit.biggestGap.split(".")[0]}.

Demo mein yeh pehle se fix hai.

Demo abhi bhi live hai:
${demoUrl}

5 minute ki call ho sakti hai walk-through ke liye? Bas bata dein kab free hain.`,
      };
    }
    if (channel === "email") {
      return {
        first: `Subject: Aap ki ${l.name} ke liye ek website demo (free, 30 second mein dekh lein)

Hi ${ownerName},

${l.city} mein ${niche} services research kar raha tha. ${l.name} top results mein nazar aayi, ${rating}★, ${reviews}+ reviews.

Magar ek gap notice ki: ${l.audit.biggestGap}

Aap ke business ke liye ek live website demo bana di hai. Tamam information already fill ki gayi hai, services, location, WhatsApp booking, Google reviews integration.

Demo: ${demoUrl}

30 second lagenge dekhne mein. Pasand aaye to launch kar dete hain, full price [your price] (one-time), koi monthly fee nahi.

"YES" reply karein agar interested hain, ya "NO" agar relevant nahi, dono theek hai.

Best,
[Your Name]`,
        followUp: `Subject: Re: ${l.name} website demo

Hi ${ownerName},

Pichli email pe quick check-in. Demo abhi bhi live hai: ${demoUrl}

Jo gap maine bataya tha (${l.audit.biggestGap.split(".")[0]}), woh demo mein pehle se fix hai.

5-min call ho sakti hai?

Best,
[Your Name]`,
      };
    }
    return {
      first: `Hi! 🙏 ${l.name} ke liye ek website demo bana di hai, ${l.audit.biggestGap} solve karne ke liye. ${demoUrl} pe live preview. Pasand aaye to DM karein!`,
      followUp: `Hey, pichle din jo website demo bheja tha, koi feedback? Demo: ${demoUrl} | 5 min call set kar sakte hain?`,
    };
  }

  if (lang === "spanish") {
    const greet = ownerName === "there" ? "Hola" : `Hola, ${ownerName}`;
    if (channel === "whatsapp") {
      return {
        first: `${greet} 👋

Estuve investigando negocios de ${niche} en ${l.city} y ${l.name} me llamó la atención: ${rating}★ con más de ${reviews} reseñas en Google.

Pero noté un problema: ${l.audit.biggestGap}

Por eso te preparé una demo web gratuita con reservas por WhatsApp, reseñas de Google y tus servicios. Todo ya completado con tu información.

Vista previa de 30 segundos: ${demoUrl}

Si te gusta, la lanzamos. Si no, la demo es tuya, gratis.

¿Respondes "SÍ" si te interesa?`,
        followUp: `${greet}, te escribo por la demo que te envié hace unos días: ${demoUrl}

El problema que te señalé (${l.audit.biggestGap.split(".")[0]}) ya está resuelto en la demo.

¿Te sirve una llamada breve de 5 minutos para recorrerla?`,
      };
    }
    if (channel === "email") {
      return {
        first: `Subject: Creé una demo web para ${l.name}: vista previa de 30 segundos

Hola,

Estuve investigando negocios de ${niche} en ${l.city}. ${l.name} destacó (${rating}★, más de ${reviews} reseñas).

Pero noté algo: ${l.audit.biggestGap}

Por eso creé una demo web gratuita para tu negocio, ya completada con tus servicios, ubicación, reservas por WhatsApp y reseñas de Google.

Demo: ${demoUrl}

Si te gusta, el lanzamiento es [your price], pago único, sin mensualidades. Si no, la demo es tuya.

Responde "SÍ" o "NO", ambas opciones están bien.

Saludos,
[Your Name]`,
        followUp: `Subject: Re: demo web de ${l.name}

Hola,

Un mensaje rápido de seguimiento. La demo sigue en vivo: ${demoUrl}

El problema que te señalé ya está resuelto en la demo.

¿Podemos hacer una llamada de 5 minutos?

Saludos,
[Your Name]`,
      };
    }
    return {
      first: `¡Hola! 👋 Creé una demo web para ${l.name} que resuelve esto: ${l.audit.biggestGap} Vista previa en vivo: ${demoUrl} Si te gusta, escríbeme por aquí.`,
      followUp: `Hola, ¿viste la demo web que te envié el otro día? Sigue aquí: ${demoUrl} ¿Agendamos una llamada de 5 minutos?`,
    };
  }

  if (lang === "arabic") {
    const greet = ownerName === "there" ? "مرحباً" : `مرحباً ${ownerName}`;
    if (channel === "whatsapp") {
      return {
        first: `${greet} 👋

كنت أبحث عن أعمال ${niche} في ${l.city} ولفت انتباهي ${l.name}: تقييم ${rating}★ وأكثر من ${reviews} مراجعة على Google.

لكن لاحظت مشكلة: ${l.audit.biggestGap}

لذلك أعددت لك نموذج موقع إلكتروني مجانياً مع الحجز عبر واتساب ومراجعات Google وخدماتك، وكل المعلومات مُدخلة مسبقاً.

معاينة في 30 ثانية: ${demoUrl}

إذا أعجبك، نطلقه فوراً. وإذا لم يعجبك، النموذج لك مجاناً.

هل ترد بـ "نعم" إذا كنت مهتماً؟`,
        followUp: `${greet}، أتابع معك بخصوص النموذج الذي أرسلته قبل أيام: ${demoUrl}

المشكلة التي أشرت إليها (${l.audit.biggestGap.split(".")[0]}) تم حلها بالفعل في النموذج.

هل يناسبك اتصال قصير لمدة 5 دقائق لاستعراضه؟`,
      };
    }
    if (channel === "email") {
      return {
        first: `Subject: أعددت نموذج موقع إلكتروني لـ ${l.name}: معاينة في 30 ثانية

مرحباً،

كنت أبحث عن أعمال ${niche} في ${l.city}. وقد برز ${l.name} بتقييم ${rating}★ وأكثر من ${reviews} مراجعة.

لكن لاحظت أمراً: ${l.audit.biggestGap}

لذلك أنشأت نموذج موقع إلكتروني مجانياً لعملك، مُكملاً بخدماتك وموقعك والحجز عبر واتساب ومراجعات Google.

النموذج: ${demoUrl}

إذا أعجبك، الإطلاق بسعر [your price] دفعة واحدة، دون أي رسوم شهرية. وإذا لم يعجبك، النموذج لك.

رد بـ "نعم" أو "لا"، كلاهما مناسب.

مع التحية،
[Your Name]`,
        followUp: `Subject: Re: نموذج موقع ${l.name}

مرحباً،

متابعة سريعة. النموذج ما زال متاحاً: ${demoUrl}

المشكلة التي ذكرتها تم حلها بالفعل في النموذج.

هل يمكننا إجراء مكالمة لمدة 5 دقائق؟

مع التحية،
[Your Name]`,
      };
    }
    return {
      first: `مرحباً! 👋 أعددت نموذج موقع لـ ${l.name} يعالج هذه المشكلة: ${l.audit.biggestGap} المعاينة المباشرة: ${demoUrl} إذا أعجبك، راسلني هنا!`,
      followUp: `مرحباً، هل اطلعت على نموذج الموقع الذي أرسلته قبل أيام؟ ما زال هنا: ${demoUrl} هل نحدد مكالمة لمدة 5 دقائق؟`,
    };
  }

  if (lang === "french") {
    const greet = ownerName === "there" ? "Bonjour" : `Bonjour ${ownerName}`;
    if (channel === "whatsapp") {
      return {
        first: `${greet} 👋

Je faisais des recherches sur les entreprises de ${niche} à ${l.city} et ${l.name} s'est démarqué : ${rating}★ avec plus de ${reviews} avis Google.

Mais j'ai remarqué un problème : ${l.audit.biggestGap}

Je vous ai donc préparé une démo de site gratuite avec réservation WhatsApp, avis Google et vos services. Tout est déjà rempli avec vos informations.

Aperçu en 30 secondes : ${demoUrl}

Si elle vous plaît, on la met en ligne. Sinon, la démo est à vous, gratuitement.

Répondez « OUI » si cela vous intéresse ?`,
        followUp: `${greet}, je reviens vers vous au sujet de la démo envoyée il y a quelques jours : ${demoUrl}

Le problème signalé (${l.audit.biggestGap.split(".")[0]}) est déjà corrigé dans la démo.

Un petit appel de 5 minutes pour la parcourir ensemble, cela vous dit ?`,
      };
    }
    if (channel === "email") {
      return {
        first: `Subject: J'ai créé une démo de site pour ${l.name} : aperçu en 30 secondes

Bonjour,

Je recherchais des entreprises de ${niche} à ${l.city}. ${l.name} s'est démarqué (${rating}★, plus de ${reviews} avis).

Mais j'ai remarqué ceci : ${l.audit.biggestGap}

J'ai donc créé une démo de site gratuite pour votre entreprise, déjà remplie avec vos services, votre adresse, la réservation WhatsApp et les avis Google.

Démo : ${demoUrl}

Si elle vous plaît, la mise en ligne est à [your price], en paiement unique, sans frais mensuels. Sinon, la démo est à vous.

Répondez « OUI » ou « NON », les deux me conviennent.

Cordialement,
[Your Name]`,
        followUp: `Subject: Re: démo de site de ${l.name}

Bonjour,

Petit message de suivi. La démo est toujours en ligne : ${demoUrl}

Le problème signalé est déjà corrigé dans la démo.

Un appel de 5 minutes, cela vous convient ?

Cordialement,
[Your Name]`,
      };
    }
    return {
      first: `Bonjour ! 👋 J'ai créé une démo de site pour ${l.name} qui corrige ceci : ${l.audit.biggestGap} Aperçu en direct : ${demoUrl} Si elle vous plaît, écrivez-moi ici !`,
      followUp: `Bonjour, avez-vous vu la démo de site envoyée l'autre jour ? Elle est toujours là : ${demoUrl} On se cale un appel de 5 minutes ?`,
    };
  }

  if (lang === "portuguese") {
    const greet = ownerName === "there" ? "Olá" : `Olá, ${ownerName}`;
    if (channel === "whatsapp") {
      return {
        first: `${greet} 👋

Estava pesquisando empresas de ${niche} em ${l.city} e ${l.name} se destacou: ${rating}★ com mais de ${reviews} avaliações no Google.

Mas notei um problema: ${l.audit.biggestGap}

Por isso preparei uma demonstração de site gratuita com agendamento pelo WhatsApp, avaliações do Google e seus serviços. Tudo já preenchido com suas informações.

Prévia de 30 segundos: ${demoUrl}

Se gostar, colocamos no ar. Se não gostar, a demonstração é sua, grátis.

Responda "SIM" se tiver interesse?`,
        followUp: `${greet}, passando para saber da demonstração que enviei há alguns dias: ${demoUrl}

O problema que apontei (${l.audit.biggestGap.split(".")[0]}) já está resolvido na demonstração.

Topa uma ligação rápida de 5 minutos para eu te mostrar?`,
      };
    }
    if (channel === "email") {
      return {
        first: `Subject: Criei uma demonstração de site para ${l.name}: prévia de 30 segundos

Olá,

Estava pesquisando empresas de ${niche} em ${l.city}. ${l.name} se destacou (${rating}★, mais de ${reviews} avaliações).

Mas notei o seguinte: ${l.audit.biggestGap}

Então criei uma demonstração de site gratuita para o seu negócio, já preenchida com seus serviços, endereço, agendamento pelo WhatsApp e avaliações do Google.

Demonstração: ${demoUrl}

Se gostar, o lançamento é [your price], pagamento único, sem mensalidade. Se não gostar, a demonstração é sua.

Responda "SIM" ou "NÃO", os dois estão ótimos.

Atenciosamente,
[Your Name]`,
        followUp: `Subject: Re: demonstração de site de ${l.name}

Olá,

Só uma confirmação rápida. A demonstração continua no ar: ${demoUrl}

O problema que apontei já está resolvido nela.

Podemos fazer uma ligação de 5 minutos?

Atenciosamente,
[Your Name]`,
      };
    }
    return {
      first: `Olá! 👋 Criei uma demonstração de site para ${l.name} que resolve isto: ${l.audit.biggestGap} Prévia ao vivo: ${demoUrl} Se gostar, me chama aqui!`,
      followUp: `Oi, você viu a demonstração de site que enviei outro dia? Ainda está aqui: ${demoUrl} Marcamos uma ligação de 5 minutos?`,
    };
  }

  if (lang === "german") {
    const greet = ownerName === "there" ? "Hallo" : `Hallo ${ownerName}`;
    if (channel === "whatsapp") {
      return {
        first: `${greet} 👋

Ich habe nach ${niche}-Betrieben in ${l.city} recherchiert und ${l.name} ist mir aufgefallen: ${rating}★ mit über ${reviews} Google-Bewertungen.

Dabei ist mir eine Lücke aufgefallen: ${l.audit.biggestGap}

Deshalb habe ich Ihnen eine kostenlose Website-Demo erstellt, mit WhatsApp-Buchung, Google-Bewertungen und Ihren Leistungen. Alles bereits mit Ihren Daten ausgefüllt.

30-Sekunden-Vorschau: ${demoUrl}

Wenn sie Ihnen gefällt, bringen wir sie online. Wenn nicht, gehört die Demo Ihnen, kostenlos.

Antworten Sie mit "JA", wenn Sie interessiert sind?`,
        followUp: `${greet}, ich melde mich kurz zur Demo von vor ein paar Tagen: ${demoUrl}

Die Lücke, die ich angesprochen hatte (${l.audit.biggestGap.split(".")[0]}), ist in der Demo bereits behoben.

Passt Ihnen ein kurzes 5-Minuten-Telefonat, um sie durchzugehen?`,
      };
    }
    if (channel === "email") {
      return {
        first: `Subject: Ich habe eine Website-Demo für ${l.name} erstellt: 30 Sekunden Vorschau

Guten Tag,

ich habe nach ${niche}-Betrieben in ${l.city} recherchiert. ${l.name} ist dabei aufgefallen (${rating}★, über ${reviews} Bewertungen).

Aber mir ist etwas aufgefallen: ${l.audit.biggestGap}

Deshalb habe ich eine kostenlose Website-Demo für Ihren Betrieb erstellt, bereits ausgefüllt mit Ihren Leistungen, Ihrem Standort, WhatsApp-Buchung und Google-Bewertungen.

Demo: ${demoUrl}

Wenn sie Ihnen gefällt, kostet der Start [your price], einmalig, ohne monatliche Gebühren. Wenn nicht, gehört die Demo Ihnen.

Antworten Sie einfach mit "JA" oder "NEIN", beides ist in Ordnung.

Mit freundlichen Grüßen
[Your Name]`,
        followUp: `Subject: Re: Website-Demo für ${l.name}

Guten Tag,

nur eine kurze Nachfrage. Die Demo ist weiterhin online: ${demoUrl}

Die angesprochene Lücke ist darin bereits behoben.

Hätten Sie 5 Minuten für ein kurzes Telefonat?

Mit freundlichen Grüßen
[Your Name]`,
      };
    }
    return {
      first: `Hallo! 👋 Ich habe eine Website-Demo für ${l.name} erstellt, die genau diese Lücke schließt: ${l.audit.biggestGap} Live-Vorschau: ${demoUrl} Wenn sie Ihnen gefällt, schreiben Sie mir hier!`,
      followUp: `Hallo, haben Sie die Website-Demo gesehen, die ich neulich geschickt habe? Sie ist noch hier: ${demoUrl} Sollen wir 5 Minuten telefonieren?`,
    };
  }

  // English
  if (channel === "whatsapp") {
    return {
      first: `Hi ${ownerName} 👋

Was researching ${niche} businesses in ${l.city} and ${l.name} stood out, ${rating}★ with ${reviews}+ Google reviews.

Spotted one gap though: ${l.audit.biggestGap}

So I built you a free website demo with WhatsApp booking, Google reviews integration, and services. All pre-filled with your info.

30-second preview: ${demoUrl}

If you like it, we launch it. If not, the demo is yours to keep, free.

Reply "YES" if interested?`,
      followUp: `Hi ${ownerName}, following up on the demo from a couple of days ago: ${demoUrl}

The gap I flagged (${l.audit.biggestGap.split(".")[0]}) is already fixed in the demo.

Worth a quick 5-min call to walk through?`,
    };
  }
  if (channel === "email") {
    return {
      first: `Subject: Built ${l.name} a website demo, 30 sec preview

Hi ${ownerName},

I was researching ${niche} businesses in ${l.city}. ${l.name} stood out (${rating}★, ${reviews}+ reviews).

But I noticed: ${l.audit.biggestGap}

So I built a free demo website for your business, pre-filled with services, location, WhatsApp booking, and Google reviews.

Demo: ${demoUrl}

If you like it, launch is [your price] one-time, zero monthly. If not, demo is yours.

Reply "YES" or "NO", both work.

Best,
[Your Name]`,
      followUp: `Subject: Re: ${l.name} website demo

Hi ${ownerName},

Quick check-in. Demo still live: ${demoUrl}

The gap I flagged is already fixed in the demo.

5-min call?

Best,
[Your Name]`,
    };
  }
  return {
    first: `Hey! Built a website demo for ${l.name} to fix one gap (${l.audit.biggestGap.split(".")[0]}). Preview: ${demoUrl}. DM if interested!`,
    followUp: `Hi! Following up on the demo: ${demoUrl}. 5-min call?`,
  };
}
