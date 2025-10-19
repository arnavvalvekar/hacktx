// Generates last-60-days transactions with weekend patterns and occasional spikes.
export function generateSeedTransactions(days = 60) {
  const merchants = {
    Restaurant:   [{ name: "Green Fork Bistro", mcc: "5812" }, { name: "Urban Noodle House", mcc: "5812" }],
    Grocery:      [{ name: "FreshField Market", mcc: "5411" }, { name: "Daily Greens Co-Op", mcc: "5411" }],
    Fashion:      [{ name: "EcoThreads Apparel", mcc: "5651" }, { name: "StreetWear Hub", mcc: "5651" }],
    Electronics:  [{ name: "Byte & Bolt", mcc: "5732" }, { name: "Circuit Cloud", mcc: "5732" }],
    Transport:    [{ name: "MetroRide", mcc: "4111" }, { name: "FuelMart", mcc: "4111" }],
    Travel:       [{ name: "SkyReach Airlines", mcc: "4511" }, { name: "Nest Hotels", mcc: "4511" }],
    Entertainment:[{ name: "CineVerse", mcc: "7999" }, { name: "LiveBeat Arena", mcc: "7999" }],
    Utilities:    [{ name: "City Energy", mcc: "4900" }],
    General:      [{ name: "Everyday Mart", mcc: "0000" }],
  };
  const bands = {
    Grocery: [25, 120], Restaurant: [12, 60], Entertainment: [10, 80], Transport: [8, 75],
    Fashion: [30, 200], Electronics: [40, 600], Travel: [120, 800], Utilities: [50, 200], General: [10, 90],
  };

  function randBetween(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const result = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayIso = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 6 || d.getDay() === 0;

    // 1–4 tx/day
    const count = 1 + Math.floor(Math.random() * 4);
    for (let j = 0; j < count; j++) {
      const catWeights = {
        Grocery: isWeekend ? 0.9 : 1.3,
        Restaurant: isWeekend ? 1.6 : 1.0,
        Entertainment: isWeekend ? 1.4 : 0.7,
        Transport: 1.0,
        Fashion: 0.6,
        Electronics: 0.5,
        Travel: Math.random() < 0.07 ? 2.0 : 0.1,
        Utilities: Math.random() < 0.05 ? 2.0 : 0.1,
        General: 0.8,
      };
      const categories = Object.keys(catWeights);
      const weights = categories.map(c => catWeights[c]);
      const totalW = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalW;
      let chosen = categories[0];
      for (let k = 0; k < categories.length; k++) {
        if (r < weights[k]) { chosen = categories[k]; break; }
        r -= weights[k];
      }

      const merchant = pick(merchants[chosen]);
      const [lo, hi] = bands[chosen];
      const amount = Math.round(randBetween(lo, hi) * 100) / 100;

      result.push({
        id: `${dayIso}-${j}-${chosen}`,
        date: `${dayIso}T12:00:00.000Z`,
        merchant: merchant.name,
        mcc: merchant.mcc,
        amount,
        category: chosen,
      });
    }
  }
  return result;
}