// "use client";

// import { useEffect, useState } from "react";
// import { Box, Typography } from "@mui/material";

// interface CurrentUser {
//   level: number;
//   levelName: string;
//   points: number;
//   nextLevelMin: number;
// }

// export default function LevelProgressCard() {
//   const [user, setUser] = useState<CurrentUser | null>(null);

//   useEffect(() => {
//     const stored = sessionStorage.getItem("currentUser");
//     if (stored) {
//       setUser(JSON.parse(stored).user);
//     }
//   }, []);

//   if (!user) return null;

//   const isMaxLevel = user.nextLevelMin === null;
// console.log(user)
//   const progressPercent = isMaxLevel
//     ? 100
//     : Math.min((user.points / user.nextLevelMin) * 100, 100);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "center",
//       }}
//     >

//       {/* 🟩 CURVED XP BAR */}
      
//         <Box
//           sx={{
//             height: "25px",
//              borderTopLeftRadius: 100,
//              borderBottomLeftRadius: 100,
//             background: "lightgreen",
//             border:"2px solid",
//               borderRight:"0px",
//             p:1.5,
//              minWidth:"100px",
//             alignItems:"center"
//           }}
//         >
//          <Typography
//           sx={{
//             fontSize: 12,
//           mt:-1.5,
//             textAlign: "left",
//             color: "#000",
           
//         }}
//         >{user.points??"0 Xps"}
//         </Typography> 
//         </Box>

//         {/* 🔷 HEXAGON LEVEL */}
//         <Box className="hex" sx={{ml:"-25px",mr:"-25px",    }}>
//           <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
//             {user.level ?? "1"}
//           </Typography>
//         </Box>
//       {/* 🏷 LEVEL NAME */}
//       <Box  sx={{
//             height: "25px",
//             borderTopRightRadius: 100,
//              borderBottomRightRadius: 100,
//             background: "#ffdb81",
//             border:"2px solid",
//             borderLeft:"0px",
//             p:1.5,
            
//             alignItems:"center",
//              minWidth:"160px"
//           }}>
//         <Typography sx={{ mt:-1.5,fontWeight: 700, color: "#000", textAlign:"right" }}>
//           {user.levelName ?? "Steady Mind"}
//         </Typography>
//       </Box>
//     </Box>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { LEVELS } from "@/utils/level_config";

type CurrentUser = {
  level: number;
  levelName: string;
  points: number;
};

function getNextLevelMin(level: number): number | null {
  const next = LEVELS.find((l) => l.level === level + 1);
  return next?.minPoints ?? null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function LevelProgressCard() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentUser");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const u = parsed?.user ?? parsed;
      if (u?.level != null && u?.points != null) setUser(u);
    } catch {
      // ignore
    }
  }, []);

  const meta = useMemo(() => {
    if (!user) return null;

    const currentLevel = LEVELS.find((l) => l.level === user.level) ?? LEVELS[0];
    const nextLevelMin = getNextLevelMin(user.level);

    const currentMin = currentLevel.minPoints;
    const nextMin = nextLevelMin;

    const isMax = nextMin === null;
    const remaining = isMax ? 0 : Math.max(0, nextMin - user.points);

    const denom = isMax ? 1 : Math.max(1, nextMin - currentMin);
    const percent = isMax ? 100 : clamp(((user.points - currentMin) / denom) * 100, 0, 100);

    return { isMax, remaining, percent };
  }, [user]);

  if (!user || !meta) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, minWidth: { xs: 260, sm: 320 } }}>
      {/* MAIN PILL */}
      <Box
        sx={{
          height: 40,
          borderRadius: 999,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",

          // premium glass
          background: "linear-gradient(180deg, rgba(15,23,42,.72), rgba(15,23,42,.55))",
          border: "1px solid rgba(148,163,184,.22)",
          boxShadow: "0 10px 28px rgba(0,0,0,.28)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* XP BLOCK */}
        <Box
          sx={{
            position: "relative",
            height: "100%",
            minWidth: 108,
            px: 1.6,
            display: "flex",
            alignItems: "center",
            gap: 0.8,

            // mint/teal premium gradient
            background: "linear-gradient(90deg, #34d399, #22c55e)",
          }}
        >
          {/* subtle fill sheen based on percent */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: `${meta.percent}%`,
              opacity: 0.18,
              background: "linear-gradient(90deg, rgba(255,255,255,.9), rgba(255,255,255,0))",
            }}
          />

          <Typography
            sx={{
              position: "relative",
              zIndex: 1,
              color: "#052e16",
              fontWeight: 900,
              fontSize: 11.5,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
            }}
          >
            {user.points.toLocaleString()} XP
          </Typography>
        </Box>

        {/* HEX LEVEL */}
        <Box
          sx={{
            width: 44,
            height: 44,
            marginLeft: "-10px",
            marginRight: "-10px",
            zIndex: 3,

            clipPath:
              "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",

            // sapphire premium
            background: "linear-gradient(135deg, #60a5fa, #4f46e5)",
            border: "1px solid rgba(255,255,255,.22)",
            boxShadow: "0 10px 20px rgba(79,70,229,.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              color: "white",
              fontWeight: 950,
              fontSize: 14,
              textShadow: "0 2px 6px rgba(0,0,0,.45)",
              lineHeight: 1,
            }}
          >
            {user.level}
          </Typography>
        </Box>

        {/* LEVEL NAME */}
        <Box
          sx={{
            height: "100%",
            flex: 1,
            px: 1.6,
            display: "flex",
            alignItems: "center",

            // warm premium gold
            background: "linear-gradient(90deg, #fde68a, #f59e0b)",
          }}
          title={user.levelName}
        >
          <Typography
            sx={{
              color: "#111827",
              fontWeight: 950,
              fontSize: 11.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.levelName}
          </Typography>
        </Box>
      </Box>

      {/* FOOTER LINE */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 1.2,
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        {meta.isMax ? (
          <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#22c55e" }}>
            MAX LEVEL • Legend
          </Typography>
        ) : (
          <>
            <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#cbd5e1" }}>
              {meta.remaining.toLocaleString()} XP to next level
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 900, color: "#93c5fd" }}>
              {meta.percent.toFixed(0)}%
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
