import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box, Typography } from "@mui/material";
import StatCard from "./StatCard";

export type CityStats = {
    city: string;
    interventions: number;
    providerCount: number;
};

export default function CityRankingCard({ cities, onOpenDrawer }: { cities: CityStats[]; onOpenDrawer: () => void }) {

    const ranked = [...cities]
        .sort((a,b)=> b.interventions - a.interventions)
        .slice(0,10);

    const top = ranked[0];
    const max = top?.interventions ?? 1;

    const expandContent = (

        <Box sx={{display:"flex", flexDirection:"column", gap:1.2}}>

            {ranked.map((c,index)=>{

                const pct = Math.round((c.interventions/max)*100);

                return (

                    <Box key={c.city}>

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
                                #{index+1} {c.city}
                            </Typography>

                            <Typography sx={{
                                fontSize:12,
                                fontWeight:700,
                                color:"#38bdf8"
                            }}>
                                {c.interventions} · {c.providerCount} presta.
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
                                bgcolor:"#38bdf8"
                            }}/>
                        </Box>

                    </Box>

                );

            })}

        </Box>

    );

    return (

        <StatCard
            label="Top Villes"
            value={top?.city ?? "—"}
            subtitle={
                top
                    ? `${top.interventions} interventions · ${top.providerCount} prestataires`
                    : "Aucune donnée"
            }
            icon={<LocationOnIcon />}
            accentColor="purple"
            expandContent={expandContent}
            onClick={onOpenDrawer}
        />

    );

}