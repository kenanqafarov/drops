import { EmbedBuilder } from 'discord.js';
import { ProductData, SupplierPrice, AdCreative, NewsItem, AIAnalysisResult } from '../services/sources/types';

export class DiscordEmbedBuilder {
  /**
   * Embed for Winning Product Scanner Alerts
   */
  static buildWinnerAlertEmbed(product: ProductData, score: number): EmbedBuilder {
    const likes = product.socialEngagement.likes
      ? `${(product.socialEngagement.likes / 1000).toFixed(0)}K`
      : 'N/A';

    return new EmbedBuilder()
      .setColor(score >= 85 ? 0xff4500 : 0x00ff7f)
      .setTitle(`🚀 New Potential Winner: ${product.title}`)
      .setURL(product.url)
      .setDescription(
        `📦 **Product:** ${product.title}\n` +
          `💰 **Price:** $${product.price.toFixed(2)}\n` +
          `📈 **Orders:** +${product.ordersGrowthDay} today\n` +
          `❤️ **TikTok Likes:** ${likes}\n` +
          `🔥 **Score:** ${score}/100`,
      )
      .addFields(
        { name: 'Source', value: product.source, inline: true },
        { name: 'Sellers Count', value: `${product.sellerCount}`, inline: true },
        { name: 'Category', value: product.category, inline: true },
      )
      .setThumbnail(product.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500')
      .setFooter({ text: 'Dropshipping Scanner • Powered by AI & Multi-Source Intelligence' })
      .setTimestamp();
  }

  /**
   * Embed for /find command results
   */
  static buildFindResultsEmbed(query: string, products: { product: ProductData; score: number }[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🔎 Dropshipping Product Search: "${query}"`)
      .setDescription(`Found **${products.length}** relevant product candidates across active data feeds.`)
      .setFooter({ text: 'Dropshipping Research Bot' })
      .setTimestamp();

    products.forEach(({ product, score }, idx) => {
      embed.addFields({
        name: `#${idx + 1} ${product.title} (Score: ${score}/100)`,
        value:
          `💰 **Price:** $${product.price.toFixed(2)} | 📈 **Orders:** +${product.ordersGrowthDay}/day\n` +
          `❤️ **Likes:** ${product.socialEngagement.likes.toLocaleString()} | 🏬 **Sellers:** ${product.sellerCount}\n` +
          `🔗 [View Product](${product.url}) (${product.source})`,
        inline: false,
      });
    });

    return embed;
  }

  /**
   * Embed for /analyze command (Claude AI Analysis)
   */
  static buildAnalyzeEmbed(url: string, analysis: AIAnalysisResult, title = 'Product Link Analysis'): EmbedBuilder {
    const saturationEmoji = analysis.saturation <= 4 ? '🟢 Low' : analysis.saturation <= 7 ? '🟡 Medium' : '🔴 High';

    return new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🤖 AI Product Saturation & Viability Report`)
      .setURL(url)
      .setDescription(`**Product:** [${title}](${url})\n\n**AI Reasoning:**\n_${analysis.reasoning}_`)
      .addFields(
        { name: '📊 Saturation Level', value: `${saturationEmoji} (${analysis.saturation}/10)`, inline: true },
        { name: '💵 Estimated Margin', value: analysis.profitMargin, inline: true },
        { name: '⚡ Impulse Buy', value: analysis.impulseBuy, inline: true },
        { name: '📱 TikTok Potential', value: analysis.tiktokPotential, inline: true },
        { name: '🌍 Recommended Market', value: analysis.recommendedCountry, inline: true },
      )
      .setFooter({ text: 'Analyzed with Anthropic Claude API' })
      .setTimestamp();
  }

  /**
   * Embed for /supplier command
   */
  static buildSupplierComparisonEmbed(productName: string, suppliers: SupplierPrice[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setTitle(`🏭 Supplier Price & Logistics Comparison: "${productName}"`)
      .setDescription('Comparison matrix across AliExpress, CJ Dropshipping, 1688, Alibaba & Zendrop:')
      .setFooter({ text: 'Supplier Sourcing Adapter' })
      .setTimestamp();

    suppliers.forEach((s) => {
      embed.addFields({
        name: `🏷️ ${s.supplier} — $${s.price.toFixed(2)} (MOQ: ${s.minOrderQty})`,
        value:
          `🚚 **Shipping:** $${s.shippingCost.toFixed(2)} (${s.shippingTime})\n` +
          `📦 **Item:** ${s.productTitle}\n` +
          `🔗 [Open Supplier Page](${s.productUrl})`,
        inline: false,
      });
    });

    return embed;
  }

  /**
   * Embed for /ads command
   */
  static buildAdsEmbed(query: string, creatives: AdCreative[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xe91e63)
      .setTitle(`🎯 Active Ad Creatives for "${query}"`)
      .setDescription(`Discovered **${creatives.length}** scaling ad campaigns on Meta & TikTok Ad Libraries.`)
      .setFooter({ text: 'Meta & TikTok Ads Library Service' })
      .setTimestamp();

    creatives.forEach((c) => {
      embed.addFields({
        name: `${c.platform === 'Meta' ? '📘 Meta' : '🎵 TikTok'} Ad — ${c.storeName}`,
        value:
          `📝 **Headline:** ${c.title}\n` +
          `⏱️ **Active Duration:** Running for **${c.activeDays} days**\n` +
          `🔗 [View Ad Creative](${c.creativeUrl})`,
        inline: false,
      });
    });

    return embed;
  }

  /**
   * Embed for /trends command
   */
  static buildTrendsEmbed(country: string, products: ProductData[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🔥 Trending Products in ${country.toUpperCase()}`)
      .setDescription(`Top viral products surging on TikTok & Shopify in ${country.toUpperCase()}`)
      .setFooter({ text: 'TikTok & Shopify Trends Engine' })
      .setTimestamp();

    products.forEach((p, idx) => {
      embed.addFields({
        name: `#${idx + 1} ${p.title} (${p.category})`,
        value: `💰 **Price:** $${p.price.toFixed(2)} | ❤️ **Likes:** ${(p.socialEngagement.likes / 1000).toFixed(0)}K | 🔗 [Link](${p.url})`,
        inline: false,
      });
    });

    return embed;
  }

  /**
   * Embed for /news command
   */
  static buildNewsEmbed(newsItems: NewsItem[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle(`📰 Latest E-Commerce & Dropshipping News`)
      .setDescription('Fresh market updates from Shopify, Modern Retail, and industry feeds:')
      .setFooter({ text: 'E-Commerce RSS Aggregator' })
      .setTimestamp();

    newsItems.forEach((n) => {
      embed.addFields({
        name: `📌 ${n.title} (${n.source})`,
        value: `${n.snippet}\n🔗 [Read Full Article](${n.link}) • _${n.pubDate}_`,
        inline: false,
      });
    });

    return embed;
  }

  /**
   * Embed for Daily Digest Report
   */
  static buildDailyDigestEmbed(data: {
    winnersCount: number;
    topTrends: ProductData[];
    news: NewsItem[];
  }): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`📅 Daily Dropshipping Report`)
      .setDescription(
        `🔥 **${data.winnersCount} New Winning Products Detected**\n` +
          `📈 **Top 5 TikTok Trends**\n` +
          `💵 **Best Profit Margins**\n` +
          `🚀 **Fastest Growing Stores Monitored**\n` +
          `📰 **E-commerce News Included**`,
      )
      .setFooter({ text: 'Daily Automated Dropshipping Summary' })
      .setTimestamp();

    if (data.topTrends.length > 0) {
      const trendsList = data.topTrends
        .slice(0, 3)
        .map((t) => `• [${t.title}](${t.url}) - Score: ${t.trendMomentumScore}/100`)
        .join('\n');
      embed.addFields({ name: '🔥 Top Trending Items Today', value: trendsList });
    }

    if (data.news.length > 0) {
      const newsList = data.news
        .slice(0, 3)
        .map((n) => `• [${n.title}](${n.link}) (${n.source})`)
        .join('\n');
      embed.addFields({ name: '📰 Key E-commerce Headlines', value: newsList });
    }

    return embed;
  }

  /**
   * Embed for /spy command store tracking confirmation or update
   */
  static buildSpyEmbed(url: string, isNew: boolean, productCount = 0): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`👁️ Competitor Store Watcher`)
      .setDescription(
        isNew
          ? `Successfully added **${url}** to your competitor watchlist!\n\nThe bot will monitor this store every 15-30 minutes for new products, price changes, and restocks.`
          : `Competitor Store Status for **${url}**:\nCurrently tracking **${productCount}** products.`,
      )
      .setFooter({ text: 'Competitor Store Watcher' })
      .setTimestamp();
  }
}
