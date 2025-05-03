
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const RIOT_API_KEY = "RGAPI-09beccbb-12db-4b4e-9aa9-e860f4187a35";
  const summonerName = "2024MUSIC";
  const tagLine = "2024";
  const region = "europe";

  try {
    const response = await fetch(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagLine}`, {
      headers: { "X-Riot-Token": RIOT_API_KEY }
    });
    const accountData = await response.json();

    const summonerIdRes = await fetch(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`, {
      headers: { "X-Riot-Token": RIOT_API_KEY }
    });
    const summoner = await summonerIdRes.json();

    const rankedRes = await fetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`, {
      headers: { "X-Riot-Token": RIOT_API_KEY }
    });
    const rankedData = await rankedRes.json();

    const soloQ = rankedData.find(q => q.queueType === "RANKED_SOLO_5x5");
    const currentLP = soloQ ? soloQ.leaguePoints : 0;
    const tier = soloQ ? soloQ.tier : "UNRANKED";
    const rank = soloQ ? soloQ.rank : "";
    const lpToEmerald = 100 * (["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM"].indexOf(tier) + (["IV", "III", "II", "I"].indexOf(rank) + 1)) - currentLP;

    return {
      statusCode: 200,
      body: JSON.stringify({ lp: currentLP, tier, rank, lpToEmerald })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
