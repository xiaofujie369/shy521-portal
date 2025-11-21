// functions/api/nav.js
// Cloudflare Pages Functions
// 需要在项目绑定：KV 名称 NAV_KV，环境变量 ADMIN_KEY

const defaultConfig = [
  {
    title: "常用入口",
    subtitle: "每天都会用到的小工具与工作台。",
    links: [
      {
        title: "可云加速面板",
        url: "https://ss.shy521.com",
        icon: "☁︎",
        desc: "一站式网络加速与订阅管理中心。",
        tags: "dashboard, ss, keyun",
        badge: "工作台"
      },
      {
        title: "可云中转控制台",
        url: "https://na.shy521.com",
        icon: "⛓",
        desc: "VPS 中转与隧道策略管理。",
        tags: "tunnel, relay, vps"
      },
      {
        title: "GitHub",
        url: "https://github.com",
        icon: "🐙",
        desc: "代码与项目的家。",
        tags: "code, dev"
      },
      {
        title: "Cloudflare Dashboard",
        url: "https://dash.cloudflare.com",
        icon: "⚡︎",
        desc: "域名、Workers 与 Pages 统一控制中心。",
        tags: "dns, cdn, workers"
      }
    ]
  },
  {
    title: "创作空间",
    subtitle: "音乐 · 设计 · 文案相关的常用链接。",
    links: [
      {
        title: "Apple Music",
        url: "https://music.apple.com",
        icon: "♪",
        desc: "聆听与参考，找到新的灵感。",
        tags: "music, inspiration",
        badge: "灵感"
      },
      {
        title: "Notion",
        url: "https://www.notion.so",
        icon: "N",
        desc: "写作、规划、项目管理的统一工作台。",
        tags: "note, doc"
      }
    ]
  }
];

export async function onRequestGet({ env }) {
  const kv = env.NAV_KV;
  if (!kv) {
    return new Response(
      JSON.stringify(defaultConfig, null, 2),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  let stored = await kv.get("nav-config");
  if (!stored) {
    stored = JSON.stringify(defaultConfig, null, 2);
    await kv.put("nav-config", stored);
  }

  return new Response(stored, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestPost({ request, env }) {
  const kv = env.NAV_KV;
  const adminKey = env.ADMIN_KEY;

  if (!kv || !adminKey) {
    return new Response(
      JSON.stringify({ error: "KV 或 ADMIN_KEY 未配置。" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }

  const headerKey = request.headers.get("X-Admin-Key");
  if (headerKey !== adminKey) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }

  const text = await request.text();
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return new Response(
        JSON.stringify({ error: "根节点必须为数组。" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        }
      );
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "JSON 格式错误：" + e.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }

  await kv.put("nav-config", text);

  return new Response(
    JSON.stringify({ ok: true }),
    {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }
  );
}
