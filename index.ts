// STOP IT
import "dotenv/config";

import { fastify } from "fastify";
import { google } from "googleapis";

import { authorize } from "./auth.js";
import { Feed } from "feed";

const app = fastify();

const { PORT = "6969" } = process.env;

app.get("/email-to-rss", async (_, res) => {
  const feed = new Feed({
    title: "Dota Is Lazy",
    description: "This is dota's personal feed!",
    id: "http://nickhudkins.com/dota-is-lazy",
    copyright: "© 2024, The Trash Company",
  });

  const auth = await authorize();

  const gmail = google.gmail({ version: "v1", auth });

  const {
    data: { messages },
  } = await gmail.users.messages.list({
    userId: "nick@nickhudkins.com",
    q: "category:primary",
    maxResults: 10,
  });

  const promises = messages?.map(async (msg) => {
    const {
      data: { payload },
    } = await gmail.users.messages.get({
      id: msg.id!,
      userId: "me",
    });

    const goodHeaders = (payload?.headers || []).reduce((acc, curr) => {
      return {
        ...acc,
        [curr.name!]: curr.value,
      };
    }, {} as Record<string, any>);

    const subject = goodHeaders["Subject"];
    const from = goodHeaders["From"];
    const date = goodHeaders["Date"];
    const replyTo = goodHeaders["Reply-To"] || goodHeaders["From"];

    feed.addItem({
      title: subject,
      author: from,
      id: msg.id!,
      link: `mailto:${replyTo}`,
      date: new Date(date),
    });
  });
  await Promise.all(promises || []);
  res.send(feed.rss2());
});

app.listen({ port: parseInt(PORT, 10) }).then(() => {
  console.log(`🚀 Listening on PORT: ${PORT}`);
});
