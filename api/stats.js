import dayjs from "dayjs";

export default async function handler(request, response) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get("username");
    const game_type = url.searchParams.get("game_type") || "rapid";
    if (!username) {
      throw new Error("Username not found or invalid");
    }

    const userAgent = { "user-agent": "MyStatsProjectForGitHub: Bappoz" };
    const statsUrl = `https://api.chess.com/pub/player/${username}/stats`;

    // Get dates for current and past two months
    const today = dayjs();
    const gamesUrls = [
      today,
      today.subtract(1, "month"),
      today.subtract(2, "month"),
    ].map((date) => {
      const year = date.format("YYYY");
      const month = date.format("MM");
      return `https://api.chess.com/pub/player/${username}/games/${year}/${month}`;
    });

    // Fetch stats and games concurrently with AbortController for timeout (5s per request)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per fetch

    const statsPromise = fetch(statsUrl, {
      headers: userAgent, 
      signal: controller.signal,
    });
    const gamePromises = gamesUrls.map((url) =>
      fetch(url, { ...userAgent, signal: controller.signal })
    );

    const [statsResponse, ...gameResponses] = await Promise.all([
      statsPromise,
      ...gamePromises,
    ]);

    clearTimeout(timeoutId);

    if (!statsResponse.ok) {
      throw new Error(
        `Error fetching player stats (HTTP ${statsResponse.status})`
      );
    }

    const statsData = await statsResponse.json();

    let allGames = [];
    for (const res of gameResponses) {
      if (res.ok) {
        const data = await res.json();
        allGames = allGames.concat(data.games || []); // Assuming 'games' is the array key; adjust if needed
      } else {
        console.warn(`Failed to fetch games: HTTP ${res.status}`);
      }
    }

    // Filter by game_type and sort chronologically
    const filteredGames = allGames.filter((game) => game.time_class === game_type);
    filteredGames.sort((a, b) => a.end_time - b.end_time);

    const reponseBody = {
      message: "Dados coletados com sucesso!",
      username: username,
      stats: statsData,
      totalGamesFetched: allGames.length,
      filteredGamesCount: filteredGames.length,
      games: filteredGames, 
    };

    return new Response(JSON.stringify(reponseBody), {
        status: 200,
        headers: { "Content-Type": "application/json",},    
    });

  } catch (error) {
    console.error(error);
    const errorBody = {
      error: "Ocorreu um erro no servidor",
      errorMessage: error.message,
    };

    return new Response(JSON.stringify(errorBody), {
      status: 500, // O código de erro
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
