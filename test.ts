async function na() {
    const users = ["172973666", "758846364", "510114690", "749589477", "231496817"];
    const names = ["lilz3bra", "Nyamyuu05", "teh513", "emzy8764e", "TR1P_Sol"];
    for (var i = 0; i < 10; i++) {
        const x = await fetch(`https://atmana-wheel-git-moderation-lilz3bra.vercel.app/api/test?n=1&id=${users[i % 5]}&name=${names[i % 5]}`, { method: "POST" });
        console.log("Run", i + 1, x.status);
    }
}
na();
