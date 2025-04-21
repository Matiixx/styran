interface DiscordAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordThumbnail {
  url: string;
}

interface DiscordImage {
  url: string;
}

interface DiscordFooter {
  text: string;
  icon_url?: string;
}

interface DiscordEmbed {
  author?: DiscordAuthor;
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: DiscordField[];
  thumbnail?: DiscordThumbnail;
  image?: DiscordImage;
  footer?: DiscordFooter;
  timestamp?: string; // ISO8601 timestamp (yyyy-mm-ddThh:mm:ss.msZ)
}

interface DiscordAllowedMentions {
  parse?: Array<"roles" | "users" | "everyone">;
  roles?: string[];
  users?: string[];
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
  tts?: boolean;
  allowed_mentions?: DiscordAllowedMentions;
}

export type {
  DiscordEmbed,
  DiscordAuthor,
  DiscordField,
  DiscordThumbnail,
  DiscordImage,
  DiscordFooter,
  DiscordAllowedMentions,
  DiscordWebhookPayload,
};
