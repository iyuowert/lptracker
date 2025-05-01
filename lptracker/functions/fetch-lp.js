import axios from "axios";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = "euw1"; // EUW

export async function handler(event, context) {
  try {
    const name = "2024MUSIC";
    const tag = "2024";

    const puuidRes = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const puuid = puuidRes.data.puuid;

    const summonerRes = await axios.get(
      `https://${REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const summonerId = summonerRes.data.id;

    const rankedRes = await axios.get(
      `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const soloQ = rankedRes.data.find(entry => entry.queueType === "RANKED_SOLO_5x5");

    const lp = soloQ ? soloQ.leaguePoints : 0;
    const tier = soloQ ? soloQ.tier : "UNRANKED";
    const rank = soloQ ? soloQ.rank : "";
    const emeraldLP = 3200;
    const lpTotal = calculateLP(tier, rank, lp);
    const lpToEmerald = Math.max(0, emeraldLP - lpTotal);

    return {
      statusCode: 200,
      body: JSON.stringify({
        lp,
        tier,
        rank,
        lpTotal,
        lpToEmerald
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

function calculateLP(tier, division, lp) {
  const tiers = {
    IRON: 0,
    BRONZE: 400,
    SILVER: 800,
    GOLD: 1200,
    PLATINUM: 1600,
    EMERALD: 2000,
    DIAMOND: 2400
  };
  const divisions = { IV: 0, III: 100, II: 200, I: 300 };
  const base = tiers[tier?.toUpperCase()] || 0;
  const div = divisions[division] || 0;
  return base + div + lp;
}