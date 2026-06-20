import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Typography } from "@mui/material";
import StatCard from "./StatCard";

type ProviderStat = { id: string; name: string; interventions: number; rating: number; };

function scoreOf(p: ProviderStat, maxInterventions: number): number {
    const interventionScore = maxInterventions > 0 ? p.interventions / maxInterventions : 0;
    const ratingScore = p.rating / 5;
    return interventionScore * 0.6 + ratingScore * 0.4;
}

export default function TopProvidersCard({ providers, onClick }: { providers: ProviderStat[]; onClick: () => void }) {

    const maxInterventions = Math.max(...providers.map(p => p.interventions), 1);

    const ranked = [...providers]
        .sort((a,b) => scoreOf(b,maxInterventions) - scoreOf(a,maxInterventions))
        .slice(0,10);

    const top = ranked[0];

    const expandContent = (
        <Box sx={{display:"flex", flexDirection:"column", gap:1.2}}>

            {ranked.map((p,index) => {

                const pct = Math.round(scoreOf(p,maxInterventions)*100);

                return (

                    <Box key={p.id}>

                        <Box sx={{
                            display:"flex",
                            justifyContent:"space-between",
                            mb:0.4
                        }}>

                            <Typography sx={{
                                fontSize:12,
                                fontWeight:600,
                                color:"rgba(180,210,245,0.7)"
                            }}>
                                #{index+1} {p.name}
                            </Typography>

                            <Typography sx={{
                                fontSize:12,
                                fontWeight:700,
                                color:"#fbbf24"
                            }}>
                                {p.interventions} · {p.rating.toFixed(1)}★
                            </Typography>

                        </Box>

                        <Box sx={{
                            height:4,
                            borderRadius:999,
                            bgcolor:"rgba(147,181,218,0.12)"
                        }}>
                            <Box sx={{
                                width:`${pct}%`,
                                height:"100%",
                                borderRadius:999,
                                bgcolor:"#fbbf24"
                            }}/>
                        </Box>

                    </Box>

                );

            })}

        </Box>
    );

    return (

        <StatCard
            label="Top Prestataires"
            value={top?.name ?? "—"}
            subtitle={
                top
                    ? `${top.interventions} interventions · ${top.rating.toFixed(1)}★`
                    : "Aucune donnée"
            }
            icon={<EmojiEventsIcon />}
            accentColor="blue"
            expandContent={expandContent}
            onClick={onClick}
        />

    );

}