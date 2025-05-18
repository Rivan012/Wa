const path = require("path");
// Import Ai4Chat dengan path absolut supaya tidak error relatif
const Ai4Chat = require(path.resolve(__dirname, "../scrape/Ai4Chat"));

module.exports = async (lenwy, m) => {
  const msg = m.messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const sender = msg.key.remoteJid;
  const isGroup = sender.endsWith("@g.us");
  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    "";
  const text = body.trim().toLowerCase();
  const pushname = msg.pushName || "Lenwy";
  const participant = msg.key.participant || sender;
  const mention = participant.includes("@s.whatsapp.net") ? participant : sender;

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const botNumber = lenwy.user.id.split(":")[0] + "@s.whatsapp.net";
  const isMentioned = mentionedJid.includes(botNumber);

  if (isGroup && !isMentioned) return;

  if (text.startsWith("halo")) {
    await lenwy.sendMessage(sender, {
      text: `Halo juga, @${mention.split("@")[0]}!`,
      contextInfo: { mentionedJid: [mention] },
    });
    return;
  }

  if (text.startsWith("ping")) {
    await lenwy.sendMessage(sender, {
      text: `Pong 🏓`,
    });
    return;
  }

  if (text.startsWith("ai ")) {
    const prompt = body.slice(3).trim();
    if (!prompt) {
      await lenwy.sendMessage(sender, {
        text: `Mau tanya apa sama AI?\nContoh: ai siapa presiden Indonesia?`,
      });
      return;
    }
    try {
      const response = await Ai4Chat(prompt);
      const resultText = typeof response === "string" ? response : response?.result || "Format tidak didukung.";
      if (!resultText) throw new Error("Response AI kosong");

      await lenwy.sendMessage(sender, {
        text: `@${mention.split("@")[0]} ${resultText}`,
        contextInfo: { mentionedJid: [mention] },
      });
      return;
    } catch (error) {
      console.error("AI Error:", error);
      await lenwy.sendMessage(sender, {
        text: `Terjadi kesalahan: ${error.message}`,
      });
      return;
    }
  }

  // fallback: lempar semua pesan ke AI
  try {
    const response = await Ai4Chat(body);
    if (!response) throw new Error("Response AI kosong");

    await lenwy.sendMessage(sender, {
      text: `@${mention.split("@")[0]} ${response}`,
      contextInfo: { mentionedJid: [mention] },
    });
  } catch (error) {
    console.error("AI Error fallback:", error);
    await lenwy.sendMessage(sender, {
      text: `Terjadi kesalahan saat menjawab: ${error.message}`,
    });
  }
};
